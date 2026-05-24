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
    bevelSegments: 6,
    curveSegments: 12,
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

export const installGlobalPointerDownImpl = (handler) => () => {
  const fn = () => handler()
  window.addEventListener("pointerdown", fn)
  return () => window.removeEventListener("pointerdown", fn)
}

export const setWordmarkTransformImpl = (px) => (py) => () => {
  const el = document.getElementById("feltballs-wordmark")
  if (el) el.style.transform = `translate3d(${px}px, ${py}px, 0)`
}

export const installGlobalPointerUpImpl = (handler) => () => {
  const fn = () => handler()
  window.addEventListener("pointerup", fn)
  window.addEventListener("pointercancel", fn)
  return () => {
    window.removeEventListener("pointerup", fn)
    window.removeEventListener("pointercancel", fn)
  }
}
