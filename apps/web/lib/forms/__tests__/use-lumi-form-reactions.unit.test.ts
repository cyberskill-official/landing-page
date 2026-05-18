/* @vitest-environment happy-dom */

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useSceneStore } from '@/lib/stores/sceneStore';
import { useLumiStore } from '@/lib/stores/lumiStore';
import { resolveLumiFormReaction, useLumiFormReactions } from '../use-lumi-form-reactions';

const trackEventMock = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

function stubReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    }),
  });
}

describe('FR-CTA-007 useLumiFormReactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
    trackEventMock.mockClear();
    useSceneStore.setState({ lowMemoryMode: false });
    useLumiStore.getState().resetIdle();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('maps form triggers to the expected animation contract', () => {
    expect(resolveLumiFormReaction('mount')).toMatchObject({ animation: 'mouth_smile', priority: 30 });
    expect(resolveLumiFormReaction('step_advance')).toMatchObject({ animation: 'summon', priority: 40 });
    expect(resolveLumiFormReaction('submit_success')).toMatchObject({ animation: 'wave_goodbye', priority: 60 });
    expect(resolveLumiFormReaction('submit_error')).toMatchObject({ animation: 'idle_concerned', priority: 50 });
  });

  test('fires mouth_smile on mount and restores idle on unmount', () => {
    const { unmount } = renderHook(() => useLumiFormReactions({ currentStep: 1, track: 'buy' }));

    expect(useLumiStore.getState().currentAnim).toBe('mouth_smile');
    expect(trackEventMock).toHaveBeenCalledWith('lumi_form_reaction_fired', {
      anim: 'mouth_smile',
      form_track: 'buy',
      trigger: 'mount',
    });

    unmount();
    expect(useLumiStore.getState().currentAnim).toBe('idle');
  });

  test('debounces rapid step advances into one summon reaction', async () => {
    const { rerender } = renderHook((step: number) => useLumiFormReactions({ currentStep: step, track: 'partner' }), {
      initialProps: 1,
    });

    rerender(2);
    rerender(3);
    rerender(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(199);
    });
    expect(useLumiStore.getState().currentAnim).toBe('mouth_smile');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(useLumiStore.getState().currentAnim).toBe('summon');
    expect(trackEventMock.mock.calls.filter(([name, payload]) => name === 'lumi_form_reaction_fired' && payload?.anim === 'summon')).toHaveLength(1);
  });

  test('plays wave_goodbye on success and restores idle after the clip window', async () => {
    const { rerender } = renderHook(
      (status: 'idle' | 'success') => useLumiFormReactions({ submitStatus: status, track: 'join' }),
      { initialProps: 'idle' },
    );

    rerender('success');
    expect(useLumiStore.getState().currentAnim).toBe('wave_goodbye');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500);
    });

    expect(useLumiStore.getState().currentAnim).toBe('idle');
  });

  test('does not override higher-priority scene animation', () => {
    useLumiStore.getState().setCurrentAnim('fly_in', 100);

    renderHook(() => useLumiFormReactions({ currentStep: 1, track: 'buy' }));

    expect(useLumiStore.getState().currentAnim).toBe('fly_in');
    expect(useLumiStore.getState().queue.some((queued) => queued.animation === 'mouth_smile')).toBe(true);
  });

  test('no-ops in low-memory or reduced-motion mode', () => {
    useSceneStore.setState({ lowMemoryMode: true });
    renderHook(() => useLumiFormReactions({ currentStep: 1, track: 'buy' }));
    expect(useLumiStore.getState().currentAnim).toBe('idle');

    cleanup();
    useSceneStore.setState({ lowMemoryMode: false });
    stubReducedMotion(true);
    renderHook(() => useLumiFormReactions({ currentStep: 1, track: 'buy' }));
    expect(useLumiStore.getState().currentAnim).toBe('idle');
  });
});
