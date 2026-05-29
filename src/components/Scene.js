import { Vector3, CatmullRomCurve3, BufferGeometry, LineCurve3, TubeGeometry } from "three"

export const mkLineGeometryImpl = (from) => (to) => () =>
  new BufferGeometry().setFromPoints([
    new Vector3(from[0], from[1], from[2]),
    new Vector3(to[0], to[1], to[2]),
  ])

export const mkTubeGeometryImpl = (from) => (to) => (tubularSegments) => (radius) => (radialSegments) => (closed) => () => {
  const curve = new LineCurve3(
    new Vector3(from[0], from[1], from[2]),
    new Vector3(to[0], to[1], to[2]),
  )
  return new TubeGeometry(curve, tubularSegments, radius, radialSegments, closed)
}

export const mkCatmullRomCurveImpl = (positions) => (closed) => (curveType) => (tension) => () => {
  const pts = positions.map((p) => new Vector3(p[0], p[1], p[2]))
  return new CatmullRomCurve3(pts, closed, curveType, tension)
}

export const curvePointAtImpl = (curve) => (t) => () => {
  const p = curve.getPointAt(t)
  return [p.x, p.y, p.z]
}

export const readCssVarImpl = (name) => () => {
  if (typeof document === "undefined") return ""
  return document.documentElement.style.getPropertyValue(name)
}

export const writeCssVarImpl = (name) => (value) => () => {
  if (typeof document === "undefined") return
  document.documentElement.style.setProperty(name, value)
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
