"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, Sparkles, Trail, useGLTF } from "@react-three/drei";
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
    // The digest is a calm, slow draw now - no mid-devour pixie burst (that read
    // as a flash). Lumi just swells a touch as she feeds (below).
    const dig = getDigest();
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

// Lumi's travelling pixie dust. Pulled out during a digest so the wide gold
// bokeh does not clutter the cosmic reveal - the permanent CosmosBackdrop (a DOM
// layer behind the page) carries the space beat now, so the canvas stays clean.
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

// The black hole Lumi holds while she digests the page (FR-CHAR-032). A dark
// event-horizon core reads as a true hole against the gold-lit scene, ringed by
// two hot accretion bands that bloom and swirl, with gold motes spiralling in.
// It grows from nothing to full as getDigest() ramps and sits at her hand, so
// the page visibly pours into something, not just drifts. toneMapped=false keeps
// the core black and the rings hot under the AGX grade.
function DigestHole() {
  const grp = useRef<THREE.Group>(null);
  const plasma = useRef<THREE.Group>(null);
  const sRef = useRef(0);
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
    // Rides her raised fingertip (bone-tracked from GltfLumi), a touch in front.
    g.position.set(w.x, w.y, w.z + 0.18);
    // Stay small: ease a compact bead in and hold it - a marble on her fingertip.
    const eased = d * d * (3 - 2 * d);
    const target = 0.12 + eased * 0.05;
    sRef.current += (target - sRef.current) * Math.min(1, delta * 6);
    g.scale.setScalar(sRef.current);
    // The plasma streaks whirl around the hole - the "energy running around it".
    if (plasma.current) plasma.current.rotation.z += delta * 2.2;
  });
  return (
    <group ref={grp} visible={false}>
      {/* the dark singularity */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#050300" toneMapped={false} />
      </mesh>
      {/* the accretion disc, tilted so it reads as a disc seen at an angle (like a
          real black hole), not a flat ring. Additive so it glows under the bloom. */}
      <group rotation-x={1.2}>
        <mesh>
          <ringGeometry args={[0.46, 0.8, 96]} />
          <meshBasicMaterial color="#fff0c0" toneMapped={false} transparent opacity={0.85} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.8, 1.15, 96]} />
          <meshBasicMaterial color="#F4BA17" toneMapped={false} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh>
          <ringGeometry args={[1.15, 1.6, 96]} />
          <meshBasicMaterial color="#c8890a" toneMapped={false} transparent opacity={0.24} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* bright plasma streaks (arcs) that whirl round as this group spins */}
        <group ref={plasma}>
          <mesh>
            <ringGeometry args={[0.5, 0.74, 64, 1, 0, 2.1]} />
            <meshBasicMaterial color="#fffbe8" toneMapped={false} transparent opacity={0.9} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh rotation-z={2.5}>
            <ringGeometry args={[0.8, 1.02, 64, 1, 0, 1.6]} />
            <meshBasicMaterial color="#ffe6a0" toneMapped={false} transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh rotation-z={4.4}>
            <ringGeometry args={[1.04, 1.34, 64, 1, 0, 1.2]} />
            <meshBasicMaterial color="#ffd873" toneMapped={false} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      </group>
      {/* bright photon ring hugging the event horizon (faces camera) */}
      <mesh>
        <ringGeometry args={[0.42, 0.49, 80]} />
        <meshBasicMaterial color="#fff6d8" toneMapped={false} transparent opacity={0.85} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* soft bloom halo */}
      <mesh>
        <sphereGeometry args={[0.95, 24, 24]} />
        <meshBasicMaterial color="#F4BA17" toneMapped={false} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Sparkles count={18} scale={[2.2, 0.7, 2.2]} size={2.4} speed={1.3} color="#FFD873" opacity={0.85} />
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
    // Fade with the hero, and pull the wire floor fully out EARLY in a digest so
    // the reveal behind Lumi is clean cosmos, not a tron grid. Read the digest
    // from the --cs-digest custom property the DOM BlackHole writes each frame
    // (an inline-style read, guaranteed shared) as well as the scene store, since
    // the store can be a separate instance across the lazily-loaded scene chunk.
    let dig = getDigest();
    if (typeof document !== "undefined") {
      const v = parseFloat(document.documentElement.style.getPropertyValue("--cs-digest"));
      if (!Number.isNaN(v)) dig = Math.max(dig, v);
    }
    const fade = Math.max(0, 1 - getScrollProgress() * 1.15) * Math.max(0, 1 - dig * 4);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // FR-PERF-012: Pause R3F render loop when document hidden
    const onVisibility = () => {
      setVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", onVisibility);

    // Initial check
    setVisible(!document.hidden);

    // FR-PERF-012: Pause R3F render loop when canvas container leaves viewport
    const el = containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (el) {
      observer = new IntersectionObserver(([entry]) => {
        setVisible(entry.isIntersecting && !document.hidden);
      }, { threshold: 0 });
      observer.observe(el);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  const active = visible;

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
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        className="cs-canvas"
        dpr={[1, 2]}
        flat
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        tabIndex={-1}
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
      <WishGrid />
      <BurstField />
      <DigestHole />
      {/* The comet trail tracks an anchor inside the rig but renders at scene
          level, so the rig's scale never distorts the ribbon. */}
      <Trail
        target={trailAnchor as React.MutableRefObject<THREE.Object3D>}
        width={isLight ? 0.16 : 0.22}
        length={2}
        decay={3.6}
        color={isLight ? "#B5780A" : "#F4BA17"}
        // Cube attenuation collapses the tail quickly, so it reads as a short
        // sparkle hugging Lumi rather than a long ribbon drawn across the copy.
        attenuation={(w) => w * w * w}
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
  </div>
  );
}
