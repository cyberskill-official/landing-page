'use client';
import { Canvas } from '@react-three/fiber';

export default function CanvasMount() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      {/* Scenes push meshes here via <UseCanvas> — FR-WEB-003 */}
    </Canvas>
  );
}
