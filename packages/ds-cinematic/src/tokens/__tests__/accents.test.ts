import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { accent, assertSceneAllowsAccent, SCOPED } from '../accents.js';

type Palette = {
  accent: {
    flag_red: `#${string}`;
    star_yellow: `#${string}`;
  };
};

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..', '..', '..');
const palette = JSON.parse(
  readFileSync(resolve(root, 'design', 'tokens', 'palette-canonical.json'), 'utf8'),
) as Palette;
const css = readFileSync(resolve(here, '..', 'accents.css'), 'utf8');

function scopedValueForScene(sceneId: string | undefined, varName: string): string {
  if (!sceneId) return '';
  const allowed = [
    `[data-scene="${sceneId}"]`,
    sceneId === 'scene-6' || sceneId === 'footer' ? '[data-scene-after="scene-5"]' : '',
  ].filter(Boolean);
  if (!allowed.some((selector) => css.includes(selector))) return '';
  const match = css.match(new RegExp(`${varName}:\\s*(#[0-9A-F]{6});`));
  return match?.[1] ?? '';
}

describe('FR-DS-005 — Scene-5-scoped accent tokens', () => {
  test('AC#1: accent tokens match canonical palette', () => {
    expect(accent).toEqual(palette.accent);
    expect(SCOPED).toBe(true);
  });

  test('AC#2 and AC#3: CSS is selector-scoped and never declared at root', () => {
    expect(css).not.toMatch(/:root/);
    expect(css.match(/\[data-scene=/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(css).toContain('[data-scene-after="scene-5"]');
  });

  test('AC#4: runtime guard rejects pre-Scene-5 surfaces', () => {
    expect(() => assertSceneAllowsAccent('scene-0')).toThrow('[FR-DS-005]');
    expect(() => assertSceneAllowsAccent('scene-4')).toThrow('[FR-DS-005]');
    expect(() => assertSceneAllowsAccent('scene-5')).not.toThrow();
    expect(() => assertSceneAllowsAccent('scene-6')).not.toThrow();
    expect(() => assertSceneAllowsAccent('footer')).not.toThrow();
  });

  test('AC#5: CSS cascade simulation has no pre-Scene-5 variable leakage', () => {
    expect(scopedValueForScene(undefined, '--accent-flag-red')).toBe('');
    for (const scene of ['scene-0', 'scene-1', 'scene-2', 'scene-3', 'scene-4']) {
      expect(scopedValueForScene(scene, '--accent-flag-red')).toBe('');
    }
    expect(scopedValueForScene('scene-5', '--accent-flag-red')).toBe('#DA251D');
    expect(scopedValueForScene('scene-5', '--accent-star-yellow')).toBe('#FFEB3B');
  });
});
