"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { LumiPlaceholder } from "@/components/canvas/LumiPlaceholder";

// The single fixed full-viewport canvas that renders the whole story, so assets
// load once (research doc §B). alpha:true keeps it transparent, letting the
// server-rendered hero (the LCP element) show through. Float gives a gentle
// drift; Sparkles are golden motes that make Lumi feel alive. Imported only by
// CanvasMount, which dynamic()-loads it ssr:false on capable devices.
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
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
        <LumiPlaceholder />
      </Float>
      <Sparkles count={40} scale={[7, 5, 3]} size={4} speed={0.35} color="#F4BA17" opacity={0.7} />
    </Canvas>
  );
}
