// Off-main-thread render entry. The parent ships an OffscreenCanvas via
// postMessage; @react-three/offscreen's `render` mounts the scene against it
// using the same R3F pipeline, just inside this worker.
import { render } from "@react-three/offscreen"
import { sceneJSX } from "../output/Feltballs.Entry/index.js"

render(sceneJSX)
