// @vitest-environment happy-dom

import React from 'react';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AnimationClip, LoopOnce, Object3D, type AnimationAction, type AnimationMixer } from 'three';
import {
  LUMI_CROSSFADE_DURATION_MS,
  LUMI_CROSSFADE_DURATION_SECONDS,
  NON_LOOP_LUMI_CLIPS,
  useLumiAnimations,
} from '../useLumiAnimations';
import { Lumi, LUMI_GLB_PATH } from '../Lumi';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const storeMock = vi.hoisted(() => {
  const state = {
    currentAnim: 'idle',
    setCurrentAnim: vi.fn((animation: string) => {
      state.currentAnim = animation;
    }),
  };
  return state;
});

const reducedMotionMock = vi.hoisted(() => ({ value: false }));

const dreiMock = vi.hoisted(() => {
  const useGLTF = Object.assign(vi.fn(), { preload: vi.fn() });
  return {
    useAnimations: vi.fn(),
    useGLTF,
  };
});

vi.mock('@react-three/drei', () => dreiMock);

vi.mock('@/lib/a11y/use-reduced-motion', () => ({
  useReducedMotion: () => reducedMotionMock.value,
}));

vi.mock('@/lib/stores', () => ({
  useLumiAnim: () => storeMock.currentAnim,
  setCurrentAnim: storeMock.setCurrentAnim,
}));

type MockAction = AnimationAction & {
  reset: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  crossFadeFrom: ReturnType<typeof vi.fn>;
  setLoop: ReturnType<typeof vi.fn>;
};

type MockMixer = AnimationMixer & {
  emitFinished: (action: AnimationAction) => void;
};

function createAction(name: string): MockAction {
  const action = {
    clampWhenFinished: false,
    reset: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    crossFadeFrom: vi.fn(),
    setLoop: vi.fn(),
    getClip: vi.fn(() => new AnimationClip(name, 1, [])),
  } as unknown as MockAction;

  action.reset.mockReturnValue(action);
  action.play.mockReturnValue(action);
  action.stop.mockReturnValue(action);
  action.crossFadeFrom.mockReturnValue(action);
  action.setLoop.mockReturnValue(action);
  return action;
}

function createMixer(): MockMixer {
  const listeners = new Map<string, Array<(event: { action?: AnimationAction }) => void>>();
  const mixer = {
    addEventListener: vi.fn((type: string, listener: (event: { action?: AnimationAction }) => void) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    }),
    removeEventListener: vi.fn((type: string, listener: (event: { action?: AnimationAction }) => void) => {
      listeners.set(
        type,
        (listeners.get(type) ?? []).filter((candidate) => candidate !== listener),
      );
    }),
    stopAllAction: vi.fn(),
    uncacheRoot: vi.fn(),
    emitFinished: (action: AnimationAction) => {
      for (const listener of listeners.get('finished') ?? []) listener({ action });
    },
  } as unknown as MockMixer;

  return mixer;
}

function arrangeAnimationMocks(
  actions: Record<string, MockAction> = { idle: createAction('idle'), fly_in: createAction('fly_in') },
) {
  const rootBone = new Object3D();
  const animations = Object.keys(actions).map((name) => new AnimationClip(name, 1, []));
  const mixer = createMixer();

  dreiMock.useAnimations.mockReturnValue({ actions, mixer });
  dreiMock.useGLTF.mockReturnValue({ scene: rootBone, animations });

  return { actions, animations, mixer, rootBone };
}

beforeEach(() => {
  storeMock.currentAnim = 'idle';
  storeMock.setCurrentAnim.mockClear();
  reducedMotionMock.value = false;
  dreiMock.useAnimations.mockReset();
  dreiMock.useGLTF.mockReset();
  dreiMock.useGLTF.preload.mockClear();
  window.__lumiAnimationEvents = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FR-SCENE-010 useLumiAnimations', () => {
  test('looks up the typed clip name and crossfades with the token-derived 200ms duration', () => {
    const { actions, animations, rootBone } = arrangeAnimationMocks();
    const idle = actions.idle!;
    const flyIn = actions.fly_in!;

    const { rerender } = renderHook(() => useLumiAnimations({ rootBone, animations }));
    expect(idle.play).toHaveBeenCalledTimes(1);

    storeMock.currentAnim = 'fly_in';
    rerender();

    expect(LUMI_CROSSFADE_DURATION_MS).toBe(200);
    expect(LUMI_CROSSFADE_DURATION_SECONDS).toBe(0.2);
    expect(flyIn.reset).toHaveBeenCalledTimes(1);
    expect(flyIn.play).toHaveBeenCalledTimes(1);
    expect(flyIn.crossFadeFrom).toHaveBeenCalledWith(
      idle,
      LUMI_CROSSFADE_DURATION_SECONDS,
      false,
    );
    expect(flyIn.setLoop).toHaveBeenCalledWith(LoopOnce, 1);
    expect(flyIn.clampWhenFinished).toBe(true);
    expect(window.__lumiAnimationEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event: 'lumi_animation_transition',
          currentAnim: 'fly_in',
          previousAnim: 'idle',
          crossfadeMs: 200,
        }),
      ]),
    );
  });

  test('switches instantly under reduced motion without crossfade', () => {
    const { actions, animations, rootBone } = arrangeAnimationMocks();
    const idle = actions.idle!;
    const flyIn = actions.fly_in!;
    reducedMotionMock.value = true;

    const { rerender } = renderHook(() => useLumiAnimations({ rootBone, animations }));
    storeMock.currentAnim = 'fly_in';
    rerender();

    expect(flyIn.crossFadeFrom).not.toHaveBeenCalled();
    expect(flyIn.play).toHaveBeenCalledTimes(1);
    expect(idle.stop).toHaveBeenCalledTimes(1);
    expect(window.__lumiAnimationEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event: 'lumi_animation_transition',
          currentAnim: 'fly_in',
          reducedMotion: true,
          crossfadeMs: 0,
        }),
      ]),
    );
  });

  test('defaults non-loop clips back to idle on mixer finished', () => {
    const { actions, animations, mixer, rootBone } = arrangeAnimationMocks();
    const flyIn = actions.fly_in!;

    renderHook(() => useLumiAnimations({ rootBone, animations }));
    mixer.emitFinished(flyIn);

    expect(NON_LOOP_LUMI_CLIPS.has('fly_in')).toBe(true);
    expect(storeMock.setCurrentAnim).toHaveBeenCalledWith('idle');
    expect(window.__lumiAnimationEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'lumi_animation_finished', currentAnim: 'fly_in' }),
      ]),
    );
  });

  test('keeps loop clips from forcing idle and cleans the mixer on unmount', () => {
    const { actions, animations, mixer, rootBone } = arrangeAnimationMocks();
    const idle = actions.idle!;
    const unknownClip = createAction('unknown_clip');

    const { unmount } = renderHook(() => useLumiAnimations({ rootBone, animations }));
    mixer.emitFinished(idle);
    mixer.emitFinished(unknownClip);
    unmount();

    expect(storeMock.setCurrentAnim).not.toHaveBeenCalledWith('idle');
    expect(mixer.stopAllAction).toHaveBeenCalledTimes(1);
    expect(mixer.uncacheRoot).toHaveBeenCalledWith(rootBone);
    expect(mixer.removeEventListener).toHaveBeenCalledWith('finished', expect.any(Function));
  });

  test('logs a dev warning and structured event when a typed clip is absent from the loaded GLB', () => {
    const { animations, rootBone } = arrangeAnimationMocks({ idle: createAction('idle') });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    storeMock.currentAnim = 'wave';

    renderHook(() => useLumiAnimations({ rootBone, animations }));

    expect(warn).toHaveBeenCalledWith('[FR-SCENE-010] no action for clip wave');
    expect(window.__lumiAnimationEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'lumi_animation_missing_clip', currentAnim: 'wave' }),
      ]),
    );
  });

  test('Lumi loads /lumi.glb and wires the returned scene through the animation picker', () => {
    const { animations, rootBone } = arrangeAnimationMocks();

    render(React.createElement(Lumi));

    expect(dreiMock.useGLTF).toHaveBeenCalledWith(LUMI_GLB_PATH);
    expect(dreiMock.useAnimations).toHaveBeenCalledWith(animations, rootBone);
  });

  test('source guard: picker is effect-driven, token-sourced, and scene-agnostic', async () => {
    const source = await readFile(path.join(appRoot, 'components/lumi/useLumiAnimations.ts'), 'utf8');

    expect(source).toContain("import { duration, ease } from '@cyberskill/ds-cinematic/tokens/motion'");
    expect(source).toContain('export type LumiAnimationsProps');
    expect(source).not.toContain('useFrame');
    expect(source).not.toContain('setState(');
    expect(source).not.toMatch(/CROSSFADE_DURATION(?:_SECONDS)?\s*=\s*0\.2/);
    expect(source).not.toMatch(/components\/scenes|scene-0|scene-1|scene-2|scene-3|scene-4|scene-5|scene-6/);
  });
});
