module Feltballs.Bindings where

import Prelude

import Data.Function.Uncurried (Fn2, runFn2)
import Effect (Effect)
import React.Basic (JSX, ReactComponent, element)
import React.R3F.Three.Internal (threejs)

-- ThreeEvent FFI (R3F pointer events)
foreign import data ThreeEvent :: Type

foreign import eventPointX :: ThreeEvent -> Number
foreign import eventPointY :: ThreeEvent -> Number
foreign import eventPointZ :: ThreeEvent -> Number
foreign import stopPropagation :: ThreeEvent -> Effect Unit

-- Built-in R3F intrinsics via the `threejs` helper (string → component name)
boxGeometry :: forall p. { | p } -> JSX
boxGeometry = element (threejs "BoxGeometry")

planeGeometry :: forall p. { | p } -> JSX
planeGeometry = element (threejs "PlaneGeometry")

sphereGeometry :: forall p. { | p } -> JSX
sphereGeometry = element (threejs "SphereGeometry")

icosahedronGeometry :: forall p. { | p } -> JSX
icosahedronGeometry = element (threejs "IcosahedronGeometry")

cylinderGeometry :: forall p. { | p } -> JSX
cylinderGeometry = element (threejs "CylinderGeometry")

meshBasicMaterial :: forall p. { | p } -> JSX
meshBasicMaterial = element (threejs "MeshBasicMaterial")

meshLambertMaterial :: forall p. { | p } -> JSX
meshLambertMaterial = element (threejs "MeshLambertMaterial")

meshPhongMaterial :: forall p. { | p } -> JSX
meshPhongMaterial = element (threejs "MeshPhongMaterial")

meshStandardMaterial :: forall p. { | p } -> JSX
meshStandardMaterial = element (threejs "MeshStandardMaterial")

-- Drei components (FFI to native React components)
foreign import edgesImpl :: forall a. ReactComponent { | a }

edges :: forall p. { | p } -> JSX
edges = element edgesImpl

foreign import outlinesImpl :: forall a. ReactComponent { | a }

outlines :: forall p. { | p } -> JSX
outlines = element outlinesImpl

foreign import instancesImpl :: forall a. ReactComponent { | a }

instances :: forall p. { | p } -> Array JSX -> JSX
instances p kids = element instancesImpl (withChildren kids p)

foreign import instanceImpl :: forall a. ReactComponent { | a }

instance_ :: forall p. { | p } -> JSX
instance_ = element instanceImpl

foreign import roundedBoxGeometryImpl :: forall a. ReactComponent { | a }

roundedBoxGeometry :: forall p. { | p } -> JSX
roundedBoxGeometry = element roundedBoxGeometryImpl

foreign import environmentImpl :: forall a. ReactComponent { | a }

environment :: forall p. { | p } -> JSX
environment = element environmentImpl

foreign import textImpl :: forall a. ReactComponent { | a }

text :: forall p. { | p } -> JSX
text = element textImpl

foreign import htmlImpl :: forall a. ReactComponent { | a }

html :: forall p. { | p } -> JSX
html = element htmlImpl

-- Helpers
foreign import withChildrenImpl :: forall c p. Fn2 c p p

withChildren :: forall c p. c -> p -> p
withChildren = runFn2 withChildrenImpl
