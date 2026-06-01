module DiagramShapes.Entry (sceneJSX) where

import React.Basic (JSX)
import DiagramShapes.Scene (sceneJSX) as Scene

-- Re-exported so the offscreen worker entry (@react-three/offscreen `render`) can
-- mount it; the worker supplies the Canvas, so no wrapper component is needed.
sceneJSX :: JSX
sceneJSX = Scene.sceneJSX
