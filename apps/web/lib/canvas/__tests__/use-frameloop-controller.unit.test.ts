/* @vitest-environment happy-dom */

import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useLumiStore } from '@/lib/stores/lumiStore';
import { useSceneStore } from '@/lib/stores/sceneStore';
import { useScrollStore } from '@/lib/stores/scrollStore';
import {
  FRAMELOOP_IDLE_TAIL_MS,
  isContinuousLumiAnimation,
  sceneHasContinuousParticles,
  useFrameloopController,
} from '../use-frameloop-controller';

const setFrameloopMock = vi.fn();
const invalidateMock = vi.fn();

vi.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: { setFrameloop: typeof setFrameloopMock; invalidate: typeof invalidateMock }) => unknown) =>
    selector({ setFrameloop: setFrameloopMock, invalidate: invalidateMock }),
}));

describe('FR-PERF-003 useFrameloopController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setFrameloopMock.mockClear();
    invalidateMock.mockClear();
    useLumiStore.setState({ currentAnim: 'idle' });
    useSceneStore.setState({ activeScene: 1, transitioning: false });
    useScrollStore.setState({ velocity: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns to demand after the idle tail clears', () => {
    renderHook(() => useFrameloopController());

    act(() => vi.advanceTimersByTime(FRAMELOOP_IDLE_TAIL_MS + 1));

    expect(setFrameloopMock).toHaveBeenCalledWith('demand');
    expect(invalidateMock).toHaveBeenCalled();
  });

  test('flips to always for active animation, transition, scroll, or particles', () => {
    expect(isContinuousLumiAnimation('wave_goodbye')).toBe(true);
    expect(isContinuousLumiAnimation('idle')).toBe(false);
    expect(sceneHasContinuousParticles(0)).toBe(true);

    useLumiStore.setState({ currentAnim: 'wave_goodbye' });
    renderHook(() => useFrameloopController());

    expect(setFrameloopMock).toHaveBeenCalledWith('always');
  });

  test('transitioning forces always mode without waiting for the tail', () => {
    useSceneStore.setState({ transitioning: true });

    renderHook(() => useFrameloopController());

    expect(setFrameloopMock).toHaveBeenCalledWith('always');
  });
});
