"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGenieStore } from "@/lib/genie/store";
import { getScrollProgress } from "@/lib/scroll/progress";

// PLACEHOLDER. A procedural golden orb stands in for the commissioned
// golden-genie GLB (research doc §C). It demonstrates the behaviours the real
// model will need: gaze toward the pointer, a chat-state-reactive idle/think/
// speak animation (Zustand store), and scroll-tied choreography (the orb turns,
// drifts, and brightens as the visitor moves through the story).
export function LumiPlaceholder() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const prog = useRef(0);
  const status = useGenieStore((s) => s.status);

  useFrame((state, delta) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;
    const t = state.clock.elapsedTime;
    const k = Math.min(1, delta * 3);
    const speed = status === "speaking" ? 3 : status === "thinking" ? 1.7 : 0.8;

    // Gaze: the orb watches the pointer (lerped on the mesh itself).
    const targetY = state.pointer.x * 0.6;
    const targetX = -state.pointer.y * 0.4;
    m.rotation.y += (targetY - m.rotation.y) * k;
    m.rotation.x += (targetX - m.rotation.x) * k;

    // Scroll choreography on the parent group (smoothly eased).
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const p = prog.current;
    g.rotation.y = p * Math.PI * 1.2;
    g.position.x = 1.35 + p * 0.5;
    g.position.z = p * 0.6; // drifts gently toward the camera

    if (material.current) material.current.emissiveIntensity = 0.5 + p * 0.5;
    if (light.current) {
      const base = status === "thinking" ? 2.4 : status === "speaking" ? 3.4 : 1.8;
      light.current.intensity = base + Math.sin(t * speed * 2) * 0.4 + p * 0.6;
    }
  });

  return (
    <group ref={group} position={[1.35, 0, 0]} scale={0.78}>
      <pointLight ref={light} position={[0, 0, 2.4]} color="#F4BA17" intensity={1.8} distance={9} />
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          ref={material}
          color="#F4BA17"
          emissive="#C8890A"
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.45}
        />
      </mesh>
    </group>
  );
}
