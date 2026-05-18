'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export type TeamMember = {
  firstName: string;
  role: string;
};

export type AvatarPlacement = {
  member: TeamMember;
  position: [number, number, number];
};

export const TEAM_AVATARS: AvatarPlacement[] = [
  { member: { firstName: 'Minh', role: 'Senior Engineer' }, position: [-1.6, 0.4, -1.8] },
  { member: { firstName: 'An', role: 'Product Designer' }, position: [-0.9, -0.2, -1.2] },
  { member: { firstName: 'Linh', role: 'AI Engineer' }, position: [-0.3, 0.7, -1.6] },
  { member: { firstName: 'Quan', role: 'Three.js Engineer' }, position: [0.4, 0.1, -0.8] },
  { member: { firstName: 'Ha', role: 'QA Lead' }, position: [1.1, 0.55, -1.5] },
  { member: { firstName: 'Trang', role: 'Delivery Lead' }, position: [1.6, -0.3, -0.6] },
  { member: { firstName: 'Bao', role: 'Platform Engineer' }, position: [-1.2, -0.9, 0.3] },
  { member: { firstName: 'Nhi', role: 'Design Systems Engineer' }, position: [-0.1, -1, 0.8] },
  { member: { firstName: 'Khoa', role: 'Backend Engineer' }, position: [0.9, -0.85, 0.2] },
  { member: { firstName: 'Vy', role: 'Frontend Engineer' }, position: [1.7, 0.95, 0.7] },
];

export function getAvatarScale(z: number) {
  return Number((0.15 + (z + 2) * 0.05).toFixed(3));
}

export function formatMemberTooltip(member: TeamMember) {
  return `${member.firstName} - ${member.role}`;
}

export function AvatarSphere({
  member,
  onHoverEnd,
  onHoverStart,
  position,
}: AvatarPlacement & {
  onHoverEnd?: () => void;
  onHoverStart?: (member: TeamMember, position: [number, number, number]) => void;
}) {
  const meshRef = useRef<Mesh | null>(null);
  const [hovered, setHovered] = useState(false);
  const scale = getAvatarScale(position[2]) * (hovered ? 1.16 : 1);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.04;
  });

  return (
    <mesh
      ref={meshRef}
      name={`scene-4-avatar-${member.firstName}`}
      position={position}
      scale={scale}
      userData={{ firstName: member.firstName, role: member.role }}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHoverStart?.(member, position);
      }}
      onPointerLeave={() => {
        setHovered(false);
        onHoverEnd?.();
      }}
    >
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color="#f9d966" emissive="#e8b523" emissiveIntensity={0.35} />
    </mesh>
  );
}
