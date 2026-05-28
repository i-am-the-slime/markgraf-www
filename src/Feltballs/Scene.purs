module Feltballs.Scene (sceneJSX) where

import Prelude

import Data.Array (any, dropWhile, drop, foldl, index, last, range, snoc, uncons, zipWith)
import Data.Foldable (for_, sum, traverse_)
import Data.Int as Int
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.Nullable (Nullable, toNullable)
import Data.Number (acos, cos, floor, pi, sin, sqrt)
import Effect (Effect)
import Effect.Random (randomInt)
import Effect.Unsafe (unsafePerformEffect)
import Feltballs.Bindings (cylinderGeometry, instance_, instances, meshBasicMaterial, meshStandardMaterial)
import React.Basic (JSX, Ref, element)
import React.Basic.Hooks (Component, component, readRef, readRefMaybe, useEffectOnce, useRef, useState, writeRef, (/\))
import React.Basic.Hooks as Hooks
import React.R3F.Hooks (applyProps, useFrame)
import React.R3F.Three.Internal (threejs)
import React.R3F.Three.Types (Object3D)
import Unsafe.Coerce (unsafeCoerce)

noRaycast :: forall a. a
noRaycast = unsafeCoerce (\_ _ -> unit)

-- Mutable per-ball byte buffer for marking connected/last-color state. Allocated
-- once and mutated in place to avoid array reallocs on the hot path.
foreign import data U8Array :: Type

newU8 :: Int -> Effect U8Array
newU8 = newU8Impl

readU8 :: U8Array -> Int -> Effect Int
readU8 a i = readU8Impl a i

writeU8 :: U8Array -> Int -> Int -> Effect Unit
writeU8 a i v = writeU8Impl a i v

fillU8 :: U8Array -> Int -> Effect Unit
fillU8 = fillU8Impl

-- Per-ball pop bookkeeping. popStart is the elapsed-time when the ball started
-- popping (or -1 if not popping). Lives outside React state so closeCycle
-- doesn't churn React and per-frame reads are direct typed-array indexing.
foreign import data F32Array :: Type

newF32 :: Int -> Effect F32Array
newF32 = newF32Impl

readF32 :: F32Array -> Int -> Effect Number
readF32 a i = readF32Impl a i

writeF32 :: F32Array -> Int -> Number -> Effect Unit
writeF32 a i v = writeF32Impl a i v

-- Frame cadence — backdrop renders at this rate, not 60. useFrame still fires
-- every rAF, we just bail early when not enough time has passed.
frameInterval :: Number
frameInterval = 1.0 / 30.0

-- Color indices written into the last-color buffer; the index matches the
-- branch in `ballColor` so we can compare cheaply before deciding to repaint.
colorNormal :: Int
colorNormal = 0

colorConnected :: Int
colorConnected = 1

colorHover :: Int
colorHover = 2

ballColorHex :: Int -> String
ballColorHex 2 = "#ffd84a"
ballColorHex 1 = "#ff5a2a"
ballColorHex _ = "#0a0e1a"

makeFog :: String -> Number -> Number -> JSX
makeFog color near far =
  element (threejs "Fog") { attach: "fog", args: [ unsafeCoerce color, unsafeCoerce near, unsafeCoerce far ] }

makeHemisphereLight :: String -> String -> Number -> JSX
makeHemisphereLight sky ground intensity =
  element (threejs "HemisphereLight") { args: [ unsafeCoerce sky, unsafeCoerce ground, unsafeCoerce intensity ] }

totalBalls :: Int
totalBalls = 135

segDuration :: Number
segDuration = 0.45

popDuration :: Number
popDuration = 0.55

rrEnd :: Int
rrEnd = 101

pgEnd :: Int
pgEnd = 128

-- hold lives in a ref, not React state. Putting it in state caused the parent
-- component to re-render on every chain transition, which made drei reconcile
-- every <Instance> and flicker. ArrowsLayer reads the ref each frame.

type FrameState =
  { t :: Number
  , aspect :: Number
  }

type ChainNode = { idx :: Int, cycle :: Int }

type HoldState =
  { chain :: Array ChainNode
  , target :: ChainNode
  , segStart :: Number
  }

type Vec3 = { x :: Number, y :: Number, z :: Number }

-- Per-ball mesh refs are stable across all renders. React writes the mounted
-- drei PositionMesh into .current; useFrame mutates .position/.scale/etc.
-- A React ref is just `{current: null}`; allocate one per ball with no FFI.
ballRefs :: Array (Ref (Nullable Object3D))
ballRefs = (\_ -> unsafeCoerce { current: toNullable Nothing }) <$> range 1 totalBalls

ballRefAt :: Int -> Ref (Nullable Object3D)
ballRefAt i = fromMaybe (unsafeCoerce unit) (index ballRefs i)

wireRefs :: Array (Ref (Nullable Object3D))
wireRefs = (\_ -> unsafeCoerce { current: toNullable Nothing }) <$> range 1 totalBalls

wireRefAt :: Int -> Ref (Nullable Object3D)
wireRefAt i = fromMaybe (unsafeCoerce unit) (index wireRefs i)

-- Module-level mutable scratch. Stable across re-renders without needing a ref
-- since the underlying U8Array identity never changes.
connectedBuf :: U8Array
connectedBuf = unsafePerformEffect (newU8 totalBalls)

lastColorBuf :: U8Array
lastColorBuf = unsafePerformEffect do
  a <- newU8 totalBalls
  fillU8 a 255
  pure a

popStartBuf :: F32Array
popStartBuf = unsafePerformEffect (newF32 totalBalls)

-- morphBuf layout: [0..3] target (dx, dy, dz, amount), [4..7] current.
-- Direction is unit-ish; amount in 0..1; explodeMagnitude scales the offset.
morphBuf :: F32Array
morphBuf = unsafePerformEffect do
  a <- newF32 8
  for_ (range 0 7) \i -> writeF32 a i 0.0
  pure a

-- formationBuf: [0..4] target (kind, radius, length, speed, order),
--               [5..9] current (kind, radius, length, speed, order).
-- kind is snapped (Int-valued); the other four lerp.
formationBuf :: F32Array
formationBuf = unsafePerformEffect do
  a <- newF32 10
  for_ (range 0 9) \i -> writeF32 a i 0.0
  pure a

-- cameraBuf layout: [0..6] target (px, py, pz, lx, ly, lz, fov),
--                   [7..13] current. Init from the default camera so the
-- first morph lerps from the home pose.
cameraBuf :: F32Array
cameraBuf = unsafePerformEffect do
  a <- newF32 14
  let init i v = writeF32 a i v
  -- target = current = home pose: position (0,-3,9), lookAt origin, fov 85.
  -- Matches HeroPreview's `home` so the first frame doesn't snap.
  init 0 0.0
  init 1 (-3.0)
  init 2 9.0
  init 3 0.0
  init 4 0.0
  init 5 0.0
  init 6 85.0
  init 7 0.0
  init 8 (-3.0)
  init 9 9.0
  init 10 0.0
  init 11 0.0
  init 12 0.0
  init 13 85.0
  pure a

explodeMagnitude :: Number
explodeMagnitude = 80.0

lerpRate :: Number
lerpRate = 0.05

sceneJSX :: JSX
sceneJSX = animatedField {}

animatedField :: {} -> JSX
animatedField = unsafePerformEffect animatedFieldComponent

animatedFieldComponent :: Component {}
animatedFieldComponent = component "AnimatedField" \_ -> Hooks.do
  noiseMatRef <- useRef (toNullable (Nothing :: Maybe Object3D))
  frameRef <- useRef initFrame
  lastPaintRef <- useRef (-1.0)
  holdRef <- useRef (Nothing :: Maybe HoldState)

  useEffectOnce $
    installStartChainListener (startChainFromRandom holdRef frameRef)

  useEffectOnce $ installMorphListener \dx dy dz amount -> do
    writeF32 morphBuf 0 dx
    writeF32 morphBuf 1 dy
    writeF32 morphBuf 2 dz
    writeF32 morphBuf 3 amount
    when (amount > 0.5) (writeRef holdRef Nothing)

  useEffectOnce $ installFormationListener \kind radius length speed order -> do
    writeF32 formationBuf 0 kind
    writeF32 formationBuf 1 radius
    writeF32 formationBuf 2 length
    writeF32 formationBuf 3 speed
    writeF32 formationBuf 4 order
    -- Snap kind in the current slot so we never lerp through nonsense kinds.
    writeF32 formationBuf 5 kind

  useEffectOnce $ installCameraListener \px py pz lx ly lz fov -> do
    writeF32 cameraBuf 0 px
    writeF32 cameraBuf 1 py
    writeF32 cameraBuf 2 pz
    writeF32 cameraBuf 3 lx
    writeF32 cameraBuf 4 ly
    writeF32 cameraBuf 5 lz
    writeF32 cameraBuf 6 fov

  useFrame \rs _ -> do
    let t = readClockElapsed rs
    lastT <- readRef lastPaintRef
    when (t - lastT >= frameInterval) do
      let aspect = readAspect rs
      writeRef lastPaintRef t
      writeRef frameRef { t, aspect }

      readRefMaybe noiseMatRef # withJust \m -> applyProps m
        { "uniforms-u_time-value": t }

      morph <- lerpMorph
      formation <- lerpFormation
      lerpAndApplyCamera rs
      hold <- readRef holdRef
      refreshConnected hold
      for_ (range 0 (totalBalls - 1)) (paintBall t morph formation)

      when (morph.amount < 0.01 && formation.order < 0.01)
        (advanceHoldEffect holdRef t)

  pure $ element (threejs "Group")
    { children:
        ([ fog
         , ambient
         , hemi
         , directional
         , rim
         ] <> shapeGroups)
          <> [ arrowsLayer { holdRef } ]
          <> [ noiseOverlay noiseMatRef ]
    }
  where
  initFrame = { t: 0.0, aspect: 1.0 }
  fog = makeFog "#0a0e1a" 6.0 55.0
  ambient = element (threejs "AmbientLight") { intensity: 0.12 }
  hemi = makeHemisphereLight "#c8cdd9" "#1a1f2e" 0.9
  directional = element (threejs "DirectionalLight")
    { intensity: 0.45, position: [ 3.0, 4.0, 5.0 ] }
  rim = element (threejs "DirectionalLight")
    { intensity: 0.35, color: "#ff3b1a", position: [ -4.0, -2.0, -3.0 ] }

withJust :: forall a. (a -> Effect Unit) -> Effect (Maybe a) -> Effect Unit
withJust f m = m >>= traverse_ f

-- Refresh the connected-bitmask in place. Cheap: clear and set just the few
-- chain members. Avoids the per-ball O(C) `elem` scan in paintBall.
refreshConnected :: Maybe HoldState -> Effect Unit
refreshConnected hold = do
  fillU8 connectedBuf 0
  case hold of
    Nothing -> pure unit
    Just h -> for_ h.chain \n -> writeU8 connectedBuf n.idx 1

type Morph = { dx :: Number, dy :: Number, dz :: Number, amount :: Number }

type Formation =
  { kind :: Number, radius :: Number, length :: Number, speed :: Number, order :: Number }

lerpFormation :: Effect Formation
lerpFormation = do
  -- kind doesn't lerp — snap from the listener so we never blend two shapes.
  kind <- readF32 formationBuf 5
  radius <- step 1 6
  length <- step 2 7
  speed <- step 3 8
  order <- step 4 9
  pure { kind, radius, length, speed, order }
  where
  step ti ci = do
    target <- readF32 formationBuf ti
    cur <- readF32 formationBuf ci
    let n = cur + (target - cur) * lerpRate
    writeF32 formationBuf ci n
    pure n

formationPos :: Number -> Formation -> Int -> Vec3
formationPos t f i = applyDance t i basePos
  where
  basePos =
    if kindInt == 1 then ringPos t f i
    else if kindInt == 2 then spherePos t f i
    else if kindInt == 3 then helixPos t f i
    else if kindInt == 4 then wavePos t f i
    else if kindInt == 5 then tornadoPos t f i
    else { x: 0.0, y: 0.0, z: 0.0 }
  kindInt = Int.round f.kind

-- Layered on top of every formation: per-ball micro-sway so each dancer has
-- their own phase, plus a slow whole-cluster sideways drift so the formation
-- travels across the camera left ↔ right. Without this the rotations look
-- static and metronomic.
-- Per-ball micro-sway only: each dancer has their own phase so the cluster
-- ripples in place. No cluster-wide drift — the section's camera arm decides
-- where the formation sits in frame, and it stays parked there.
applyDance :: Number -> Int -> Vec3 -> Vec3
applyDance t i p =
  { x: p.x + sx, y: p.y + sy, z: p.z + sz }
  where
  fi = Int.toNumber i
  sx = sin (t * 0.85 + fi * 0.31) * 0.55
  sy = cos (t * 0.55 + fi * 0.27) * 0.40
  sz = sin (t * 0.65 + fi * 0.19) * 0.35

-- Five concentric rings of 27 balls, slowly rotating. Each ring is offset in
-- y so the whole thing stacks into a short column.
ringPos :: Number -> Formation -> Int -> Vec3
ringPos t f i = { x, y, z }
  where
  fi = Int.toNumber i
  per = 27.0
  ringIdx = floor (fi / per)
  posInRing = fi - ringIdx * per
  theta = 2.0 * pi * posInRing / per + t * f.speed
  r = f.radius + ringIdx * 0.6
  x = r * cos theta
  y = ringIdx * 0.7 - 1.4
  z = r * sin theta

-- Fibonacci sphere: deterministic, evenly distributed. Slow rotation about Y.
spherePos :: Number -> Formation -> Int -> Vec3
spherePos t f i = { x, y, z }
  where
  fi = Int.toNumber i
  n = Int.toNumber totalBalls
  goldenRatio = 1.6180339887
  theta = 2.0 * pi * fi / goldenRatio + t * f.speed
  phi = acos (1.0 - 2.0 * (fi + 0.5) / n)
  x = f.radius * sin phi * cos theta
  y = f.radius * cos phi
  z = f.radius * sin phi * sin theta

-- Joy Division "Unknown Pleasures" pulsar-trace look: balls are distributed
-- into stacked horizontal scan lines, each line tracing pulse-shaped peaks
-- of varying heights, denser toward the centre, sparser at the edges. Each
-- row has its own phase so the peaks don't line up vertically.
-- `length` sets horizontal extent, `radius` the peak amplitude, `speed` how
-- fast the trace scrolls.
wavePos :: Number -> Formation -> Int -> Vec3
wavePos t f i = { x, y, z: 0.0 }
  where
  rows = 5
  perRow = totalBalls / rows
  rowIdx = i / perRow
  posInRow = i - rowIdx * perRow
  rowsN = Int.toNumber rows
  rowIdxN = Int.toNumber rowIdx
  perRowN = Int.toNumber perRow
  -- Per-row horizontal stagger breaks the column alignment that otherwise
  -- makes the formation read as vertical bars instead of horizontal scan
  -- lines. Offset is a fraction of one ball-step, varied per row by an
  -- irrational-ish sine so no two rows line up.
  step = 1.0 / (perRowN - 1.0)
  rowOffsetU = sin (rowIdxN * 1.732) * step * 1.7
  u = Int.toNumber posInRow / (perRowN - 1.0) + rowOffsetU
  x = (u - 0.5) * f.length
  rowSpacing = 7.0
  rowY = (rowIdxN - (rowsN - 1.0) * 0.5) * rowSpacing
  rowPhase = rowIdxN * 1.7
  -- Pulse pulse: (abs sin)^4 makes a sharp positive spike. Three layered at
  -- mismatched frequencies + phases gives Joy-Division-y random-looking peaks
  -- that drift slowly with t.
  -- (sin k)^2 — a *fat* positive pulse (not the ^4 needle). Fatter peaks span
  -- multiple balls along x so each peak reads as a horizontal hump rather than
  -- a single tall ball that the eye joins into a vertical bar.
  pulse k = q * q
    where
    s = sin k
    q = if s < 0.0 then -s else s
  p1 = pulse (x * 0.62 + rowPhase + t * f.speed * 0.45)
  p2 = pulse (x * 1.27 - rowPhase * 0.7 + t * f.speed * 0.31) * 0.65
  p3 = pulse (x * 2.11 + rowPhase * 1.3 - t * f.speed * 0.23) * 0.35
  -- Per-x amplitude envelope (low-frequency, row-dependent) so peaks in
  -- "loud" stretches tower over peaks in "quiet" ones. Without this every
  -- spike caps near the same height because (abs sin)^4 maxes at 1.
  ampWiggle = sin (x * 0.028 + rowPhase * 2.3 + t * 0.07)
            + sin (x * 0.061 - rowPhase * 1.1 + t * 0.05) * 0.8
            + sin (x * 0.13  + rowPhase * 3.7 - t * 0.03) * 0.5
  -- Map ampWiggle (~[-2.3..2.3]) into a steep curve: cube it so extremes
  -- dominate, then offset+scale to [0.05 .. 3.2]. Quiet stretches nearly
  -- flatten while loud peaks tower 3× over the median.
  w = ampWiggle / 2.3
  amp = 0.05 + 1.6 * (w * w * w + 1.0)
  spike = (p1 + p2 + p3) * amp
  -- Bell-shaped center fade: tall in the middle, near-zero at the edges.
  xc = x * 0.11
  centerFade = 1.0 / (1.0 + xc * xc)
  y = rowY + spike * centerFade * f.radius

-- Multi-turn helix along Y. `length` is the total Y extent.
helixPos :: Number -> Formation -> Int -> Vec3
helixPos t f i = { x, y, z }
  where
  fi = Int.toNumber i
  n = Int.toNumber totalBalls
  turns = 5.0
  theta = 2.0 * pi * turns * fi / n + t * f.speed
  y = (fi / n) * f.length - f.length / 2.0
  x = f.radius * cos theta
  z = f.radius * sin theta

-- Funnel-shaped helix: radius narrows toward the bottom, widens toward the
-- top, with a faster spin and a slight per-ball wobble so the cone looks
-- turbulent. `radius` is the top width; `length` is the total height.
tornadoPos :: Number -> Formation -> Int -> Vec3
tornadoPos t f i = { x, y, z }
  where
  fi = Int.toNumber i
  n = Int.toNumber totalBalls
  turns = 6.0
  u = fi / n
  y = u * f.length - f.length / 2.0
  funnel = 0.15 + u * u
  wobble = 1.0 + sin (t * 2.1 + fi * 0.37) * 0.12
  r = f.radius * funnel * wobble
  theta = 2.0 * pi * turns * u + t * f.speed * (1.6 + (1.0 - u) * 0.8)
  x = r * cos theta
  z = r * sin theta

lerpMorph :: Effect Morph
lerpMorph = do
  tdx <- readF32 morphBuf 0
  tdy <- readF32 morphBuf 1
  tdz <- readF32 morphBuf 2
  tam <- readF32 morphBuf 3
  cdx <- readF32 morphBuf 4
  cdy <- readF32 morphBuf 5
  cdz <- readF32 morphBuf 6
  cam <- readF32 morphBuf 7
  let ndx = cdx + (tdx - cdx) * lerpRate
      ndy = cdy + (tdy - cdy) * lerpRate
      ndz = cdz + (tdz - cdz) * lerpRate
      nam = cam + (tam - cam) * lerpRate
  writeF32 morphBuf 4 ndx
  writeF32 morphBuf 5 ndy
  writeF32 morphBuf 6 ndz
  writeF32 morphBuf 7 nam
  pure { dx: ndx, dy: ndy, dz: ndz, amount: nam }

lerpAndApplyCamera :: forall r. { | r } -> Effect Unit
lerpAndApplyCamera rs = do
  let step ti ci = do
        target <- readF32 cameraBuf ti
        cur <- readF32 cameraBuf ci
        let n = cur + (target - cur) * lerpRate
        writeF32 cameraBuf ci n
        pure n
  px <- step 0 7
  py <- step 1 8
  pz <- step 2 9
  lx <- step 3 10
  ly <- step 4 11
  lz <- step 5 12
  fov <- step 6 13
  applyCamera rs px py pz lx ly lz fov

paintBall :: Number -> Morph -> Formation -> Int -> Effect Unit
paintBall t morph formation i = do
  popMul <- popMultiplierAt t i
  let envBlended = envelope * (1.0 - ord) + ord
      scale = baseScale * envBlended * popMul
  readRefMaybe (ballRefAt i) # withJust \o -> do
    applyProps o
      { position: [ px, py, pz ]
      , scale
      , rotation: [ spin, spin * 0.7, 0.0 ]
      }
    -- Only push color when it actually changes — drei marks instanceColor
    -- needsUpdate on every setColorAt and re-uploads the buffer to the GPU.
    isConn <- readU8 connectedBuf i
    let nextColor = if isConn == 1 then colorConnected else colorNormal
    prev <- readU8 lastColorBuf i
    when (prev /= nextColor) do
      applyProps o { color: ballColorHex nextColor }
      writeU8 lastColorBuf i nextColor
  readRefMaybe (wireRefAt i) # withJust \o ->
    applyProps o
      { position: [ px, py, pz ]
      , scale: scale * 1.18
      , rotation: [ spin, spin * 0.7, 0.0 ]
      }
  where
  streamP = ballPos t i
  formP = formationPos t formation i
  ord = clamp01 formation.order
  baseX = streamP.x + (formP.x - streamP.x) * ord
  baseY = streamP.y + (formP.y - streamP.y) * ord
  baseZ = streamP.z + (formP.z - streamP.z) * ord
  fi = Int.toNumber i
  travel = (t + hash01 (fi * 37.719) * corridorDepth / streamSpeed) * streamSpeed
  cycles = floor (travel / corridorDepth)
  local = travel - cycles * corridorDepth
  u = local / corridorDepth
  baseScale = 0.55 + 0.45 * hash01 (fi * 1.61803)
  envelope = plopEnvelope u
  spin = t * (0.3 + hash01 (fi * 4.27) * 0.6) + fi
  jx = (hash01 (fi * 9.13) - 0.5) * 0.35
  jy = (hash01 (fi * 17.37) - 0.5) * 0.35
  jz = (hash01 (fi * 23.71) - 0.5) * 0.35
  off = morph.amount * explodeMagnitude
  px = baseX + (morph.dx + jx) * off
  py = baseY + (morph.dy + jy) * off
  pz = baseZ + (morph.dz + jz) * off

metaballBackground :: Ref (Nullable Object3D) -> JSX
metaballBackground matRef = element (threejs "Mesh")
  { renderOrder: -1000
  , frustumCulled: false
  , raycast: noRaycast
  , children:
      [ element (threejs "PlaneGeometry") { args: [ 2.0, 2.0 ] }
      , element (threejs "ShaderMaterial")
          { ref: matRef
          , vertexShader: bgVert
          , fragmentShader: bgFrag
          , depthTest: false
          , depthWrite: false
          , uniforms:
              { u_time: { value: 0.0 }
              , u_aspect: { value: 1.0 }
              }
          }
      ]
  }

bgVert :: String
bgVert =
  """
  varying vec2 vUv;
  void main(){
    vUv = position.xy;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
  """

bgFrag :: String
bgFrag =
  """
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_aspect;
  float h1(float n){ return fract(sin(n) * 43758.5453); }
  void main(){
    vec2 uv = vec2(vUv.x * u_aspect * 0.5, vUv.y * 0.5);
    float field = 0.0;
    for (float i = 0.0; i < 6.0; i += 1.0) {
      float s = i * 7.13;
      float fx = 0.12 + h1(s) * 0.18;
      float fy = 0.10 + h1(s + 1.0) * 0.16;
      vec2 ctr = vec2(
        sin(u_time * fx + s * 5.0) * u_aspect * 0.85,
        cos(u_time * fy + s * 3.0) * 0.7
      );
      float r = 0.42 + 0.14 * sin(u_time * 0.30 + s * 4.0);
      float d = length(uv - ctr);
      field += exp(-d * d / (r * r));
    }
    vec3 c0 = vec3(0.039, 0.055, 0.102);
    vec3 c1 = vec3(0.16, 0.20, 0.34);
    vec3 c2 = vec3(0.28, 0.36, 0.55);
    vec3 c3 = vec3(0.55, 0.65, 0.85);
    vec3 col = c0;
    col = mix(col, c1, smoothstep(0.05, 0.5, field));
    col = mix(col, c2, smoothstep(0.6, 1.3, field));
    col = mix(col, c3, smoothstep(1.4, 2.4, field));
    col *= smoothstep(1.65, 0.35, length(uv)) * 0.95 + 0.05;
    gl_FragColor = vec4(col, 1.0);
  }
  """

noiseOverlay :: Ref (Nullable Object3D) -> JSX
noiseOverlay matRef = element (threejs "Mesh")
  { renderOrder: 999
  , frustumCulled: false
  , raycast: noRaycast
  , children:
      [ element (threejs "PlaneGeometry") { args: [ 2.0, 2.0 ] }
      , element (threejs "ShaderMaterial")
          { ref: matRef
          , vertexShader: noiseVert
          , fragmentShader: noiseFrag
          , transparent: true
          , depthTest: false
          , depthWrite: false
          , blending: 2
          , uniforms: { u_time: { value: 0.0 } }
          }
      ]
  }

noiseVert :: String
noiseVert =
  "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }"

noiseFrag :: String
noiseFrag =
  """
  precision mediump float;
  uniform float u_time;
  float hash(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  void main(){
    vec2 c = gl_FragCoord.xy + vec2(sin(u_time*0.1), cos(u_time*0.13));
    float u1 = max(hash(c), 0.0001);
    float u2 = hash(c + vec2(1.0));
    float n = sqrt(-2.0 * log(u1)) * cos(6.28318530718 * u2);
    float v = clamp(n * 0.5 + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(vec3(v) * 0.18, 1.0);
  }
  """

-- | Triggered by a "startChain" message from the host page. Picks a random
-- | non-popped ball as the source and seeds the hold state; the existing
-- | `advanceHoldEffect` carries the chain forward each frame.
startChainFromRandom
  :: Ref (Maybe HoldState)
  -> Ref FrameState
  -> Effect Unit
startChainFromRandom holdRef frameRef = do
  existing <- readRef holdRef
  case existing of
    Just _ -> pure unit
    Nothing -> do
      frame <- readRef frameRef
      -- Skip popped balls as sources: the chain can close back on its source, and
      -- re-popping an already-popped ball restarts deathPop from k=0 — which makes
      -- the ball swell briefly back to scale ≈1 and then shrink, i.e. pop-pulses.
      maybeSrc <- pickFreshSource totalBalls
      case maybeSrc of
        Nothing -> pure unit
        Just source -> do
          targetIdx <- pickNearest frame.t source (-1)
          let sourceNode = { idx: source, cycle: ballCycle frame.t source }
              targetNode = { idx: targetIdx, cycle: ballCycle frame.t targetIdx }
              fresh = { chain: [ sourceNode ], target: targetNode, segStart: frame.t }
          writeRef holdRef (Just fresh)

pickFreshSource :: Int -> Effect (Maybe Int)
pickFreshSource attempts
  | attempts <= 0 = pure Nothing
  | otherwise = do
      i <- randomInt 0 (totalBalls - 1)
      hidden <- isHidden i
      if hidden then pickFreshSource (attempts - 1)
      else pure (Just i)

advanceHoldEffect
  :: Ref (Maybe HoldState)
  -> Number
  -> Effect Unit
advanceHoldEffect holdRef t = readRef holdRef >>= case _ of
  Nothing -> pure unit
  Just h -> advanceJust h
  where
  wrapped n = ballCycle t n.idx /= n.cycle
  extendedChain h = snoc h.chain h.target
  lastIdx h = maybe (-1) _.idx (last h.chain)

  advanceJust h
    | any wrapped h.chain || wrapped h.target =
        writeRef holdRef Nothing
    | t - h.segStart < segDuration = pure unit
    | otherwise = do
        nextIdx <- pickNearest t h.target.idx (lastIdx h)
        let ext = extendedChain h
        if any (\n -> n.idx == nextIdx) ext then do
          closePops t (dropWhile (\n -> n.idx /= nextIdx) ext)
          writeRef holdRef Nothing
        else
          writeRef holdRef $ Just
            { chain: ext
            , target: { idx: nextIdx, cycle: ballCycle t nextIdx }
            , segStart: t
            }

-- Mutates the pop buffer in place; React state only loses `hold`.
closePops :: Number -> Array ChainNode -> Effect Unit
closePops t nodes = for_ nodes \n -> writeF32 popStartBuf n.idx t

pickNearest :: Number -> Int -> Int -> Effect Int
pickNearest t source avoid =
  _.idx <$> foldlEffect step { idx: -1, d: 1.0e308 } (range 0 (totalBalls - 1))
  where
  origin = ballPos t source
  step acc i =
    if i == source || i == avoid then pure acc
    else do
      hidden <- isHidden i
      if hidden then pure acc
      else pure (compare' acc i)
  compare' acc i =
    if dist < acc.d then { idx: i, d: dist } else acc
    where
    p = ballPos t i
    dx = p.x - origin.x
    dy = p.y - origin.y
    dz = p.z - origin.z
    dist = dx * dx + dy * dy + dz * dz

isHidden :: Int -> Effect Boolean
isHidden i = do
  start <- readF32 popStartBuf i
  pure (start >= 0.0)

foldlEffect :: forall a b. (b -> a -> Effect b) -> b -> Array a -> Effect b
foldlEffect f z = foldl step (pure z)
  where
  step macc a = macc >>= \acc -> f acc a

shapeGroups :: Array JSX
shapeGroups =
  [ shapeGroup rrGeo solidMat 0 101
  , shapeGroup pgGeo solidMat 101 27
  , shapeGroup cylinderGeo solidMat 128 7
  , wireGroup rrGeo 0 101
  , wireGroup pgGeo 101 27
  , wireGroup cylinderGeo 128 7
  ]
  where
  rrGeo = roundedRectGeometry 1.9 1.2 0.55 0.28
  pgGeo = parallelogramGeometry 1.8 1.1 0.6 0.18
  cylinderGeo = cylinderGeometry { args: [ 0.9, 0.9, 1.6, 8.0 ] }
  solidMat = meshStandardMaterial
    { color: "#ffffff"
    , roughness: 0.3
    , metalness: 0.55
    , emissive: "#f5f1e8"
    , emissiveIntensity: 0.04
    }
  wireMat = meshBasicMaterial
    { color: "#ffffff"
    , wireframe: true
    , transparent: true
    , opacity: 0.3
    }

  wireGroup geo startIdx count = instances { limit: count, range: count }
    ([ geo, wireMat ] <> (wireInstance <$> range startIdx (startIdx + count - 1)))

  wireInstance i = instance_ { ref: wireRefAt i }

shapeGroup :: JSX -> JSX -> Int -> Int -> JSX
shapeGroup geo mat startIdx count = instances { limit: count, range: count }
  ([ geo, mat ] <> kids)
  where
  kids = ballInstance <$> range startIdx (startIdx + count - 1)

ballInstance :: Int -> JSX
ballInstance i = instance_
  { ref: ballRefAt i
  , userData: { ballIndex: i }
  }

corridorDepth :: Number
corridorDepth = 120.0

streamSpeed :: Number
streamSpeed = 6.0

spread :: Number
spread = 38.0

popMultiplierAt :: Number -> Int -> Effect Number
popMultiplierAt t i = do
  start <- readF32 popStartBuf i
  let k = (t - start) / popDuration
  pure $
    if start < 0.0 then 1.0
    else if k >= 1.0 then 0.0
    else deathPop k

ballCycle :: Number -> Int -> Int
ballCycle t i = Int.floor (travel / corridorDepth)
  where
  fi = Int.toNumber i
  travel = (t + hash01 (fi * 37.719) * corridorDepth / streamSpeed) * streamSpeed

ballPos :: Number -> Int -> Vec3
ballPos t i = { x, y, z }
  where
  fi = Int.toNumber i
  rx = hash01 (fi * 12.9898)
  ry = hash01 (fi * 78.233)
  phase = hash01 (fi * 37.719) * corridorDepth / streamSpeed
  travel = (t + phase) * streamSpeed
  cycles = floor (travel / corridorDepth)
  local = travel - cycles * corridorDepth
  drift = 0.4 * sin (t * 0.4 + fi)
  x = (rx - 0.5) * spread + drift
  y = (ry - 0.5) * spread * 0.55 + drift - 8.0 + local * 0.77
  z = 8.0 - local * 0.64

-- Arrows are extracted into their own component so the per-frame re-render
-- that drives the growing-tip animation stays local. Re-rendering the parent
-- AnimatedField every frame caused drei to reconcile every <Instance>, which
-- flickered shape colors and matrices.
arrowsLayer :: { holdRef :: Ref (Maybe HoldState) } -> JSX
arrowsLayer = unsafePerformEffect arrowsLayerComponent

arrowsLayerComponent :: Component { holdRef :: Ref (Maybe HoldState) }
arrowsLayerComponent = component "ArrowsLayer" \props -> Hooks.do
  st /\ setSt <- useState initSt
  useFrame \rs _ -> do
    let t = readClockElapsed rs
    hold <- readRef props.holdRef
    setSt \prev -> case prev.hold, hold of
      Nothing, Nothing -> prev
      _, _ -> { hold, t }
  pure $ element (threejs "Group") { children: renderArrows st.t st.hold }
  where
  initSt = { hold: Nothing :: Maybe HoldState, t: 0.0 }

renderArrows :: Number -> Maybe HoldState -> Array JSX
renderArrows _ Nothing = []
renderArrows t (Just h) = arrows t h

arrows :: Number -> HoldState -> Array JSX
arrows t h = completed <> [ growing ]
  where
  chainPositions = (\n -> ballPos t n.idx) <$> h.chain
  targetPos = ballPos t h.target.idx
  completed = zipWith (arrowBetween 1.0) chainPositions (drop 1 chainPositions)
  tailPos = fromMaybe targetPos (last chainPositions)
  progress = clamp01 ((t - h.segStart) / segDuration)
  growing = arrowBetween progress tailPos targetPos

arrowBetween :: Number -> Vec3 -> Vec3 -> JSX
arrowBetween progress from to = arrow { from, to, progress }

arrow :: { from :: Vec3, to :: Vec3, progress :: Number } -> JSX
arrow { from, to, progress } =
  if progress <= 0.0 || totalLen < 0.001 then emptyMesh
  else element (threejs "Group") { children: pathParts <> [ tipPart ] }
  where
  emptyMesh = element (threejs "Group") {}

  corner1 = { x: to.x, y: from.y, z: from.z }
  corner2 = { x: to.x, y: to.y, z: from.z }
  l1 = absN (corner1.x - from.x)
  l2 = absN (corner2.y - corner1.y)
  l3 = absN (to.z - corner2.z)

  dirIn1  = { x: signN (corner1.x - from.x), y: 0.0, z: 0.0 }
  dirOut1 = { x: 0.0, y: signN (corner2.y - corner1.y), z: 0.0 }
  dirIn2  = dirOut1
  dirOut2 = { x: 0.0, y: 0.0, z: signN (to.z - corner2.z) }

  shaftR = 0.06
  tipR = 0.18
  tipLen = min 0.6 (l3 * 0.5)

  baseR = 0.45
  maxR = min baseR (min l1 (min (l2 / 2.0) (max 0.0 (l3 - tipLen))))
  cornerR1 = if l1 > 0.001 && l2 > 0.001 then maxR else 0.0
  cornerR2 = if l2 > 0.001 && (l3 - tipLen) > 0.001 then maxR else 0.0

  leg1End   = subVec corner1 (scaleVec dirIn1 cornerR1)
  leg2Start = addVec corner1 (scaleVec dirOut1 cornerR1)
  leg2End   = subVec corner2 (scaleVec dirIn2 cornerR2)
  leg3Start = addVec corner2 (scaleVec dirOut2 cornerR2)
  tipBase   = addVec corner2 (scaleVec dirOut2 (l3 - tipLen))

  arc1Segs = if cornerR1 > 0.001 then arcSegments corner1 dirIn1 dirOut1 cornerR1 8 else []
  arc2Segs = if cornerR2 > 0.001 then arcSegments corner2 dirIn2 dirOut2 cornerR2 8 else []

  path = [ { from, to: leg1End } ]
      <> arc1Segs
      <> [ { from: leg2Start, to: leg2End } ]
      <> arc2Segs
      <> [ { from: leg3Start, to: tipBase } ]

  segLen s = distance s.from s.to
  totalStraight = sum (segLen <$> path)
  totalLen = totalStraight + tipLen

  drawnTotal = totalLen * clamp01 progress
  drawnStraight = min drawnTotal totalStraight
  tipDrawn = max 0.0 (drawnTotal - totalStraight)
  tipGrowth = clamp01 (tipDrawn / max 1.0e-6 tipLen)
  tipEnd = addVec tipBase (scaleVec dirOut2 (tipGrowth * tipLen))

  pathParts = drawStraightPath drawnStraight path shaftR
  tipPart =
    if tipDrawn > 0.0 then coneTipMesh tipBase tipEnd (tipR * tipGrowth)
    else emptyMesh

arcSegments :: Vec3 -> Vec3 -> Vec3 -> Number -> Int -> Array { from :: Vec3, to :: Vec3 }
arcSegments corner dirIn dirOut r n = zipWith (\a b -> { from: a, to: b }) pts (drop 1 pts)
  where
  center = addVec (subVec corner (scaleVec dirIn r)) (scaleVec dirOut r)
  pts = (\i -> at (Int.toNumber i / Int.toNumber n)) <$> range 0 n
  at u = addVec center (addVec (scaleVec dirOut (-r * c)) (scaleVec dirIn (r * s)))
    where
    th = u * pi * 0.5
    c = cos th
    s = sin th

drawStraightPath
  :: Number
  -> Array { from :: Vec3, to :: Vec3 }
  -> Number
  -> Array JSX
drawStraightPath drawn segs r = go drawn segs
  where
  go :: Number -> Array { from :: Vec3, to :: Vec3 } -> Array JSX
  go remaining segs' = case uncons segs' of
    Nothing -> []
    Just u -> step remaining u.head u.tail

  step :: Number -> { from :: Vec3, to :: Vec3 } -> Array { from :: Vec3, to :: Vec3 } -> Array JSX
  step remaining s tail = case distance s.from s.to of
    l | remaining <= 0.001 -> []
      | remaining >= l -> [ segmentMesh s.from s.to r ] <> go (remaining - l) tail
      | otherwise -> [ segmentMesh s.from (lerpVec s.from s.to (remaining / l)) r ]

addVec :: Vec3 -> Vec3 -> Vec3
addVec a b = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }

subVec :: Vec3 -> Vec3 -> Vec3
subVec a b = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }

scaleVec :: Vec3 -> Number -> Vec3
scaleVec a k = { x: a.x * k, y: a.y * k, z: a.z * k }

lerpVec :: Vec3 -> Vec3 -> Number -> Vec3
lerpVec a b u = addVec a (scaleVec (subVec b a) u)

distance :: Vec3 -> Vec3 -> Number
distance a b = sqrt (dx * dx + dy * dy + dz * dz)
  where
  dx = a.x - b.x
  dy = a.y - b.y
  dz = a.z - b.z

absN :: Number -> Number
absN x = if x < 0.0 then -x else x

signN :: Number -> Number
signN x = if x > 0.0 then 1.0 else if x < 0.0 then -1.0 else 0.0

arrowMat :: JSX
arrowMat = meshStandardMaterial
  { color: "#ff8a5c"
  , roughness: 0.45
  , metalness: 0.15
  , emissive: "#ff3b1a"
  , emissiveIntensity: 1.6
  }

segmentMesh :: Vec3 -> Vec3 -> Number -> JSX
segmentMesh start end r =
  if len < 0.001 then element (threejs "Group") {}
  else element (threejs "Mesh")
    { position: [ (start.x + end.x) * 0.5, (start.y + end.y) * 0.5, (start.z + end.z) * 0.5 ]
    , quaternion: [ q.x, q.y, q.z, q.w ]
    , raycast: noRaycast
    , children:
        [ element (threejs "CylinderGeometry") { args: [ r, r, len, 6.0 ] }
        , arrowMat
        ]
    }
  where
  dx = end.x - start.x
  dy = end.y - start.y
  dz = end.z - start.z
  len = sqrt (dx * dx + dy * dy + dz * dz)
  q = quatFromYTo (dx / len) (dy / len) (dz / len)

coneTipMesh :: Vec3 -> Vec3 -> Number -> JSX
coneTipMesh start end r =
  if len < 0.001 then element (threejs "Group") {}
  else element (threejs "Mesh")
    { position: [ (start.x + end.x) * 0.5, (start.y + end.y) * 0.5, (start.z + end.z) * 0.5 ]
    , quaternion: [ q.x, q.y, q.z, q.w ]
    , raycast: noRaycast
    , children:
        [ element (threejs "ConeGeometry") { args: [ r, len, 8.0 ] }
        , arrowMat
        ]
    }
  where
  dx = end.x - start.x
  dy = end.y - start.y
  dz = end.z - start.z
  len = sqrt (dx * dx + dy * dy + dz * dz)
  q = quatFromYTo (dx / len) (dy / len) (dz / len)

clamp01 :: Number -> Number
clamp01 v = max 0.0 (min 1.0 v)

quatFromYTo
  :: Number -> Number -> Number
  -> { x :: Number, y :: Number, z :: Number, w :: Number }
quatFromYTo nx ny nz
  | 1.0 + ny < 1.0e-6 = { x: 1.0, y: 0.0, z: 0.0, w: 0.0 }
  | otherwise = { x: nz / n, y: 0.0, z: -nx / n, w: (1.0 + ny) / n }
  where
  n = sqrt (nz * nz + nx * nx + (1.0 + ny) * (1.0 + ny))

plopEnvelope :: Number -> Number
plopEnvelope u =
  if u < birthEnd then birthSpring (u / birthEnd)
  else if u > deathStart then deathPop ((u - deathStart) / (1.0 - deathStart))
  else 1.0
  where
  birthEnd = 0.10
  deathStart = 0.90

birthSpring :: Number -> Number
birthSpring tt =
  if tt < 0.18 then -0.15 * sin (tt / 0.18 * 3.14159)
  else 1.0 + 2.70158 * pow (s - 1.0) 3 + 1.70158 * pow (s - 1.0) 2
  where
  s = (tt - 0.18) / 0.82

deathPop :: Number -> Number
deathPop tt =
  if tt < 0.30 then 1.0 + 0.18 * sin (tt / 0.30 * 3.14159)
  else (1.0 - s) * (1.0 - s) * (1.0 - 0.25 * s)
  where
  s = (tt - 0.30) / 0.70

pow :: Number -> Int -> Number
pow x n
  | n <= 0 = 1.0
  | otherwise = x * pow x (n - 1)

hash01 :: Number -> Number
hash01 n = s - floor s
  where
  s = sin n * 43758.5453

parallelogramGeometry :: Number -> Number -> Number -> Number -> JSX
parallelogramGeometry = parallelogramGeometryImpl

roundedRectGeometry :: Number -> Number -> Number -> Number -> JSX
roundedRectGeometry = roundedRectGeometryImpl

installStartChainListener :: Effect Unit -> Effect (Effect Unit)
installStartChainListener = installStartChainListenerImpl

installMorphListener :: (Number -> Number -> Number -> Number -> Effect Unit) -> Effect (Effect Unit)
installMorphListener = installMorphListenerImpl

installFormationListener
  :: (Number -> Number -> Number -> Number -> Number -> Effect Unit)
  -> Effect (Effect Unit)
installFormationListener = installFormationListenerImpl

installCameraListener
  :: (Number -> Number -> Number -> Number -> Number -> Number -> Number -> Effect Unit)
  -> Effect (Effect Unit)
installCameraListener = installCameraListenerImpl

applyCamera
  :: forall r. { | r }
  -> Number -> Number -> Number -> Number -> Number -> Number -> Number
  -> Effect Unit
applyCamera = applyCameraImpl

foreign import readClockElapsed :: forall r. { | r } -> Number
foreign import readAspect :: forall r. { | r } -> Number
foreign import parallelogramGeometryImpl :: Number -> Number -> Number -> Number -> JSX
foreign import roundedRectGeometryImpl :: Number -> Number -> Number -> Number -> JSX
foreign import installStartChainListenerImpl :: Effect Unit -> Effect (Effect Unit)
foreign import installMorphListenerImpl
  :: (Number -> Number -> Number -> Number -> Effect Unit) -> Effect (Effect Unit)
foreign import installFormationListenerImpl
  :: (Number -> Number -> Number -> Number -> Number -> Effect Unit) -> Effect (Effect Unit)
foreign import installCameraListenerImpl
  :: (Number -> Number -> Number -> Number -> Number -> Number -> Number -> Effect Unit)
  -> Effect (Effect Unit)
foreign import applyCameraImpl
  :: forall r. { | r }
  -> Number -> Number -> Number -> Number -> Number -> Number -> Number
  -> Effect Unit
foreign import newU8Impl :: Int -> Effect U8Array
foreign import readU8Impl :: U8Array -> Int -> Effect Int
foreign import writeU8Impl :: U8Array -> Int -> Int -> Effect Unit
foreign import fillU8Impl :: U8Array -> Int -> Effect Unit
foreign import newF32Impl :: Int -> Effect F32Array
foreign import readF32Impl :: F32Array -> Int -> Effect Number
foreign import writeF32Impl :: F32Array -> Int -> Number -> Effect Unit
