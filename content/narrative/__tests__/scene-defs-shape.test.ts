import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

type SceneDef = {
  id: string;
  ordinal: number;
  title: string;
  viewportHeights: number;
  lumiRole: string;
  emotionBeat: string;
  narrativeFunction: string;
  narration_line_ids: string[];
  comp_fr_id: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const sceneDefs = JSON.parse(
  readFileSync(resolve(here, '..', 'scene-defs.json'), 'utf8'),
) as SceneDef[];

describe('FR-CMS-001 scene-defs shape', () => {
  test('contains the seven scenes plus footer in canonical order', () => {
    expect(sceneDefs.map((scene) => scene.id)).toEqual([
      'scene-0',
      'scene-1',
      'scene-2',
      'scene-3',
      'scene-4',
      'scene-5',
      'scene-6',
      'footer',
    ]);
    expect(sceneDefs.map((scene) => scene.ordinal)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test('matches the master-plan scene titles', () => {
    expect(sceneDefs.map((scene) => scene.title)).toEqual([
      'What if your will became real?',
      'Saigon, 2020.',
      'From sketch to system.',
      'How we turn will into real.',
      'Ten people. One craft.',
      'From Sài Gòn to your time zone.',
      'What do you want to make real?',
      'Trust signals + secondary nav',
    ]);
  });

  test('each scene has a narrative contract and FR cross-reference', () => {
    for (const scene of sceneDefs) {
      expect(scene.viewportHeights).toBeGreaterThan(0);
      expect(scene.lumiRole).not.toHaveLength(0);
      expect(scene.emotionBeat).not.toHaveLength(0);
      expect(scene.narrativeFunction).not.toHaveLength(0);
      expect(scene.narration_line_ids.length).toBeGreaterThan(0);
      expect(scene.comp_fr_id).toMatch(/^FR-SCENE-\d{3}$/);
    }
  });
});
