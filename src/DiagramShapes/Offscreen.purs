module DiagramShapes.Offscreen (diagramShapesOffscreen) where

import Prelude

import Data.Int (toNumber)
import Data.Maybe (Maybe(..))
import Data.Nullable (toNullable)
import Data.Number (sqrt)
import Effect (Effect)
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (ReactComponent)
import React.Basic.Hooks (Component, component, readRefMaybe, useEffectOnce, useRef)
import React.Basic.Hooks as Hooks
import Unsafe.Coerce (unsafeCoerce)
import Web.DOM.Element (clientHeight, clientWidth)
import Web.HTML.HTMLCanvasElement (HTMLCanvasElement, toElement)
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.Internal (css, noJSX)

foreign import setupDiagramShapesImpl :: Int -> HTMLCanvasElement -> Effect (Effect Unit)

pixelBudget :: Int
pixelBudget = 640 * 480

targetDpr :: Int -> HTMLCanvasElement -> Effect Number
targetDpr budget canvasEl = do
  w <- clientWidth el
  h <- clientHeight el
  pure (min 1.0 (sqrt (toNumber budget / area w h)))
  where
  el = toElement canvasEl
  area w h = max 1.0 w * max 1.0 h

diagramShapesOffscreen :: ReactComponent {}
diagramShapesOffscreen = unsafeCoerce (unsafePerformEffect diagramShapesOffscreenComponent)

diagramShapesOffscreenComponent :: Component {}
diagramShapesOffscreenComponent = component "DiagramShapesOffscreen" \_ -> Hooks.do
  canvasRef <- useRef (toNullable (Nothing :: Maybe HTMLCanvasElement))

  useEffectOnce do
    readRefMaybe canvasRef >>= case _ of
      Just c -> setupDiagramShapesImpl pixelBudget c
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
