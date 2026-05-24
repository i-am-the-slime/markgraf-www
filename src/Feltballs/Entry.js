import React from "react"
import { Canvas } from "@react-three/fiber"
import { sceneJSX } from "./index.js"

export const feltballsApp = function FeltballsApp() {
  return React.createElement(
    Canvas,
    {
      camera: { position: [0, -3, 9], rotation: [0.28, 0, 0], fov: 85 },
      style: { background: "transparent" },
      gl: { alpha: true },
    },
    sceneJSX
  )
}
