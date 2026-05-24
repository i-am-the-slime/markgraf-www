import { Edges, Outlines, Instances, Instance, RoundedBoxGeometry, Environment, Text, Html } from "@react-three/drei"

// ---- ThreeEvent helpers ----
export const eventPointX = e => e.point.x
export const eventPointY = e => e.point.y
export const eventPointZ = e => e.point.z
export const stopPropagation = e => () => e.stopPropagation()

// ---- Drei intrinsic re-exports ----
export const edgesImpl = Edges
export const outlinesImpl = Outlines
export const instancesImpl = Instances
export const instanceImpl = Instance
export const roundedBoxGeometryImpl = RoundedBoxGeometry
export const environmentImpl = Environment
export const textImpl = Text
export const htmlImpl = Html

// ---- helpers ----
export const withChildrenImpl = (children, props) => ({ ...props, children })
