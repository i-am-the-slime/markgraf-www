module Components.Scene (writeSceneProgress) where

import Prelude

import Effect (Effect)

-- Publishes scroll progress as the `--scene-progress` CSS custom property.
writeSceneProgress :: Number -> Effect Unit
writeSceneProgress = writeCssVarImpl "--scene-progress" <<< show

foreign import writeCssVarImpl :: String -> String -> Effect Unit
