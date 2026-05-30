import * as THREE from "three";

// Irreducible three.js object assembly. The morph math (which positions to set)
// lives in PureScript; this just wires up the Object3D graph and mutates it.

const makeGeometry = (indices, positions) => {
  const g = new THREE.BufferGeometry();
  g.setIndex(indices);
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
};

// A group holding a solid mesh and a wireframe mesh (each its own geometry), to
// be mounted whole via <primitive object={group}>.
export const mkShapeGroupImpl = (indices) => (positions) => () => {
  const solidGeo = makeGeometry(indices, positions);
  const wireGeo = makeGeometry(indices, positions);

  const solid = new THREE.Mesh(
    solidGeo,
    new THREE.MeshStandardMaterial({
      color: "#ff3b1a",
      roughness: 0.35,
      metalness: 0.12,
      side: THREE.DoubleSide,
    })
  );
  const wire = new THREE.Mesh(
    wireGeo,
    new THREE.MeshBasicMaterial({
      color: "#ffe9d6",
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
  );
  solid.frustumCulled = false;
  wire.frustumCulled = false;

  const group = new THREE.Group();
  group.add(solid);
  group.add(wire);
  group.userData.geometries = [solidGeo, wireGeo];
  return group;
};

// Overwrite both geometries' positions in place and recompute normals.
export const setGroupPositionsImpl = (group) => (positions) => () => {
  for (const g of group.userData.geometries) {
    const arr = g.attributes.position.array;
    for (let i = 0; i < positions.length; i++) arr[i] = positions[i];
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
  }
};

export const setGroupRotationImpl = (group) => (ry) => () => {
  group.rotation.y = ry;
  group.rotation.x = 0.5;
};
