'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { setCurrentAnim, setEmissiveBoost } from '@/lib/stores';
import { useSceneProgress } from '@/lib/use-scene-progress';
import { AvatarSphere, formatMemberTooltip, TEAM_AVATARS, type TeamMember } from './AvatarSphere';
import { BokehLayer } from './BokehLayer';

const SCENE_4_CAMERA_POSITION = [0.1, 0.3, 5] as const;

export function Scene4Canvas() {
  const progress = useSceneProgress();
  const { camera } = useThree();
  const enteredRef = useRef(false);
  const [hovered, setHovered] = useState<{ member: TeamMember; position: [number, number, number] } | null>(null);

  useEffect(() => {
    if (progress <= 0.05 || enteredRef.current) return;
    enteredRef.current = true;
    setCurrentAnim('idle', 100);
    setEmissiveBoost(0.1);
    gsap.to(camera.position, {
      duration: 0.5,
      ease: 'power3.out',
      x: SCENE_4_CAMERA_POSITION[0],
      y: SCENE_4_CAMERA_POSITION[1],
      z: SCENE_4_CAMERA_POSITION[2],
    });
    return () => setEmissiveBoost(0.2);
  }, [camera, progress]);

  return (
    <group name="scene-4-team-root">
      <ambientLight color="#f9d966" intensity={0.45} />
      <directionalLight color="#fceaa8" intensity={0.5} position={[-1.5, 3.5, 2]} />
      <BokehLayer />
      {TEAM_AVATARS.map((avatar) => (
        <AvatarSphere
          key={avatar.member.firstName}
          {...avatar}
          onHoverEnd={() => setHovered(null)}
          onHoverStart={(member, position) => setHovered({ member, position })}
        />
      ))}
      {hovered ? (
        <group name="scene-4-hover-contract" userData={{ tooltip: formatMemberTooltip(hovered.member), position: hovered.position }} />
      ) : null}
    </group>
  );
}
