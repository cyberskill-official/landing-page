"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Trail, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { LumiPlaceholder, useThemeMode } from "@/components/canvas/LumiPlaceholder";
import { GltfLumi } from "@/components/canvas/GltfLumi";
import { GlbBoundary } from "@/components/canvas/GlbBoundary";
import { getPageScroll, getScrollProgress } from "@/lib/scroll/progress";
import {
  CHAT_ANCHOR,
  measureRoute,
  sampleJourney,
  viewportToWorld,
  type JourneyStop,
} from "@/lib/scene/journey";
import {
  drainBursts,
  getLumiExcite,
  getLumiWorld,
  getPointerNorm,
  requestBurst,
  setLumiScreen,
  setLumiWorld,
  setPointerNorm,
  WISH_GRANTED_EVENT,
} from "@/lib/scene/mascot";
import { useGenieStore } from "@/lib/genie/store";

// Optional commissioned GLB (FR-CHAR-022). When NEXT_PUBLIC_LUMI_GLB is set to a
// model path (e.g. /models/lumi.glb), the scene renders it instead of the
// procedural placeholder; preloading it here (SCENE-010) starts the fetch as
// soon as the scene chunk loads, and the Suspense boundary keeps it from
// blocking first paint. Unset (the default) keeps the procedural Lumi.
const LUMI_GLB = process.env.NEXT_PUBLIC_LUMI_GLB;
if (LUMI_GLB) useGLTF.preload(LUMI_GLB);

// Fixed camera contract (FR-CHAR-030): the mascot journey maps viewport
// anchors to the z=0 plane assuming the camera sits at (0,0,CAM_Z) with
// CAM_FOV. The rig only adds a small pointer parallax on top, so the mapping
// stays honest and lib/scene/journey.ts stays unit-testable.
const CAM_Z = 4;
const CAM_FOV = 45;

function CameraRig() {
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 2);
    const cam = state.camera as THREE.PerspectiveCamera;
    const p = getPointerNorm();
    cam.position.x += (p.x * 0.16 - cam.position.x) * k;
    cam.position.y += (p.y * 0.1 - cam.position.y) * k;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

// Lumi's flight rig (FR-CHAR-030): eases the whole mascot (model + pixie
// dust) along the measured page journey, banks into turns, attends the chat
// panel when it is open, pops a magic burst at each section doorway, and
// projects its screen position for the DOM hotspot that makes Lumi itself
// the chat entry.
function LumiRig({ children }: { children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null);
  const stops = useRef<JourneyStop[]>([]);
  const seg = useRef(0);
  const excitePrev = useRef(false);
  const chatPrev = useRef(false);
  const pos = useRef(new THREE.Vector3(1.4, 0.2, 0));
  const scaleRef = useRef(1);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const chatOpen = useGenieStore((s) => s.open);
  const size = useThree((s) => s.size);

  // Measure the route on mount and whenever layout changes (fonts settling,
  // the hero pin's spacer, resizes). measureRoute is a cheap pure read.
  useEffect(() => {
    const measure = () => {
      stops.current = measureRoute();
    };
    measure();
    const t1 = window.setTimeout(measure, 700);
    const t2 = window.setTimeout(measure, 2600);
    window.addEventListener("resize", measure);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(document.body);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  // "The wish is granted": LeadForm dispatches on a successful submission and
  // Lumi celebrates with a big burst.
  useEffect(() => {
    const onWish = () => requestBurst(2.2);
    window.addEventListener(WISH_GRANTED_EVENT, onWish);
    return () => window.removeEventListener(WISH_GRANTED_EVENT, onWish);
  }, []);

  useFrame((state, delta) => {
    const g = rig.current;
    if (!g) return;
    const aspect = size.width / Math.max(1, size.height);
    const k = Math.min(1, delta * 2.4);

    let anchor: { vx: number; vy: number; scale: number };
    let bow = 0;
    if (chatOpen) {
      anchor = CHAT_ANCHOR;
    } else {
      const s = sampleJourney(stops.current, getPageScroll().y);
      anchor = s;
      // Legs read as swoops, not straight lines.
      bow = Math.sin(s.t * Math.PI) * 0.35;
      if (s.seg !== seg.current) {
        seg.current = s.seg;
        requestBurst(1);
      }
    }
    if (chatOpen !== chatPrev.current) {
      chatPrev.current = chatOpen;
      requestBurst(1.4);
    }

    const world = viewportToWorld(anchor.vx, anchor.vy, CAM_Z, CAM_FOV, aspect);
    const idleBob = chatOpen ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.06;
    const prevX = pos.current.x;
    pos.current.x += (world.x + bow * 0.4 - pos.current.x) * k;
    pos.current.y += (world.y + idleBob - pos.current.y) * k;
    g.position.set(pos.current.x, pos.current.y, 0);
    setLumiWorld({ x: pos.current.x, y: pos.current.y, z: 0 });

    // Bank into horizontal motion like a tiny aircraft.
    const velX = (pos.current.x - prevX) / Math.max(delta, 1e-4);
    g.rotation.z += (THREE.MathUtils.clamp(-velX * 0.16, -0.5, 0.5) - g.rotation.z) * Math.min(1, delta * 3);

    // Hover excitement puffs Lumi and pops a burst on the rising edge.
    const excite = getLumiExcite();
    if (excite !== excitePrev.current) {
      excitePrev.current = excite;
      if (excite) requestBurst(0.8);
    }
    scaleRef.current += (anchor.scale * (excite ? 1.12 : 1) - scaleRef.current) * k;
    g.scale.setScalar(scaleRef.current);

    // Project to CSS pixels for the DOM hotspot (hidden while the chat is
    // open so the panel underneath stays clickable).
    projected.copy(pos.current).project(state.camera);
    const pxPerUnit = size.height / (2 * Math.tan((CAM_FOV * Math.PI) / 360) * CAM_Z);
    setLumiScreen({
      x: (projected.x * 0.5 + 0.5) * size.width,
      y: (-projected.y * 0.5 + 0.5) * size.height,
      // Core-sized (not aura-sized) and capped, so the button never blankets
      // nearby text even when Lumi is hero-large.
      r: Math.min(190, Math.max(34, 0.66 * scaleRef.current * pxPerUnit)),
      visible: !chatOpen,
    });
  });

  return <group ref={rig}>{children}</group>;
}

// Pooled magic bursts: gold sparks that erupt where Lumi is - at section
// doorways, on hover/click, when the chat opens, and when a wish (lead form)
// is granted. Three reusable slots, additive points, ~1s life each.
const BURST_PARTICLES = 42;
const BURST_SLOTS = 3;
const BURST_SECONDS = 0.95;

function BurstField() {
  const isLight = useThemeMode() === "light";
  const refs = useRef<Array<THREE.Points | null>>([]);
  const slots = useMemo(
    () =>
      Array.from({ length: BURST_SLOTS }, () => ({
        life: 0,
        power: 1,
        origin: new THREE.Vector3(),
        dirs: Array.from({ length: BURST_PARTICLES }, () =>
          new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
            .normalize()
            .multiplyScalar(0.55 + Math.random() * 0.95),
        ),
      })),
    [],
  );
  const geoms = useMemo(
    () =>
      slots.map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BURST_PARTICLES * 3), 3));
        return geo;
      }),
    [slots],
  );
  useEffect(() => () => geoms.forEach((g) => g.dispose()), [geoms]);

  useFrame((_, delta) => {
    for (const req of drainBursts()) {
      const slot = slots.find((s) => s.life <= 0) ?? slots[0];
      slot.life = 1;
      slot.power = req.power;
      const w = getLumiWorld();
      slot.origin.set(w.x, w.y, w.z);
    }
    slots.forEach((slot, i) => {
      const pts = refs.current[i];
      if (!pts) return;
      if (slot.life <= 0) {
        pts.visible = false;
        return;
      }
      slot.life = Math.max(0, slot.life - delta / BURST_SECONDS);
      const t = 1 - slot.life;
      const eased = 1 - Math.pow(1 - t, 3);
      const attr = geoms[i].getAttribute("position") as THREE.BufferAttribute;
      for (let p = 0; p < BURST_PARTICLES; p++) {
        const d = slot.dirs[p];
        attr.setXYZ(
          p,
          slot.origin.x + d.x * eased * slot.power,
          slot.origin.y + d.y * eased * slot.power + t * 0.18,
          slot.origin.z + d.z * eased * slot.power,
        );
      }
      attr.needsUpdate = true;
      pts.visible = true;
      const mat = pts.material as THREE.PointsMaterial;
      mat.opacity = (1 - t) * (isLight ? 1 : 0.9);
      mat.size = 0.05 + 0.06 * slot.power * (1 - t);
    });
  });

  return (
    <>
      {slots.map((_, i) => (
        <points
          key={i}
          ref={(el) => {
            // three's JSX element generic (NormalOrGLBufferAttributes) is wider
            // than THREE.Points' default; the runtime object is the same.
            refs.current[i] = el as unknown as THREE.Points | null;
          }}
          geometry={geoms[i]}
          visible={false}
        >
          <pointsMaterial
            color={isLight ? "#B5780A" : "#FFD873"}
            transparent
            opacity={0}
            size={0.08}
            sizeAttenuation
            depthWrite={false}
            blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  );
}

// A waving golden wire floor under the hero: pure geometry, no textures. It
// fades out with the hero progress so it never overlays the content sections
// (the live canvas rides above them).
function WishGrid() {
  const mesh = useRef<THREE.Mesh>(null);
  const isLight = useThemeMode() === "light";
  const geo = useMemo(() => new THREE.PlaneGeometry(26, 10, 64, 22), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const attr = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      attr.setZ(i, Math.sin(x * 0.55 + t * 0.7) * Math.cos(y * 0.7 + t * 0.5) * 0.22);
    }
    attr.needsUpdate = true;
    const fade = Math.max(0, 1 - getScrollProgress() * 1.15);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = (isLight ? 0.09 : 0.12) * fade;
    m.visible = mat.opacity > 0.004;
  });

  return (
    <mesh ref={mesh} geometry={geo} rotation-x={-Math.PI / 2.35} position={[0, -1.85, -1.2]}>
      <meshBasicMaterial
        color={isLight ? "#8A6A06" : "#F4BA17"}
        wireframe
        transparent
        opacity={0.14}
        depthWrite={false}
      />
    </mesh>
  );
}

// The single fixed full-viewport canvas that renders the whole story, so assets
// load once (research doc §B). alpha:true keeps it transparent; when the live
// scene mounts, CanvasMount raises the layer above the content (cs-canvas-live)
// so Lumi can fly the entire page as a living mascot (FR-CHAR-030) - the
// mascot-scoped pixie dust and trail keep body text clean. Imported only by
// CanvasMount, which dynamic()-loads it ssr:false on capable devices.
export function GenieScene() {
  const isLight = useThemeMode() === "light";
  const trailAnchor = useRef<THREE.Object3D>(null!);

  // Feed the normalized pointer from a WINDOW listener. r3f's own pointer
  // tracking needs its canvas to receive pointer events, but this canvas is
  // hard-inert (see .cs-canvas-layer * in globals.css) so it can never block
  // the page's interactive elements underneath.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPointerNorm({
        x: (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        y: -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      className="cs-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} color="#fff4d6" />
      <pointLight position={[-4, -2, 1]} intensity={0.5} color="#F4BA17" distance={14} />
      <CameraRig />
      <WishGrid />
      <BurstField />
      {/* The comet trail tracks an anchor inside the rig but renders at scene
          level, so the rig's scale never distorts the ribbon. */}
      <Trail
        target={trailAnchor as React.MutableRefObject<THREE.Object3D>}
        width={isLight ? 0.35 : 0.45}
        length={3.5}
        decay={3}
        color={isLight ? "#B5780A" : "#F4BA17"}
        attenuation={(w) => w * w}
      />
      <LumiRig>
        <object3D ref={trailAnchor} />
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
          <Suspense fallback={null}>
            {LUMI_GLB ? (
              <GlbBoundary fallback={<LumiPlaceholder />}>
                <GltfLumi url={LUMI_GLB} />
              </GlbBoundary>
            ) : (
              <LumiPlaceholder />
            )}
          </Suspense>
        </Float>
        {/* Pixie dust travels with the mascot instead of dusting the whole
            page, so text stays clean outside Lumi's flight path. */}
        <Sparkles count={34} scale={[2.2, 1.9, 1.5]} size={3.2} speed={0.4} color="#F4BA17" opacity={0.75} />
      </LumiRig>
    </Canvas>
  );
}
