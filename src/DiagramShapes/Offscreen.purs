module DiagramShapes.Offscreen (diagramShapesOffscreen, WorkerPost) where

import Prelude

import Data.Int (toNumber)
import Data.Maybe (Maybe(..))
import Data.Nullable (Nullable, null)
import Data.Number (sqrt)
import Effect (Effect)
import Effect.Console (log)
import Effect.Unsafe (unsafePerformEffect)
import Foreign (Foreign, unsafeToForeign)
import Page.Active (onActiveChange)
import React.Basic (ReactComponent, Ref)
import React.Basic.Hooks (Component, component, readRefMaybe, useEffectOnce, useRef, writeRef)
import React.Basic.Hooks as Hooks
import Unsafe.Coerce (unsafeCoerce)
import Web.DOM.Element (clientHeight, clientWidth)
import Web.Event.Event (EventType(..))
import Web.Event.EventTarget (addEventListener, eventListener, removeEventListener)
import Web.HTML (window)
import Web.HTML.HTMLCanvasElement (HTMLCanvasElement, toElement, toHTMLElement)
import Web.HTML.HTMLElement (offsetLeft, offsetTop)
import Web.HTML.Window as Window
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.Internal (css, noJSX)
import Yoga.WebBoss (onErrorFromWorker, postMessageToWorker, postMessageToWorkerWithTransfer, terminate)
import Yoga.WebProletarian.Transferable (OffscreenCanvas, offscreenCanvasToTransferable, transferControlToOffscreen)
import Yoga.WebProletarian.Types (Worker)

-- The diagramShapes scene renders into an OffscreenCanvas owned by a Web Worker.
-- Messages to that worker are the @react-three/offscreen `{ type, payload }`
-- protocol, so both message params are opaque `Foreign`.
type DiagramShapesWorker = Worker Foreign Foreign

-- Posts a `{ type, payload }` message to the worker. The parent (HeroPreview) holds
-- a `Ref (Maybe WorkerPost)` that this component fills once the worker is live, so
-- per-section morph/camera/formation messages reach the worker without a window
-- global — a Ref passed down, populated by this child, read by the parent.
type WorkerPost = String -> Foreign -> Effect Unit

foreign import newDiagramShapesWorker :: Effect DiagramShapesWorker
foreign import transferGuard :: HTMLCanvasElement -> Effect Boolean

diagramShapesOffscreen :: ReactComponent { postRef :: Ref (Maybe WorkerPost) }
diagramShapesOffscreen = unsafeCoerce (unsafePerformEffect diagramShapesOffscreenComponent)

diagramShapesOffscreenComponent :: Component { postRef :: Ref (Maybe WorkerPost) }
diagramShapesOffscreenComponent = component "DiagramShapesOffscreen" \{ postRef } -> Hooks.do
  canvasRef <- useRef (null :: Nullable HTMLCanvasElement)

  useEffectOnce do
    readRefMaybe canvasRef >>= case _ of
      Just c -> setupDiagramShapes postRef c
      Nothing -> pure (pure unit)

  pure $ canvas
    { ref: unsafeCoerce canvasRef
    , style: css
        { position: "absolute"
        , inset: "0"
        , width: "100%"
        , height: "100%"
        , overflow: "hidden"
        , display: "block"
        , background: "transparent"
        }
    }
    noJSX

-- Hand the canvas's drawing surface to the worker, then keep it in sync: dpr and
-- geometry on window resize, and the frameloop paused whenever the page isn't
-- being watched (`Page.Active`). Returns a teardown.
setupDiagramShapes :: Ref (Maybe WorkerPost) -> HTMLCanvasElement -> Effect (Effect Unit)
setupDiagramShapes postRef canvasEl = do
  alreadyRan <- transferGuard canvasEl
  if alreadyRan then pure (pure unit) else setup
  where
  setup = do
    worker <- newDiagramShapesWorker
    worker # onErrorFromWorker \msg -> log ("[diagram-shapes-worker] " <> msg)

    offscreen <- transferControlToOffscreen canvasEl
    initWorker worker offscreen

    stopResize <- onWindowResize (syncSize worker)
    stopActive <- onActiveChange \active -> do
      post worker "props" { frameloop: if active then "always" else "never" }
      -- Configure alone doesn't reliably restart a parked loop in the worker, so
      -- nudge it: this `resume` lands after the props above and invalidates.
      when active (post worker "resume" {})
    writeRef postRef (Just (post worker))

    pure do
      stopResize
      stopActive
      writeRef postRef Nothing
      terminate worker

  initWorker worker offscreen = do
    dpr <- targetDpr canvasEl
    geom <- geometry canvasEl
    postMessageToWorkerWithTransfer
      (envelope "init" (initPayload offscreen dpr geom))
      [ offscreenCanvasToTransferable offscreen ]
      worker
    post worker "props" { dpr }

  -- @react-three/offscreen clamps the init dpr to `Math.max(1, pixelRatio)`, so a
  -- sub-1 budget never lands on the first frame — and it caches that 1 for every
  -- later props message that omits dpr. This props message sets the real budget;
  -- handleProps applies dpr verbatim, with no clamp.

  syncSize worker = do
    dpr <- targetDpr canvasEl
    geom <- geometry canvasEl
    post worker "props" { dpr }
    post worker "resize" geom

-- The scene renders into a fixed pixel budget; dpr is the uniform scale that
-- keeps total pixels under that budget while preserving aspect ratio.
targetDpr :: HTMLCanvasElement -> Effect Number
targetDpr canvasEl = do
  w <- clientWidth el
  h <- clientHeight el
  budget <- pixelBudget
  pure (min 1.0 (sqrt (toNumber budget / area w h)))
  where
  el = toElement canvasEl
  area w h = max 1.0 w * max 1.0 h

-- Wider viewports earn a larger pixel budget, so the background sharpens on big
-- screens but stays cheap on phones. Re-read on every resize via targetDpr.
pixelBudget :: Effect Int
pixelBudget = do
  width <- window >>= Window.innerWidth
  height <- window >>= Window.innerHeight
  pure (budgetFor width height)
  where
  budgetFor width height
    | width >= 1600 && height >= 1000 = 1600 * 1200
    | width >= 1400 && height >= 900 = 1024 * 768
    | width >= 800 && height >= 600 = 800 * 600
    | otherwise = 640 * 480

type Geometry = { width :: Number, height :: Number, top :: Number, left :: Number }

type InitPayload =
  { props ::
      { camera :: { position :: Array Number, rotation :: Array Number, fov :: Number }
      , gl :: { alpha :: Boolean }
      , dpr :: Number
      }
  , drawingSurface :: OffscreenCanvas
  , width :: Number
  , height :: Number
  , top :: Number
  , left :: Number
  , pixelRatio :: Number
  }

geometry :: HTMLCanvasElement -> Effect Geometry
geometry canvasEl = do
  width <- clientWidth el
  height <- clientHeight el
  top <- offsetTop htmlEl
  left <- offsetLeft htmlEl
  pure { width, height, top, left }
  where
  el = toElement canvasEl
  htmlEl = toHTMLElement canvasEl

initPayload :: OffscreenCanvas -> Number -> Geometry -> InitPayload
initPayload offscreen dpr geom =
  { props: { camera, gl: { alpha: true }, dpr }
  , drawingSurface: offscreen
  , width: geom.width
  , height: geom.height
  , top: geom.top
  , left: geom.left
  , pixelRatio: dpr
  }
  where
  camera = { position: [ 0.0, -3.0, 9.0 ], rotation: [ 0.28, 0.0, 0.0 ], fov: 85.0 }

post :: forall payload. DiagramShapesWorker -> String -> payload -> Effect Unit
post worker ty payload = postMessageToWorker (envelope ty payload) worker

envelope :: forall payload. String -> payload -> Foreign
envelope ty payload = unsafeToForeign { "type": ty, payload }

onWindowResize :: Effect Unit -> Effect (Effect Unit)
onWindowResize action = do
  target <- map Window.toEventTarget window
  listener <- eventListener \_ -> action
  addEventListener (EventType "resize") listener false target
  pure (removeEventListener (EventType "resize") listener false target)

