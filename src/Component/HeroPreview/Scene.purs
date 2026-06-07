module Component.HeroPreview.Scene
  ( sectionStates
  , diagramShapesBackground
  , dispatchActive
  , observeRatios
  , mostVisible
  ) where

import Prelude

import Component.HeroPreview.Dom (findElementById)
import Data.Array as Array
import Data.Foldable (for_, traverse_)
import Data.Maybe (Maybe(..), maybe)
import Data.Newtype (un)
import Data.Options ((:=))
import Data.Traversable (traverse)
import DiagramShapes.Offscreen as DiagramShapes
import Effect (Effect)
import Foreign (unsafeToForeign)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (Ref, readRef, writeRef)
import React.Basic.Hooks as Hooks
import Web.DOM.Element as Element
import Web.DOM.ElementId (ElementId(..))
import Web.Intersection.Observer as IO
import Web.Intersection.Observer.Options as IO
import Yoga.React.DOM.HTML.Div (div)

-- Fixed full-viewport layer that the offscreen WebGL canvas paints into. Sits
-- behind every section so per-section camera arms + ball morphs are visible
-- as the user scrolls between spreads.
-- Held dark until the wordmark's neon catches, then faded up — so the title
-- strikes on against black and the world powers up behind it. The worker is
-- mounted from the start (its per-section poses still land); only the reveal
-- waits on `lit`.
diagramShapesBackground :: Ref (Maybe DiagramShapes.WorkerPost) -> Boolean -> JSX
diagramShapesBackground postRef lit = diagramShapes { postRef } #
  div
    { className:
        "fixed inset-0 z-0 pointer-events-none transition-opacity duration-[1200ms] ease-out "
          <> if lit then "opacity-100" else "opacity-0"
    }

-- ---------------------------------------------------------------------------
-- Per-section declarative state: each section declares both a ball morph
-- direction/amount and a camera arm pose. The controller watches which section
-- is most visible and posts both to the worker; the worker lerps current
-- toward target each frame.
-- ---------------------------------------------------------------------------

type Morph =
  { dx :: Number, dy :: Number, dz :: Number, amount :: Number }

type CameraArm =
  { px :: Number
  , py :: Number
  , pz :: Number
  , lx :: Number
  , ly :: Number
  , lz :: Number
  , fov :: Number
  }

-- Formations are declared per section. kind 0=stream (disorder), 1=ring,
-- 2=sphere, 3=helix. `order` blends between the stream and the formation
-- in the worker — 0 means the original wandering, 1 means fully choreographed.
type FormationPose =
  { kind :: Number
  , radius :: Number
  , length :: Number
  , speed :: Number
  , order :: Number
  }

stream :: FormationPose
stream = zero

ring :: { radius :: Number, speed :: Number } -> FormationPose
ring fp = { kind: 1.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

sphere :: { radius :: Number, speed :: Number } -> FormationPose
sphere fp = { kind: 2.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

helix :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
helix fp = { kind: 3.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

-- Fake sound-wave: balls strung along a horizontal axis, y traces a multi-
-- harmonic sine that scrolls with time.
wave :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
wave fp = { kind: 4.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

tornado :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
tornado fp = { kind: 5.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

-- Right-pointing play-button outline. Balls trace the triangle perimeter at
-- `speed`; `radius` is the triangle half-extent.
playButton :: { radius :: Number, speed :: Number } -> FormationPose
playButton fp = { kind: 6.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

-- Heroicons code-bracket outline (`</>`). Three disconnected polylines.
code :: { radius :: Number, speed :: Number } -> FormationPose
code fp = { kind: 7.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

type SectionState =
  { id :: String
  , morph :: Morph
  , camera :: CameraArm
  , formation :: FormationPose
  }

home :: CameraArm
home = { px: 0.0, py: -3.0, pz: 9.0, lx: 0.0, ly: 0.0, lz: 0.0, fov: 85.0 }

gathered :: Morph
gathered = { dx: 0.0, dy: 0.0, dz: 0.0, amount: 0.0 }

sectionStates :: Array SectionState
sectionStates =
  [ { id: "page-hero"
    , morph: gathered
    , camera: home
    , formation: stream
    }
  , { id: "playground"
    , morph: gathered
    , camera: home { py = 0.0, pz = 24.0, fov = 55.0 }
    , formation: code { radius: 11.0, speed: 0.15 }
    }
  , { id: "integrations"
    , morph: gathered
    , camera: home { px = -4.0, lx = -1.8, fov = 80.0 }
    , formation: helix { radius: 4.0, length: 12.0, speed: 0.6 }
    }
  , { id: "render"
    , morph: gathered
    , camera: home { py = -6.0, lx = -0.8, ly = 2.0 }
    , formation: sphere { radius: 5.0, speed: 0.25 }
    }
  , { id: "ai"
    , morph: gathered
    , camera: home { px = 1.5, lx = -5.0, ly = 2.5, fov = 80.0 }
    , formation: tornado { radius: 3.5, length: 8.0, speed: 6.0 }
    }
  , { id: "embed"
    , morph: gathered
    , camera: home { pz = 28.0, fov = 70.0 }
    , formation: wave { radius: 2.4, length: 36.0, speed: 1.8 }
    }
  , { id: "play"
    , morph: gathered
    , camera: home { py = 0.0, pz = 24.0, fov = 55.0 }
    , formation: code { radius: 11.0, speed: 0.15 }
    }
  , { id: "install"
    , morph: gathered
    , camera: home { pz = 6.0, fov = 90.0 }
    , formation: stream
    }
  ]

diagramShapesComponent :: ReactComponent { postRef :: Ref (Maybe DiagramShapes.WorkerPost) }
diagramShapesComponent = DiagramShapes.diagramShapesOffscreen

diagramShapes = element diagramShapesComponent

-- Picks the most-visible section from the ratios so far and, when it changes,
-- posts its declared morph + camera arm to the worker.
dispatchActive
  :: Ref (Maybe DiagramShapes.WorkerPost)
  -> Hooks.Ref String
  -> Array { id :: String, ratio :: Number }
  -> Effect Unit
dispatchActive postRef activeRef ratios = case mostVisible ratios of
  Nothing -> pure unit
  Just best -> case Array.find (\s -> s.id == best.id) sectionStates of
    Nothing -> pure unit
    Just sect -> do
      last <- readRef activeRef
      when (sect.id /= last) do
        writeRef activeRef sect.id
        postWorkerMessage postRef "morph" sect.morph
        postWorkerMessage postRef "camera" sect.camera
        postWorkerMessage postRef "formation" sect.formation

mostVisible
  :: Array { id :: String, ratio :: Number }
  -> Maybe { id :: String, ratio :: Number }
mostVisible = Array.foldl pick Nothing
  where
  pick Nothing x = Just x
  pick (Just best) x = Just (if x.ratio > best.ratio then x else best)

observeRatios
  :: String
  -> Array String
  -> (String -> Number -> Effect Unit)
  -> Effect (Effect Unit)
observeRatios rootId ids cb = do
  rootEl <- findElementById rootId
  els <- Array.catMaybes <$> traverse findElementById ids
  obs <- IO.newIntersectionObserver
    ( \entries _ -> for_ entries \e -> do
        id <- Element.id e.target
        cb (un ElementId id) e.intersectionRatio
    )
    ( IO.thresholds := [ 0.0, 0.25, 0.5, 0.75, 1.0 ]
        <> maybe mempty (\r -> IO.root := r) rootEl
    )
  for_ els (IO.observe obs)
  pure $ for_ els (IO.unobserve obs)

-- Push a worker message through the Ref the offscreen component fills once its
-- worker is live; a no-op until then (the next section change retries naturally).
postWorkerMessage :: forall a. Ref (Maybe DiagramShapes.WorkerPost) -> String -> a -> Effect Unit
postWorkerMessage postRef ty payload =
  readRef postRef >>= traverse_ \post -> post ty (unsafeToForeign payload)
