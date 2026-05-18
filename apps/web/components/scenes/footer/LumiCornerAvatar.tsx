'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { useScrollDirection } from '@/lib/stores';
import { LumiLod } from '@/components/lumi/LumiLod';

export const CORNER_AVATAR_SIZE_PX = 48;
export const CORNER_AVATAR_Z_INDEX = 90;
export const CORNER_AVATAR_SCALE = 0.16;
export const CORNER_VIEWPORT_OFFSET = { x: 0.88, y: 0.82 } as const;

export const LUMI_TAGLINE = {
  en: 'Lumi - for light turns wishes into reality',
  vi: 'Lumi - vi anh sang bien nguyen uoc thanh su that',
} as const satisfies Record<SupportedLocale, string>;

type LumiCornerAvatarProps = {
  visible: boolean;
};

export function LumiCornerAvatar({ visible }: LumiCornerAvatarProps) {
  const groupRef = useRef<Group | null>(null);
  const { viewport } = useThree();
  const scrollDirection = useScrollDirection();

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const position = cornerAvatarWorldPosition(viewport.width, viewport.height);
    group.position.set(position[0], position[1], 1);
    group.scale.setScalar(CORNER_AVATAR_SCALE);
    group.rotation.y = MathUtils.lerp(group.rotation.y, scrollDirection === 'up' ? -0.35 : 0.18, 0.08);
    group.visible = visible;
  });

  return (
    <group ref={groupRef} name="footer-lumi-corner-avatar">
      <LumiLod forceLow name="footer-lumi-corner-avatar-lod" />
    </group>
  );
}

export function cornerAvatarWorldPosition(viewportWidth: number, viewportHeight: number): [number, number] {
  return [
    (CORNER_VIEWPORT_OFFSET.x - 0.5) * viewportWidth,
    (CORNER_VIEWPORT_OFFSET.y - 0.5) * viewportHeight,
  ];
}
