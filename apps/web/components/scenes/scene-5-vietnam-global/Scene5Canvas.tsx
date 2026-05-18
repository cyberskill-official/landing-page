'use client';

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { setCurrentAnim, setNonlaVisible } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { DESTINATION_POINTS, HcmcPin } from './HcmcPin';
import { DestinationArcs } from './DestinationArc';
import { StylizedGlobe } from './StylizedGlobe';

const SCENE_5_CAMERA_POSITION = [0, 0.2, 6.5] as const;

export function Scene5Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);

  useEffect(() => {
    if (progress <= 0.1 || enteredRef.current) return undefined;
    enteredRef.current = true;
    setNonlaVisible(true);
    setCurrentAnim('nonla_appear', 100);
    const timer = window.setTimeout(() => setCurrentAnim('nonla_tip', 100), 1_000);
    gsap.to(camera.position, {
      duration: 0.6,
      ease: 'power3.out',
      x: SCENE_5_CAMERA_POSITION[0],
      y: SCENE_5_CAMERA_POSITION[1],
      z: SCENE_5_CAMERA_POSITION[2],
    });
    return () => window.clearTimeout(timer);
  }, [camera, progress]);

  return (
    <group name="scene-5-vietnam-global-root">
      <ambientLight color="#f9d966" intensity={0.38} />
      <directionalLight color="#fceaa8" intensity={0.72} position={[1.5, 3, 2]} />
      <StylizedGlobe />
      <HcmcPin />
      {DESTINATION_POINTS.map((point) => (
        <HcmcPin key={point.label} point={point} tint="#FFEB3B" />
      ))}
      <DestinationArcs />
    </group>
  );
}
