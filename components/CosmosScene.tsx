"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// The heavy 3D solar system (three.js + R3F + postprocessing). Kept in its OWN
// module so it can be code-split: CosmosCanvas dynamic-imports it (ssr:false)
// only once a digest actually begins, so none of three.js ships in the initial
// page bundle (keeps the Lighthouse script budget green). See CosmosCanvas.tsx.

// The eight worlds, inner to outer, with distinct sizes and colours so the whole
// system reads in full - little rocky inners, the gas giants, ringed Saturn, the
// icy outers. r = orbit radius, spin = self-rotation, phase = start angle so they
// are spread around the sun the instant the system reveals.
const PLANETS = [
  { r: 2.0, size: 0.11, speed: 0.62, color: "#caa06a", ring: false, spin: 0.5, phase: 0.6, kind: "mercury" },
  { r: 2.7, size: 0.18, speed: 0.47, color: "#e6c079", ring: false, spin: 0.4, phase: 2.4, kind: "venus" },
  { r: 3.5, size: 0.19, speed: 0.4, color: "#6fb0e8", ring: false, spin: 0.6, phase: 4.1, kind: "earth" },
  { r: 4.3, size: 0.14, speed: 0.33, color: "#d0714a", ring: false, spin: 0.55, phase: 5.5, kind: "mars" },
  { r: 5.6, size: 0.42, speed: 0.22, color: "#e6c890", ring: false, spin: 0.9, phase: 1.3, kind: "jupiter" },
  { r: 7.0, size: 0.36, speed: 0.16, color: "#f0d69a", ring: true, spin: 0.8, phase: 3.2, kind: "saturn" },
  { r: 8.2, size: 0.27, speed: 0.12, color: "#a7dbe8", ring: false, spin: 0.5, phase: 5.0, kind: "uranus" },
  { r: 9.2, size: 0.26, speed: 0.09, color: "#5f7fd8", ring: false, spin: 0.5, phase: 2.0, kind: "neptune" },
] as const;

// Paint a believable equirectangular planet skin on a 2D canvas - latitude bands
// for the gas giants, mottled maria/continents for the rocky worlds, ice caps -
// so each sphere reads with real surface detail and gradient instead of a flat
// fill. Cheap (drawn once, 512x256) and lightweight enough for a background scene.
function makePlanetTexture(kind: string): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const W = 512;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return null;
  const rnd = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  };
  const bands = (stops: [number, string][], jitter: number, seed: number) => {
    const r = rnd(seed);
    for (let y = 0; y < H; y++) {
      const t = y / H;
      let col = stops[0][1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i][0] && t <= stops[i + 1][0]) {
          col = i % 2 === 0 ? stops[i][1] : stops[i + 1][1];
          break;
        }
      }
      g.fillStyle = col;
      g.fillRect(0, y, W, 1);
      if (jitter > 0) {
        g.globalAlpha = 0.08 + r() * 0.12;
        g.fillStyle = r() > 0.5 ? "#ffffff" : "#000000";
        const bw = 30 + r() * 120;
        g.fillRect(r() * W - bw, y, bw, 1);
        g.globalAlpha = 1;
      }
    }
  };
  const blobs = (base: string, cols: string[], n: number, seed: number, rmin: number, rmax: number) => {
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);
    const r = rnd(seed);
    for (let i = 0; i < n; i++) {
      g.globalAlpha = 0.35 + r() * 0.4;
      g.fillStyle = cols[Math.floor(r() * cols.length)];
      const x = r() * W;
      const y = 30 + r() * (H - 60);
      const rad = rmin + r() * (rmax - rmin);
      g.beginPath();
      g.ellipse(x, y, rad, rad * (0.6 + r() * 0.5), r() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  };
  const caps = (col: string, h: number) => {
    g.fillStyle = col;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.ellipse(W / 2, 0, W, h, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(W / 2, H, W, h, 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
  };
  switch (kind) {
    case "jupiter":
      bands(
        [
          [0, "#c9a877"], [0.12, "#e6d3ac"], [0.24, "#b07f52"], [0.36, "#eaddba"],
          [0.5, "#a86a44"], [0.62, "#e2caa0"], [0.74, "#b98a5c"], [0.86, "#efe2c4"], [1, "#c19a6b"],
        ],
        1,
        11,
      );
      g.globalAlpha = 0.8;
      g.fillStyle = "#b1503a";
      g.beginPath();
      g.ellipse(W * 0.66, H * 0.62, 46, 26, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      break;
    case "saturn":
      bands(
        [
          [0, "#e3d2a2"], [0.15, "#f1e6c4"], [0.32, "#d8c090"], [0.5, "#efe3bd"],
          [0.68, "#dcc79a"], [0.85, "#f2e8c8"], [1, "#e0cd9e"],
        ],
        0.6,
        23,
      );
      break;
    case "uranus":
      bands([[0, "#9fd3e2"], [0.5, "#b6e0ec"], [1, "#a6d8e6"]], 0.3, 31);
      break;
    case "neptune":
      bands([[0, "#3f5fc8"], [0.4, "#5878da"], [0.6, "#3552b8"], [1, "#4f70d4"]], 0.4, 37);
      g.globalAlpha = 0.7;
      g.fillStyle = "#20306e";
      g.beginPath();
      g.ellipse(W * 0.4, H * 0.42, 34, 20, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      break;
    case "earth":
      blobs("#20518c", ["#2f7a3e", "#3c8a48", "#7a6a42", "#2a6b46"], 26, 5, 20, 60);
      caps("#eef4f6", 20);
      break;
    case "mars":
      blobs("#c1502e", ["#9a3b1f", "#a8492a", "#7f2f18", "#d0663f"], 22, 9, 16, 50);
      caps("#f1e6df", 12);
      break;
    case "venus":
      bands([[0, "#e7cf8f"], [0.3, "#f2e2b0"], [0.6, "#dcc079"], [1, "#efdca0"]], 0.7, 13);
      break;
    default: // mercury - gray, cratered
      blobs("#9a8b7c", ["#7d7064", "#b0a396", "#6b5f54", "#8a7d70"], 34, 3, 8, 34);
      break;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function CameraSetup() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// A faint ring of asteroids between Mars and Jupiter, built once as a point
// cloud in the XZ plane and spun slowly - it fills the gap so the layout reads
// as a real system, not lonely dots.
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
    const gm = new THREE.BufferGeometry();
    gm.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return gm;
  }, []);
  useEffect(() => () => geom.dispose(), [geom]);
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
  const textures = useMemo(() => PLANETS.map((p) => makePlanetTexture(p.kind)), []);
  useEffect(() => () => textures.forEach((t) => t?.dispose()), [textures]);
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
      <mesh>
        <sphereGeometry args={[1.1, 48, 48]} />
        <meshBasicMaterial color="#FFCF6B" toneMapped={false} />
      </mesh>
      <mesh ref={sun}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#ffb020" transparent opacity={0.28} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2.6} distance={44} color="#ffd873" />
      <ambientLight intensity={0.42} color="#9fb0d0" />
      {PLANETS.map((p, i) => (
        <group
          key={i}
          rotation-y={p.phase}
          ref={(el) => {
            orbits.current[i] = el;
          }}
        >
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
              <sphereGeometry args={[p.size, 48, 48]} />
              <meshStandardMaterial
                map={textures[i] ?? undefined}
                color={textures[i] ? "#ffffff" : p.color}
                roughness={0.82}
                metalness={0.05}
                emissive={p.color}
                emissiveIntensity={0.05}
              />
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

// The scene itself. `digesting` drives the render loop: always while a digest is
// on, never otherwise (idle). Mounted by CosmosCanvas only after the first
// digest, so this whole three.js module loads lazily.
export default function CosmosScene({ digesting }: { digesting: boolean }) {
  // Pulled back + raised so the whole Neptune-radius system (r=9.2) sits inside
  // the frame, viewed obliquely from above the orbit plane.
  const camera = useMemo(() => ({ position: [0, 6.4, 16.5] as [number, number, number], fov: 40 }), []);

  // R3F measures its drawing buffer at mount; nudge a re-measure when a digest
  // reveals it so the buffer fills the viewport rather than the 300x150 default.
  useEffect(() => {
    if (!digesting) return;
    const raf = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [digesting]);

  return (
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
  );
}
