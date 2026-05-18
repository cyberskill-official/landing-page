'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CubicBezierCurve3, TubeGeometry, Vector3, type ShaderMaterial } from 'three';
import { useSceneProgress } from '@/lib/use-scene-progress';

export type PaintTrailUniforms = {
  uColor: { value: Vector3 };
  uDrawProgress: { value: number };
};

export const PAINT_TRAIL_SEGMENTS = 6;
export const PAINT_TRAIL_COLOR = [232 / 255, 181 / 255, 35 / 255] as const;

const vertexShader = `
  varying float vTrailAlpha;

  void main() {
    vTrailAlpha = 1.0 - uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uDrawProgress;
  uniform vec3 uColor;
  varying float vTrailAlpha;

  void main() {
    if (1.0 - vTrailAlpha > uDrawProgress) discard;
    gl_FragColor = vec4(uColor, vTrailAlpha * 0.9);
  }
`;

export function getPaintTrailDrawProgress(sceneProgress: number) {
  if (!Number.isFinite(sceneProgress)) return 0;
  return Math.min(1, Math.max(0, sceneProgress / 0.4));
}

export function createPaintTrailUniforms(): PaintTrailUniforms {
  return {
    uColor: { value: new Vector3(...PAINT_TRAIL_COLOR) },
    uDrawProgress: { value: 0 },
  };
}

export function createPaintTrailGeometry() {
  const curve = new CubicBezierCurve3(
    new Vector3(0.7, 0.3, 0),
    new Vector3(1.1, 0.2, 0.2),
    new Vector3(0.9, -0.3, 0.3),
    new Vector3(0.2, -0.5, 0.5),
  );
  return new TubeGeometry(curve, 32, 0.012, PAINT_TRAIL_SEGMENTS, false);
}

export function PaintTrail() {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const progress = useSceneProgress();
  const geometry = useMemo(createPaintTrailGeometry, []);
  const uniforms = useMemo(createPaintTrailUniforms, []);

  useFrame(() => {
    const uniform = materialRef.current?.uniforms.uDrawProgress;
    if (!uniform) return;
    uniform.value = getPaintTrailDrawProgress(progress);
  });

  return (
    <mesh geometry={geometry} name="scene-2-paint-trail">
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
