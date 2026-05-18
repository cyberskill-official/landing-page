'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

export type SatelliteSpec = {
  id: 'react' | 'three' | 'ai' | 'design-systems';
  isHomeBase?: boolean;
  label: string;
  position: [number, number, number];
  tint: string;
};

export const CAPABILITY_SATELLITES: SatelliteSpec[] = [
  { id: 'react', label: 'React', position: [0, 2, 0], tint: '#7DD3FC' },
  { id: 'three', label: 'Three.js', position: [2, 0, 0], tint: '#E879F9' },
  { id: 'ai', label: 'AI / RAG', position: [0, -2, 0], tint: '#84CC16' },
  {
    id: 'design-systems',
    isHomeBase: true,
    label: 'Design Systems',
    position: [-2, 0, 0],
    tint: '#E8B523',
  },
];

export function getSatelliteByClockPosition(clock: 12 | 3 | 6 | 9) {
  const index = { 12: 0, 3: 1, 6: 2, 9: 3 }[clock];
  return CAPABILITY_SATELLITES[index];
}

export function Satellite({ isHomeBase = false, label, position, tint }: SatelliteSpec) {
  const groupRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + position[0]) * 0.08;
  });

  return (
    <group ref={groupRef} name={`scene-3-satellite-${label}`} position={position} userData={{ label, tint }}>
      <mesh>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={isHomeBase ? 0.62 : 0.42} />
      </mesh>
    </group>
  );
}
