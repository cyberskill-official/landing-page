'use client';

import React from 'react';
import { useGLTF } from '@react-three/drei';
import type { AnimationClip, Object3D } from 'three';
import { useLumiAnimations } from './useLumiAnimations';

export const LUMI_GLB_PATH = '/lumi.glb';

type LumiGltf = {
  scene: Object3D;
  animations: AnimationClip[];
};

export function Lumi() {
  const { scene, animations } = useGLTF(LUMI_GLB_PATH) as unknown as LumiGltf;
  useLumiAnimations({ rootBone: scene, animations });

  return <primitive object={scene} />;
}

useGLTF.preload(LUMI_GLB_PATH);
