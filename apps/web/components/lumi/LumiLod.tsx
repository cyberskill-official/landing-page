'use client';

import React, { useMemo } from 'react';
import { Detailed, useGLTF } from '@react-three/drei';
import type { AnimationClip, Object3D } from 'three';
import { useLumiAnim, type AnimationClipName } from '@/lib/stores';

export const LUMI_PRODUCTION_GLB_PATH = '/lumi.glb';
export const LUMI_GREYBOX_GLB_PATH = '/lumi-greybox.glb';
export const LUMI_LOD_DISTANCE = 12;
export const LUMI_LOD_SWAP_TO_GREYBOX_DISTANCE = 12.5;
export const LUMI_LOD_SWAP_TO_PRODUCTION_DISTANCE = 11.5;

export type LumiLodLevel = 'production' | 'greybox';

export type ResolveLumiLodInput = {
  distance: number;
  currentLod: LumiLodLevel;
  isAnimating: boolean;
  forceLow?: boolean;
};

type LumiGltf = {
  scene: Object3D;
  animations: AnimationClip[];
};

type LumiLodProps = {
  forceLow?: boolean;
  name?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export function LumiLod({ forceLow = false, ...groupProps }: LumiLodProps) {
  const production = useGLTF(LUMI_PRODUCTION_GLB_PATH) as unknown as LumiGltf;
  const greybox = useGLTF(LUMI_GREYBOX_GLB_PATH) as unknown as LumiGltf;
  const currentAnim = useLumiAnim();
  const productionScene = useMemo(() => production.scene.clone(true), [production.scene]);
  const greyboxScene = useMemo(() => greybox.scene.clone(true), [greybox.scene]);

  if (forceLow) {
    return (
      <group {...groupProps}>
        <primitive object={greyboxScene} />
      </group>
    );
  }

  if (isActiveLumiAnimation(currentAnim)) {
    return (
      <group {...groupProps}>
        <primitive object={productionScene} />
      </group>
    );
  }

  return (
    <group {...groupProps}>
      <Detailed distances={[0, LUMI_LOD_DISTANCE]}>
        <primitive object={productionScene} />
        <primitive object={greyboxScene} />
      </Detailed>
    </group>
  );
}

export function resolveLumiLod({
  distance,
  currentLod,
  isAnimating,
  forceLow = false,
}: ResolveLumiLodInput): LumiLodLevel {
  if (forceLow) return 'greybox';
  if (isAnimating) return 'production';
  if (!Number.isFinite(distance)) return currentLod;
  if (currentLod === 'greybox') {
    return distance < LUMI_LOD_SWAP_TO_PRODUCTION_DISTANCE ? 'production' : 'greybox';
  }
  return distance > LUMI_LOD_SWAP_TO_GREYBOX_DISTANCE ? 'greybox' : 'production';
}

export function isActiveLumiAnimation(animation: AnimationClipName): boolean {
  return animation !== 'idle' && animation !== 'idle_concerned' && animation !== 'coil_idle';
}

useGLTF.preload(LUMI_PRODUCTION_GLB_PATH);
useGLTF.preload(LUMI_GREYBOX_GLB_PATH);
