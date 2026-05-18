import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';
import { cssEase, duration, ease, prefersReducedMotion } from '../motion.js';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '..', 'motion.css'), 'utf8');
const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
    writable: true,
  });
});

describe('FR-DS-006 — motion tokens', () => {
  test('AC#2: durations match master plan §3.2', () => {
    expect(duration).toEqual({ instant: 80, swift: 240, cinematic: 720, epic: 1400 });
  });

  test('AC#3: easing curves match master plan §3.2', () => {
    expect(ease.genie).toEqual([0.22, 1, 0.36, 1]);
    expect(ease.breath).toEqual([0.45, 0, 0.55, 1]);
    expect(ease.anchor).toEqual([0.65, 0, 0.35, 1]);
  });

  test('AC#4: cssEase returns canonical cubic-bezier strings', () => {
    expect(cssEase('genie')).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(cssEase('breath')).toBe('cubic-bezier(0.45, 0, 0.55, 1)');
    expect(cssEase('anchor')).toBe('cubic-bezier(0.65, 0, 0.35, 1)');
  });

  test('AC#5: prefersReducedMotion is SSR-safe', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    expect(prefersReducedMotion(720)).toBe(720);
  });

  test('AC#6: prefersReducedMotion clamps to 1ms when requested', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { matchMedia: () => ({ matches: true }) },
      writable: true,
    });
    expect(prefersReducedMotion(720)).toBe(1);
  });

  test('AC#7 and AC#8: CSS exposes only the closed motion token set', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    const durationVars = [...css.matchAll(/--duration-(instant|swift|cinematic|epic):/g)].map((m) => m[1]);
    const easeVars = [...css.matchAll(/--ease-(genie|breath|anchor):/g)].map((m) => m[1]);
    expect(new Set(durationVars)).toEqual(new Set(['instant', 'swift', 'cinematic', 'epic']));
    expect(new Set(easeVars)).toEqual(new Set(['genie', 'breath', 'anchor']));
    expect(css).not.toMatch(/--duration-(?!instant|swift|cinematic|epic)[a-z-]+:/);
    expect(css).not.toMatch(/--ease-(?!genie|breath|anchor)[a-z-]+:/);
  });
});
