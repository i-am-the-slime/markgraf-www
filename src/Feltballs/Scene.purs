module Feltballs.Scene (sceneJSX) where

import Prelude

import Data.Array (any, dropWhile, drop, foldl, index, last, range, replicate, snoc, uncons, updateAt, zipWith)
import Data.Foldable (for_)
import Data.Foldable (sum, traverse_)
import Data.Int as Int
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.Nullable (Nullable, toNullable)
import Data.Number (cos, floor, pi, sin, sqrt)
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
totalBalls = 180

segDuration :: Number
segDuration = 0.45

popDuration :: Number
popDuration = 0.55

rrEnd :: Int
rrEnd = 135

pgEnd :: Int
pgEnd = 171

type PersistentState =
  { hold :: Maybe HoldState
  , popStart :: Array Number
  , popCycle :: Array Int
  , arrowTick :: Number
  }

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

sceneJSX :: JSX
sceneJSX = animatedField {}

animatedField :: {} -> JSX
animatedField = unsafePerformEffect animatedFieldComponent

animatedFieldComponent :: Component {}
animatedFieldComponent = component "AnimatedField" \_ -> Hooks.do
  state /\ setState <- useState initState
  bgMatRef <- useRef (toNullable (Nothing :: Maybe Object3D))
  noiseMatRef <- useRef (toNullable (Nothing :: Maybe Object3D))
  frameRef <- useRef initFrame
  lastPaintRef <- useRef (-1.0)

  useEffectOnce $
    installStartChainListener (startChainFromRandom setState frameRef)

  useFrame \rs _ -> do
    let t = readClockElapsed rs
    lastT <- readRef lastPaintRef
    when (t - lastT >= frameInterval) do
      let aspect = readAspect rs
      writeRef lastPaintRef t
      writeRef frameRef { t, aspect }

      readRefMaybe bgMatRef # withJust \m -> applyProps m
        { "uniforms-u_time-value": t, "uniforms-u_aspect-value": aspect }
      readRefMaybe noiseMatRef # withJust \m -> applyProps m
        { "uniforms-u_time-value": t }

      refreshConnected state.hold
      for_ (range 0 (totalBalls - 1)) (paintBall t state.popStart state.popCycle)

      advanceHoldEffect setState state t

      case state.hold of
        Nothing -> pure unit
        Just _ -> setState _ { arrowTick = t }

  pure $ element (threejs "Group")
    { children:
        ([ fog
         , metaballBackground bgMatRef
         , ambient
         , hemi
         , directional
         , rim
         ] <> shapeGroups)
          <> renderArrows state.arrowTick state.hold
          <> [ noiseOverlay noiseMatRef ]
    }
  where
  initFrame = { t: 0.0, aspect: 1.0 }
  initState =
    { hold: Nothing
    , popStart: replicate totalBalls (-1.0)
    , popCycle: replicate totalBalls 0
    , arrowTick: 0.0
    }
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

paintBall :: Number -> Array Number -> Array Int -> Int -> Effect Unit
paintBall t popStart popCycle i = do
  readRefMaybe (ballRefAt i) # withJust \o -> do
    applyProps o
      { position: [ p.x, p.y, p.z ]
      , scale: baseScale * envelope * popMul
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
      { position: [ p.x, p.y, p.z ]
      , scale: baseScale * envelope * popMul * 1.18
      , rotation: [ spin, spin * 0.7, 0.0 ]
      }
  where
  p = ballPos t i
  fi = Int.toNumber i
  travel = (t + hash01 (fi * 37.719) * corridorDepth / streamSpeed) * streamSpeed
  cycles = floor (travel / corridorDepth)
  local = travel - cycles * corridorDepth
  u = local / corridorDepth
  baseScale = 0.55 + 0.45 * hash01 (fi * 1.61803)
  envelope = plopEnvelope u
  spin = t * (0.3 + hash01 (fi * 4.27) * 0.6) + fi
  popMul = popMultiplierAt t popStart popCycle i

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
  :: ((PersistentState -> PersistentState) -> Effect Unit)
  -> Ref FrameState
  -> Effect Unit
startChainFromRandom setState frameRef = do
  frame <- readRef frameRef
  source <- randomInt 0 (totalBalls - 1)
  setState \s -> case s.hold of
    Just _ -> s
    Nothing -> s { hold = Just (freshHold frame.t source s) }
  where
  freshHold t i s =
    { chain: [ sourceNode ]
    , target: targetNode
    , segStart: t
    }
    where
    sourceNode = { idx: i, cycle: ballCycle t i }
    targetIdx = pickNearest t s.popStart s.popCycle i (-1)
    targetNode = { idx: targetIdx, cycle: ballCycle t targetIdx }

advanceHoldEffect
  :: ((PersistentState -> PersistentState) -> Effect Unit)
  -> PersistentState
  -> Number
  -> Effect Unit
advanceHoldEffect setState s t = case s.hold of
  Nothing -> pure unit
  Just h -> advanceJust h
  where
  advanceJust h
    | any (wrapped h) h.chain || wrapped h h.target =
        setState _ { hold = Nothing }
    | t - h.segStart < segDuration = pure unit
    | cycleClosed h =
        setState \st -> closeCycle st t (cycleNodes h)
    | otherwise =
        setState _ { hold = Just (nextHold h) }
  wrapped _ n = ballCycle t n.idx /= n.cycle
  extendedChain h = snoc h.chain h.target
  lastIdx h = maybe (-1) _.idx (last h.chain)
  newTargetIdx h = pickNearest t s.popStart s.popCycle h.target.idx (lastIdx h)
  cycleClosed h = any (\n -> n.idx == newTargetIdx h) (extendedChain h)
  cycleNodes h = dropWhile (\n -> n.idx /= newTargetIdx h) (extendedChain h)
  nextHold h =
    { chain: extendedChain h
    , target: { idx: newTargetIdx h, cycle: ballCycle t (newTargetIdx h) }
    , segStart: t
    }

closeCycle :: PersistentState -> Number -> Array ChainNode -> PersistentState
closeCycle s t nodes = (foldl popNode s nodes) { hold = Nothing }
  where
  popNode acc n = acc
    { popStart = fromMaybe acc.popStart (updateAt n.idx t acc.popStart)
    , popCycle = fromMaybe acc.popCycle (updateAt n.idx n.cycle acc.popCycle)
    }

pickNearest :: Number -> Array Number -> Array Int -> Int -> Int -> Int
pickNearest t popStart popCycle source avoid =
  (foldl step { idx: -1, d: 1.0e308 } (range 0 (totalBalls - 1))).idx
  where
  origin = ballPos t source
  step acc i =
    if i == source || i == avoid then acc
    else if isHidden t popStart popCycle i then acc
    else if dist < acc.d then { idx: i, d: dist }
    else acc
    where
    p = ballPos t i
    dx = p.x - origin.x
    dy = p.y - origin.y
    dz = p.z - origin.z
    dist = dx * dx + dy * dy + dz * dz

isHidden :: Number -> Array Number -> Array Int -> Int -> Boolean
isHidden _ popStart _ i = start >= 0.0
  where
  start = fromMaybe (-1.0) (index popStart i)

shapeGroups :: Array JSX
shapeGroups =
  [ shapeGroup rrGeo solidMat 0 135
  , shapeGroup pgGeo solidMat 135 36
  , shapeGroup cylinderGeo solidMat 171 9
  , wireGroup rrGeo 0 135
  , wireGroup pgGeo 135 36
  , wireGroup cylinderGeo 171 9
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
  , color: "#ffffff"
  , userData: { ballIndex: i }
  }

corridorDepth :: Number
corridorDepth = 120.0

streamSpeed :: Number
streamSpeed = 6.0

spread :: Number
spread = 38.0

popMultiplierAt :: Number -> Array Number -> Array Int -> Int -> Number
popMultiplierAt t popStart _ i =
  if start < 0.0 then 1.0
  else if k >= 1.0 then 0.0
  else deathPop k
  where
  start = fromMaybe (-1.0) (index popStart i)
  k = (t - start) / popDuration

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

foreign import readClockElapsed :: forall r. { | r } -> Number
foreign import readAspect :: forall r. { | r } -> Number
foreign import parallelogramGeometryImpl :: Number -> Number -> Number -> Number -> JSX
foreign import roundedRectGeometryImpl :: Number -> Number -> Number -> Number -> JSX
foreign import installStartChainListenerImpl :: Effect Unit -> Effect (Effect Unit)
foreign import newU8Impl :: Int -> Effect U8Array
foreign import readU8Impl :: U8Array -> Int -> Effect Int
foreign import writeU8Impl :: U8Array -> Int -> Int -> Effect Unit
foreign import fillU8Impl :: U8Array -> Int -> Effect Unit
