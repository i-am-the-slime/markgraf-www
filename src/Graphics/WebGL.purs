module Graphics.WebGL
  ( GL
  , Program
  , Texture
  , Uniform
  , getContext
  , buildProgram
  , setupQuad
  , uniformLocation
  , uniform1f
  , uniform2f
  , uniform1i
  , uniform4fv
  , uniform4fvNE
  , uniform2fv
  , uniform2fvNE
  , uniform1fv
  , uniform1fvNE
  , createTexture
  , uploadCanvas
  , uploadCanvasUnit
  , resize
  , clear
  , drawQuad
  , clientSize
  , devicePixelRatio
  , now
  ) where

import Prelude

import Data.Array.NonEmpty (NonEmptyArray, toArray)
import Data.Array.NonEmpty as NEA
import Data.Maybe (maybe)
import Data.Nullable (Nullable)
import Effect (Effect)
import Effect.Uncurried (EffectFn1, EffectFn2, EffectFn3, EffectFn4, runEffectFn1, runEffectFn2, runEffectFn3, runEffectFn4)
import Graphics.Canvas (CanvasElement)

-- A thin WebGL1 binding: opaque GL handles, raw calls. The drawing surface is
-- the CanvasElement type Graphics.Canvas already uses; all rendering logic stays
-- in PureScript (see Component.InstallButtonSDF).

foreign import data GL :: Type
foreign import data Program :: Type
foreign import data Texture :: Type
foreign import data Uniform :: Type

getContext :: CanvasElement -> Effect (Nullable GL)
getContext = runEffectFn1 getContextImpl

foreign import getContextImpl :: EffectFn1 CanvasElement (Nullable GL)

buildProgram :: GL -> { vertex :: String, fragment :: String } -> Effect Program
buildProgram gl shaders = runEffectFn3 buildProgramImpl gl shaders.vertex shaders.fragment

foreign import buildProgramImpl :: EffectFn3 GL String String Program

setupQuad :: GL -> Program -> Effect Unit
setupQuad = runEffectFn2 setupQuadImpl

foreign import setupQuadImpl :: EffectFn2 GL Program Unit

uniformLocation :: GL -> Program -> String -> Effect Uniform
uniformLocation = runEffectFn3 uniformLocationImpl

foreign import uniformLocationImpl :: EffectFn3 GL Program String Uniform

uniform1f :: GL -> Uniform -> Number -> Effect Unit
uniform1f = runEffectFn3 uniform1fImpl

foreign import uniform1fImpl :: EffectFn3 GL Uniform Number Unit

uniform2f :: GL -> Uniform -> Number -> Number -> Effect Unit
uniform2f = runEffectFn4 uniform2fImpl

foreign import uniform2fImpl :: EffectFn4 GL Uniform Number Number Unit

uniform1i :: GL -> Uniform -> Int -> Effect Unit
uniform1i = runEffectFn3 uniform1iImpl

foreign import uniform1iImpl :: EffectFn3 GL Uniform Int Unit

-- Array uniforms. Public API takes Array and skips when empty; the Impl takes
-- NonEmptyArray so the FFI can't receive an empty payload.
uniform4fv :: GL -> Uniform -> Array Number -> Effect Unit
uniform4fv gl loc = maybe (pure unit) (uniform4fvNE gl loc) <<< NEA.fromArray

uniform4fvNE :: GL -> Uniform -> NonEmptyArray Number -> Effect Unit
uniform4fvNE gl loc = runEffectFn3 uniform4fvImpl gl loc <<< toArray

foreign import uniform4fvImpl :: EffectFn3 GL Uniform (Array Number) Unit

uniform2fv :: GL -> Uniform -> Array Number -> Effect Unit
uniform2fv gl loc = maybe (pure unit) (uniform2fvNE gl loc) <<< NEA.fromArray

uniform2fvNE :: GL -> Uniform -> NonEmptyArray Number -> Effect Unit
uniform2fvNE gl loc = runEffectFn3 uniform2fvImpl gl loc <<< toArray

foreign import uniform2fvImpl :: EffectFn3 GL Uniform (Array Number) Unit

uniform1fv :: GL -> Uniform -> Array Number -> Effect Unit
uniform1fv gl loc = maybe (pure unit) (uniform1fvNE gl loc) <<< NEA.fromArray

uniform1fvNE :: GL -> Uniform -> NonEmptyArray Number -> Effect Unit
uniform1fvNE gl loc = runEffectFn3 uniform1fvImpl gl loc <<< toArray

foreign import uniform1fvImpl :: EffectFn3 GL Uniform (Array Number) Unit

createTexture :: GL -> Effect Texture
createTexture = runEffectFn1 createTextureImpl

foreign import createTextureImpl :: EffectFn1 GL Texture

uploadCanvas :: GL -> Texture -> CanvasElement -> Effect Unit
uploadCanvas gl texture canvas = runEffectFn4 uploadCanvasImpl gl texture canvas 0

uploadCanvasUnit :: GL -> Texture -> CanvasElement -> Int -> Effect Unit
uploadCanvasUnit = runEffectFn4 uploadCanvasImpl

foreign import uploadCanvasImpl :: EffectFn4 GL Texture CanvasElement Int Unit

resize :: GL -> CanvasElement -> Int -> Int -> Effect Unit
resize = runEffectFn4 resizeImpl

foreign import resizeImpl :: EffectFn4 GL CanvasElement Int Int Unit

clear :: GL -> Effect Unit
clear = runEffectFn1 clearImpl

foreign import clearImpl :: EffectFn1 GL Unit

drawQuad :: GL -> Effect Unit
drawQuad = runEffectFn1 drawQuadImpl

foreign import drawQuadImpl :: EffectFn1 GL Unit

clientSize :: CanvasElement -> Effect { width :: Number, height :: Number }
clientSize = runEffectFn1 clientSizeImpl

foreign import clientSizeImpl :: EffectFn1 CanvasElement { width :: Number, height :: Number }

devicePixelRatio :: Effect Number
devicePixelRatio = devicePixelRatioImpl

foreign import devicePixelRatioImpl :: Effect Number

now :: Effect Number
now = nowImpl

foreign import nowImpl :: Effect Number
