"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, Sparkles, Stars, Trail, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
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
  getAttend,
  getDigest,
  getLumiExcite,
  getLumiHand,
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
// Default to the committed model so the hero works with zero env config; an env
// var (a CDN URL, say) still overrides it. NEXT_PUBLIC_* is inlined at build time,
// which is awkward in the Docker/CI build, so the model no longer depends on it.
const LUMI_GLB = process.env.NEXT_PUBLIC_LUMI_GLB || "/models/lumi_anim.glb";
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
  const digPrev = useRef(0);
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
    const idleBob = chatOpen ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
    const prevX = pos.current.x;
    pos.current.x += (world.x + bow * 0.4 - pos.current.x) * k;
    pos.current.y += (world.y + idleBob - pos.current.y) * k;
    g.position.set(pos.current.x, pos.current.y, 0);
    setLumiWorld({ x: pos.current.x, y: pos.current.y, z: 0 });

    // Bank gently into horizontal motion like a tiny aircraft (kept subtle so
    // the skeletal idle reads clearly and Lumi never tips far off vertical).
    const velX = (pos.current.x - prevX) / Math.max(delta, 1e-4);
    g.rotation.z += (THREE.MathUtils.clamp(-velX * 0.08, -0.26, 0.26) - g.rotation.z) * Math.min(1, delta * 3);

    // Present the act (FR-SCENE-014): while an act is held at screen centre
    // (attend high), turn Lumi a touch toward the page - inward from whichever
    // gutter it is flying - and give a small forward nod, so it reads as the
    // genie showing you the scene, then relax to neutral between acts. Amplitude
    // is deliberately tiny (a lean, ~11deg, never a turn-around) so the base
    // facing and the skeletal idle always stay clear on either side. Zeroed
    // while the chat holds Lumi at its cloud.
    const attend = chatOpen ? 0 : getAttend();
    const inward = pos.current.x >= 0 ? -1 : 1;
    const ky = Math.min(1, delta * 2.2);
    // Ambient awareness (FR-CHAR-034): when Lumi is not presenting an act
    // (attend low) and not held by the chat, she turns a touch toward the
    // pointer, so she reads as noticing you. The presenting lean takes over as
    // attend rises (the pointer glance is weighted by 1 - attend), so the two
    // never fight. Amplitudes stay small - a glance, not a spin - and touch
    // devices leave the pointer at centre, so nothing moves there.
    // Always turn toward the cursor, even mid-flight (FR-CHAR-034): a firm yaw
    // and pitch that track the pointer so Lumi keeps eye contact wherever she
    // is, with the act-presenting lean layered on top when an act is centred.
    // Amplitude stays under a quarter-turn so she never shows her back.
    const p = getPointerNorm();
    // While digesting she presents the hole, so square her to the viewer (yaw and
    // pitch ease to 0) instead of tracking the pointer or leaning into an act.
    const presenting = getDigest() > 0.05;
    const trackYaw = chatOpen || presenting ? 0 : p.x * 0.55;
    const trackPitch = chatOpen || presenting ? 0 : -p.y * 0.28;
    const targetYaw = presenting ? 0 : trackYaw + inward * 0.15 * attend;
    const targetPitch = presenting ? 0 : trackPitch + 0.06 * attend;
    g.rotation.y += (targetYaw - g.rotation.y) * ky;
    g.rotation.x += (targetPitch - g.rotation.x) * ky;

    // Hover excitement puffs Lumi and pops a burst on the rising edge; the
    // black-hole digest swells the whole mascot as it feeds (FR-CHAR-032).
    const excite = getLumiExcite();
    if (excite !== excitePrev.current) {
      excitePrev.current = excite;
      if (excite) requestBurst(0.8);
    }
    const dig = getDigest();
    if (dig > 0.5 && digPrev.current <= 0.5) requestBurst(1.6);
    digPrev.current = dig;
    // A shallow breathing pulse (~1.5%) keeps Lumi feeling alive even when she
    // hovers in place between legs, layered on the Float bob. It rides only the
    // visible scale, not scaleRef, so the projected hotspot radius stays steady.
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.015;
    scaleRef.current += (anchor.scale * (excite ? 1.12 : 1) * (1 + dig * 0.1) - scaleRef.current) * k;
    g.scale.setScalar(scaleRef.current * breath);

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

// A deep starfield uncovered as the page is digested (FR-CHAR-032): the DOM
// fades out to --cs-digest, revealing this cosmos - a dark universe of shining
// stars behind Lumi and her black hole, the premium space beat. Only computed
// while a digest is in progress; hidden (and free) otherwise.
// Lumi's travelling pixie dust. Pulled out during a digest so the wide gold
// bokeh does not clutter the cosmic reveal - the hole's own sparkle and the
// solar system carry the sparkle then.
function AmbientMotes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const show = getDigest() <= 0.15;
    if (g.visible !== show) g.visible = show;
  });
  return (
    <group ref={ref}>
      <Sparkles count={34} scale={[2.2, 1.9, 1.5]} size={3.2} speed={0.4} color="#F4BA17" opacity={0.75} />
    </group>
  );
}

function CosmicStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const show = getDigest() > 0.01;
    if (g.visible !== show) g.visible = show;
  });
  return (
    <group ref={ref} visible={false}>
      <Stars radius={90} depth={50} count={1800} factor={3.6} saturation={0.15} fade speed={0.5} />
    </group>
  );
}

// An animated solar system revealed with the digest (FR-CHAR-032): a glowing
// gold sun with planets orbiting on faint rings, deep behind Lumi. It scales and
// fades in with getDigest, so when the page dissolves the visitor is left with
// Lumi holding her black hole against a living cosmos. Only ticks while a digest
// is in progress; hidden (and free) otherwise.
const SOLAR = [
  { r: 2.0, size: 0.16, speed: 0.55, color: "#ffe6a0", tilt: -0.3, ring: false },
  { r: 2.9, size: 0.3, speed: 0.36, color: "#f4ba17", tilt: -0.44, ring: true },
  { r: 3.9, size: 0.2, speed: 0.27, color: "#d98a1f", tilt: -0.22, ring: false },
  { r: 5.0, size: 0.24, speed: 0.2, color: "#9fc7ff", tilt: -0.5, ring: false },
  { r: 6.2, size: 0.34, speed: 0.14, color: "#fff2d0", tilt: -0.36, ring: false },
] as const;

function SolarSystem() {
  const grp = useRef<THREE.Group>(null);
  const orbits = useRef<Array<THREE.Group | null>>([]);
  const sun = useRef<THREE.Mesh>(null);
  const sRef = useRef(0);
  useFrame((state, delta) => {
    const g = grp.current;
    if (!g) return;
    const d = getDigest();
    const show = d > 0.01;
    if (g.visible !== show) g.visible = show;
    if (!show) {
      sRef.current = 0;
      return;
    }
    const eased = d * d * (3 - 2 * d);
    sRef.current += (0.6 + eased * 0.5 - sRef.current) * Math.min(1, delta * 4);
    g.scale.setScalar(sRef.current);
    for (let i = 0; i < SOLAR.length; i++) {
      const o = orbits.current[i];
      if (o) o.rotation.y += delta * SOLAR[i].speed;
    }
    g.rotation.z += delta * 0.012;
    // gentle corona breathe on the sun
    if (sun.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
      sun.current.scale.setScalar(s);
    }
  });
  return (
    <group ref={grp} position={[0, 0.3, -9]} visible={false}>
      {/* nebula clouds: big, faint, additive - colour and depth in the void */}
      <mesh position={[-6.5, 2.2, -6]}>
        <sphereGeometry args={[7, 24, 24]} />
        <meshBasicMaterial color="#3a2a6b" transparent opacity={0.1} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[7, -3, -8]}>
        <sphereGeometry args={[8, 24, 24]} />
        <meshBasicMaterial color="#6b3d1f" transparent opacity={0.09} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* sun core + soft corona */}
      <mesh>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial color="#FFCF6B" toneMapped={false} />
      </mesh>
      <mesh ref={sun}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FFB020" transparent opacity={0.3} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#ffd873" intensity={2.4} distance={32} />
      {SOLAR.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            orbits.current[i] = el;
          }}
          rotation-x={p.tilt}
        >
          <mesh rotation-x={Math.PI / 2}>
            <ringGeometry args={[p.r - 0.014, p.r + 0.014, 128]} />
            <meshBasicMaterial color="#f4ba17" transparent opacity={0.22} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <group position={[p.r, 0, 0]}>
            <mesh>
              <sphereGeometry args={[p.size, 28, 28]} />
              <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} metalness={0.5} roughness={0.4} />
            </mesh>
            {p.ring && (
              <mesh rotation-x={Math.PI / 2.3} rotation-z={0.3}>
                <ringGeometry args={[p.size * 1.5, p.size * 2.2, 48]} />
                <meshBasicMaterial color="#ffe6a0" transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            )}
          </group>
        </group>
      ))}
    </group>
  );
}

// The black hole Lumi holds while she digests the page (FR-CHAR-032). A dark
// event-horizon core reads as a true hole against the gold-lit scene, ringed by
// two hot accretion bands that bloom and swirl, with gold motes spiralling in.
// It grows from nothing to full as getDigest() ramps and sits at her hand, so
// the page visibly pours into something, not just drifts. toneMapped=false keeps
// the core black and the rings hot under the AGX grade.
function DigestHole() {
  const grp = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const sRef = useRef(0);
  const camera = useThree((s) => s.camera);
  useFrame((_, delta) => {
    const g = grp.current;
    if (!g) return;
    const d = getDigest();
    if (d <= 0.002) {
      if (g.visible) g.visible = false;
      sRef.current = 0;
      return;
    }
    g.visible = true;
    const w = getLumiHand();
    // Sits exactly in her hand (bone-tracked from GltfLumi), a touch in front of
    // the palm - not her belly or feet.
    g.position.set(w.x, w.y, w.z + 0.18);
    // Stay small: ease a compact bead in and hold it - a marble she cups, never
    // a growing blob. Eased so it does not pop in.
    const eased = d * d * (3 - 2 * d);
    const target = 0.12 + eased * 0.05;
    sRef.current += (target - sRef.current) * Math.min(1, delta * 6);
    g.scale.setScalar(sRef.current);
    // Billboard the accretion so it always faces the camera - a round glowing
    // rim around a dark core (a black hole), never an edge-on Saturn disc. A
    // slow spin about the view axis gives it life without breaking the circle.
    if (rings.current) {
      rings.current.quaternion.copy(camera.quaternion);
      rings.current.rotateZ((performance.now() / 1000) * 0.6);
    }
  });
  return (
    <group ref={grp} visible={false}>
      {/* the dark singularity */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#050300" toneMapped={false} />
      </mesh>
      {/* camera-facing accretion glow: concentric rings, brightest at the rim */}
      <group ref={rings}>
        <mesh>
          <ringGeometry args={[0.52, 0.72, 72]} />
          <meshBasicMaterial color="#FFCF6B" toneMapped={false} transparent opacity={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.72, 0.9, 72]} />
          <meshBasicMaterial color="#F4BA17" toneMapped={false} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.9, 1.25, 72]} />
          <meshBasicMaterial color="#F4BA17" toneMapped={false} transparent opacity={0.13} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Sparkles count={12} scale={[1.3, 1.3, 0.5]} size={2.6} speed={0.6} color="#FFD873" opacity={0.8} />
    </group>
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
    // Fade with the hero, and pull the wire floor fully out during a digest so
    // the reveal behind Lumi is clean cosmos, not a tron grid.
    const fade = Math.max(0, 1 - getScrollProgress() * 1.15) * (1 - getDigest());
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
      dpr={[1, 2]}
      flat
      camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} color="#fff4d6" />
      <pointLight position={[-4, -2, 1]} intensity={0.5} color="#F4BA17" distance={14} />
      {/* Self-contained IBL so the commissioned Lumi's metallic-gold PBR has
          something to reflect - a metalness=1 material renders black without an
          environment. Baked once (frames={1}), inline Lightformers so there is no
          external HDR fetch. The procedural placeholder does not need this. */}
      <Environment resolution={512} frames={1}>
        {/* Warm soft key */}
        <Lightformer form="rect" intensity={4.0} color="#fff2d0" position={[0, 3, 6]} scale={[12, 12, 1]} />
        {/* Ochre side rim (brand) */}
        <Lightformer form="rect" intensity={2.8} color="#F4BA17" position={[-6, 1, 3]} scale={[6, 10, 1]} />
        {/* Cool fill for a premium warm/cool contrast (kept low so the gold stays rich) */}
        <Lightformer form="rect" intensity={0.85} color="#bcd0ff" position={[6, 2, 2]} scale={[5, 9, 1]} />
        {/* Warm underglow */}
        <Lightformer form="ring" intensity={2.0} color="#ffce6b" position={[0, -3, 5]} scale={[8, 8, 1]} />
        {/* Small bright glint for a sharp specular sparkle */}
        <Lightformer form="rect" intensity={7.0} color="#ffffff" position={[2.5, 4, 4]} scale={[1.4, 1.4, 1]} />
      </Environment>
      <CameraRig />
      <CosmicStars />
      <SolarSystem />
      <WishGrid />
      <BurstField />
      <DigestHole />
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
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.35}>
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
            page, so text stays clean outside Lumi's flight path. Clears during
            a digest (AmbientMotes) so the cosmic reveal reads clean. */}
        <AmbientMotes />
      </LumiRig>
      {/* Premium post: bloom on the gold highlights + AgX filmic tone map (matches
          the Blender look) + a subtle vignette; SMAA replaces MSAA (antialias off,
          flat renderer so the ToneMapping effect owns the transform). */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom mipmapBlur luminanceThreshold={0.72} luminanceSmoothing={0.14} intensity={0.62} radius={0.62} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette eskil={false} offset={0.28} darkness={0.55} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
