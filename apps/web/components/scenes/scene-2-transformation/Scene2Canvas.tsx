'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { setCurrentAnim } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { getPaintTrailDrawProgress, PaintTrail } from './PaintTrail';
import { SketchToAppMorph } from './SketchToAppMorph';

const SCENE_2_CAMERA_POSITION = [0.5, -0.2, 4] as const;

export function Scene2Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);

  useEffect(() => {
    if (progress <= 0.05 || enteredRef.current) return;
    enteredRef.current = true;
    setCurrentAnim('paint', 100);
    gsap.to(camera.position, {
      duration: 0.5,
      ease: 'power3.out',
      x: SCENE_2_CAMERA_POSITION[0],
      y: SCENE_2_CAMERA_POSITION[1],
      z: SCENE_2_CAMERA_POSITION[2],
    });
  }, [camera, progress]);

  useFrame(() => {
    if (typeof window === 'undefined') return;
    window.__scene2TransformationState = {
      ...(window.__scene2TransformationState ?? {}),
      currentAnim: 'paint',
      paintTrailDraw: Number(getPaintTrailDrawProgress(progress).toFixed(3)),
    };
  });

  return (
    <group name="scene-2-transformation-root">
      <ambientLight color="#ddb995" intensity={0.35} />
      <directionalLight color="#f9d966" intensity={0.75} position={[0.5, 4.5, 2]} />
      <mesh name="scene-2-sketchpad" position={[0.15, -0.62, 0.2]} rotation={[-0.22, 0, 0]}>
        <planeGeometry args={[3.2, 1.7]} />
        <meshBasicMaterial color="#fef6d9" />
      </mesh>
      <PaintTrail />
      <SketchToAppMorph />
    </group>
  );
}
