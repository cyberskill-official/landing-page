'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MathUtils, type Object3D } from 'three';
import { useFocusedCta, type CtaTrack } from '@/lib/stores';

export const MAX_HEAD_TURN = 0.523;
export const HEAD_TURN_DAMPING = 0.08;

export const HEAD_TURN_TARGETS = {
  buy: -0.45,
  partner: 0,
  join: 0.45,
  default: 0,
} as const satisfies Record<CtaTrack | 'default', number>;

type LumiHeadTurnProps = {
  headBone?: Object3D | null;
};

type LumiGltf = {
  scene: Object3D;
  nodes?: Record<string, Object3D>;
};

export function LumiHeadTurn({ headBone }: LumiHeadTurnProps) {
  const focusedTrack = useFocusedCta();
  const gltf = useGLTF('/lumi.glb') as unknown as LumiGltf;
  const headBoneRef = useRef<Object3D | null>(headBone ?? null);

  useEffect(() => {
    headBoneRef.current = headBone ?? gltf.nodes?.head ?? resolveHeadBone(gltf.scene);
  }, [gltf.nodes, gltf.scene, headBone]);

  useFrame(() => {
    const bone = headBoneRef.current;
    if (!bone) return;
    bone.rotation.y = nextHeadTurnRotation(bone.rotation.y, focusedTrack);
  });

  return null;
}

export function getHeadTurnTarget(track: CtaTrack | null | undefined): number {
  return HEAD_TURN_TARGETS[track ?? 'default'];
}

export function clampHeadTurn(value: number): number {
  return MathUtils.clamp(value, -MAX_HEAD_TURN, MAX_HEAD_TURN);
}

export function nextHeadTurnRotation(
  currentRotationY: number,
  track: CtaTrack | null | undefined,
  damping = HEAD_TURN_DAMPING,
): number {
  return clampHeadTurn(MathUtils.lerp(currentRotationY, getHeadTurnTarget(track), damping));
}

export function resolveHeadBone(root: Object3D): Object3D | null {
  return root.getObjectByName('head') ?? root.getObjectByName('Head') ?? root.getObjectByName('mixamorigHead') ?? null;
}

useGLTF.preload('/lumi.glb');
