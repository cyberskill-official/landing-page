/* @vitest-environment happy-dom */

import { describe, expect, test } from 'vitest';
import {
  SCENE_RANGES,
  getActiveSceneFromScrollY,
  getIntersectingSceneId,
  getSceneProgress,
  getSceneProgressMap,
} from '../scene-timeline';

describe('FR-SCENE-020 scene timeline helpers', () => {
  test('defines scene ranges from hero through footer', () => {
    expect(SCENE_RANGES.map((range) => range.id)).toEqual([
      'scene-0-hero',
      'scene-1-origin',
      'scene-2-transformation',
      'scene-3-capabilities',
      'scene-4-team',
      'scene-5-vietnam-global',
      'scene-6-cta-hub',
      'footer',
    ]);
    expect(SCENE_RANGES[0]).toMatchObject({ index: 0, startVh: 0, endVh: 100 });
    expect(SCENE_RANGES[7]).toMatchObject({ index: 7, startVh: 700, endVh: 800 });
  });

  test('resolves active scenes and local progress from scroll position', () => {
    expect(getActiveSceneFromScrollY(0, 1000).id).toBe('scene-0-hero');
    expect(getActiveSceneFromScrollY(3500, 1000).id).toBe('scene-3-capabilities');
    expect(getActiveSceneFromScrollY(9000, 1000).id).toBe('footer');
    expect(getSceneProgress('scene-2-transformation', 2500, 1000)).toBe(0.5);
    expect(getSceneProgress('scene-2-transformation', 500, 1000)).toBe(0);
    expect(getSceneProgress('scene-2-transformation', 3500, 1000)).toBe(1);
    expect(getSceneProgressMap(6500, 1000)['scene-6-cta-hub']).toBe(0.5);
  });

  test('selects the highest-ratio intersecting scene at the 50 percent threshold', () => {
    const scene4 = document.createElement('section');
    scene4.dataset.sceneId = 'scene-4-team';
    const scene5 = document.createElement('section');
    scene5.dataset.sceneId = 'scene-5-vietnam-global';

    expect(
      getIntersectingSceneId([
        { target: scene4, isIntersecting: true, intersectionRatio: 0.51 },
        { target: scene5, isIntersecting: true, intersectionRatio: 0.72 },
      ]),
    ).toBe('scene-5-vietnam-global');
    expect(getIntersectingSceneId([{ target: scene4, isIntersecting: true, intersectionRatio: 0.2 }])).toBeNull();
  });
});
