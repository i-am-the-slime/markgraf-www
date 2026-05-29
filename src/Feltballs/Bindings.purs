module Feltballs.Bindings
  ( module Yoga.React.R3F.Events
  , module Drei
  , module DreiStaging
  , boxGeometry
  , planeGeometry
  , sphereGeometry
  , icosahedronGeometry
  , cylinderGeometry
  , meshBasicMaterial
  , meshLambertMaterial
  , meshPhongMaterial
  , meshStandardMaterial
  ) where

import React.Basic (JSX, element)
import React.R3F.Three.Internal (threejs)
import Yoga.React.R3F.Drei.Misc (edges, outlines, instances, instance_, roundedBoxGeometry, text, html) as Drei
import Yoga.React.R3F.Drei.Staging (environment) as DreiStaging
import Yoga.React.R3F.Events (ThreeEvent, eventPointX, eventPointY, eventPointZ, stopPropagation, withChildren)

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
