'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Color, type ShaderMaterial } from 'three';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { useLowMemoryMode } from '@/lib/stores';
import { useDeviceTier } from '@/lib/use-device-tier';
import {
  getDustDpr,
  getDustParticleCount,
  getInitialDustViewportWidth,
  getDustViewportTier,
  type DustViewportTier,
} from './dust-contract';
import { DUST_FRAGMENT_SHADER, DUST_GLOW_COLOR, DUST_GLOW_TOKEN, DUST_VERTEX_SHADER } from './dust-shader';

export { getDustDpr, getDustParticleCount, getDustViewportTier, getInitialDustViewportWidth };
export type { DustViewportTier };

export const DUST_MATERIAL_PROPS = {
  blending: AdditiveBlending,
  depthWrite: false,
  transparent: true,
} as const;

type DustAttributes = {
  lifetimes: Float32Array;
  phases: Float32Array;
  positions: Float32Array;
  velocities: Float32Array;
};

type DustFrameState = {
  count: number;
  debugEnabled: boolean;
  drawCalls: number;
  dpr: number;
  elapsedTime: number;
  material: Pick<ShaderMaterial, 'uniforms'> | null | undefined;
};

export function createDustAttributes(count: number): DustAttributes {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);
  const phases = new Float32Array(count);
  const random = seededRandom(count + 0x9e3779b9);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (random() - 0.5) * 4.8;
    positions[offset + 1] = (random() - 0.5) * 2.6;
    positions[offset + 2] = (random() - 0.5) * 1.2;
    velocities[offset] = (random() - 0.5) * 0.2;
    velocities[offset + 1] = 0.15 + random() * 0.35;
    velocities[offset + 2] = (random() - 0.5) * 0.08;
    lifetimes[index] = 3 + random() * 5;
    phases[index] = random() * lifetimes[index]!;
  }

  return { lifetimes, phases, positions, velocities };
}

export function updateDustFrame({ count, debugEnabled, drawCalls, dpr, elapsedTime, material }: DustFrameState) {
  if (material?.uniforms?.uTime) {
    material.uniforms.uTime.value = elapsedTime;
  }
  if (debugEnabled && typeof window !== 'undefined') {
    window.__scene0DustState = {
      count,
      drawCalls,
      dpr,
      token: DUST_GLOW_TOKEN,
    };
  }
}

export function ParticulateDust() {
  const reducedMotion = useReducedMotion();
  const lowMemoryMode = useLowMemoryMode();
  const deviceTier = useDeviceTier();
  const viewportWidth = useViewportWidth();
  const debugEnabled = useDustDebugEnabled();
  const count = getDustParticleCount(viewportWidth, lowMemoryMode, deviceTier);

  if (reducedMotion || count === 0) return null;

  return (
    <ParticulateDustPoints
      count={count}
      dpr={getDustDpr(deviceTier)}
      debugEnabled={debugEnabled}
    />
  );
}

function ParticulateDustPoints({ count, debugEnabled, dpr }: { count: number; debugEnabled: boolean; dpr: number }) {
  const materialRef = useRef<ShaderMaterial | null>(null);
  const attributes = useMemo(() => createDustAttributes(count), [count]);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(DUST_GLOW_COLOR.color) },
      uDpr: { value: dpr },
      uIntensity: { value: DUST_GLOW_COLOR.intensity },
      uPointSize: { value: 7 },
      uTime: { value: 0 },
    }),
    [dpr],
  );

  useEffect(() => {
    if (!debugEnabled || typeof window === 'undefined') return;
    window.__scene0DustState = {
      count,
      drawCalls: window.__scene0DustState?.drawCalls ?? 1,
      dpr: uniforms.uDpr.value,
      token: DUST_GLOW_TOKEN,
    };
  }, [count, debugEnabled, uniforms.uDpr.value]);

  useFrame(({ clock, gl }) => {
    updateDustFrame({
      count,
      debugEnabled,
      drawCalls: gl.info.render.calls,
      dpr: uniforms.uDpr.value,
      elapsedTime: clock.elapsedTime,
      material: materialRef.current,
    });
  });

  return (
    <>
      <points
        name="scene-0-dust"
        frustumCulled={false}
        userData={{
          particleCount: count,
          scene: 'scene-0-hero',
          token: DUST_GLOW_TOKEN,
        }}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
          <bufferAttribute attach="attributes-aVelocity" args={[attributes.velocities, 3]} />
          <bufferAttribute attach="attributes-aLifetime" args={[attributes.lifetimes, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[attributes.phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          {...DUST_MATERIAL_PROPS}
          fragmentShader={DUST_FRAGMENT_SHADER}
          uniforms={uniforms}
          vertexShader={DUST_VERTEX_SHADER}
        />
      </points>
      {debugEnabled && process.env.NODE_ENV !== 'production' ? (
        <Html prepend>
          <output data-dust-debug aria-label="Scene 0 dust debug">
            dust count: {count} | drawCalls: {window.__scene0DustState?.drawCalls ?? 1}
          </output>
        </Html>
      ) : null}
    </>
  );
}

function useViewportWidth() {
  const [width, setWidth] = useState(getInitialDustViewportWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

function useDustDebugEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).get('debug') === 'dust');
  }, []);

  return enabled;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
