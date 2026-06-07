module Component.InstallButtonSDF (installButtonSDF) where

import Prelude

import Data.Foldable (traverse_)
import Data.Int (round)
import Data.Maybe (Maybe(..))
import Data.Nullable (Nullable, null, toMaybe)
import Data.Number (exp, sin)
import Effect (Effect)
import Effect.Aff (launchAff_)
import Effect.Class (liftEffect)
import Effect.Unsafe (unsafePerformEffect)
import Graphics.Canvas (CanvasElement, TextAlign(..), TextBaseline(..), clearRect, fillText, getContext2D, setCanvasHeight, setCanvasWidth, setFillStyle, setFont, setTextAlign, setTextBaseline)
import Graphics.Canvas.Extra (LetterSpacing(..), createCanvasElement, kerningNormal, setFontKerning, setLetterSpacing)
import Graphics.WebGL as GL
import Page.Active (onActiveChange)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Events (EventHandler, handler_)
import React.Basic.Hooks (readRef, readRefMaybe, reactComponent, useRef, writeRef)
import React.Basic.Hooks as Hooks
import Web.Font.Loading (FontShorthand(..), loadFont)
import Web.HTML (window)
import Web.HTML.Window (RequestAnimationFrameId, cancelAnimationFrame, requestAnimationFrame)
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.Internal (css, noJSX)

-- The "INSTALL" button is one fullscreen-quad raymarcher: a grey glassy shape
-- morphs through markgraf's node silhouettes, fills with blue->red gas from the
-- cursor on hover, and carries the black INSTALL letters with an orange comet
-- shimmer wiping across them. The shape, with its baked-in text, IS the button.
--
-- It draws with bare WebGL — a single quad and a fragment shader is all a
-- raymarcher needs, so three/r3f (and its ~230KB chunk) earns no place here.
installButtonSDF :: JSX
installButtonSDF = element installButton {}

-- Hover/cursor are tracked on the DOM anchor (it wraps the whole button, so
-- enter/leave/move are reliable) and read by the render loop off shared refs.
installButton :: ReactComponent {}
installButton = unsafePerformEffect $ reactComponent "InstallButtonSDF" \_ -> Hooks.do
  hoveringRef <- useRef false
  pointerRef <- useRef { x: 0.0, y: 0.0 }
  canvasRef <- useRef (null :: Nullable CanvasElement)
  phaseRef <- useRef 0.0
  targetRef <- useRef 0.0
  lastSwitchRef <- useRef 0.0
  yawRef <- useRef 0.0
  tiltRef <- useRef idleTilt
  fillRef <- useRef 0.0
  timeRef <- useRef 0.0
  lastWallRef <- useRef 0.0
  rafRef <- useRef (Nothing :: Maybe RequestAnimationFrameId)

  Hooks.useEffectOnce $ readRefMaybe canvasRef >>= case _ of
    Nothing -> pure (pure unit)
    Just canvasEl -> GL.getContext canvasEl >>= toMaybe >>> case _ of
      Nothing -> pure (pure unit)
      Just gl -> do
        program <- GL.buildProgram gl { vertex: sdfVert, fragment: sdfFrag }
        GL.setupQuad gl program
        uRes <- GL.uniformLocation gl program "uRes"
        uPhase <- GL.uniformLocation gl program "uPhase"
        uRot <- GL.uniformLocation gl program "uRot"
        uTilt <- GL.uniformLocation gl program "uTilt"
        uFill <- GL.uniformLocation gl program "uFill"
        uTime <- GL.uniformLocation gl program "uTime"
        uMouse <- GL.uniformLocation gl program "uMouse"
        uText <- GL.uniformLocation gl program "uText"
        GL.uniform1i gl uText 0

        texture <- GL.createTexture gl
        label <- ensureLabel gl texture
        win <- window

        let
          renderFrame = do
            dt <- tickClock lastWallRef timeRef
            now <- readRef timeRef
            phase <- advancePhase phaseRef targetRef lastSwitchRef now dt
            hovering <- readRef hoveringRef
            pointer <- readRef pointerRef
            size <- GL.clientSize canvasEl
            dpr <- clampDpr <$> GL.devicePixelRatio
            let aspect = size.width / size.height
            yaw <- easeYaw yawRef hovering pointer.x now dt
            tilt <- easeTilt tiltRef hovering pointer.y now dt
            fill <- easeFill fillRef hovering dt
            when (size.width > 0.0) do
              GL.resize gl canvasEl (round (size.width * dpr)) (round (size.height * dpr))
              GL.clear gl
              GL.uniform1f gl uTime now
              GL.uniform1f gl uPhase phase
              GL.uniform1f gl uRot yaw
              GL.uniform1f gl uTilt tilt
              GL.uniform1f gl uFill fill
              GL.uniform2f gl uMouse (pointer.x * 0.5 * aspect) (negate pointer.y * 0.5)
              GL.uniform2f gl uRes (size.width * dpr) (size.height * dpr)
              GL.drawQuad gl
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          -- Kick a fresh frame, resetting the wall clock so the first delta is
          -- one small step rather than the whole paused gap.
          start = do
            writeRef lastWallRef =<< GL.now
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          stop = readRef rafRef >>= traverse_ \id -> do
            cancelAnimationFrame id win
            writeRef rafRef Nothing

        start
        -- Stop raymarching while the page isn't watched; resume on return. The
        -- rafRef doubles as the running flag, so neither edge double-fires.
        stopActive <- onActiveChange \active -> readRef rafRef >>= case active, _ of
          true, Nothing -> start
          false, Just _ -> stop
          _, _ -> pure unit
        pure (stop *> stopActive)

  pure $
    a
      { href: "#install"
      , style: css
          { position: "relative"
          , display: "block"
          , width: "18rem"
          , height: "8rem"
          , textDecoration: "none"
          , pointerEvents: "auto"
          }
      , onPointerEnter: handler_ (writeRef hoveringRef true)
      , onPointerLeave: handler_ (writeRef hoveringRef false)
      , onPointerMove: pointerMoveHandler \p ->
          writeRef pointerRef
            { x: (p.cx - p.left) / p.width * 2.0 - 1.0
            , y: negate ((p.cy - p.top) / p.height * 2.0 - 1.0)
            }
      }
      [ canvas
          { ref: reactRef canvasRef
          , style: css { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" }
          }
          noJSX
      ]

-- Build the label texture from an offscreen canvas, then — once the brand font
-- loads — repaint and re-upload so the first paint's fallback face is replaced.
ensureLabel :: GL.GL -> GL.Texture -> Effect CanvasElement
ensureLabel gl texture = do
  label <- makeLabelCanvas labelConfig
  GL.uploadCanvas gl texture label
  launchAff_ do
    loadFont (FontShorthand labelConfig.font)
    liftEffect do
      drawLabel label labelConfig
      GL.uploadCanvas gl texture label
  pure label

-- Wall-clock tick. requestAnimationFrame pauses while the tab is hidden, so the
-- first delta on return is the whole away-duration — clamp it so a background gap
-- is one small step, never a fast-forward, and accumulate our own sim time off it.
tickClock :: Hooks.Ref Number -> Hooks.Ref Number -> Effect Number
tickClock lastWallRef timeRef = do
  wall <- GL.now
  prev <- readRef lastWallRef
  writeRef lastWallRef wall
  let dt = min maxFrameGap ((wall - prev) / 1000.0)
  readRef timeRef >>= \t -> writeRef timeRef (t + dt)
  pure dt

clampDpr :: Number -> Number
clampDpr d = max 1.0 (min 2.0 d)

type PointerBox =
  { cx :: Number, cy :: Number, left :: Number, top :: Number, width :: Number, height :: Number }

pointerMoveHandler :: (PointerBox -> Effect Unit) -> EventHandler
pointerMoveHandler = pointerMoveHandlerImpl

foreign import pointerMoveHandlerImpl :: (PointerBox -> Effect Unit) -> EventHandler

-- ---------------------------------------------------------------------------
-- Animation state machine, ported from the prototype's frame() — all over Refs.
-- ---------------------------------------------------------------------------

-- The morph index eases toward an integer target that ticks up every STEP
-- seconds (Freya exp-decay), wrapping back at L shapes so the loop is seamless.
advancePhase
  :: Hooks.Ref Number -> Hooks.Ref Number -> Hooks.Ref Number
  -> Number -> Number -> Effect Number
advancePhase phaseRef targetRef lastSwitchRef t dt = do
  lastSwitch <- readRef lastSwitchRef
  when (t - lastSwitch >= step) do
    writeRef lastSwitchRef (lastSwitch + step)
    target <- readRef targetRef
    writeRef targetRef (target + 1.0)
  phase0 <- readRef phaseRef
  target <- readRef targetRef
  let phase1 = phase0 + (target - phase0) * (1.0 - exp (-decay * dt))
  let wrapped = if phase1 >= shapeCount then phase1 - shapeCount else phase1
  when (phase1 >= shapeCount) (writeRef targetRef (target - shapeCount))
  writeRef phaseRef wrapped
  pure wrapped
  where
  step = 2.7
  decay = 4.0

-- Yaw follows the cursor while hovering, else drifts in a gentle idle sway.
easeYaw :: Hooks.Ref Number -> Boolean -> Number -> Number -> Number -> Effect Number
easeYaw yawRef hovering mx t dt = do
  yaw0 <- readRef yawRef
  let yaw1 = yaw0 + (targetYaw - yaw0) * orientEase dt
  writeRef yawRef yaw1
  pure yaw1
  where
  targetYaw = if hovering then mx * 0.45 else sin (t * 0.45) * 0.22

-- Tilt likewise tracks the cursor's vertical, settling to a slow idle bob.
easeTilt :: Hooks.Ref Number -> Boolean -> Number -> Number -> Number -> Effect Number
easeTilt tiltRef hovering my t dt = do
  tilt0 <- readRef tiltRef
  let tilt1 = tilt0 + (targetTilt - tilt0) * orientEase dt
  writeRef tiltRef tilt1
  pure tilt1
  where
  targetTilt = if hovering then idleTilt + my * 0.5 else idleTilt + sin (t * 0.32) * 0.12

-- The gas fills toward 1 on hover and empties toward 0 on leave.
easeFill :: Hooks.Ref Number -> Boolean -> Number -> Effect Number
easeFill fillRef hovering dt = do
  fill0 <- readRef fillRef
  let target = if hovering then 1.0 else 0.0
  let fill1 = fill0 + (target - fill0) * (1.0 - exp (-7.0 * dt))
  writeRef fillRef fill1
  pure fill1

orientEase :: Number -> Number
orientEase dt = 1.0 - exp (-6.0 * dt)

idleTilt :: Number
idleTilt = 0.12

-- Largest per-frame delta we trust (~3 frames at 60fps). A bigger gap means the
-- tab was hidden; clamping here keeps a return-to-tab from fast-forwarding.
maxFrameGap :: Number
maxFrameGap = 0.05

shapeCount :: Number
shapeCount = 6.0

-- ---------------------------------------------------------------------------
-- Shaders, ported verbatim from the prototype. The vertex shader declares its
-- own `position` attribute (no three to inject it); the fragment shader is
-- unchanged WebGL1 GLSL.
-- ---------------------------------------------------------------------------

sdfVert :: String
sdfVert = "attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }"

sdfFrag :: String
sdfFrag =
  """
  precision highp float;
  uniform vec2 uRes; uniform float uPhase; uniform float uRot; uniform float uTilt; uniform float uFill; uniform float uTime; uniform vec2 uMouse; uniform sampler2D uText;
  const int L = 6;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }

  // cheap value-noise fbm for the gaseous fill
  float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
  float fbm(vec3 p){ float a=0.5,s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.0; a*=0.5; } return s; }
  float sdSphere(vec3 p,float r){ return length(p)-r; }
  float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
  float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
  float sdCappedCyl(vec3 p, float h, float r){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
  float sdBox2(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
  float sdEll2(vec2 p, vec2 r){ float k1=length(p/r); float k2=length(p/(r*r)); return k1*(k1-1.0)/k2; }  // iq 2D ellipse approx
  // database: classic side-view (straight body, elliptical bulge top & bottom), extruded in z
  float sdDatabase(vec3 p, float w, float bodyH, float capH, float hz){
    float body = sdBox2(p.xy, vec2(w, bodyH));
    float top  = sdEll2(p.xy - vec2(0.0,  bodyH), vec2(w, capH));
    float bot  = sdEll2(p.xy - vec2(0.0, -bodyH), vec2(w, capH));
    float d2 = min(min(body, top), bot);
    vec2 wv = vec2(d2, abs(p.z) - hz);
    return min(max(wv.x, wv.y), 0.0) + length(max(wv, 0.0));
  }
  // chevron / "<==>" : flat top+bottom, pointed ends — markgraf's chevronRect, extruded in z
  float sdChevron(vec3 p, float hw, float hh, float chev, float hz){
    vec2 q = abs(p.xy);
    float top = q.y - hh;                              // flat top/bottom
    vec2 n = normalize(vec2(hh, chev));                // outward normal of the slanted end
    float slant = dot(q - vec2(hw, 0.0), n);           // sloped edge to the point
    float dxy = max(top, slant);
    vec2 w = vec2(dxy, abs(p.z) - hz);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
  }

  // each shape is a genuine 3D volume sized for a wide button
  float shapeDist(int i, vec3 p){
    if(i==0) return sdCapsule(p, vec3(-2.0,0.,0.), vec3(2.0,0.,0.), 0.92);   // pill = capsule
    if(i==1) return sdRoundBox(p, vec3(2.55,0.92,0.6), 0.16);                // rounded box (crisp corners)
    if(i==2) return sdChevron(p, 2.6, 0.85, 0.7, 0.55);                     // chevron <==>
    if(i==3) return sdDatabase(p, 2.4, 0.46, 0.4, 0.5);                     // database = squat, wide side-view can
    if(i==4) return sdCappedCyl(vec3(p.y,p.x,p.z), 2.2, 0.92);               // queue = sideways tube along x
    // cloud = smooth union of spheres on a flat base
    float d = sdSphere(p-vec3(-1.6,0.05,0.), 0.82);
    d = smin(d, sdSphere(p-vec3(-0.4,0.32,0.), 1.0), 0.42);
    d = smin(d, sdSphere(p-vec3(0.9,0.12,0.), 0.9), 0.42);
    d = smin(d, sdSphere(p-vec3(1.9,-0.05,0.), 0.66), 0.42);
    d = smin(d, sdRoundBox(p-vec3(0.,-0.55,0.), vec3(2.1,0.25,0.55), 0.2), 0.42);
    return d;
  }

  // world -> shape-local: same transform the SDF uses, so anything textured
  // with these coords (the label) is glued to the surface and rocks with it.
  vec3 toLocal(vec3 p){ p.yz = rot(uTilt) * p.yz; p.xz = rot(uRot) * p.xz; return p; }
  // returns (distance, materialId): 0 = shape
  vec2 mapID(vec3 p){
    vec3 pl = toLocal(p);
    int k = int(floor(uPhase));
    float f = fract(uPhase); f = f*f*(3.0-2.0*f);
    int a = k - (k/L)*L; int b = a+1; if(b>=L) b-=L;
    return vec2(mix(shapeDist(a,pl), shapeDist(b,pl), f), 0.0);
  }
  float map(vec3 p){ return mapID(p).x; }
  vec3 normal(vec3 p){ vec2 e=vec2(0.0015,0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
  float calcAO(vec3 p, vec3 n){ float occ=0., sca=1.; for(int i=0;i<5;i++){ float h=0.01+0.13*float(i)/4.; occ+=(h-map(p+n*h))*sca; sca*=0.92; } return clamp(1.-2.5*occ,0.,1.); }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
    vec3 ro = vec3(0.,0.,5.6);
    vec3 rd = normalize(vec3(uv, -1.5));  // wider fov -> shape sits smaller, with margin
    float t=0.; bool hit=false; vec3 p; float id=0.;
    for(int i=0;i<90;i++){ p=ro+rd*t; vec2 m=mapID(p); if(m.x<0.001){hit=true; id=m.y; break;} t+=m.x*0.7; if(t>14.) break; }
    vec3 col = vec3(0.0); float alpha = 0.0;
    if(hit){
    vec3 n=normal(p);
    vec3 v=-rd;
    vec3 key=normalize(vec3(0.55,0.8,0.7));
    vec3 fill=normalize(vec3(-0.6,0.25,0.5));
    float ao=calcAO(p,n);
    float difKey=clamp(dot(n,key),0.,1.);
    float difFill=clamp(dot(n,fill),0.,1.);
    float fres=pow(1.0-clamp(dot(n,v),0.,1.),3.0);
    vec3 hlf=normalize(key+v);
    float spec=pow(clamp(dot(n,hlf),0.,1.),60.0);
    vec3 refl=reflect(rd,n);
    vec3 pl = toLocal(p);
    vec3 grey = vec3(0.5,0.5,0.53);            // container grey at rest
    col = grey*(0.5 + 0.5*difKey + 0.18*difFill) * (0.72 + 0.28*ao);
    col += vec3(1.0)*spec*0.4;                 // glossy highlight
    col += grey*fres*0.3;                      // subtle rim
    vec3 glass = mix(vec3(0.10,0.11,0.16), vec3(0.74,0.76,0.85), clamp(refl.y*0.5+0.5,0.,1.));
    col = mix(col, glass, fres*0.45);
    float cc = pow(clamp(dot(n,hlf),0.,1.), 230.0); col += cc*0.9;
    // on hover, gas fills from the centre and sweeps blue -> red
    float face = smoothstep(0.0, 0.5, n.z);
    float rad = length(uv - uMouse) * 1.1;               // distance from the cursor, in screen space
    float front = uFill * 2.2;                            // fill front grows outward from the cursor
    float filled = smoothstep(front, front-0.6, rad);
    vec3 gasCol = mix(vec3(0.2,0.42,0.95), vec3(0.8,0.2,0.05), smoothstep(0.0,1.0,uFill));
    float vignette = mix(0.55, 1.25, exp(-rad*rad*0.7));
    float warp = fbm(pl*1.3 + vec3(uTime*0.18, uTime*0.12, uTime*0.07));
    float gas = fbm(pl*1.6 + vec3(warp*1.5) + vec3(uTime*0.22, -uTime*0.1, uTime*0.05));
    gas = 0.35 + 1.1*gas;
    col += gasCol * vignette * gas * filled * face;
    // text stays a black stencil against the glowing gas
    vec2 tuv = pl.xy / vec2(2.7, 0.62) * 0.5 + 0.5;
    float tin = step(0.,tuv.x)*step(tuv.x,1.)*step(0.,tuv.y)*step(tuv.y,1.);
    float a = texture2D(uText, tuv).a * tin * smoothstep(0.15,0.55,n.z);
    col = mix(col, vec3(0.04), a);                     // near-black base letters
    float sweep = fract(uTime * 0.22) * 2.4 - 0.7;     // travels off-screen then dwells, ~4.5s loop
    float d = tuv.x - sweep;                           // signed: >0 ahead of streak, <0 behind
    float streak = exp(-abs(d) / (d > 0.0 ? 0.03 : 0.20)); // sharp head, long fading trail behind
    col = mix(col, vec3(0.42, 0.10, 0.0), streak * a); // saturated dark-orange shine wipes through
    alpha = 1.0;
    }
    gl_FragColor = vec4(col, alpha);
  }
  """

-- ---------------------------------------------------------------------------
-- The label canvas. All maths/config is PureScript; Graphics.Canvas does the
-- 2D drawing, GL.uploadCanvas turns it into the uText sampler.
-- ---------------------------------------------------------------------------

type LabelConfig =
  { text :: String
  , font :: String
  , letterSpacing :: String
  , offsetX :: Number
  }

labelConfig :: LabelConfig
labelConfig =
  { text: "install"
  , font: "800 144px \"Sinistre\", \"Sinistre Fallback\", serif"
  , letterSpacing: "8px"
  , offsetX: 4.0
  }

canvasW :: Number
canvasW = 1024.0

canvasH :: Number
canvasH = 256.0

makeLabelCanvas :: LabelConfig -> Effect CanvasElement
makeLabelCanvas cfg = do
  el <- createCanvasElement
  setCanvasWidth el canvasW
  setCanvasHeight el canvasH
  drawLabel el cfg
  pure el

drawLabel :: CanvasElement -> LabelConfig -> Effect Unit
drawLabel el cfg = do
  ctx <- getContext2D el
  clearRect ctx { x: 0.0, y: 0.0, width: canvasW, height: canvasH }
  setFillStyle ctx "#fff"
  setFont ctx cfg.font
  setTextAlign ctx AlignCenter
  setTextBaseline ctx BaselineMiddle
  setFontKerning ctx kerningNormal
  setLetterSpacing ctx (LetterSpacing cfg.letterSpacing)
  fillText ctx cfg.text (canvasW / 2.0 + cfg.offsetX) (canvasH / 2.0)
