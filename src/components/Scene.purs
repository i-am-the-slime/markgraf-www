module Components.Scene (sceneJSX, sceneComponent) where

import Prelude

import Data.Maybe (Maybe(..), fromMaybe)
import Data.Nullable (toNullable)
import Data.Number (cos, floor, pi, sin)
import Data.Number as Number
import Data.Foldable (traverse_)
import Effect (Effect)
import Effect.Unsafe (unsafePerformEffect)
import Feltballs.Bindings (withChildren)
import React.Basic (JSX, ReactComponent, element, fragment)
import React.Basic.Hooks (Component, component, readRefMaybe, useRef)
import React.Basic.Hooks as Hooks
import React.R3F.Hooks (applyProps, useFrame)
import React.R3F.Three.Internal (threejs)
import React.R3F.Three.Types (Object3D)
import React.R3F.Web (canvas)
import Unsafe.Coerce (unsafeCoerce)
import Yoga.React.DOM.Internal (css)

-- Palette ---------------------------------------------------------------------

accent :: String
accent = "#ff3b1a"

bone :: String
bone = "#f5f1e8"

ink :: String
ink = "#0a0e1a"

-- Static positions ------------------------------------------------------------

type Vec3 = Array Number

nodePositions :: Array Vec3
nodePositions =
  [ [ -3.5, 0.6, 0.0 ]
  , [ 0.0, 1.4, 0.0 ]
  , [ 3.5, 0.0, 0.0 ]
  ]

edgePairs :: Array { from :: Vec3, to :: Vec3 }
edgePairs =
  [ { from: [ -3.5, 0.6, 0.0 ], to: [ 0.0, 1.4, 0.0 ] }
  , { from: [ 0.0, 1.4, 0.0 ], to: [ 3.5, 0.0, 0.0 ] }
  ]

tokenWaypoints :: Array Vec3
tokenWaypoints =
  [ [ -3.5, 0.6, 0.0 ]
  , [ 0.0, 1.4, 0.0 ]
  , [ 3.5, 0.0, 0.0 ]
  , [ 0.0, 1.4, 0.0 ]
  , [ -3.5, 0.6, 0.0 ]
  ]

contextNodePositions :: Array Vec3
contextNodePositions =
  [ [ -7.0, 2.5, -3.0 ]
  , [ 7.0, 2.0, -4.0 ]
  , [ -5.0, -2.5, 3.0 ]
  , [ 6.0, -2.0, 4.0 ]
  , [ 0.0, 4.0, -6.0 ]
  , [ 0.0, -3.5, -5.0 ]
  ]

-- Easing & camera path --------------------------------------------------------

smooth :: Number -> Number
smooth t
  | t <= 0.0 = 0.0
  | t >= 1.0 = 1.0
  | otherwise = t * t * (3.0 - 2.0 * t)

clamp01 :: Number -> Number
clamp01 v = max 0.0 (min 1.0 v)

remap :: Number -> Number -> Number -> Number
remap v a b = smooth (clamp01 ((v - a) / (b - a)))

mix :: Number -> Number -> Number -> Number
mix a b t = a + (b - a) * t

cameraForProgress :: Number -> { x :: Number, y :: Number, z :: Number }
cameraForProgress p = { x: sin ang2 * r2, y: y2, z: cos ang2 * r2 }
  where
  a1 = remap p 0.0 0.30
  a2 = remap p 0.30 0.65
  a3 = remap p 0.65 1.0
  r0 = mix 7.0 9.0 a1
  ang0 = mix 0.0 0.15 a1
  y0 = mix 1.2 1.6 a1
  r1 = mix r0 15.0 a2
  ang1 = mix ang0 (pi * 0.7) a2
  y1 = mix y0 3.0 a2
  r2 = mix r1 11.0 a3
  ang2 = mix ang1 (pi * 0.9) a3
  y2 = mix y1 9.0 a3

-- Token curve cached at module load -------------------------------------------

tokenCurve :: ThreeCurve
tokenCurve = unsafePerformEffect $
  mkCatmullRomCurveImpl tokenWaypoints true "catmullrom" 0.1

-- Primitive geometry attached as a child of a Mesh/Line ----------------------

primitiveGeometry :: ThreeObject -> JSX
primitiveGeometry o = element (threejs "primitive")
  { object: o, attach: "geometry" }

lineGeometry :: Vec3 -> Vec3 -> JSX
lineGeometry from to = primitiveGeometry $
  unsafePerformEffect (mkLineGeometryImpl from to)

tubeGeometry :: Vec3 -> Vec3 -> Number -> JSX
tubeGeometry from to radius = primitiveGeometry $
  unsafePerformEffect (mkTubeGeometryImpl from to 8 radius 6 false)

-- Scroll progress -------------------------------------------------------------

readSceneProgress :: Effect Number
readSceneProgress = readCssVarImpl "--scene-progress" <#> parse
  where
  parse s = fromMaybe 0.0 (Number.fromString s)

-- drei wrappers ---------------------------------------------------------------

floatNode :: forall p. { | p } -> Array JSX -> JSX
floatNode props kids = element floatImpl (withChildren kids props)

trail :: forall p. { | p } -> Array JSX -> JSX
trail props kids = element trailImpl (withChildren kids props)

environmentNode :: forall p. { | p } -> Array JSX -> JSX
environmentNode props kids = element environmentImpl (withChildren kids props)

lightformer :: forall p. { | p } -> JSX
lightformer = element lightformerImpl

effectComposer :: forall p. { | p } -> Array JSX -> JSX
effectComposer props kids = element effectComposerImpl (withChildren kids props)

bloom :: forall p. { | p } -> JSX
bloom = element bloomImpl

chromaticAberration :: forall p. { | p } -> JSX
chromaticAberration = element chromaticAberrationImpl

-- Node / edge / token ---------------------------------------------------------

nodeJsx :: Vec3 -> JSX
nodeJsx pos = floatNode { speed: 1.4, rotationIntensity: 0.2, floatIntensity: 0.4 }
  [ element (threejs "Mesh")
      { position: pos
      , children:
          [ element (threejs "IcosahedronGeometry") { args: [ 0.35, 1.0 ] }
          , element (threejs "MeshPhysicalMaterial")
              { color: ink
              , emissive: bone
              , emissiveIntensity: 0.05
              , metalness: 0.6
              , roughness: 0.25
              , clearcoat: 1.0
              , clearcoatRoughness: 0.2
              }
          , element (threejs "Mesh")
              { children:
                  [ element (threejs "IcosahedronGeometry") { args: [ 0.42, 1.0 ] }
                  , element (threejs "MeshBasicMaterial")
                      { color: bone, wireframe: true, transparent: true, opacity: 0.18 }
                  ]
              }
          ]
      }
  ]

edgeJsx :: { from :: Vec3, to :: Vec3 } -> JSX
edgeJsx e = element (threejs "Line")
  { children:
      [ lineGeometry e.from e.to
      , element (threejs "LineBasicMaterial")
          { color: bone, transparent: true, opacity: 0.35 }
      ]
  }

edgeTubeJsx :: { from :: Vec3, to :: Vec3 } -> JSX
edgeTubeJsx e = element (threejs "Mesh")
  { children:
      [ tubeGeometry e.from e.to 0.015
      , element (threejs "MeshBasicMaterial")
          { color: bone, transparent: true, opacity: 0.25 }
      ]
  }

tokenJsx :: JSX
tokenJsx = token {}
  where
  token :: {} -> JSX
  token = unsafePerformEffect tokenComp

tokenComp :: Component {}
tokenComp = component "Token" \_ -> Hooks.do
  meshRef <- useRef (toNullable (Nothing :: Maybe Object3D))
  useFrame \rs _ -> do
    let t0 = readClockElapsed rs * 0.12
        t = t0 - floor t0
    p <- curvePointAtImpl tokenCurve t
    readRefMaybe meshRef # withJust \o -> applyProps o { position: p }
  pure $ trail
    { width: 1.2
    , length: 6.0
    , color: accent
    , attenuation: \(u :: Number) -> u * u
    }
    [ element (threejs "Mesh")
        { ref: meshRef
        , children:
            [ element (threejs "SphereGeometry") { args: [ 0.14, 16.0, 16.0 ] }
            , element (threejs "MeshBasicMaterial") { color: accent, toneMapped: false }
            ]
        }
    ]

-- ContextNodes ---------------------------------------------------------------

contextNodesJsx :: JSX
contextNodesJsx = contextNodes {}
  where
  contextNodes :: {} -> JSX
  contextNodes = unsafePerformEffect contextComp

contextComp :: Component {}
contextComp = component "ContextNodes" \_ -> Hooks.do
  groupRef <- useRef (toNullable (Nothing :: Maybe Object3D))
  useFrame \_ _ -> do
    p <- readSceneProgress
    let a = remap p 0.55 0.95
    readRefMaybe groupRef # withJust \o -> applyProps o
      { scale: a, visible: a > 0.001 }
  pure $ element (threejs "Group")
    { ref: groupRef
    , scale: 0.0
    , children: contextNodePositions <#> \pos ->
        element (threejs "Mesh")
          { position: pos
          , children:
              [ element (threejs "IcosahedronGeometry") { args: [ 0.25, 1.0 ] }
              , element (threejs "MeshBasicMaterial")
                  { color: bone, wireframe: true, transparent: true, opacity: 0.35 }
              ]
          }
    }

-- Camera scroll rig -----------------------------------------------------------

scrollRigJsx :: JSX
scrollRigJsx = scrollRig {}
  where
  scrollRig :: {} -> JSX
  scrollRig = unsafePerformEffect scrollRigComp

scrollRigComp :: Component {}
scrollRigComp = component "ScrollRig" \_ -> Hooks.do
  useFrame \rs _ -> do
    p <- readSceneProgress
    let c = cameraForProgress p
        cam = readCamera rs
        cur = cameraPosImpl cam
        k = 0.12
    setCameraPosImpl cam
      (cur.x + (c.x - cur.x) * k)
      (cur.y + (c.y - cur.y) * k)
      (cur.z + (c.z - cur.z) * k)
    cameraLookAtImpl cam 0.0 0.6 0.0
  pure $ element (threejs "Group") {}

-- Effects ---------------------------------------------------------------------

effectsJsx :: JSX
effectsJsx = effectComposer {}
  [ bloom
      { mipmapBlur: true
      , intensity: 0.6
      , luminanceThreshold: 0.4
      , luminanceSmoothing: 0.4
      }
  ]

-- Main scene JSX --------------------------------------------------------------

sceneJSX :: JSX
sceneJSX = fragment
  [ fogJsx
  , element (threejs "AmbientLight") { intensity: 0.25 }
  , element (threejs "PointLight")
      { position: [ 6.0, 6.0, 6.0 ], intensity: 0.6, color: bone }
  , element (threejs "PointLight")
      { position: [ -6.0, -2.0, -4.0 ], intensity: 0.8, color: accent }
  , environmentNode { resolution: 256 }
      [ lightformer
          { form: "rect"
          , intensity: 1.5
          , position: [ 0.0, 4.0, 4.0 ]
          , scale: [ 8.0, 2.0, 1.0 ]
          , color: bone
          }
      , lightformer
          { form: "rect"
          , intensity: 1.2
          , position: [ -4.0, -2.0, 2.0 ]
          , scale: [ 4.0, 2.0, 1.0 ]
          , color: accent
          }
      ]
  , element (threejs "Group")
      { children:
          (nodeJsx <$> nodePositions)
            <> (edgePairs >>= \e -> [ edgeJsx e, edgeTubeJsx e ])
            <> [ tokenJsx, contextNodesJsx ]
      }
  , scrollRigJsx
  , effectsJsx
  ]
  where
  fogJsx = element (threejs "Fog")
    { attach: "fog"
    , args: [ unsafeCoerce ink, unsafeCoerce 10.0, unsafeCoerce 28.0 ]
    }

-- Utility ---------------------------------------------------------------------

withJust :: forall a. (a -> Effect Unit) -> Effect (Maybe a) -> Effect Unit
withJust f m = m >>= traverse_ f

-- Canvas wrapper --------------------------------------------------------------

sceneComponent :: ReactComponent {}
sceneComponent = unsafePerformEffect sceneComp
  where
  sceneComp :: Effect (ReactComponent {})
  sceneComp = Hooks.reactComponent "MarkgrafScene" \(_ :: {}) -> Hooks.do
    pure $ canvas
      { camera: { position: [ 0.0, 1.5, 9.0 ], fov: 42 }
      , dpr: [ 1, 2 ]
      , gl: { antialias: true, alpha: true }
      , style: css
          { position: "absolute", inset: 0, background: "transparent" }
      , children: [ sceneJSX ]
      }

-- FFI -------------------------------------------------------------------------

foreign import data ThreeCurve :: Type
foreign import data ThreeCamera :: Type
foreign import data ThreeObject :: Type

foreign import floatImpl :: forall a. ReactComponent { | a }
foreign import trailImpl :: forall a. ReactComponent { | a }
foreign import environmentImpl :: forall a. ReactComponent { | a }
foreign import lightformerImpl :: forall a. ReactComponent { | a }
foreign import effectComposerImpl :: forall a. ReactComponent { | a }
foreign import bloomImpl :: forall a. ReactComponent { | a }
foreign import chromaticAberrationImpl :: forall a. ReactComponent { | a }

foreign import mkLineGeometryImpl :: Vec3 -> Vec3 -> Effect ThreeObject
foreign import mkTubeGeometryImpl
  :: Vec3 -> Vec3 -> Int -> Number -> Int -> Boolean -> Effect ThreeObject

foreign import mkCatmullRomCurveImpl
  :: Array Vec3 -> Boolean -> String -> Number -> Effect ThreeCurve
foreign import curvePointAtImpl :: ThreeCurve -> Number -> Effect Vec3

foreign import readCssVarImpl :: String -> Effect String
foreign import readCamera :: forall r. { | r } -> ThreeCamera
foreign import cameraPosImpl :: ThreeCamera -> { x :: Number, y :: Number, z :: Number }
foreign import setCameraPosImpl :: ThreeCamera -> Number -> Number -> Number -> Effect Unit
foreign import cameraLookAtImpl :: ThreeCamera -> Number -> Number -> Number -> Effect Unit

-- Bridge so the .js sidecar can wrap sceneJSX in a Canvas. Not exported from PS.
foreign import readClockElapsed :: forall r. { | r } -> Number
