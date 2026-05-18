'use client';

import React from 'react';
import { getBokehCountForTier } from '@/lib/dpr-scaling';
import { useDeviceTier } from '@/lib/use-device-tier';

export const BOKEH_POSITIONS = [
  [-2.7, 1.2, -3.2],
  [-1.8, -0.9, -3.8],
  [-0.9, 1.4, -4.2],
  [0.1, -1.2, -3.4],
  [0.9, 1.1, -4.6],
  [1.8, -0.65, -3.9],
  [2.6, 0.85, -4.8],
  [2.1, 1.55, -3.1],
  [-2.2, 0.05, -4.9],
  [0.4, 0.3, -5.1],
  [-0.2, 1.9, -3.6],
  [1.2, -1.6, -4.4],
] as const;

export function BokehLayer() {
  const tier = useDeviceTier();
  const count = getBokehCountForTier(tier);

  return (
    <group name="scene-4-bokeh-layer">
      {BOKEH_POSITIONS.slice(0, count).map((position, index) => (
        <mesh key={`${position.join(':')}:${index}`} name="scene-4-bokeh-orb" position={[...position]}>
          <sphereGeometry args={[0.38 + (index % 3) * 0.09, 16, 16]} />
          <meshStandardMaterial color="#f9d966" transparent opacity={0.18} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
