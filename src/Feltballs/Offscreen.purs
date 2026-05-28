module Feltballs.Offscreen (feltballsOffscreen) where

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
foreign import setupFeltballsImpl :: Int -> CanvasEl -> Effect (Effect Unit)

pixelBudget :: Int
pixelBudget = 400 * 300

feltballsOffscreen :: ReactComponent {}
feltballsOffscreen = unsafeCoerce (unsafePerformEffect feltballsOffscreenComponent)

feltballsOffscreenComponent :: Component {}
feltballsOffscreenComponent = component "FeltballsOffscreen" \_ -> Hooks.do
  canvasRef <- useRef (toNullable (Nothing :: Maybe CanvasEl))

  useEffectOnce do
    readRefMaybe canvasRef >>= case _ of
      Just c -> setupFeltballsImpl pixelBudget c
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
