"use client"

import { Canvas } from "@react-three/offscreen"
import { memo, useEffect, useState } from "react"

const cameraProps = { position: [0, -3, 9], rotation: [0.28, 0, 0], fov: 85 }
const styleProps = { background: "transparent", position: "absolute", inset: 0, width: "100%", height: "100%" }
const glProps = { alpha: true }

function FeltballsOffscreen() {
  const [worker, setWorker] = useState(null)
  useEffect(() => {
    const w = new Worker(new URL("./feltballs.worker.js", import.meta.url), { type: "module" })
    setWorker(w)
    return () => w.terminate()
  }, [])
  if (!worker) return null
  return (
    <Canvas
      worker={worker}
      fallback={null}
      camera={cameraProps}
      style={styleProps}
      gl={glProps}
    />
  )
}

export default memo(FeltballsOffscreen)
