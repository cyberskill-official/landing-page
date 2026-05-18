import { afterEach, describe, expect, test, vi } from 'vitest';
import { resetScenePreloadState } from '@/lib/scene-preload-chain';
import {
  PRELOAD_OBSERVER_OPTIONS,
  preloadNextScene,
  shouldSkipPreload,
} from '../use-preload-next';
import { MAX_TOTAL_PRELOAD_BYTES, totalPreloadBytes } from '../preload-manifest';

function fakeFetch(bytes: number) {
  return vi.fn(async () => ({
    blob: async () => ({ size: bytes }),
  })) as unknown as typeof fetch;
}

describe('FR-PERF-004 preload next scene', () => {
  afterEach(() => {
    resetScenePreloadState();
    vi.restoreAllMocks();
  });

  test('uses 200% rootMargin and 50% threshold', () => {
    expect(PRELOAD_OBSERVER_OPTIONS).toEqual({ rootMargin: '200%', threshold: 0.5 });
  });

  test('preloads only the next scene asset and instruments analytics', async () => {
    const preload = vi.fn();
    const track = vi.fn();
    const fetchImpl = fakeFetch(1234);

    await expect(preloadNextScene(0, { fetchImpl, preload, track })).resolves.toEqual({
      status: 'started',
      url: '/scene-1.glb',
    });

    expect(preload).toHaveBeenCalledTimes(1);
    expect(preload).toHaveBeenCalledWith('/scene-1.glb');
    expect(track).toHaveBeenCalledWith('preload_started', { scene: 0, url: '/scene-1.glb' });
    expect(track).toHaveBeenCalledWith('preload_completed', expect.objectContaining({
      bytes: 1234,
      scene: 0,
      url: '/scene-1.glb',
    }));
  });

  test('skips save-data, 2G, low-memory, and terminal scenes', async () => {
    expect(shouldSkipPreload({ connection: { saveData: true } })).toBe('save_data');
    expect(shouldSkipPreload({ connection: { effectiveType: '2g' } })).toBe('slow_connection');
    expect(shouldSkipPreload({ lowMemoryMode: true })).toBe('low_memory');
    await expect(preloadNextScene(6, { preload: vi.fn(), fetchImpl: fakeFetch(1) })).resolves.toEqual({
      status: 'skipped',
      reason: 'no_next_scene',
    });
  });

  test('keeps total declared preloads below 5 MB', () => {
    expect(totalPreloadBytes()).toBeLessThan(MAX_TOTAL_PRELOAD_BYTES);
  });
});

