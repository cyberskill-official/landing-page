"use client";

import { Canvas } from "@react-three/fiber";
import { LumiPlaceholder } from "@/components/canvas/LumiPlaceholder";

// The single fixed full-viewport canvas that renders the whole story, so assets
// load once (research doc §B). alpha:true keeps it transparent, letting the
// server-rendered hero (the LCP element) show through. Imported only by
// CanvasMount, which dynamic()-loads it ssr:false on capable devices.
export function GenieScene() {
  return (
    <Canvas
      className="cs-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <LumiPlaceholder />
    </Canvas>
  );
}
