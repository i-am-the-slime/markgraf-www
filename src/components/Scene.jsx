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

function ScrollRig({ progressRef }) {
  const { camera } = useThree();
  useFrame(() => {
    const p = progressRef.current ?? 0;
    // 0 → close, looking head-on; 1 → orbited, pulled back, slight tilt
    const angle = p * Math.PI * 0.6;
    const radius = 9 + p * 6;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = 1.5 + p * 2.5;
    camera.lookAt(0, 0.6, 0);
  });
  return null;
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
