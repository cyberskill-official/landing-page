/* @vitest-environment happy-dom */

import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createIdeaSparkUniforms,
  IDEA_SPARK_POSITION,
  lerpWispTowardSpark,
  WISP_DAMPING,
} from '../IdeaSpark';
import { getTypedCaptionDurationMs, TypedCaption } from '../TypedCaption';

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

describe('FR-SCENE-013 Scene 1 primitives', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('idea spark exposes the expected position, pulse uniform, and wisp damping contract', () => {
    const uniforms = createIdeaSparkUniforms();
    const next = lerpWispTowardSpark([0, 0, 0], IDEA_SPARK_POSITION, WISP_DAMPING);

    expect(IDEA_SPARK_POSITION).toEqual([0.4, 0.6, -0.2]);
    expect(uniforms.uTime.value).toBe(0);
    expect(next).toEqual([0.020000000000000004, 0.03, -0.010000000000000002]);
  });

  test('typed caption reveals at the 45 chars/sec cadence', async () => {
    render(React.createElement(TypedCaption, { charsPerSecond: 45, text: 'Saigon, 2020.' }));

    expect(screen.getByLabelText('Saigon, 2020.').textContent).toBe('|');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(getTypedCaptionDurationMs('Saigon, 2020.', 45));
    });

    expect(screen.getByLabelText('Saigon, 2020.').textContent).toBe('Saigon, 2020.');
  });

  test('typed caption renders instantly when reduced motion is active', () => {
    stubReducedMotion(true);
    render(React.createElement(TypedCaption, { text: 'Instant caption.' }));

    expect(screen.getByLabelText('Instant caption.').textContent).toBe('Instant caption.');
  });
});
