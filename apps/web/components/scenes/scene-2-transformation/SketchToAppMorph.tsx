'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useSceneProgress } from '@/lib/use-scene-progress';

export function getSketchMorphWeight(sceneProgress: number) {
  if (!Number.isFinite(sceneProgress)) return 0;
  return Math.min(1, Math.max(0, (sceneProgress - 0.45) / 0.4));
}

export function SketchToAppMorph() {
  const progress = useSceneProgress();
  const meshRef = useRef<Mesh & { morphTargetInfluences?: number[] }>(null);
  const wirePoints = useMemo(
    () =>
      new Float32Array([
        -0.8, -0.35, 0, 0.75, -0.35, 0, 0.75, -0.35, 0, 0.75, 0.35, 0, 0.75, 0.35, 0, -0.8, 0.35, 0, -0.8,
        0.35, 0, -0.8, -0.35, 0, -0.55, 0.1, 0, 0.55, 0.1, 0,
      ]),
    [],
  );

  useFrame(() => {
    const weight = getSketchMorphWeight(progress);
    if (meshRef.current?.morphTargetInfluences) meshRef.current.morphTargetInfluences[0] = weight;
    if (typeof window !== 'undefined') {
      window.__scene2TransformationState = {
        ...(window.__scene2TransformationState ?? {}),
        morphWeight: Number(weight.toFixed(3)),
      };
    }
  });

  return (
    <group name="scene-2-sketch-to-app-morph" position={[0.15, -0.45, 0.35]}>
      <lineSegments name="scene-2-sketch-wire">
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[wirePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#e8b523" transparent opacity={Math.max(0.25, 1 - progress)} />
      </lineSegments>
      <mesh ref={meshRef} name="scene-2-app-shell" position={[0, 0, -0.02]} scale={[1, 0.62, 1]}>
        <boxGeometry args={[1.55, 1.1, 0.04]} />
        <meshBasicMaterial color="#fef6d9" transparent opacity={getSketchMorphWeight(progress)} />
      </mesh>
    </group>
  );
}

declare global {
  interface Window {
    __scene2TransformationState?: {
      currentAnim?: 'paint';
      morphWeight?: number;
      paintTrailDraw?: number;
      pullQuoteVisible?: boolean;
    };
  }
}
