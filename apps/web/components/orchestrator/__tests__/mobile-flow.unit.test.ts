import { describe, expect, test, vi } from 'vitest';
import {
  MOBILE_BREAKPOINT_QUERY,
  MOBILE_SCENE_RANGES,
  isMobileViewport,
} from '../mobile-scene-ranges';
import {
  getActiveSceneRanges,
  getMergedSceneDwellMs,
  getMobileMappedSceneId,
} from '../MobileSceneFlow';

describe('FR-SCENE-021 mobile scene flow', () => {
  test('defines five mobile cinematic ranges plus footer and keeps Scene 5 isolated', () => {
    expect(MOBILE_SCENE_RANGES).toHaveLength(6);
    expect(MOBILE_SCENE_RANGES.map((range) => range.id)).toEqual([
      'scene-0-hero',
      'scene-1-2-merged',
      'scene-3-4-merged',
      'scene-5-vietnam-global',
      'scene-6-cta-hub',
      'footer',
    ]);
    expect(MOBILE_SCENE_RANGES.find((range) => range.id === 'scene-5-vietnam-global')).toMatchObject({
      startVh: 300,
      endVh: 400,
    });
  });

  test('maps desktop scenes into mobile merged scenes without touching Scene 5', () => {
    expect(getMobileMappedSceneId('scene-1-origin', true)).toBe('scene-1-2-merged');
    expect(getMobileMappedSceneId('scene-2-transformation', true)).toBe('scene-1-2-merged');
    expect(getMobileMappedSceneId('scene-3-capabilities', true)).toBe('scene-3-4-merged');
    expect(getMobileMappedSceneId('scene-4-team', true)).toBe('scene-3-4-merged');
    expect(getMobileMappedSceneId('scene-5-vietnam-global', true)).toBe('scene-5-vietnam-global');
    expect(getMergedSceneDwellMs('scene-1-2-merged')).toBe(3_000);
  });

  test('selects mobile or desktop ranges from the breakpoint query', () => {
    const matchMedia = vi.fn((query: string) => ({ matches: query === MOBILE_BREAKPOINT_QUERY }));

    expect(isMobileViewport(matchMedia as unknown as Window['matchMedia'])).toBe(true);
    expect(getActiveSceneRanges(true)).toBe(MOBILE_SCENE_RANGES);
    expect(getActiveSceneRanges(false)).not.toBe(MOBILE_SCENE_RANGES);
  });
});
