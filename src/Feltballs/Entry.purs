module Feltballs.Entry (feltballsApp, sceneJSX) where

import React.Basic (ReactComponent)
import Feltballs.Scene (sceneJSX) as Scene

-- Re-export sceneJSX so the JS sidecar can wrap it in a <Canvas>.
sceneJSX = Scene.sceneJSX

foreign import feltballsApp :: ReactComponent {}
