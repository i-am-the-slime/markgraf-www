module Component.SdfDiagram (sdfDiagram) where

import Prelude

import Data.Array (concatMap, foldl, length, mapWithIndex, (!!))
import Data.Foldable (traverse_)
import Data.Int (round, toNumber)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Nullable (Nullable, null, toMaybe)
import Data.Number (cos, sin, sqrt)
import Effect (Effect)
import Graphics.Canvas (CanvasElement)
import Graphics.WebGL as GL
import Page.Active (onActiveChange)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (readRefMaybe, reactComponent, useRef, writeRef, readRef)
import React.Basic.Hooks as Hooks
import Effect.Unsafe (unsafePerformEffect)
import Web.HTML (window)
import Web.HTML.Window (RequestAnimationFrameId, cancelAnimationFrame, requestAnimationFrame)
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.Internal (css, noJSX)

-- A markgraf diagram drawn as one fullscreen-quad SDF raymarcher: every node is
-- an extruded SDF solid in its own markgraf shape, every edge an SDF capsule
-- capped with an SDF arrowhead. The whole scene is one fragment shader, tilted a
-- little so the slabs read as 3D — the same machinery as the install button,
-- generalised from one morphing shape to a laid-out graph.
--
-- This is the spike: the layout is hand-built here (a Client→API hub fanning out
-- to a cache, a database and an event cloud). Feeding it real markgraf Layout
-- data and baking SDF text labels are the next two steps.
sdfDiagram :: JSX
sdfDiagram = element diagramComponent {}

-- ---------------------------------------------------------------------------
-- The scene, in layout space (y grows downward, as ELK emits it). Shapes match
-- markgraf's Shape enum order: 0 Rectangle, 1 Cylinder, 3 Diamond, 4 Ellipse,
-- 6 Cloud.
-- ---------------------------------------------------------------------------

type LNode = { cx :: Number, cy :: Number, w :: Number, h :: Number, shape :: Int }
type LEdge = { from :: Int, to :: Int }

nodes :: Array LNode
nodes =
  [ { cx: 200.0, cy: 60.0, w: 150.0, h: 64.0, shape: 0 }   -- 0 Client (rect)
  , { cx: 200.0, cy: 230.0, w: 150.0, h: 64.0, shape: 0 }  -- 1 API (rect, the hub)
  , { cx: 30.0, cy: 410.0, w: 140.0, h: 88.0, shape: 1 }   -- 2 Cache (cylinder)
  , { cx: 210.0, cy: 410.0, w: 140.0, h: 88.0, shape: 1 }  -- 3 DB (cylinder)
  , { cx: 400.0, cy: 405.0, w: 160.0, h: 96.0, shape: 6 }  -- 4 Events (cloud)
  ]

edges :: Array LEdge
edges =
  [ { from: 0, to: 1 }
  , { from: 1, to: 2 }
  , { from: 1, to: 3 }
  , { from: 1, to: 4 }
  ]

-- ---------------------------------------------------------------------------
-- Layout space -> world space. Centre the bounding box on the origin, flip y so
-- it points up, and scale the larger dimension to fill `worldSpan`.
-- ---------------------------------------------------------------------------

type WorldNode = { x :: Number, y :: Number, hw :: Number, hh :: Number, shape :: Number }

worldSpan :: Number
worldSpan = 6.6

bounds :: { minX :: Number, maxX :: Number, minY :: Number, maxY :: Number }
bounds = foldl step { minX: inf, maxX: -inf, minY: inf, maxY: -inf } nodes
  where
  inf = 1.0e9
  step acc n =
    { minX: min acc.minX (n.cx - n.w / 2.0)
    , maxX: max acc.maxX (n.cx + n.w / 2.0)
    , minY: min acc.minY (n.cy - n.h / 2.0)
    , maxY: max acc.maxY (n.cy + n.h / 2.0)
    }

scaleFactor :: Number
scaleFactor = worldSpan / max (bounds.maxX - bounds.minX) (bounds.maxY - bounds.minY)

midX :: Number
midX = (bounds.minX + bounds.maxX) / 2.0

midY :: Number
midY = (bounds.minY + bounds.maxY) / 2.0

worldNodes :: Array WorldNode
worldNodes = toWorld <$> nodes
  where
  toWorld n =
    { x: (n.cx - midX) * scaleFactor
    , y: negate (n.cy - midY) * scaleFactor
    , hw: n.w / 2.0 * scaleFactor
    , hh: n.h / 2.0 * scaleFactor
    , shape: toNumber n.shape
    }

nodeRectFlat :: Array Number
nodeRectFlat = concatMap (\n -> [ n.x, n.y, n.hw * 2.0, n.hh * 2.0 ]) worldNodes

nodeShapeFlat :: Array Number
nodeShapeFlat = _.shape <$> worldNodes

-- Each edge is trimmed at both ends onto its endpoints' bounding boxes, so the
-- capsule starts at the source's border and the arrowhead lands on the target's.
edgeFlat :: Array Number
edgeFlat = concatMap segment edges
  where
  segment e = fromMaybe [] do
    a <- worldNodes !! e.from
    b <- worldNodes !! e.to
    let
      dx = b.x - a.x
      dy = b.y - a.y
      len = sqrt (dx * dx + dy * dy)
      ux = dx / len
      uy = dy / len
      start = boxExit a ux uy
      end = boxExit b (negate ux) (negate uy)
    pure [ start.x, start.y, end.x, end.y ]

-- Walk out from a node's centre along a unit direction to where it leaves the
-- node's bounding box.
boxExit :: WorldNode -> Number -> Number -> { x :: Number, y :: Number }
boxExit n ux uy = { x: n.x + ux * t, y: n.y + uy * t }
  where
  tx = if ux == 0.0 then inf else n.hw / abs ux
  ty = if uy == 0.0 then inf else n.hh / abs uy
  t = min tx ty
  inf = 1.0e9
  abs v = if v < 0.0 then negate v else v

-- ---------------------------------------------------------------------------
-- The component: bind a GL context to the canvas, push the static scene as
-- uniforms once, then drive uTime/uTilt on a paused-aware rAF loop.
-- ---------------------------------------------------------------------------

diagramComponent :: ReactComponent {}
diagramComponent = unsafePerformEffect $ reactComponent "SdfDiagram" \_ -> Hooks.do
  canvasRef <- useRef (null :: Nullable CanvasElement)
  timeRef <- useRef 0.0
  lastWallRef <- useRef 0.0
  rafRef <- useRef (Nothing :: Maybe RequestAnimationFrameId)

  Hooks.useEffectOnce $ readRefMaybe canvasRef >>= case _ of
    Nothing -> pure (pure unit)
    Just canvasEl -> GL.getContext canvasEl >>= toMaybe >>> case _ of
      Nothing -> pure (pure unit)
      Just gl -> do
        program <- GL.buildProgram gl { vertex: vert, fragment: frag }
        GL.setupQuad gl program
        uRes <- GL.uniformLocation gl program "uRes"
        uTime <- GL.uniformLocation gl program "uTime"
        uTilt <- GL.uniformLocation gl program "uTilt"
        uNodeCount <- GL.uniformLocation gl program "uNodeCount"
        uEdgeCount <- GL.uniformLocation gl program "uEdgeCount"
        uNodeRect <- GL.uniformLocation gl program "uNodeRect"
        uNodeShape <- GL.uniformLocation gl program "uNodeShape"
        uEdge <- GL.uniformLocation gl program "uEdge"

        GL.uniform1i gl uNodeCount (length nodes)
        GL.uniform1i gl uEdgeCount (length edges)
        GL.uniform4fv gl uNodeRect nodeRectFlat
        GL.uniform1fv gl uNodeShape nodeShapeFlat
        GL.uniform4fv gl uEdge edgeFlat

        win <- window
        let
          renderFrame = do
            wall <- GL.now
            prev <- readRef lastWallRef
            writeRef lastWallRef wall
            let dt = min 0.05 ((wall - prev) / 1000.0)
            now <- readRef timeRef
            let now' = now + dt
            writeRef timeRef now'
            size <- GL.clientSize canvasEl
            dpr <- clampDpr <$> GL.devicePixelRatio
            when (size.width > 0.0) do
              GL.resize gl canvasEl (round (size.width * dpr)) (round (size.height * dpr))
              GL.clear gl
              GL.uniform2f gl uRes (size.width * dpr) (size.height * dpr)
              GL.uniform1f gl uTime now'
              GL.uniform1f gl uTilt (idleTilt + sin (now' * 0.4) * 0.13)
              GL.drawQuad gl
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          start = do
            writeRef lastWallRef =<< GL.now
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          stop = readRef rafRef >>= traverse_ \id -> do
            cancelAnimationFrame id win
            writeRef rafRef Nothing

        start
        stopActive <- onActiveChange \active -> readRef rafRef >>= \r -> case active, r of
          true, Nothing -> start
          false, Just _ -> stop
          _, _ -> pure unit
        pure (stop *> stopActive)

  pure $
    div
      { style: css { position: "absolute", inset: "0" } }
      [ canvas
          { ref: reactRef canvasRef
          , style: css { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" }
          }
          noJSX
      ]

clampDpr :: Number -> Number
clampDpr d = max 1.0 (min 2.0 d)

idleTilt :: Number
idleTilt = 0.34

-- ---------------------------------------------------------------------------
-- Shaders. The vertex stage is the bare quad; the fragment stage raymarches the
-- whole graph. All scene data arrives as uniform arrays, indexed only inside
-- bounded loops (WebGL1 forbids dynamic uniform-array indexing elsewhere — the
-- nearest node's shape is therefore carried out of the loop, not looked up).
-- ---------------------------------------------------------------------------

vert :: String
vert = "attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }"

frag :: String
frag =
  """
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uTilt;
  uniform int uNodeCount;
  uniform int uEdgeCount;
  uniform vec4 uNodeRect[24];   // (cx, cy, w, h) in world space
  uniform float uNodeShape[24]; // markgraf Shape id
  uniform vec4 uEdge[32];       // (x1, y1, x2, y2), trimmed to node borders

  const int MAXN = 24;
  const int MAXE = 32;
  const float DEPTH    = 0.30;  // node slab half-thickness
  const float EDGE_R   = 0.040; // edge capsule radius
  const float EDGE_HZ  = 0.050; // edge slab half-thickness
  const float ARROW_LEN = 0.26;
  const float ARROW_HW  = 0.15;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }

  float sdSphere(vec3 p,float r){ return length(p)-r; }
  float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
  float sdBox2(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
  float sdEll2(vec2 p, vec2 r){ float k1=length(p/r); float k2=length(p/(r*r)); return k1*(k1-1.0)/k2; }
  float ndot(vec2 a, vec2 b){ return a.x*b.x - a.y*b.y; }
  float sdRhombus2(vec2 p, vec2 b){
    p = abs(p);
    float h = clamp(ndot(b - 2.0*p, b) / dot(b,b), -1.0, 1.0);
    float d = length(p - 0.5*b*vec2(1.0-h, 1.0+h));
    return d * sign(p.x*b.y + p.y*b.x - b.x*b.y);
  }
  // extrude a 2D distance d2 into a z-slab of half-thickness hz
  float extr(float d2, float pz, float hz){ vec2 w=vec2(d2, abs(pz)-hz); return min(max(w.x,w.y),0.)+length(max(w,0.)); }

  // A node's silhouette, by markgraf Shape id, centred at the origin with half
  // extents he. Anything unrecognised falls back to a rounded rectangle.
  float nodeShapeDist(int sh, vec3 q, vec2 he){
    if(sh==1){ // Cylinder: straight body with elliptical caps (a side-view can)
      float bodyH = he.y*0.74, capH = he.y*0.26;
      float body = sdBox2(q.xy, vec2(he.x, bodyH));
      float top  = sdEll2(q.xy - vec2(0.0,  bodyH), vec2(he.x, capH));
      float bot  = sdEll2(q.xy - vec2(0.0, -bodyH), vec2(he.x, capH));
      return extr(min(min(body, top), bot), q.z, DEPTH);
    }
    if(sh==3) return extr(sdRhombus2(q.xy, he), q.z, DEPTH);       // Diamond
    if(sh==4) return extr(sdEll2(q.xy, he), q.z, DEPTH);            // Ellipse
    if(sh==6){ // Cloud: a smooth union of lobes over a flat base
      float r = he.y;
      float d = sdSphere(q - vec3(-he.x*0.55, 0.0, 0.0), r*0.78);
      d = smin(d, sdSphere(q - vec3(-he.x*0.12,  he.y*0.30, 0.0), r*0.95), r*0.5);
      d = smin(d, sdSphere(q - vec3( he.x*0.35,  he.y*0.10, 0.0), r*0.85), r*0.5);
      d = smin(d, sdSphere(q - vec3( he.x*0.62, -he.y*0.05, 0.0), r*0.62), r*0.5);
      d = smin(d, sdRoundBox(q - vec3(0.0, -he.y*0.5, 0.0), vec3(he.x*0.9, he.y*0.22, DEPTH), r*0.2), r*0.5);
      return d;
    }
    return sdRoundBox(q, vec3(he.x, he.y, DEPTH), min(he.x,he.y)*0.18); // Rectangle
  }

  // Nearest node; the winner's shape id is carried out for shading.
  float mapNode(vec3 p, out float nshape){
    float d = 1e9; nshape = -1.0;
    for(int i=0;i<MAXN;i++){
      if(i>=uNodeCount) break;
      vec4 r = uNodeRect[i];
      float sh = uNodeShape[i];
      float nd = nodeShapeDist(int(sh+0.5), p - vec3(r.x, r.y, 0.0), r.zw*0.5);
      if(nd < d){ d = nd; nshape = sh; }
    }
    return d;
  }

  float sdSeg2(vec2 p, vec2 a, vec2 b, float r){
    vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    return length(pa-ba*h)-r;
  }
  // Extruded triangular arrowhead, tip at `tip`, pointing along unit `dir`.
  float arrowHead(vec3 p, vec2 tip, vec2 dir){
    vec2 n = vec2(-dir.y, dir.x);
    vec2 q = p.xy - tip;
    float along = dot(q, dir);           // <=0 behind the tip
    float side  = abs(dot(q, n));
    float tFrac = clamp(-along/ARROW_LEN, 0.0, 1.0);
    float d2 = max(max(side - ARROW_HW*tFrac, along), -along - ARROW_LEN);
    return extr(d2, p.z, EDGE_HZ*1.3);
  }
  float mapEdge(vec3 p){
    float d = 1e9;
    for(int i=0;i<MAXE;i++){
      if(i>=uEdgeCount) break;
      vec4 e = uEdge[i];
      vec2 a = e.xy, b = e.zw;
      vec2 dir = normalize(b - a);
      vec2 bShort = b - dir*ARROW_LEN*0.7;       // make room for the head
      float line = extr(sdSeg2(p.xy, a, bShort, EDGE_R), p.z, EDGE_HZ);
      d = min(d, min(line, arrowHead(p, b, dir)));
    }
    return d;
  }

  // The whole scene, after tilting the world about x so the slabs show depth.
  float map(vec3 p){
    p.yz = rot(uTilt) * p.yz;
    float dummy;
    return min(mapNode(p, dummy), mapEdge(p));
  }
  vec3 calcNormal(vec3 p){ vec2 e=vec2(0.0015,0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
  float calcAO(vec3 p, vec3 n){ float occ=0., sca=1.; for(int i=0;i<5;i++){ float h=0.01+0.12*float(i)/4.; occ+=(h-map(p+n*h))*sca; sca*=0.9; } return clamp(1.-2.2*occ,0.,1.); }

  vec3 nodeTint(int sh){
    if(sh==1) return vec3(0.44,0.51,0.62);  // cylinder — steel
    if(sh==6) return vec3(0.63,0.64,0.67);  // cloud — light grey
    if(sh==3) return vec3(0.60,0.50,0.40);  // diamond — warm
    if(sh==4) return vec3(0.48,0.58,0.52);  // ellipse — sage
    return vec3(0.55,0.55,0.59);            // rectangle
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
    vec3 ro = vec3(0.0, 0.0, 12.0);
    vec3 rd = normalize(vec3(uv*1.5, -1.5));

    float t = 0.0; bool hit = false; vec3 p;
    for(int i=0;i<96;i++){
      p = ro + rd*t;
      float d = map(p);
      if(d < 0.001){ hit = true; break; }
      t += d*0.85;
      if(t > 30.0) break;
    }

    // background: a soft dark vertical wash with a faint vignette
    vec3 bg = mix(vec3(0.05,0.05,0.06), vec3(0.10,0.10,0.12), uv.y*0.5+0.5);
    bg *= 1.0 - 0.25*dot(uv,uv);
    vec3 col = bg;

    if(hit){
      vec3 n = calcNormal(p);
      // classify the hit (node vs edge) and recover the node shape
      vec3 pw = p; pw.yz = rot(uTilt) * pw.yz;
      float nshape; float dn = mapNode(pw, nshape); float de = mapEdge(pw);
      bool isNode = dn <= de;

      vec3 v = -rd;
      vec3 key  = normalize(vec3(0.5, 0.85, 0.6));
      vec3 fill = normalize(vec3(-0.6, 0.2, 0.5));
      float ao = calcAO(p, n);
      float difKey  = clamp(dot(n,key), 0.0, 1.0);
      float difFill = clamp(dot(n,fill), 0.0, 1.0);
      float fres = pow(1.0 - clamp(dot(n,v),0.,1.), 3.0);
      vec3 hlf = normalize(key + v);
      float spec = pow(clamp(dot(n,hlf),0.,1.), 50.0);

      vec3 base = isNode ? nodeTint(int(nshape+0.5)) : vec3(0.16,0.17,0.20);
      col = base*(0.45 + 0.55*difKey + 0.18*difFill) * (0.7 + 0.3*ao);
      col += vec3(1.0)*spec*(isNode ? 0.35 : 0.15);
      col += base*fres*0.3;
    }

    gl_FragColor = vec4(col, 1.0);
  }
  """
