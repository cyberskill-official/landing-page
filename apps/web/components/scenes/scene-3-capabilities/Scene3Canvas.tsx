'use client';

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Vector3 } from 'three';
import { setCurrentAnim } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { CAPABILITY_SATELLITES, Satellite } from './Satellite';
import { WispRibbon } from './WispRibbon';

const SCENE_3_CAMERA_POSITION = [0, 0, 6] as const;

export function Scene3Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);

  useEffect(() => {
    if (progress <= 0.05 || enteredRef.current) return;
    enteredRef.current = true;
    setCurrentAnim('split_to_4', 100);
    gsap.to(camera.position, {
      duration: 0.5,
      ease: 'power3.out',
      x: SCENE_3_CAMERA_POSITION[0],
      y: SCENE_3_CAMERA_POSITION[1],
      z: SCENE_3_CAMERA_POSITION[2],
    });
  }, [camera, progress]);

  return (
    <group name="scene-3-capabilities-root">
      <ambientLight color="#fceaa8" intensity={0.34} />
      <pointLight color="#e8b523" intensity={0.8} position={[0, 0, 2]} />
      {CAPABILITY_SATELLITES.map((satellite, index) => (
        <React.Fragment key={satellite.id}>
          <Satellite {...satellite} />
          <WispRibbon
            delayOffset={index * 0.05}
            targetWorldPos={new Vector3(...satellite.position)}
            tint={new Vector3(...hexToRgb(satellite.tint))}
          />
        </React.Fragment>
      ))}
    </group>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}
