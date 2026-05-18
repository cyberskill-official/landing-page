'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type ShaderMaterial } from 'three';
import { GLOBE_RADIUS } from './StylizedGlobe';

export type GeoPoint = {
  label: string;
  lat: number;
  lon: number;
};

export const HCMC_POINT: GeoPoint = { label: 'Ho Chi Minh City', lat: 10.776, lon: 106.701 };
export const DESTINATION_POINTS: GeoPoint[] = [
  { label: 'New York', lat: 40.71, lon: -74.01 },
  { label: 'London', lat: 51.51, lon: -0.13 },
  { label: 'Berlin', lat: 52.52, lon: 13.41 },
];

export function latLonToVector3(lat: number, lon: number, radius = GLOBE_RADIUS) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  return new Vector3(
    Math.cos(phi) * Math.cos(theta) * radius,
    Math.sin(phi) * radius,
    Math.cos(phi) * Math.sin(theta) * radius,
  );
}

export function HcmcPin({ point = HCMC_POINT, tint = '#DA251D' }: { point?: GeoPoint; tint?: string }) {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const position = useMemo(() => latLonToVector3(point.lat, point.lon), [point.lat, point.lon]);

  useFrame(({ clock }) => {
    const uniform = materialRef.current?.uniforms.uAlpha;
    if (!uniform) return;
    uniform.value = 0.8 + 0.2 * Math.sin(clock.elapsedTime * Math.PI * 2);
  });

  return (
    <mesh name={`scene-5-pin-${point.label}`} position={position} userData={{ label: point.label }}>
      <coneGeometry args={[0.04, 0.15, 12]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={{ uAlpha: { value: 1 } }}
        vertexShader="void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
        fragmentShader={`uniform float uAlpha; void main(){gl_FragColor=vec4(${hexToVec(tint)}, uAlpha);}`}
      />
    </mesh>
  );
}

function hexToVec(hex: string) {
  const value = hex.replace('#', '');
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ].join(',');
}
