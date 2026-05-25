module Feltballs.Offscreen (feltballsOffscreen) where

import Prelude

import Data.Foldable (traverse_)
import Data.Maybe (Maybe(..))
import Data.Nullable (Nullable, toNullable)
import Effect (Effect)
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (JSX, Ref, ReactComponent, element)
import React.Basic.DOM as D
import React.Basic.DOM.Internal (css)
import React.Basic.Hooks (Component, component, readRefMaybe, useEffectOnce, useRef)
import React.Basic.Hooks as Hooks
import Unsafe.Coerce (unsafeCoerce)

foreign import data CanvasEl :: Type
foreign import setupFeltballsImpl :: CanvasEl -> Effect (Effect Unit)

feltballsOffscreen :: ReactComponent {}
feltballsOffscreen = unsafeCoerce (unsafePerformEffect feltballsOffscreenComponent)

feltballsOffscreenComponent :: Component {}
feltballsOffscreenComponent = component "FeltballsOffscreen" \_ -> Hooks.do
  canvasRef <- useRef (toNullable (Nothing :: Maybe CanvasEl))

  useEffectOnce do
    readRefMaybe canvasRef >>= case _ of
      Just c -> setupFeltballsImpl c
      Nothing -> pure (pure unit)

  pure $ D.canvas
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
