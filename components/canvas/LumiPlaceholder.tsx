"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGenieStore } from "@/lib/genie/store";
import { getScrollProgress } from "@/lib/scroll/progress";
import { resolveSceneState } from "@/lib/scene/progressMap";

// PLACEHOLDER for the commissioned golden-genie GLB (FR-CHAR-021), now a far
// richer procedural Lumi: a lit gold core, a custom-shader fresnel glow/shimmer
// aura (FR-SCENE-006), an inner nucleus, and orbiting energy wisps. It keeps the
// real model's behaviours - gaze toward the pointer, chat-state-reactive
// idle/think/speak energy, and scroll-tied choreography (Lumi turns, drifts,
// and brightens through the story).

// Custom GLSL aura: edge-bright golden glow with a gentle animated shimmer,
// additively blended so Lumi reads as luminous energy rather than a solid ball.
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
    float shimmer = 0.5 + 0.5 * sin(vPos.y * 6.0 + uTime * 2.0) * sin(vPos.x * 5.0 - uTime * 1.5);
    // Dissolve-in: a moving band of shimmer gates the alpha as uReveal rises 0->1,
    // so Lumi glows into being on appearance rather than popping in.
    float reveal = smoothstep(vPos.y - 0.6, vPos.y + 0.6, uReveal * 2.2 - 1.0 + shimmer * 0.4);
    float glow = fres * (0.7 + 0.3 * shimmer);
    glow *= (0.75 + uProgress * 0.6 + uPulse * 0.6);
    glow *= mix(reveal, 1.0, uReveal);
    vec3 col = mix(uCore, uRim, fres);
    gl_FragColor = vec4(col, clamp(glow, 0.0, 1.0));
  }
`;

export function LumiPlaceholder() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const wisps = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const prog = useRef(0);
  const reveal = useRef(0);
  const chat = useRef(0);
  const prevOpen = useRef(false);
  const status = useGenieStore((s) => s.status);
  const open = useGenieStore((s) => s.open);

  // One shared aura material; uniforms are mutated per frame.
  const aura = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: AURA_VERT,
        fragmentShader: AURA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPulse: { value: 0 },
          uReveal: { value: 0 },
          uCore: { value: new THREE.Color("#F4BA17") },
          uRim: { value: new THREE.Color("#FFE7A6") },
        },
      }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    const c = core.current;
    if (!g || !c) return;
    const t = state.clock.elapsedTime;
    const k = Math.min(1, delta * 3);
    const speed = status === "speaking" ? 3 : status === "thinking" ? 1.7 : 0.8;
    const pulseTarget = status === "speaking" ? 1 : status === "thinking" ? 0.6 : 0.25;

    // Gaze: the core watches the pointer.
    const targetY = state.pointer.x * 0.6;
    const targetX = -state.pointer.y * 0.4;
    c.rotation.y += (targetY - c.rotation.y) * k;
    c.rotation.x += (targetX - c.rotation.x) * k;

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
    // smoothly eased - no bespoke math here. Chat leans Lumi toward the viewer.
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const scene = resolveSceneState(prog.current);
    g.rotation.y = scene.model.spin;
    g.position.x = 1.35 + scene.model.driftX - ch * 0.35;
    g.position.z = scene.model.driftZ + ch * 0.6;

    // Appearance dissolve: ease reveal 0 -> 1 once, so Lumi materializes in.
    reveal.current += (1 - reveal.current) * Math.min(1, delta * 1.1);
    const rev = reveal.current;

    // Breath + status energy, scaled in by the reveal and a touch by chat lean-in.
    const breath = 1 + Math.sin(t * speed) * 0.03;
    c.scale.setScalar(breath * (0.4 + 0.6 * rev) * (1 + ch * 0.08));

    // Wisps orbit faster when Lumi is active.
    if (wisps.current) wisps.current.rotation.y = t * (0.4 + speed * 0.25);

    // Drive shader + lighting.
    aura.uniforms.uTime.value = t;
    aura.uniforms.uProgress.value = scene.model.glow;
    aura.uniforms.uReveal.value = rev;
    aura.uniforms.uPulse.value += (Math.min(1, pulseTarget + ch * 0.5) - aura.uniforms.uPulse.value) * k;
    if (coreMat.current) coreMat.current.emissiveIntensity = 0.5 + scene.model.glow * 0.5 + pulseTarget * 0.3 + ch * 0.25;
    if (light.current) {
      // Scene lighting comes from the map; chat state adds reactive energy on top.
      const statusBoost = status === "speaking" ? 1.2 : status === "thinking" ? 0.6 : 0;
      light.current.intensity = scene.light.intensity + statusBoost + ch * 0.9 + Math.sin(t * speed * 2) * 0.4;
    }
  });

  return (
    <group ref={group} position={[1.35, 0, 0]} scale={0.78}>
      <pointLight ref={light} position={[0, 0, 2.4]} color="#F4BA17" intensity={1.8} distance={9} />

      {/* Lit gold core (guaranteed to render even if the shader fails). */}
      <mesh ref={core}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#F4BA17"
          emissive="#C8890A"
          emissiveIntensity={0.6}
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>

      {/* Bright inner nucleus. */}
      <mesh scale={0.55}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFF3CF" transparent opacity={0.85} />
      </mesh>

      {/* Custom-shader fresnel glow aura (slightly larger shell). */}
      <mesh scale={1.32} material={aura}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>

      {/* Orbiting energy wisps. */}
      <group ref={wisps}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.7, Math.sin(a) * 0.5, Math.sin(a) * 1.7]} scale={0.12}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#FFE7A6" transparent opacity={0.9} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
