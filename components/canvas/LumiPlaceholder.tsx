"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGenieStore } from "@/lib/genie/store";
import { getScrollProgress } from "@/lib/scroll/progress";
import { resolveSceneState } from "@/lib/scene/progressMap";

// Track the active light/dark theme (data-theme on <html>, set by ThemeToggle)
// so Lumi can stay legible in both. The figure is solid gold (reads on either
// background); only the surrounding fresnel aura switches blend mode so the halo
// does not wash out on a pale background.
function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const read = () =>
      setMode(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

// PLACEHOLDER for the commissioned golden-genie GLB (FR-CHAR-021), now shaped
// after the CyberSkill logo: a teardrop golden hood with a dark face void, a
// collar, a tapering torso, and a curling genie wisp at the base - all in ochre,
// wrapped in a fresnel glow. It keeps the real model's behaviours: gaze toward
// the pointer (the hooded head turns), chat-state-reactive idle/think/speak
// energy, an appearance dissolve, and scroll-tied choreography (Lumi turns,
// drifts, and brightens through the story).

// Custom GLSL aura: edge-bright golden glow with a gentle animated shimmer.
// Standard built-ins only (no noise functions), so it compiles everywhere.
const AURA_VERT = `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - worldPos.xyz);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AURA_FRAG = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPulse;
  uniform float uReveal;
  uniform vec3 uCore;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
    float shimmer = 0.5 + 0.5 * sin(vPos.y * 5.0 + uTime * 2.0) * sin(vPos.x * 5.0 - uTime * 1.5);
    float reveal = smoothstep(vPos.y - 0.6, vPos.y + 0.6, uReveal * 2.6 - 1.3 + shimmer * 0.4);
    float glow = fres * (0.7 + 0.3 * shimmer);
    glow *= (0.75 + uProgress * 0.6 + uPulse * 0.6);
    glow *= mix(reveal, 1.0, uReveal);
    vec3 col = mix(uCore, uRim, fres);
    gl_FragColor = vec4(col, clamp(glow, 0.0, 1.0));
  }
`;

// Profile (radius, height) for the hooded head - a teardrop: a sharp point at
// the top, swelling to a bulb, narrowing to the neck. Revolved around Y.
const HEAD_PROFILE: [number, number][] = [
  [0.30, 0.0],
  [0.60, 0.16],
  [0.72, 0.62],
  [0.66, 1.0],
  [0.50, 1.28],
  [0.30, 1.62],
  [0.14, 1.9],
  [0.02, 2.08],
];

// Profile for the torso: broad shoulders (the crossed-arm mass in the logo)
// tapering to a narrow base where the genie wisp begins.
const TORSO_PROFILE: [number, number][] = [
  [0.30, -0.02],
  [0.62, -0.2],
  [0.82, -0.5],
  [0.78, -0.85],
  [0.6, -1.2],
  [0.4, -1.5],
  [0.2, -1.78],
  [0.12, -1.95],
];

function toPoints(profile: [number, number][]): THREE.Vector2[] {
  return profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y));
}

export function LumiPlaceholder() {
  const group = useRef<THREE.Group>(null);
  const figure = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const wisps = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const prog = useRef(0);
  const reveal = useRef(0);
  const chat = useRef(0);
  const prevOpen = useRef(false);
  const status = useGenieStore((s) => s.status);
  const open = useGenieStore((s) => s.open);
  const isLight = useThemeMode() === "light";

  const headPoints = useMemo(() => toPoints(HEAD_PROFILE), []);
  const torsoPoints = useMemo(() => toPoints(TORSO_PROFILE), []);

  // The curling genie tail at the base - a hook that drops then curls up and to
  // the side, like the logo's wisp.
  const tailCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.9, 0),
        new THREE.Vector3(0.04, -2.25, 0.16),
        new THREE.Vector3(-0.06, -2.6, 0.12),
        new THREE.Vector3(0.34, -2.82, 0),
        new THREE.Vector3(0.66, -2.62, -0.12),
        new THREE.Vector3(0.62, -2.3, -0.16),
      ]),
    [],
  );

  // One shared aura material; uniforms are mutated per frame. Rebuilt when the
  // theme flips: additive + bright gold on dark, normal-blended + deeper gold on
  // light so the halo reads against a pale background instead of vanishing.
  const aura = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: AURA_VERT,
        fragmentShader: AURA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPulse: { value: 0 },
          uReveal: { value: 0 },
          uCore: { value: new THREE.Color(isLight ? "#B5780A" : "#F4BA17") },
          uRim: { value: new THREE.Color(isLight ? "#7A5206" : "#FFE7A6") },
        },
      }),
    [isLight],
  );

  useFrame((state, delta) => {
    const g = group.current;
    const fig = figure.current;
    const hd = head.current;
    if (!g || !fig || !hd) return;
    const t = state.clock.elapsedTime;
    const k = Math.min(1, delta * 3);
    const speed = status === "speaking" ? 3 : status === "thinking" ? 1.7 : 0.8;
    const pulseTarget = status === "speaking" ? 1 : status === "thinking" ? 0.6 : 0.25;

    // Gaze: the hooded head turns toward the pointer.
    const targetY = state.pointer.x * 0.5;
    const targetX = -state.pointer.y * 0.3;
    hd.rotation.y += (targetY - hd.rotation.y) * k;
    hd.rotation.x += (targetX - hd.rotation.x) * k;

    // Chat reactivity (FR-CHAR-023): ease toward 1 while the chat is open. When
    // the panel opens or closes, dip the reveal so the dissolve shimmer replays -
    // Lumi disperses and reforms in greeting.
    if (open !== prevOpen.current) {
      reveal.current = Math.min(reveal.current, 0.5);
      prevOpen.current = open;
    }
    chat.current += ((open ? 1 : 0) - chat.current) * Math.min(1, delta * 3);
    const ch = chat.current;

    // Scroll choreography from the one declarative scene-progress map (FR-SCENE-007),
    // smoothly eased. Chat leans Lumi toward the viewer.
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const scene = resolveSceneState(prog.current);
    g.rotation.y = scene.model.spin;
    g.position.x = 1.3 + scene.model.driftX - ch * 0.35;
    g.position.z = scene.model.driftZ + ch * 0.6;

    // Appearance dissolve: ease reveal 0 -> 1 once, so Lumi materializes in.
    reveal.current += (1 - reveal.current) * Math.min(1, delta * 1.1);
    const rev = reveal.current;

    // Breath + status energy, scaled in by the reveal and a touch by chat lean-in.
    const breath = 1 + Math.sin(t * speed) * 0.02;
    fig.scale.setScalar(0.5 * breath * (0.55 + 0.45 * rev) * (1 + ch * 0.05));

    if (wisps.current) wisps.current.rotation.y = t * (0.4 + speed * 0.25);

    aura.uniforms.uTime.value = t;
    aura.uniforms.uProgress.value = scene.model.glow;
    aura.uniforms.uReveal.value = rev;
    aura.uniforms.uPulse.value += (Math.min(1, pulseTarget + ch * 0.5) - aura.uniforms.uPulse.value) * k;
    if (bodyMat.current) bodyMat.current.emissiveIntensity = 0.4 + scene.model.glow * 0.5 + pulseTarget * 0.3 + ch * 0.25;
    if (light.current) {
      const statusBoost = status === "speaking" ? 1.2 : status === "thinking" ? 0.6 : 0;
      light.current.intensity = scene.light.intensity + statusBoost + ch * 0.9 + Math.sin(t * speed * 2) * 0.4;
    }
  });

  const wispColor = isLight ? "#9A6606" : "#FFE7A6";

  return (
    <group ref={group} position={[1.3, 0.1, 0]}>
      <pointLight ref={light} position={[0, 0.4, 2.4]} color="#F4BA17" intensity={1.8} distance={9} />

      {/* The figure: scaled/breathed as a whole so the silhouette stays coherent. */}
      <group ref={figure} scale={0.5}>
        {/* Hooded head + face void, grouped so the gaze turns them together. */}
        <group ref={head} position={[0, 0, 0]}>
          <mesh>
            <latheGeometry args={[headPoints, 64]} />
            <meshStandardMaterial
              ref={bodyMat}
              color="#F4BA17"
              emissive="#C8890A"
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.55}
            />
          </mesh>
          {/* Dark face void nested in the lower front of the hood. */}
          <mesh position={[0, 0.62, 0.42]}>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#3A1D0E" roughness={0.6} metalness={0.1} emissive="#1c0e06" emissiveIntensity={0.2} />
          </mesh>
        </group>

        {/* Torso (broad shoulders tapering down). */}
        <mesh>
          <latheGeometry args={[torsoPoints, 64]} />
          <meshStandardMaterial color="#F4BA17" emissive="#C8890A" emissiveIntensity={0.45} roughness={0.32} metalness={0.55} />
        </mesh>

        {/* Collar ring at the neck (the logo's collar chevron, simplified). */}
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.07, 16, 48]} />
          <meshStandardMaterial color="#F4BA17" emissive="#C8890A" emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Curling genie tail/wisp. */}
        <mesh>
          <tubeGeometry args={[tailCurve, 64, 0.16, 16, false]} />
          <meshStandardMaterial color="#F4BA17" emissive="#C8890A" emissiveIntensity={0.45} roughness={0.32} metalness={0.55} />
        </mesh>

        {/* Fresnel glow aura - a tall ellipsoid shell enveloping the figure. */}
        <mesh position={[0, 0.1, 0]} scale={[1.25, 2.35, 1.25]} material={aura}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>

        {/* A couple of orbiting energy motes around the head. */}
        <group ref={wisps} position={[0, 0.6, 0]}>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.05, Math.sin(a) * 0.35, Math.sin(a) * 1.05]} scale={0.08}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={wispColor} transparent opacity={0.9} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}
