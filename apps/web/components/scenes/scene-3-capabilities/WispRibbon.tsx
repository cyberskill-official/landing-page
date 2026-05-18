'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CubicBezierCurve3, TubeGeometry, Vector3, type ShaderMaterial } from 'three';
import { useSceneProgress } from '@/lib/use-scene-progress';

export type WispRibbonProps = {
  delayOffset?: number;
  startWorldPos?: Vector3;
  targetWorldPos: Vector3;
  tint: Vector3;
};

export function getRibbonDrawProgress(sceneProgress: number, delayOffset = 0) {
  return Math.min(1, Math.max(0, (sceneProgress - 0.15 - delayOffset) / 0.55));
}

export function createRibbonGeometry(startWorldPos: Vector3, targetWorldPos: Vector3) {
  const control1 = startWorldPos.clone().lerp(targetWorldPos, 0.3).add(new Vector3(0, 0.5, 0));
  const control2 = startWorldPos.clone().lerp(targetWorldPos, 0.7).add(new Vector3(0, -0.3, 0));
  return new TubeGeometry(new CubicBezierCurve3(startWorldPos, control1, control2, targetWorldPos), 32, 0.018, 8, false);
}

export function WispRibbon({
  delayOffset = 0,
  startWorldPos = new Vector3(0, 0, 0),
  targetWorldPos,
  tint,
}: WispRibbonProps) {
  const progress = useSceneProgress();
  const materialRef = useRef<ShaderMaterial | null>(null);
  const geometry = useMemo(() => createRibbonGeometry(startWorldPos, targetWorldPos), [startWorldPos, targetWorldPos]);
  const uniforms = useMemo(
    () => ({
      uColor: { value: tint },
      uDrawProgress: { value: 0 },
    }),
    [tint],
  );

  useFrame(() => {
    const uniform = materialRef.current?.uniforms.uDrawProgress;
    if (!uniform) return;
    uniform.value = getRibbonDrawProgress(progress, delayOffset);
  });

  return (
    <mesh geometry={geometry} name="scene-3-wisp-ribbon">
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader="void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
        fragmentShader="uniform vec3 uColor; uniform float uDrawProgress; void main(){gl_FragColor=vec4(uColor, 0.85 * uDrawProgress);}"
      />
    </mesh>
  );
}
