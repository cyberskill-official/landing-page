import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { boxShadowGlow, filterDropShadow, glow, glowAsThreeColor } from '../glow.js';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '..', 'glow.css'), 'utf8');

describe('FR-DS-008 — glow recipes', () => {
  test('AC#1 and AC#4: exactly three glow recipes match master plan §3.2', () => {
    expect(glow).toEqual({
      genie_rim: 'rgba(255, 196, 64, 0.85)',
      genie_soft: 'rgba(232, 181, 35, 0.45)',
      scene_edge: 'rgba(232, 181, 35, 0.15)',
    });
    expect(Object.keys(glow)).toHaveLength(3);
  });

  test('AC#2: CSS helper strings are stable', () => {
    expect(boxShadowGlow('genie_rim')).toBe('0 0 16px 0px rgba(255, 196, 64, 0.85)');
    expect(boxShadowGlow('genie_soft', 24, 2)).toBe('0 0 24px 2px rgba(232, 181, 35, 0.45)');
    expect(filterDropShadow('scene_edge')).toBe('drop-shadow(0 0 8px rgba(232, 181, 35, 0.15))');
  });

  test('AC#3: Three.js adapter splits rgba into hex color and intensity', () => {
    expect(glowAsThreeColor('genie_rim')).toEqual({ color: '#ffc440', intensity: 0.85 });
    expect(glowAsThreeColor('genie_soft')).toEqual({ color: '#e8b523', intensity: 0.45 });
    expect(glowAsThreeColor('scene_edge')).toEqual({ color: '#e8b523', intensity: 0.15 });
  });

  test('AC#5: CSS declares exactly the three glow variables', () => {
    const vars = [...css.matchAll(/^\s*(--glow-[\w-]+):/gm)].map((match) => match[1]);
    expect(vars).toEqual(['--glow-genie-rim', '--glow-genie-soft', '--glow-scene-edge']);
  });

  test('AC#6: helpers are SSR-safe', () => {
    expect(() => boxShadowGlow('genie_rim')).not.toThrow();
    expect(() => filterDropShadow('genie_soft')).not.toThrow();
    expect(() => glowAsThreeColor('scene_edge')).not.toThrow();
  });
});
