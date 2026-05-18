/* @vitest-environment happy-dom */

import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { preloadGltfWithLocalDecoders } from '@/lib/canvas/decoder-config';
import { Scene0HeroCanvas } from '../Scene0HeroCanvas';

vi.mock('@/lib/canvas/decoder-config', () => ({
  preloadGltfWithLocalDecoders: vi.fn(() => Promise.resolve()),
}));

vi.mock('../ParticulateDust', () => ({
  ParticulateDust: () => <points data-scene-0-dust data-particle-count="200" />,
}));

describe('Scene0HeroCanvas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('React', React);
    vi.mocked(preloadGltfWithLocalDecoders).mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('preloads the mocked Lumi GLB contract and signals readiness on the next frame', async () => {
    const onReady = vi.fn();
    render(<Scene0HeroCanvas onReady={onReady} />);

    expect(preloadGltfWithLocalDecoders).toHaveBeenCalledWith('/lumi.glb');
    expect(document.querySelector('mesh[name="scene-0-hero-lumi-mock-contract"]')).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  test('logs preload failures without blocking the mocked mesh contract', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.mocked(preloadGltfWithLocalDecoders).mockRejectedValueOnce(new Error('missing asset'));

    render(<Scene0HeroCanvas onReady={() => undefined} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(warn).toHaveBeenCalledWith(
      '[scene-0] preload failed: /lumi.glb',
      expect.any(Error),
    );
    expect(document.querySelector('mesh[name="scene-0-hero-lumi-mock-contract"]')).toBeTruthy();
    warn.mockRestore();
  });
});
