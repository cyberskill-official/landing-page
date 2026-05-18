'use client';

import React from 'react';
import { forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, ShaderMaterial } from 'three';

export const IDEA_SPARK_POSITION = [0.4, 0.6, -0.2] as const;
export const IDEA_SPARK_RADIUS = 0.15;
export const WISP_DAMPING = 0.05;

export type Vec3Tuple = readonly [number, number, number];

export type IdeaSparkUniforms = {
  uTime: { value: number };
};

export type IdeaSparkProps = {
  position?: Vec3Tuple;
};

export function createIdeaSparkUniforms(): IdeaSparkUniforms {
  return { uTime: { value: 0 } };
}

export function lerpWispTowardSpark(current: Vec3Tuple, target: Vec3Tuple, damping = WISP_DAMPING): [number, number, number] {
  return [
    current[0] + (target[0] - current[0]) * damping,
    current[1] + (target[1] - current[1]) * damping,
    current[2] + (target[2] - current[2]) * damping,
  ];
}

const sparkVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sparkFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float distanceFromCenter = distance(vUv, vec2(0.5));
    float pulse = 0.72 + 0.2 * sin(uTime * 2.4);
    float alpha = smoothstep(0.5, 0.1, distanceFromCenter) * pulse;
    gl_FragColor = vec4(0.976, 0.851, 0.4, alpha);
  }
`;

export const IdeaSpark = forwardRef<Mesh, IdeaSparkProps>(function IdeaSpark(
  { position = IDEA_SPARK_POSITION },
  forwardedRef,
) {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const uniforms = useMemo(createIdeaSparkUniforms, []);

  useFrame(({ clock }) => {
    const uniform = materialRef.current?.uniforms.uTime;
    if (!uniform) return;
    uniform.value = clock.elapsedTime;
  });

  return (
    <mesh ref={forwardedRef} name="scene-1-origin-idea-spark" position={position}>
      <sphereGeometry args={[IDEA_SPARK_RADIUS, 24, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={sparkVertexShader}
        fragmentShader={sparkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
});
