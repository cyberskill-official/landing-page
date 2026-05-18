// @vitest-environment happy-dom

import React from 'react';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AdditiveBlending } from 'three';
import {
  createDustAttributes,
  getDustDpr,
  getInitialDustViewportWidth,
  DUST_MATERIAL_PROPS,
  getDustParticleCount,
  getDustViewportTier,
  ParticulateDust,
  updateDustFrame,
} from '../ParticulateDust';
import { DUST_FRAGMENT_SHADER, DUST_GLOW_COLOR, DUST_GLOW_TOKEN, DUST_VERTEX_SHADER } from '../dust-shader';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

const frameMock = vi.hoisted(() => ({
  callbacks: [] as Array<(state: { clock: { elapsedTime: number }; gl: { info: { render: { calls: number } } } }) => void>,
}));

const reducedMotionMock = vi.hoisted(() => ({ value: false }));
const lowMemoryMock = vi.hoisted(() => ({ value: false }));

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: (state: { clock: { elapsedTime: number }; gl: { info: { render: { calls: number } } } }) => void) => {
    frameMock.callbacks.push(callback);
  },
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div data-drei-html>{children}</div>,
}));

vi.mock('@/lib/a11y/use-reduced-motion', () => ({
  useReducedMotion: () => reducedMotionMock.value,
}));

vi.mock('@/lib/stores', () => ({
  useLowMemoryMode: () => lowMemoryMock.value,
}));

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
}

describe('FR-SCENE-012 ParticulateDust', () => {
  beforeEach(() => {
    frameMock.callbacks = [];
    reducedMotionMock.value = false;
    lowMemoryMock.value = false;
    setViewportWidth(1280);
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 1,
    });
    window.__scene0DustState = undefined;
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('classifies viewport tiers and low-memory count caps', () => {
    expect(getDustViewportTier(390)).toBe('mobile');
    expect(getDustViewportTier(800)).toBe('tablet');
    expect(getDustViewportTier(1280)).toBe('desktop');
    expect(getDustParticleCount(1280, false)).toBe(200);
    expect(getDustParticleCount(800, false)).toBe(100);
    expect(getDustParticleCount(390, false)).toBe(50);
    expect(getDustParticleCount(1280, true)).toBe(50);
  });

  test('SSR-safe viewport and DPR helpers fall back without window', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 3,
    });
    expect(getDustDpr()).toBe(1.5);
    expect(getInitialDustViewportWidth()).toBe(1280);

    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
      writable: true,
    });

    expect(getDustDpr()).toBe(1);
    expect(getInitialDustViewportWidth()).toBe(1024);

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  test('creates deterministic typed buffers with shader lifetime ranges', () => {
    const first = createDustAttributes(200);
    const second = createDustAttributes(200);

    expect(first.positions).toBeInstanceOf(Float32Array);
    expect(first.positions).toHaveLength(600);
    expect(first.velocities).toHaveLength(600);
    expect(first.lifetimes).toHaveLength(200);
    expect(first.phases).toHaveLength(200);
    expect(first.positions[0]).toBe(second.positions[0]);
    expect(Math.min(...first.lifetimes)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...first.lifetimes)).toBeLessThanOrEqual(8);
  });

  test('uses additive blending and the glow-genie-soft token shader contract', () => {
    expect(DUST_MATERIAL_PROPS.blending).toBe(AdditiveBlending);
    expect(DUST_MATERIAL_PROPS.transparent).toBe(true);
    expect(DUST_MATERIAL_PROPS.depthWrite).toBe(false);
    expect(DUST_GLOW_TOKEN).toBe('--glow-genie-soft');
    expect(DUST_GLOW_COLOR).toEqual({ color: '#e8b523', intensity: 0.45 });
    expect(DUST_VERTEX_SHADER).toContain('fract((uTime + aPhase) / aLifetime)');
    expect(DUST_VERTEX_SHADER).toContain('smoothstep(0.5, 0.7, radial)');
    expect(DUST_FRAGMENT_SHADER).toContain('gl_FragColor = vec4(uColor, mote * vAlpha * uIntensity)');
  });

  test('returns null under reduced motion before allocating particle DOM', () => {
    reducedMotionMock.value = true;

    const { container } = render(<ParticulateDust />);

    expect(container.firstChild).toBeNull();
    expect(frameMock.callbacks).toHaveLength(0);
  });

  test('renders responsive point counts and low-memory cap', async () => {
    window.history.replaceState(null, '', '/?debug=dust');
    setViewportWidth(1280);
    const desktop = render(<ParticulateDust />);
    await waitFor(() => expect(window.__scene0DustState?.count).toBe(200));
    expect(desktop.container.querySelector('points[name="scene-0-dust"]')).toBeTruthy();
    desktop.unmount();
    window.__scene0DustState = undefined;

    setViewportWidth(800);
    const tablet = render(<ParticulateDust />);
    await waitFor(() => expect(window.__scene0DustState?.count).toBe(100));
    expect(tablet.container.querySelector('points[name="scene-0-dust"]')).toBeTruthy();
    tablet.unmount();
    window.__scene0DustState = undefined;

    lowMemoryMock.value = true;
    setViewportWidth(1280);
    const lowMemory = render(<ParticulateDust />);
    await waitFor(() => expect(window.__scene0DustState?.count).toBe(50));
    expect(lowMemory.container.querySelector('points[name="scene-0-dust"]')).toBeTruthy();
  });

  test('debug mode publishes draw-call state from the frame callback', async () => {
    window.history.replaceState(null, '', '/?debug=dust');
    render(<ParticulateDust />);

    await waitFor(() => expect(document.querySelector('[data-dust-debug]')).toBeTruthy());

    act(() => {
      frameMock.callbacks.at(-1)?.({ clock: { elapsedTime: 1.25 }, gl: { info: { render: { calls: 1 } } } });
    });

    expect(window.__scene0DustState).toEqual({
      count: 200,
      drawCalls: 1,
      dpr: 1,
      token: '--glow-genie-soft',
    });
  });

  test('frame helper mutates only the shader time uniform and debug state', () => {
    const material = { uniforms: { uTime: { value: 0 } } };

    updateDustFrame({
      count: 100,
      debugEnabled: true,
      drawCalls: 1,
      dpr: 1.5,
      elapsedTime: 4.25,
      material,
    });

    expect(material.uniforms.uTime.value).toBe(4.25);
    expect(window.__scene0DustState).toEqual({
      count: 100,
      drawCalls: 1,
      dpr: 1.5,
      token: '--glow-genie-soft',
    });
  });

  test('source guard: no React state writes or CPU position updates in useFrame', async () => {
    const source = await readFile(path.join(appRoot, 'components/scenes/scene-0-hero/ParticulateDust.tsx'), 'utf8');

    expect(source).toContain('useFrame(({ clock, gl }) => {');
    expect(source).toContain('updateDustFrame({');
    expect(source).toContain('elapsedTime: clock.elapsedTime');
    expect(source).toContain('material: materialRef.current');
    expect(source).not.toContain('setState(');
    expect(source).not.toContain('setPositions');
    expect(source).toContain('DUST_MATERIAL_PROPS');
  });
});
