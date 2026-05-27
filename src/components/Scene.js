import React from "react"
import { Float, Trail, Environment, Lightformer } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing"
import { Vector3, CatmullRomCurve3, BufferGeometry, LineCurve3, TubeGeometry } from "three"

// ---- drei components ----
export const floatImpl = Float
export const trailImpl = Trail
export const environmentImpl = Environment
export const lightformerImpl = Lightformer

// ---- postprocessing ----
export const effectComposerImpl = EffectComposer
export const bloomImpl = Bloom
export const chromaticAberrationImpl = ChromaticAberration

// ---- inline geometries backed by three.js objects ----
export const lineGeometryImpl = (from) => (to) => {
  const points = [
    new Vector3(from[0], from[1], from[2]),
    new Vector3(to[0], to[1], to[2]),
  ]
  const geo = new BufferGeometry().setFromPoints(points)
  return React.createElement("primitive", { object: geo, attach: "geometry" })
}

export const tubeGeometryImpl = (from) => (to) => (radius) => {
  const curve = new LineCurve3(
    new Vector3(from[0], from[1], from[2]),
    new Vector3(to[0], to[1], to[2]),
  )
  const geo = new TubeGeometry(curve, 8, radius, 6, false)
  return React.createElement("primitive", { object: geo, attach: "geometry" })
}

// ---- CatmullRom curve helpers ----
export const makeCurveImpl = (positions) => () => {
  const pts = positions.map((p) => new Vector3(p[0], p[1], p[2]))
  return new CatmullRomCurve3(pts, true, "catmullrom", 0.1)
}

export const curvePointAtImpl = (curve) => (t) => () => {
  const p = curve.getPointAt(t)
  return [p.x, p.y, p.z]
}

// ---- Scroll progress, camera helpers ----
export const readSceneProgress = () => {
  if (typeof document === "undefined") return 0
  return parseFloat(
    document.documentElement.style.getPropertyValue("--scene-progress"),
  ) || 0
}

export const readClockElapsed = (state) => state.clock.getElapsedTime()

export const readCamera = (state) => state.camera

export const cameraPosImpl = (cam) =>
  ({ x: cam.position.x, y: cam.position.y, z: cam.position.z })

export const setCameraPosImpl = (cam) => (x) => (y) => (z) => () => {
  cam.position.set(x, y, z)
}

export const cameraLookAtImpl = (cam) => (x) => (y) => (z) => () => {
  cam.lookAt(x, y, z)
}
