import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test, vi, afterEach } from 'vitest';
import { shallow } from 'zustand/shallow';
import { useLumiStore } from '../lumiStore';
import { useSceneStore } from '../sceneStore';
import { useScrollStore } from '../scrollStore';
import {
  setActiveScene,
  setFocusedCta,
  setLowMemoryMode,
  setSceneProgress,
  setScrollSnapshot,
} from '../index';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function resetStores() {
  useSceneStore.setState({
    activeScene: 0,
    lowMemoryMode: false,
    sceneProgress: {},
    transitioning: false,
  });
  useLumiStore.setState({
    currentAnim: 'idle',
    position: [0, 0, 0],
    lookAt: [0, 0, -1],
    nonlaVisible: false,
    focusedCta: null,
    emissiveBoost: 0.1,
  });
  useScrollStore.setState({ velocity: 0, direction: 'idle', lastScrollTop: 0 });
}

describe('FR-WEB-004 Zustand stores', () => {
  afterEach(() => resetStores());

  test('scene store starts at scene 0 and merges scene progress', () => {
    expect(useSceneStore.getState().activeScene).toBe(0);

    setActiveScene(3);
    setLowMemoryMode(true);
    setSceneProgress('scene-0', 0.5);
    setSceneProgress('scene-3', 2);

    expect(useSceneStore.getState().activeScene).toBe(3);
    expect(useSceneStore.getState().lowMemoryMode).toBe(true);
    expect(useSceneStore.getState().sceneProgress).toEqual({ 'scene-0': 0.5, 'scene-3': 1 });
  });

  test('lumi store actions update session-only character state', () => {
    useLumiStore.getState().setCurrentAnim('fly_in');
    useLumiStore.getState().setPosition([1, 2, 3]);
    useLumiStore.getState().setLookAt([0, 1, 0]);
    useLumiStore.getState().setNonlaVisible(true);
    setFocusedCta('buy');
    useLumiStore.getState().setEmissiveBoost(2);

    expect(useLumiStore.getState().currentAnim).toBe('fly_in');
    expect(useLumiStore.getState().position).toEqual([1, 2, 3]);
    expect(useLumiStore.getState().lookAt).toEqual([0, 1, 0]);
    expect(useLumiStore.getState().nonlaVisible).toBe(true);
    expect(useLumiStore.getState().focusedCta).toBe('buy');
    expect(useLumiStore.getState().emissiveBoost).toBe(1);
  });

  test('scroll store derives direction from discrete snapshots', () => {
    setScrollSnapshot(200, 300);
    expect(useScrollStore.getState().direction).toBe('down');

    setScrollSnapshot(120, -80);
    expect(useScrollStore.getState().direction).toBe('up');

    useScrollStore.getState().setIdle();
    expect(useScrollStore.getState().direction).toBe('idle');
  });

  test('subscribeWithSelector shallow equality suppresses equal vector updates', () => {
    const listener = vi.fn();
    const unsubscribe = useLumiStore.subscribe((state) => state.position, listener, {
      equalityFn: shallow,
    });

    useLumiStore.getState().setPosition([0, 0, 0]);
    useLumiStore.getState().setPosition([1, 0, 0]);

    unsubscribe();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('store files stay small and avoid persist middleware', async () => {
    const files = (await readdir(storeRoot)).filter((file) => file.endsWith('.ts'));

    for (const file of files) {
      const source = await readFile(path.join(storeRoot, file), 'utf8');
      expect(source.split('\n').length, `${file} exceeded 100 lines`).toBeLessThanOrEqual(100);
      expect(source).not.toMatch(/\bpersist\s*\(/);
    }
  });
});
