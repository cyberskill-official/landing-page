"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGenieStore } from "@/lib/genie/store";

// PLACEHOLDER. A procedural golden orb stands in for the commissioned
// golden-genie GLB (research doc §C recommends a bespoke Draco+KTX2 model with
// a Mixamo rig + ARKit visemes). It already demonstrates the two behaviours the
// real model will need: gaze toward the pointer, and a chat-state-reactive
// idle/think/speak animation driven by the shared Zustand store.
export function LumiPlaceholder() {
  const mesh = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const status = useGenieStore((s) => s.status);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const speed = status === "speaking" ? 3 : status === "thinking" ? 1.7 : 0.8;

    // Idle sway / bob.
    m.position.y = Math.sin(t * speed) * 0.12;

    // Gaze: lerp rotation toward the normalised pointer each frame.
    const targetY = state.pointer.x * 0.6;
    const targetX = -state.pointer.y * 0.4;
    const k = Math.min(1, delta * 3);
    m.rotation.y += (targetY - m.rotation.y) * k;
    m.rotation.x += (targetX - m.rotation.x) * k;

    if (light.current) {
      const base = status === "thinking" ? 2.4 : status === "speaking" ? 3.4 : 1.8;
      light.current.intensity = base + Math.sin(t * speed * 2) * 0.4;
    }
  });

  return (
    <group>
      <pointLight ref={light} position={[0, 0, 2.4]} color="#F4BA17" intensity={1.8} distance={9} />
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
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
