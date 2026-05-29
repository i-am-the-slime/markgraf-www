module DiagramShapes.Offscreen (diagramShapesOffscreen) where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Nullable (toNullable)
import Effect (Effect)
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (ReactComponent)
import React.Basic.Hooks (Component, component, readRefMaybe, useEffectOnce, useRef)
import React.Basic.Hooks as Hooks
import Unsafe.Coerce (unsafeCoerce)
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.Internal (css, noJSX)

foreign import data CanvasEl :: Type
foreign import setupDiagramShapesImpl :: Int -> CanvasEl -> Effect (Effect Unit)

pixelBudget :: Int
pixelBudget = 640 * 480

diagramShapesOffscreen :: ReactComponent {}
diagramShapesOffscreen = unsafeCoerce (unsafePerformEffect diagramShapesOffscreenComponent)

diagramShapesOffscreenComponent :: Component {}
diagramShapesOffscreenComponent = component "DiagramShapesOffscreen" \_ -> Hooks.do
  canvasRef <- useRef (toNullable (Nothing :: Maybe CanvasEl))

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
