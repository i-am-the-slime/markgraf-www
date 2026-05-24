"use client";

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, Lightformer, Trail } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";

const ACCENT = "#ff3b1a";
const BONE = "#f5f1e8";
const INK = "#0a0e1a";

// Three node positions in a triangle.
const NODES = [
  { id: "client", pos: [-3.5, 0.6, 0] },
  { id: "api",    pos: [ 0,    1.4, 0] },
  { id: "db",     pos: [ 3.5,  0.0, 0] },
];

const EDGES = [
  [NODES[0].pos, NODES[1].pos],
  [NODES[1].pos, NODES[2].pos],
];

// Bezier-ish smooth path for the token: client → api → db → api → client.
function makeTokenCurve() {
  const v = (a) => new THREE.Vector3(...a);
  return new THREE.CatmullRomCurve3(
    [
      v(NODES[0].pos),
      v(NODES[1].pos),
      v(NODES[2].pos),
      v(NODES[1].pos),
      v(NODES[0].pos),
    ],
    true,
    "catmullrom",
    0.1
  );
}

function Node({ position }) {
  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh position={position}>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshPhysicalMaterial
          color={INK}
          emissive={BONE}
          emissiveIntensity={0.05}
          metalness={0.6}
          roughness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
        <mesh>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshBasicMaterial color={BONE} wireframe transparent opacity={0.18} />
        </mesh>
      </mesh>
    </Float>
  );
}

function Edge({ from, to }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [from, to]);

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={BONE} transparent opacity={0.35} />
    </line>
  );
}

function EdgeTube({ from, to }) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    return new THREE.LineCurve3(a, b);
  }, [from, to]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 8, 0.015, 6, false]} />
      <meshBasicMaterial color={BONE} transparent opacity={0.25} />
    </mesh>
  );
}

function Token() {
  const ref = useRef();
  const curve = useMemo(makeTokenCurve, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.12) % 1;
    const p = curve.getPointAt(t);
    ref.current.position.copy(p);
  });

  return (
    <Trail
      width={1.2}
      length={6}
      color={new THREE.Color(ACCENT)}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

// Smoothstep + remap helpers
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const remap = (v, a, b) => smooth(Math.max(0, Math.min(1, (v - a) / (b - a))));
const mix = (a, b, t) => a + (b - a) * t;

// Three distinct beats:
//   Act 0 (0.00–0.30): hero close-up, gentle parallax.
//   Act 1 (0.30–0.65): pull back + orbit ~120°.
//   Act 2 (0.65–1.00): swing up to a near top-down architectural view.
function cameraForProgress(p) {
  const a1 = remap(p, 0.0, 0.30);
  const a2 = remap(p, 0.30, 0.65);
  const a3 = remap(p, 0.65, 1.0);

  // Act 0: radius 7→9, angle 0, y 1.2→1.6 (subtle)
  const r0 = mix(7, 9, a1);
  const ang0 = mix(0, 0.15, a1);
  const y0 = mix(1.2, 1.6, a1);

  // Act 1: pull back radius 9→15, orbit angle 0.15→Math.PI*0.7, y 1.6→3
  const r1 = mix(r0, 15, a2);
  const ang1 = mix(ang0, Math.PI * 0.7, a2);
  const y1 = mix(y0, 3, a2);

  // Act 2: swing higher, near top-down; radius shrinks back, y climbs
  const r2 = mix(r1, 11, a3);
  const ang2 = mix(ang1, Math.PI * 0.9, a3);
  const y2 = mix(y1, 9, a3);

  return {
    x: Math.sin(ang2) * r2,
    z: Math.cos(ang2) * r2,
    y: y2,
  };
}

function ScrollRig({ progressRef }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame(() => {
    const p = progressRef.current ?? 0;
    const c = cameraForProgress(p);
    // Smooth-follow the target position so transitions feel buttery.
    const k = 0.12;
    camera.position.x += (c.x - camera.position.x) * k;
    camera.position.y += (c.y - camera.position.y) * k;
    camera.position.z += (c.z - camera.position.z) * k;
    camera.lookAt(target.current);
  });
  return null;
}

// Extra nodes that only appear in Act 2 — the "this is part of a bigger
// system" beat. They float in from outside the camera view.
function ContextNodes({ progressRef }) {
  const groupRef = useRef();
  const positions = useMemo(
    () => [
      [-7,  2.5, -3],
      [ 7,  2.0, -4],
      [-5, -2.5,  3],
      [ 6, -2.0,  4],
      [ 0,  4.0, -6],
      [ 0, -3.5, -5],
    ],
    []
  );
  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current ?? 0;
    const a = remap(p, 0.55, 0.95);
    groupRef.current.scale.setScalar(a);
    groupRef.current.visible = a > 0.001;
  });
  return (
    <group ref={groupRef} scale={0}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <icosahedronGeometry args={[0.25, 1]} />
          <meshBasicMaterial color={BONE} wireframe transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Scene3D({ progressRef }) {
  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 10, 28]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[6, 6, 6]} intensity={0.6} color={BONE} />
      <pointLight position={[-6, -2, -4]} intensity={0.8} color={ACCENT} />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={1.5} position={[0, 4, 4]} scale={[8, 2, 1]} color={BONE} />
        <Lightformer form="rect" intensity={1.2} position={[-4, -2, 2]} scale={[4, 2, 1]} color={ACCENT} />
      </Environment>

      <group>
        {NODES.map((n) => (
          <Node key={n.id} position={n.pos} />
        ))}
        {EDGES.map(([a, b], i) => (
          <React.Fragment key={i}>
            <Edge from={a} to={b} />
            <EdgeTube from={a} to={b} />
          </React.Fragment>
        ))}
        <Token />
        <ContextNodes progressRef={progressRef} />
      </group>

      <ScrollRig progressRef={progressRef} />

      <EffectComposer>
        <Bloom mipmapBlur intensity={1.4} luminanceThreshold={0.2} luminanceSmoothing={0.4} />
        <ChromaticAberration offset={[0.0006, 0.0006]} />
      </EffectComposer>
    </>
  );
}

export default function Scene({ progressId }) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const read = () => {
      const v = parseFloat(document.documentElement.style.getPropertyValue("--scene-progress")) || 0;
      progressRef.current = v;
    };
    let raf = 0;
    const tick = () => {
      read();
      raf = window.requestAnimationFrame(tick);
    };
    tick();
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 1.5, 9], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <Scene3D progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
