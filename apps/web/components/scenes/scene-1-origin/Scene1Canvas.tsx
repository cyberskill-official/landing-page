'use client';

import React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { gsap } from 'gsap';
import { setCurrentAnim } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { IdeaSpark, IDEA_SPARK_POSITION, WISP_DAMPING } from './IdeaSpark';

const SCENE_1_CAMERA_POSITION = [0.2, 0.1, 4.5] as const;

export function Scene1Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);
  const wispTip = useMemo(() => new Vector3(0.1, 0.2, 0), []);
  const sparkTarget = useMemo(() => new Vector3(...IDEA_SPARK_POSITION), []);

  useEffect(() => {
    if (progress <= 0.05 || enteredRef.current) return;
    enteredRef.current = true;
    setCurrentAnim('coil_idle', 100);
    gsap.to(camera.position, {
      duration: 0.5,
      ease: 'power3.out',
      x: SCENE_1_CAMERA_POSITION[0],
      y: SCENE_1_CAMERA_POSITION[1],
      z: SCENE_1_CAMERA_POSITION[2],
    });
  }, [camera, progress]);

  useFrame(() => {
    if (progress < 0.1 || progress > 0.9) return;
    wispTip.lerp(sparkTarget, WISP_DAMPING);
    if (typeof window === 'undefined') return;
    window.__scene1OriginState = {
      ...(window.__scene1OriginState ?? {}),
      currentAnim: 'coil_idle',
      sparkDistance: Number(wispTip.distanceTo(sparkTarget).toFixed(4)),
    };
  });

  return (
    <group name="scene-1-origin-root">
      <ambientLight color="#ddb995" intensity={0.3} />
      <directionalLight color="#f9d966" intensity={0.7} position={[0, 5, 2]} />
      <mesh name="scene-1-origin-sepia-plane" position={[0, 0, -0.65]}>
        <planeGeometry args={[4.8, 3.2]} />
        <meshBasicMaterial color="#6e3a18" />
      </mesh>
      <IdeaSpark />
    </group>
  );
}

declare global {
  interface Window {
    __scene1OriginState?: {
      caption?: string;
      currentAnim?: 'coil_idle';
      sparkDistance?: number;
    };
  }
}
