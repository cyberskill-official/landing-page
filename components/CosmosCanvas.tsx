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

// The eight worlds, inner to outer, with distinct sizes and colours so the whole
// system reads in full - little rocky inners, the gas giants, ringed Saturn, the
// icy outers. r = orbit radius, spin = self-rotation.
// phase = starting angle so the worlds are spread around the sun the instant the
// system is revealed, not lined up on one side.
const PLANETS = [
  { r: 2.0, size: 0.11, speed: 0.62, color: "#caa06a", ring: false, spin: 0.5, phase: 0.6 }, // Mercury
  { r: 2.7, size: 0.18, speed: 0.47, color: "#e6c079", ring: false, spin: 0.4, phase: 2.4 }, // Venus
  { r: 3.5, size: 0.19, speed: 0.4, color: "#6fb0e8", ring: false, spin: 0.6, phase: 4.1 }, // Earth
  { r: 4.3, size: 0.14, speed: 0.33, color: "#d0714a", ring: false, spin: 0.55, phase: 5.5 }, // Mars
  { r: 5.6, size: 0.42, speed: 0.22, color: "#e6c890", ring: false, spin: 0.9, phase: 1.3 }, // Jupiter
  { r: 7.0, size: 0.36, speed: 0.16, color: "#f0d69a", ring: true, spin: 0.8, phase: 3.2 }, // Saturn
  { r: 8.2, size: 0.27, speed: 0.12, color: "#a7dbe8", ring: false, spin: 0.5, phase: 5.0 }, // Uranus
  { r: 9.2, size: 0.26, speed: 0.09, color: "#5f7fd8", ring: false, spin: 0.5, phase: 2.0 }, // Neptune
] as const;

function CameraSetup() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// A faint ring of asteroids between Mars and Jupiter, built once as a point
// cloud in the XZ plane and spun slowly - it fills the gap so the layout reads
// as a real system, not five lonely dots.
function AsteroidBelt() {
  const belt = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4.7 + Math.random() * 0.55;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, delta) => {
    if (belt.current) belt.current.rotation.y += delta * 0.05;
  });
  return (
    <points ref={belt} geometry={geom}>
      <pointsMaterial color="#c9b184" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function System() {
  const grp = useRef<THREE.Group>(null);
  const orbits = useRef<Array<THREE.Group | null>>([]);
  const planets = useRef<Array<THREE.Mesh | null>>([]);
  const sun = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    for (let i = 0; i < PLANETS.length; i++) {
      const o = orbits.current[i];
      if (o) o.rotation.y += delta * PLANETS[i].speed;
      const pm = planets.current[i];
      if (pm) pm.rotation.y += delta * PLANETS[i].spin;
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
          rotation-y={p.phase}
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
            <mesh
              ref={(el) => {
                planets.current[i] = el;
              }}
            >
              <sphereGeometry args={[p.size, 32, 32]} />
              <meshStandardMaterial color={p.color} roughness={0.6} metalness={0.15} emissive={p.color} emissiveIntensity={0.14} />
            </mesh>
            {p.ring && (
              <mesh rotation-x={-Math.PI / 2.3} rotation-z={0.2}>
                <ringGeometry args={[p.size * 1.5, p.size * 2.5, 96]} />
                <meshBasicMaterial color="#ffe6a0" transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            )}
          </group>
        </group>
      ))}
      <AsteroidBelt />
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

  // R3F sizes its canvas from a resize measure taken at mount; because this
  // canvas mounts hidden/transparent it can settle at the 300x150 default. When a
  // digest reveals it, nudge R3F to re-measure so the buffer fills the viewport.
  useEffect(() => {
    if (!digesting) return;
    const raf = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [digesting]);

  // Pulled back + raised so the whole Neptune-radius system (r=9.2) sits inside
  // the frame, viewed obliquely from above the orbit plane.
  const camera = useMemo(() => ({ position: [0, 6.4, 16.5] as [number, number, number], fov: 40 }), []);

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
