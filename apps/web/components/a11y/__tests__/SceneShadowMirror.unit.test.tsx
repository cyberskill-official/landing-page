/* @vitest-environment happy-dom */

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  formatSceneAnnouncement,
  SCENE_SHADOW_MIRRORS,
  SceneShadowMirror,
  SceneShadowMirrorSet,
} from '../SceneShadowMirror';
import { useSceneStore } from '@/lib/stores/sceneStore';

describe('FR-A11Y-002 SceneShadowMirror', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSceneStore.setState({ activeScene: 0 });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('formats narration with scene position context', () => {
    expect(formatSceneAnnouncement(2, 8, 'A product appears.')).toBe('Scene 3 of 8: A product appears.');
  });

  test('renders role=img with labelled heading, described narration, and focusability', async () => {
    render(
      <SceneShadowMirror
        altDescription="Fallback visual description."
        narration="Narration."
        sceneId={0}
        title="Scene title"
      />,
    );

    await vi.advanceTimersByTimeAsync(500);

    const mirror = screen.getByRole('img', { name: 'Scene title' });
    const describedBy = mirror.getAttribute('aria-describedby') ?? '';
    expect(mirror.getAttribute('tabindex')).toBe('0');
    expect(mirror.classList.contains('visually-hidden')).toBe(true);
    expect(describedBy).toContain('scene-0-shadow-narration');
    expect(screen.getByText('Scene 1 of 8: Narration.').getAttribute('aria-atomic')).toBe('true');
    expect(screen.getByText('Scene 1 of 8: Narration.').getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText('Fallback visual description.')).toBeTruthy();
  });

  test('renders all eight mirrors and marks canvases aria-hidden', async () => {
    document.body.innerHTML = '<canvas></canvas>';
    render(<SceneShadowMirrorSet locale="en" />);

    await vi.advanceTimersByTimeAsync(0);

    expect(screen.getAllByRole('img')).toHaveLength(SCENE_SHADOW_MIRRORS.length);
    expect(document.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('visible mode removes the visually-hidden utility for lite output', () => {
    render(<SceneShadowMirrorSet locale="en" visible />);

    const firstMirror = screen.getAllByRole('img')[0];
    expect(firstMirror).toBeDefined();
    if (!firstMirror) return;
    expect(firstMirror.classList.contains('scene-shadow-mirror--visible')).toBe(true);
    expect(firstMirror.classList.contains('visually-hidden')).toBe(false);
  });
});
