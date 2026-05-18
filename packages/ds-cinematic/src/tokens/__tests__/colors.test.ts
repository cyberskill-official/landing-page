import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { brown, gold } from '../colors.js';

type Palette = {
  gold: Record<string, `#${string}`>;
  brown: Record<string, `#${string}`>;
};

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..', '..', '..');
const palette = JSON.parse(
  readFileSync(resolve(root, 'design', 'tokens', 'palette-canonical.json'), 'utf8'),
) as Palette;
const css = readFileSync(resolve(here, '..', 'colors.css'), 'utf8');
const ts = readFileSync(resolve(here, '..', 'colors.ts'), 'utf8');

function parseCssVars(source: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of source.matchAll(/--brand-(gold|brown)-(\d+):\s*(#[0-9A-F]{6});/g)) {
    const [, ramp, key, value] = match;
    if (ramp && key && value) vars[`${ramp}.${key}`] = value;
  }
  return vars;
}

describe('FR-DS-004 — color tokens', () => {
  test('AC#3: TS gold and brown ramps match canonical JSON', () => {
    expect(gold).toEqual(palette.gold);
    expect(brown).toEqual(palette.brown);
  });

  test('AC#4: CSS custom properties match canonical JSON', () => {
    const vars = parseCssVars(css);
    for (const [key, value] of Object.entries(palette.gold)) {
      expect(vars[`gold.${key}`]).toBe(value);
    }
    for (const [key, value] of Object.entries(palette.brown)) {
      expect(vars[`brown.${key}`]).toBe(value);
    }
  });

  test('AC#5: generated headers are present', () => {
    expect(ts.startsWith('// GENERATED')).toBe(true);
    expect(css.startsWith('/* GENERATED')).toBe(true);
  });

  test('AC#7: no off-palette hex values appear in generated outputs', () => {
    const canonical = new Set<string>([...Object.values(palette.gold), ...Object.values(palette.brown)]);
    const emitted = [...`${ts}\n${css}`.matchAll(/#[0-9A-F]{6}/g)].map((match) => match[0]);
    for (const hex of emitted) {
      expect(canonical.has(hex)).toBe(true);
    }
  });
});
