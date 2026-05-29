// Off-main-thread render entry. The parent ships an OffscreenCanvas via
// postMessage; @react-three/offscreen's `render` mounts the scene against it.
import { render } from "@react-three/offscreen"
import { sceneJSX } from "../output/DiagramShapes.Entry/index.js"

render(sceneJSX)
