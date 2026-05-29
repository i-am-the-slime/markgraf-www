module DiagramShapes.Entry (diagramShapesApp, sceneJSX) where

import React.Basic (ReactComponent)
import DiagramShapes.Scene (sceneJSX) as Scene

-- Re-export sceneJSX so the JS sidecar can wrap it in a <Canvas>.
sceneJSX = Scene.sceneJSX

foreign import diagramShapesApp :: ReactComponent {}
