'use client';

import { useEffect } from 'react';
import { preloadGltfWithLocalDecoders } from '@/lib/canvas/decoder-config';
import { ParticulateDust } from './ParticulateDust';

type Scene0HeroCanvasProps = {
  onReady: () => void;
};

export function Scene0HeroCanvas({ onReady }: Scene0HeroCanvasProps) {
  useEffect(() => {
    void preloadGltfWithLocalDecoders('/lumi.glb').catch((error) => {
      console.warn('[scene-0] preload failed: /lumi.glb', error);
    });
    const frame = window.requestAnimationFrame(onReady);
    return () => window.cancelAnimationFrame(frame);
  }, [onReady]);

  return (
    <group name="scene-0-hero-lumi" position={[1.75, -0.45, 0]} rotation={[0, -0.22, 0]} scale={1.35}>
      <ParticulateDust />
      <mesh name="scene-0-hero-lumi-mock-contract">
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color="#e8b523" emissive="#6b451f" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}
