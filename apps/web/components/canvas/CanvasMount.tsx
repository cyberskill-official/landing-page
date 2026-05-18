'use client';
import { useEffect } from 'react';
import { GlobalCanvas } from '@14islands/r3f-scroll-rig';
import { preloadGltfWithLocalDecoders } from '@/lib/canvas/decoder-config';
import { getCanvasDprForTier } from '@/lib/dpr-scaling';
import { useDeviceTier } from '@/lib/use-device-tier';
import { DecoderBootstrap } from './DecoderBootstrap';
import { DrawCallStats } from './DrawCallStats';
import { useFrameloopController } from '@/lib/canvas/use-frameloop-controller';

const SCENE_UNIT_SCALE = 0.01;

void preloadGltfWithLocalDecoders('/lumi.glb').catch((error) => {
  console.warn('[preload] failed: /lumi.glb', error);
});

function FrameloopController() {
  useFrameloopController();
  return null;
}

export default function CanvasMount() {
  const deviceTier = useDeviceTier();
  const dpr = getCanvasDprForTier(deviceTier);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('#ScrollRig-canvas canvas');
      canvas?.setAttribute('role', 'img');
      canvas?.setAttribute('aria-label', 'Lumi the golden genie waving hello');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <GlobalCanvas
      frameloop="demand"
      dpr={dpr}
      scaleMultiplier={SCENE_UNIT_SCALE}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <DecoderBootstrap />
      <FrameloopController />
      <DrawCallStats />
      {/* Scenes push meshes here via <UseCanvas> — FR-WEB-003 */}
    </GlobalCanvas>
  );
}
