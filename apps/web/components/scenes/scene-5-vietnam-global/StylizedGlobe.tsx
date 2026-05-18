'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { IcosahedronGeometry, type Mesh } from 'three';

export const GLOBE_RADIUS = 1.5;
export const GLOBE_DETAIL = 5;
export const GLOBE_SPIN_RATE = 0.15;

export function estimateIcosahedronTriangles(detail = GLOBE_DETAIL) {
  return 20 * Math.pow(4, detail);
}

export function StylizedGlobe() {
  const meshRef = useRef<Mesh | null>(null);
  const geometry = useMemo(() => new IcosahedronGeometry(GLOBE_RADIUS, GLOBE_DETAIL), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * GLOBE_SPIN_RATE;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} name="scene-5-stylized-globe">
      <meshStandardMaterial color="#A36A3F" flatShading roughness={0.7} metalness={0.15} />
    </mesh>
  );
}
