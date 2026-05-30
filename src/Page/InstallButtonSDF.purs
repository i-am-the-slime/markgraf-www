module Page.InstallButtonSDF (installButtonSDF) where

import Prelude

import Data.Foldable (traverse_)
import Data.Maybe (Maybe(..))
import Data.Nullable (Nullable, null)
import Data.Number (exp, sin)
import Effect (Effect)
import Effect.Uncurried (EffectFn1, EffectFn2, mkEffectFn1, runEffectFn1, runEffectFn2)
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (JSX, ReactComponent, Ref, element)
import React.Basic.Events (handler_)
import React.Basic.Hooks (readRef, readRefMaybe, reactComponent, useEffectOnce, useRef, writeRef)
import React.Basic.Hooks as Hooks
import React.R3F.Hooks (RootState, applyProps, useFrame)
import React.R3F.Three.Internal (threejs)
import React.R3F.Three.Types (Object3D, Texture, placeholderTexture)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.Internal (css)
import Yoga.React.R3F.Canvas (canvas)

-- The "INSTALL" button is one fullscreen-quad raymarcher: a grey glassy shape
-- morphs through markgraf's node silhouettes, fills with blue->red gas from the
-- cursor on hover, and carries the black INSTALL letters with an orange comet
-- shimmer wiping across them. The shape, with its baked-in text, IS the button.
installButtonSDF :: JSX
installButtonSDF = element installButton {}

-- Hover is tracked on the DOM anchor, not by raycasting the quad: the shader
-- bypasses the camera, so the 2x2 plane only covers a sliver of the frustum and
-- mesh pointer events would miss most of the visible shape. The anchor wraps the
-- whole button, so enter/leave there is reliable. hoveringRef is shared into the
-- scene, where useFrame reads it to drive the gas fill and the cursor tilt.
installButton :: ReactComponent {}
installButton = unsafePerformEffect $ reactComponent "InstallButtonSDF" \_ -> Hooks.do
  hoveringRef <- useRef false
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
      }
      [ canvas
          { gl: { alpha: true }
          , dpr: [ 1.0, 2.0 ]
          , style: css { position: "absolute", inset: "0" }
          , children: element installSDFScene { hoveringRef }
          }
      ]

installSDFScene :: ReactComponent { hoveringRef :: Ref Boolean }
installSDFScene = unsafePerformEffect $ reactComponent "InstallSDFScene" \{ hoveringRef } -> Hooks.do
  matRef <- useRef null
  textureRef <- useRef Nothing
  prevTickRef <- useRef 0.0
  phaseRef <- useRef 0.0
  targetRef <- useRef 0.0
  lastSwitchRef <- useRef 0.0
  yawRef <- useRef 0.0
  tiltRef <- useRef idleTilt
  fillRef <- useRef 0.0

  useEffectOnce do
    text <- makeTextTexture "INSTALL"
    writeRef textureRef (Just text)
    refreshTextOnFontLoad "INSTALL" \refreshed -> writeRef textureRef (Just refreshed)
    pure (pure unit)

  useFrame \rs _ -> do
    let t = readClockElapsed rs
    prevTick <- readRef prevTickRef
    writeRef prevTickRef t
    let dt = if prevTick > 0.0 then t - prevTick else 0.0

    phase <- advancePhase phaseRef targetRef lastSwitchRef t dt
    hovering <- readRef hoveringRef
    let mx = readPointerX rs
        my = readPointerY rs
        aspect = readAspect rs
    yaw <- easeYaw yawRef hovering mx t dt
    tilt <- easeTilt tiltRef hovering my t dt
    fill <- easeFill fillRef hovering dt

    readRefMaybe matRef # withJust \m -> do
      applyProps m
        { "uniforms-uTime-value": t
        , "uniforms-uPhase-value": phase
        , "uniforms-uRot-value": yaw
        , "uniforms-uTilt-value": tilt
        , "uniforms-uFill-value": fill
        , "uniforms-uMouse-value": [ mx * 0.5 * aspect, -my * 0.5 ]
        , "uniforms-uRes-value": [ readBufferWidth rs, readBufferHeight rs ]
        }
      readRef textureRef >>= traverse_ \text -> applyProps m { "uniforms-uText-value": text }

  pure (sdfQuad matRef)

withJust :: forall a. (a -> Effect Unit) -> Effect (Maybe a) -> Effect Unit
withJust f m = m >>= traverse_ f

-- ---------------------------------------------------------------------------
-- Animation state machine, ported from the prototype's frame() — all over Refs.
-- ---------------------------------------------------------------------------

-- The morph index eases toward an integer target that ticks up every STEP
-- seconds (Freya exp-decay), wrapping back at L shapes so the loop is seamless.
advancePhase
  :: Ref Number -> Ref Number -> Ref Number
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
easeYaw :: Ref Number -> Boolean -> Number -> Number -> Number -> Effect Number
easeYaw yawRef hovering mx t dt = do
  yaw0 <- readRef yawRef
  let yaw1 = yaw0 + (targetYaw - yaw0) * orientEase dt
  writeRef yawRef yaw1
  pure yaw1
  where
  targetYaw = if hovering then mx * 0.45 else sin (t * 0.45) * 0.22

-- Tilt likewise tracks the cursor's vertical, settling to a slow idle bob.
easeTilt :: Ref Number -> Boolean -> Number -> Number -> Number -> Effect Number
easeTilt tiltRef hovering my t dt = do
  tilt0 <- readRef tiltRef
  let tilt1 = tilt0 + (targetTilt - tilt0) * orientEase dt
  writeRef tiltRef tilt1
  pure tilt1
  where
  targetTilt = if hovering then idleTilt + my * 0.5 else idleTilt + sin (t * 0.32) * 0.12

-- The gas fills toward 1 on hover and empties toward 0 on leave.
easeFill :: Ref Number -> Boolean -> Number -> Effect Number
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

shapeCount :: Number
shapeCount = 6.0

-- ---------------------------------------------------------------------------
-- The fullscreen quad: a ShaderMaterial raymarcher. uText starts as a
-- placeholder and is swapped for the drawn label once useEffectOnce runs.
-- ---------------------------------------------------------------------------

sdfQuad :: Ref (Nullable Object3D) -> JSX
sdfQuad matRef = element (threejs "Mesh")
  { frustumCulled: false
  , children:
      [ element (threejs "PlaneGeometry") { args: [ 2.0, 2.0 ] }
      , element (threejs "ShaderMaterial")
          { ref: matRef
          , vertexShader: sdfVert
          , fragmentShader: sdfFrag
          , transparent: true
          , uniforms:
              { uRes: { value: [ 1.0, 1.0 ] }
              , uPhase: { value: 0.0 }
              , uRot: { value: 0.0 }
              , uTilt: { value: idleTilt }
              , uFill: { value: 0.0 }
              , uTime: { value: 0.0 }
              , uMouse: { value: [ 0.0, 0.0 ] }
              , uText: { value: placeholderTexture }
              }
          }
      ]
  }

-- ---------------------------------------------------------------------------
-- Shaders, ported verbatim from the prototype (dead uniforms/SDFs dropped:
-- uGlow, uDB, uGlowTex/makeGlowTexture, the arrow SDFs, sdHexPrism,
-- sdOctahedron, shapeHW, mapScaled — none are reachable from main()).
-- ---------------------------------------------------------------------------

sdfVert :: String
sdfVert = "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }"

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
-- FFI: per-frame reads off the r3f root state, and the text-canvas texture.
-- ---------------------------------------------------------------------------

readClockElapsed :: { | RootState } -> Number
readClockElapsed = readClockElapsedImpl

readPointerX :: { | RootState } -> Number
readPointerX = readPointerXImpl

readPointerY :: { | RootState } -> Number
readPointerY = readPointerYImpl

readAspect :: { | RootState } -> Number
readAspect = readAspectImpl

readBufferWidth :: { | RootState } -> Number
readBufferWidth = readBufferWidthImpl

readBufferHeight :: { | RootState } -> Number
readBufferHeight = readBufferHeightImpl

foreign import readClockElapsedImpl :: { | RootState } -> Number
foreign import readPointerXImpl :: { | RootState } -> Number
foreign import readPointerYImpl :: { | RootState } -> Number
foreign import readAspectImpl :: { | RootState } -> Number
foreign import readBufferWidthImpl :: { | RootState } -> Number
foreign import readBufferHeightImpl :: { | RootState } -> Number

makeTextTexture :: String -> Effect Texture
makeTextTexture = runEffectFn1 makeTextTextureImpl

foreign import makeTextTextureImpl :: EffectFn1 String Texture

refreshTextOnFontLoad :: String -> (Texture -> Effect Unit) -> Effect Unit
refreshTextOnFontLoad str handler = runEffectFn2 refreshTextOnFontLoadImpl str (mkEffectFn1 handler)

foreign import refreshTextOnFontLoadImpl :: EffectFn2 String (EffectFn1 Texture Unit) Unit
