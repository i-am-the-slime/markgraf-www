import React from "react"
import { Shape, ExtrudeGeometry, Vector3 } from "three"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

export const readClockElapsed = (state) => state.clock.getElapsedTime()
export const readPointerX = (state) => state.pointer.x
export const readPointerY = (state) => state.pointer.y
export const readAspect = (state) => state.size.width / state.size.height

const pgCache = new Map()
const getParallelogram = (w, h, skew, depth) => {
  const key = `${w}|${h}|${skew}|${depth}`
  let g = pgCache.get(key)
  if (g) return g
  const shape = new Shape()
  shape.moveTo(-w / 2 + skew / 2, -h / 2)
  shape.lineTo(w / 2 + skew / 2, -h / 2)
  shape.lineTo(w / 2 - skew / 2, h / 2)
  shape.lineTo(-w / 2 - skew / 2, h / 2)
  shape.closePath()
  g = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 })
  g.translate(0, 0, -depth / 2)
  pgCache.set(key, g)
  return g
}

export const parallelogramGeometryImpl = (w) => (h) => (skew) => (depth) =>
  React.createElement("primitive", {
    object: getParallelogram(w, h, skew, depth),
    attach: "geometry",
  })

const rrCache = new Map()
const getRoundedRect = (w, h, r, depth) => {
  const key = `${w}|${h}|${r}|${depth}`
  let g = rrCache.get(key)
  if (g) return g
  const shape = new Shape()
  const x = -w / 2, y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  g = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
    curveSegments: 4,
    steps: 1,
  })
  g.translate(0, 0, -depth / 2)
  g = mergeVertices(g)
  g.computeVertexNormals()
  rrCache.set(key, g)
  return g
}

export const roundedRectGeometryImpl = (w) => (h) => (r) => (depth) =>
  React.createElement("primitive", {
    object: getRoundedRect(w, h, r, depth),
    attach: "geometry",
  })

const _projTmp = new Vector3()
export const hoveredBallIndex = (state) => {
  const { camera, pointer, scene } = state
  scene.updateMatrixWorld(true)
  let bestIdx = -1
  let bestDist = 0.04
  scene.traverse((o) => {
    if (!o.userData || typeof o.userData.ballIndex !== "number") return
    o.getWorldPosition(_projTmp)
    _projTmp.project(camera)
    const dx = _projTmp.x - pointer.x
    const dy = _projTmp.y - pointer.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < bestDist) {
      bestDist = d
      bestIdx = o.userData.ballIndex
    }
  })
  return bestIdx
}

// Typed-array helpers. Used by Scene.purs as mutable per-ball buffers so we
// avoid `Array.index` (boxed) and `updateAt` (whole-array copy) on the per-frame
// path. Allocated once at component mount and reused for the lifetime of the scene.
export const newU8Impl = (n) => () => new Uint8Array(n)
export const readU8Impl = (a) => (i) => () => a[i]
export const writeU8Impl = (a) => (i) => (v) => () => { a[i] = v }
export const fillU8Impl = (a) => (v) => () => { a.fill(v) }

export const newF32Impl = (n) => () => {
  const a = new Float32Array(n)
  a.fill(-1)
  return a
}
export const readF32Impl = (a) => (i) => () => a[i]
export const writeF32Impl = (a) => (i) => (v) => () => { a[i] = v }


// Listens on the worker's `self` for `{type:"startChain"}` messages and runs
// `handler` each time. `addEventListener` doesn't disturb the `self.onmessage`
// that `@react-three/offscreen` installs — both fire on every message.
export const installStartChainListenerImpl = (handler) => () => {
  if (typeof self === "undefined" || typeof self.addEventListener !== "function") return () => {}
  const onMsg = (e) => { if (e.data && e.data.type === "startChain") handler() }
  self.addEventListener("message", onMsg)
  return () => self.removeEventListener("message", onMsg)
}

// Generic message listeners — host pages declare per-section morph and camera
// state and post it via `window.__diagramShapesPost`. The worker lerps current
// toward target each frame.
export const installMorphListenerImpl = (handler) => () => {
  if (typeof self === "undefined" || typeof self.addEventListener !== "function") return () => {}
  const onMsg = (e) => {
    if (!e.data || e.data.type !== "morph" || !e.data.payload) return
    const p = e.data.payload
    handler(p.dx)(p.dy)(p.dz)(p.amount)()
  }
  self.addEventListener("message", onMsg)
  return () => self.removeEventListener("message", onMsg)
}

export const installFormationListenerImpl = (handler) => () => {
  if (typeof self === "undefined" || typeof self.addEventListener !== "function") return () => {}
  const onMsg = (e) => {
    if (!e.data || e.data.type !== "formation" || !e.data.payload) return
    const p = e.data.payload
    handler(p.kind)(p.radius)(p.length)(p.speed)(p.order)()
  }
  self.addEventListener("message", onMsg)
  return () => self.removeEventListener("message", onMsg)
}

export const installCameraListenerImpl = (handler) => () => {
  if (typeof self === "undefined" || typeof self.addEventListener !== "function") return () => {}
  const onMsg = (e) => {
    if (!e.data || e.data.type !== "camera" || !e.data.payload) return
    const p = e.data.payload
    handler(p.px)(p.py)(p.pz)(p.lx)(p.ly)(p.lz)(p.fov)()
  }
  self.addEventListener("message", onMsg)
  return () => self.removeEventListener("message", onMsg)
}

// Mutates the R3F default camera in place, called each frame from Scene.purs.
// Lerp happens on the PureScript side so the camera math stays declarative.
export const applyCameraImpl = (state) => (px) => (py) => (pz) => (lx) => (ly) => (lz) => (fov) => () => {
  const c = state.camera
  c.position.set(px, py, pz)
  c.lookAt(lx, ly, lz)
  if (Math.abs(c.fov - fov) > 0.01) {
    c.fov = fov
    c.updateProjectionMatrix()
  }
}
