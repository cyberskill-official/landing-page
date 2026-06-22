"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import type { PerspectiveCamera } from "three";
import { LumiPlaceholder } from "@/components/canvas/LumiPlaceholder";
import { getScrollProgress } from "@/lib/scroll/progress";
import { resolveSceneState } from "@/lib/scene/progressMap";

// Cinematic camera rig (FR-SCENE-007): the camera reads its target from the one
// declarative scene-progress map (not its own math) and eases toward it, so the
// story feels like a single continuous shot with Lumi kept framed as it drifts.
function CameraRig() {
  const prog = useRef(0);
  useFrame((state, delta) => {
    const ease = Math.min(1, delta * 2);
    prog.current += (getScrollProgress() - prog.current) * ease;
    const target = resolveSceneState(prog.current).camera;
    const cam = state.camera as PerspectiveCamera;
    cam.position.x += (target.x - cam.position.x) * ease;
    cam.position.y += (target.y - cam.position.y) * ease;
    cam.position.z += (target.z - cam.position.z) * ease;
    cam.lookAt(0.4, 0, 0);
    if (Math.abs(cam.fov - target.fov) > 0.01) {
      cam.fov += (target.fov - cam.fov) * ease;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

// The single fixed full-viewport canvas that renders the whole story, so assets
// load once (research doc §B). alpha:true keeps it transparent, letting the
// server-rendered hero (the LCP element) show through. Float gives a gentle
// drift; Sparkles are golden motes that make Lumi feel alive; CameraRig scrubs
// the camera against scroll. Imported only by CanvasMount, which dynamic()-loads
// it ssr:false on capable devices.
export function GenieScene() {
  return (
    <Canvas
      className="cs-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} color="#fff4d6" />
      <pointLight position={[-4, -2, 1]} intensity={0.5} color="#F4BA17" distance={14} />
      <CameraRig />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
        <LumiPlaceholder />
      </Float>
      <Sparkles count={60} scale={[8, 5, 3]} size={4} speed={0.35} color="#F4BA17" opacity={0.7} />
    </Canvas>
  );
}
