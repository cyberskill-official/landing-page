import { afterEach, describe, expect, test, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAX_PRELOAD_AHEAD,
  getScenePreloadStates,
  preloadScene,
  resetScenePreloadState,
  resolvePreloadTargets,
} from '../../lib/scene-preload-chain';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('FR-WEB-006 scene preload chain', () => {
  afterEach(() => {
    resetScenePreloadState();
    vi.restoreAllMocks();
  });

  test('resolves one next scene when scrolling down or idle', () => {
    expect(resolvePreloadTargets(2, 'down')).toEqual(['/scene-3.glb']);
    expect(resolvePreloadTargets(2, 'idle')).toEqual(['/scene-3.glb']);
    expect(resolvePreloadTargets(2, 'down')).toHaveLength(MAX_PRELOAD_AHEAD);
  });

  test('resolves one previous scene when scrolling up', () => {
    expect(resolvePreloadTargets(4, 'up')).toEqual(['/scene-3.glb']);
  });

  test('is bounds-safe', () => {
    expect(resolvePreloadTargets(6, 'down')).toEqual([]);
    expect(resolvePreloadTargets(0, 'up')).toEqual([]);
  });

  test('preloadScene is idempotent', async () => {
    const preload = vi.fn();

    await preloadScene('/scene-1.glb', preload);
    await preloadScene('/scene-1.glb', preload);

    expect(preload).toHaveBeenCalledTimes(1);
    expect(getScenePreloadStates()['/scene-1.glb']).toBe('preloaded');
  });

  test('preloadScene logs failures without throwing and allows retry', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const preload = vi.fn()
      .mockRejectedValueOnce(new Error('missing'))
      .mockResolvedValueOnce(undefined);

    await preloadScene('/scene-2.glb', preload);
    await preloadScene('/scene-2.glb', preload);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(preload).toHaveBeenCalledTimes(2);
    expect(getScenePreloadStates()['/scene-2.glb']).toBe('preloaded');
  });

  test('CanvasMount preloads Lumi at module evaluation and ScenePreloader uses active-scene direction', async () => {
    const canvasMount = await readFile(path.join(appRoot, 'components/canvas/CanvasMount.tsx'), 'utf8');
    const scenePreloader = await readFile(path.join(appRoot, 'components/canvas/ScenePreloader.tsx'), 'utf8');

    expect(canvasMount).toContain("preloadGltfWithLocalDecoders('/lumi.glb').catch");
    expect(scenePreloader).toContain('resolvePreloadTargets(activeScene, direction)');
    expect(scenePreloader).toContain('void preloadScene(target)');
  });
});
