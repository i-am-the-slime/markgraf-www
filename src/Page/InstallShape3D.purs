module Page.InstallShape3D (installShape3D) where

import Prelude

import Data.Array as Array
import Data.Int as Int
import Data.Maybe (fromMaybe)
import Data.Number (abs, cos, pi, pow, sin)
import Effect (Effect)
import Effect.Uncurried (EffectFn2, runEffectFn2)
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (reactComponent, readRef, useRef, writeRef)
import React.Basic.Hooks as Hooks
import React.R3F.Three.Internal (threejs)
import Yoga.React.R3F.Canvas (canvas)
import Yoga.React.R3F.Hooks (useFrame)

-- A small 3D shape that slowly spins and smoothly morphs through the markgraf-ish
-- primitives. It is one superquadric surface whose two exponents animate: at
-- (1,1) it is a sphere, near (0,0) a box, (0,1) a cylinder, (2.6,2.6) an
-- octahedron. Lerping the exponents *is* the morph — same vertices throughout, so
-- it stays one coherent mesh. The whole solid+wireframe group is built in the FFI
-- and mounted via <primitive>, the robust r3f escape hatch for custom objects.
installShape3D :: JSX
installShape3D =
  canvas
    { camera: { position: [ 0.0, 0.0, 3.4 ], fov: 36.0 }
    , gl: { alpha: true }
    , dpr: [ 1.0, 2.0 ]
    , children: element installScene {}
    }

installScene :: ReactComponent {}
installScene = unsafePerformEffect $ reactComponent "InstallScene" \_ -> Hooks.do
  elapsed <- useRef 0.0
  useFrame \_ delta -> do
    t0 <- readRef elapsed
    let t = t0 + delta
    writeRef elapsed t
    let e = exponentsAt t
    setGroupPositions installGroup (superPositions e.e1 e.e2)
    setGroupRotation installGroup (t * 0.45)
  pure sceneTree

sceneTree :: JSX
sceneTree = element (threejs "Group") { children: [ ambient, directional, shape ] }
  where
  ambient = element (threejs "AmbientLight") { intensity: 0.75 }
  directional = element (threejs "DirectionalLight") { position: [ 2.0, 3.0, 4.0 ], intensity: 1.4 }
  shape = element (threejs "primitive") { object: installGroup }

-- ---------------------------------------------------------------------------
-- Geometry: a superquadric surface as a (gridU+1) x (gridV+1) parametric grid.
-- ---------------------------------------------------------------------------

gridU :: Int
gridU = 18

gridV :: Int
gridV = 36

-- The group (solid + wire meshes), built once and mutated in place each frame.
installGroup :: ShapeGroup
installGroup = unsafePerformEffect (mkShapeGroup gridIndices (superPositions 1.0 1.0))

-- The flattened [x,y,z,...] positions for the superquadric with exponents e1,e2.
superPositions :: Number -> Number -> Array Number
superPositions e1 e2 =
  Array.range 0 gridU >>= \i -> Array.range 0 gridV >>= \j -> vert i j
  where
  vert i j = [ x, y, z ]
    where
    u = -(pi / 2.0) + pi * Int.toNumber i / Int.toNumber gridU
    v = -pi + 2.0 * pi * Int.toNumber j / Int.toNumber gridV
    cu = signpow (cos u) e1
    x = cu * signpow (cos v) e2
    y = cu * signpow (sin v) e2
    z = signpow (sin u) e1

-- sign(b) * |b|^e — keeps the superquadric well defined for negative cos/sin.
signpow :: Number -> Number -> Number
signpow b e = (if b < 0.0 then -1.0 else 1.0) * pow (abs b) e

-- Two triangles per grid quad.
gridIndices :: Array Int
gridIndices =
  Array.range 0 (gridU - 1) >>= \i -> Array.range 0 (gridV - 1) >>= \j -> quad i j
  where
  quad i j = [ a, c, b, b, c, d ]
    where
    a = i * (gridV + 1) + j
    b = a + 1
    c = a + (gridV + 1)
    d = c + 1

-- ---------------------------------------------------------------------------
-- The morph timeline: hold a shape, then ease the exponents to the next.
-- ---------------------------------------------------------------------------

type Exponents = { e1 :: Number, e2 :: Number }

installPresets :: Array Exponents
installPresets =
  [ { e1: 1.0, e2: 1.0 } -- sphere
  , { e1: 0.2, e2: 0.2 } -- box
  , { e1: 0.2, e2: 1.0 } -- cylinder
  , { e1: 2.6, e2: 2.6 } -- octahedron
  , { e1: 1.0, e2: 1.0 } -- back to sphere
  ]

installStepSecs :: Number
installStepSecs = 2.7

installMorphSecs :: Number
installMorphSecs = 1.1

exponentsAt :: Number -> Exponents
exponentsAt t = { e1: lerp a.e1 b.e1 f, e2: lerp a.e2 b.e2 f }
  where
  transitions = Array.length installPresets - 1
  cycle = installStepSecs * Int.toNumber transitions
  tt = t - cycle * Int.toNumber (Int.floor (t / cycle))
  k = Int.floor (tt / installStepSecs)
  local = tt - Int.toNumber k * installStepSecs
  dwell = installStepSecs - installMorphSecs
  f = if local <= dwell then 0.0 else smooth ((local - dwell) / installMorphSecs)
  a = preset k
  b = preset (k + 1)
  preset idx = fromMaybe { e1: 1.0, e2: 1.0 } (Array.index installPresets idx)
  smooth x = x * x * (3.0 - 2.0 * x)

lerp :: Number -> Number -> Number -> Number
lerp a b t = a + (b - a) * t

-- ---------------------------------------------------------------------------
-- FFI: irreducible three.js object assembly and mutation.
-- ---------------------------------------------------------------------------

foreign import data ShapeGroup :: Type

mkShapeGroup :: Array Int -> Array Number -> Effect ShapeGroup
mkShapeGroup = runEffectFn2 mkShapeGroupImpl

foreign import mkShapeGroupImpl :: EffectFn2 (Array Int) (Array Number) ShapeGroup

setGroupPositions :: ShapeGroup -> Array Number -> Effect Unit
setGroupPositions = runEffectFn2 setGroupPositionsImpl

foreign import setGroupPositionsImpl :: EffectFn2 ShapeGroup (Array Number) Unit

setGroupRotation :: ShapeGroup -> Number -> Effect Unit
setGroupRotation = runEffectFn2 setGroupRotationImpl

foreign import setGroupRotationImpl :: EffectFn2 ShapeGroup Number Unit
