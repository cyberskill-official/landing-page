'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { setActiveScene, setCurrentAnim, setNonlaVisible } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { LumiHeadTurn } from './LumiHeadTurn';

const SCENE_6_CAMERA_POSITION = [0, 0, 5] as const;

export function Scene6Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);

  useEffect(() => {
    if (progress <= 0.1 || enteredRef.current) return;
    enteredRef.current = true;
    setActiveScene(6);
    setNonlaVisible(true);
    setCurrentAnim('idle', 100);
    gsap.to(camera.position, {
      duration: 0.5,
      ease: 'power3.out',
      x: SCENE_6_CAMERA_POSITION[0],
      y: SCENE_6_CAMERA_POSITION[1],
      z: SCENE_6_CAMERA_POSITION[2],
    });
  }, [camera, progress]);

  return (
    <group name="scene-6-cta-hub-root">
      <ambientLight color="#f4d47a" intensity={0.42} />
      <directionalLight color="#fceaa8" intensity={0.72} position={[0, 3, 2.5]} />
      <pointLight color="#e8b523" intensity={0.55} position={[0, 0.8, 2]} />
      <mesh name="scene-6-lumi-focus-proxy" position={[0, 0.35, 0]} scale={0.82}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color="#e8b523" emissive="#6e3a18" emissiveIntensity={0.24} />
      </mesh>
      <LumiHeadTurn />
    </group>
  );
}
