import * as THREE from "three";

// Irreducible three.js plumbing only — the geometry math lives in PureScript.

// Build a BufferGeometry from a flat index list and a flat [x,y,z,...] position
// array, with computed normals. Held as a singleton and mutated each frame.
export const mkGeometryImpl = (indices) => (positions) => () => {
  const g = new THREE.BufferGeometry();
  g.setIndex(indices);
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  g.computeVertexNormals();
  return g;
};

// Overwrite the position attribute in place and recompute normals.
export const setPositionsImpl = (g) => (positions) => () => {
  const arr = g.attributes.position.array;
  for (let i = 0; i < positions.length; i++) arr[i] = positions[i];
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
};
