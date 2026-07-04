"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// A true 3D solar system behind the whole site (FR-CHAR-032), revealed when the
// black hole digests the page away. It lives on its OWN fixed canvas at z-index 0
// (behind the content, which is z-index 1) - separate from Lumi's canvas, which
// rides above. The camera looks down on the orbit plane at an oblique angle, so
// the orbits read as ellipses and planets genuinely pass BEHIND the sun (real
// depth, not a flat CSS disc). The render loop only runs while a digest is on, so
// it is idle otherwise; on narrow / low-core devices it does not mount at all and
// the CSS CosmosBackdrop is the fallback.

const PLANETS = [
  { r: 2.3, size: 0.16, speed: 0.5, color: "#ffe6a0", ring: false },
  { r: 3.3, size: 0.32, speed: 0.33, color: "#f4ba17", ring: true },
  { r: 4.6, size: 0.2, speed: 0.24, color: "#9fc7ff", ring: false },
  { r: 6.0, size: 0.36, speed: 0.16, color: "#fff2d0", ring: false },
  { r: 7.6, size: 0.24, speed: 0.11, color: "#d98a1f", ring: false },
] as const;

function CameraSetup() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function System() {
  const grp = useRef<THREE.Group>(null);
  const orbits = useRef<Array<THREE.Group | null>>([]);
  const sun = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    for (let i = 0; i < PLANETS.length; i++) {
      const o = orbits.current[i];
      if (o) o.rotation.y += delta * PLANETS[i].speed;
    }
    if (grp.current) grp.current.rotation.y += delta * 0.02;
    if (sun.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      sun.current.scale.setScalar(s);
    }
  });
  return (
    <group ref={grp}>
      {/* sun: hot core + additive corona + light */}
      <mesh>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshBasicMaterial color="#FFCF6B" toneMapped={false} />
      </mesh>
      <mesh ref={sun}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#ffb020" transparent opacity={0.28} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2.6} distance={44} color="#ffd873" />
      {PLANETS.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            orbits.current[i] = el;
          }}
        >
          {/* orbit ring lies in the XZ plane; the oblique camera makes it read
              as an ellipse */}
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[p.r - 0.012, p.r + 0.012, 128]} />
            <meshBasicMaterial color="#c8aa5a" transparent opacity={0.13} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <group position={[p.r, 0, 0]}>
            <mesh>
              <sphereGeometry args={[p.size, 32, 32]} />
              <meshStandardMaterial color={p.color} roughness={0.55} metalness={0.2} emissive={p.color} emissiveIntensity={0.12} />
            </mesh>
            {p.ring && (
              <mesh rotation-x={-Math.PI / 2.3} rotation-z={0.2}>
                <ringGeometry args={[p.size * 1.5, p.size * 2.4, 64]} />
                <meshBasicMaterial color="#ffe6a0" transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

function Nebula() {
  return (
    <>
      <mesh position={[-9, 4, -7]}>
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial color="#3a2a6b" transparent opacity={0.13} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[10, -5, -9]}>
        <sphereGeometry args={[11, 16, 16]} />
        <meshBasicMaterial color="#6b2a48" transparent opacity={0.1} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[6, 6, -10]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color="#26507e" transparent opacity={0.1} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

export function CosmosCanvas() {
  const [capable, setCapable] = useState(false);
  const [digesting, setDigesting] = useState(false);

  useEffect(() => {
    // Wide + enough cores. Deliberately NOT gated on pointer type: the digest
    // only fires on desktop (holding Lumi), so on touch this canvas simply never
    // reveals - and the render loop is idle until then anyway.
    const cores = navigator.hardwareConcurrency ?? 4;
    if (window.innerWidth < 1024 || cores < 4) return;
    setCapable(true);
    const el = document.documentElement;
    const update = () => setDigesting(el.hasAttribute("data-digesting"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-digesting"] });
    return () => mo.disconnect();
  }, []);

  const camera = useMemo(() => ({ position: [0, 4.7, 10.8] as [number, number, number], fov: 42 }), []);

  if (!capable) return null;

  return (
    <div className="cs-cosmos3d" aria-hidden="true">
      <Canvas frameloop={digesting ? "always" : "never"} dpr={[1, 1.5]} camera={camera} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={["#05030f"]} />
        <CameraSetup />
        <Stars radius={70} depth={45} count={2200} factor={3.2} saturation={0} fade speed={0.4} />
        <Nebula />
        <System />
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
