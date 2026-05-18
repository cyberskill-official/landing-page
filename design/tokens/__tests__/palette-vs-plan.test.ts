import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const palette = JSON.parse(
  readFileSync(resolve(here, '..', 'palette-canonical.json'), 'utf8'),
) as Record<string, Record<string, string>>;
const matrix = JSON.parse(
  readFileSync(resolve(here, '..', 'wcag-contrast-matrix.json'), 'utf8'),
) as Array<{ fg: string; bg: string; verdict: string; notes: string }>;

const expected = {
  gold: {
    '50': '#FEF6D9',
    '100': '#FCEAA8',
    '200': '#F9D966',
    '400': '#E8B523',
    '500': '#C99317',
    '600': '#9F730E',
  },
  brown: {
    '50': '#F4E5D6',
    '100': '#DDB995',
    '200': '#A36A3F',
    '400': '#6E3A18',
    '500': '#4A2208',
    '700': '#2C1304',
  },
  accent: {
    flag_red: '#DA251D',
    star_yellow: '#FFEB3B',
  },
};

describe('FR-DS-002 palette contract', () => {
  test('matches the master-plan hex values byte-for-byte', () => {
    expect(palette.gold).toEqual(expected.gold);
    expect(palette.brown).toEqual(expected.brown);
    expect(palette.accent).toEqual(expected.accent);
  });

  test('includes required WCAG matrix pairings', () => {
    const requiredPairs = [
      'gold.200/brown.500',
      'gold.400/brown.500',
      'gold.400/brown.700',
      'gold.200/brown.700',
      'brown.700/gold.400',
      'accent.flag_red/brown.700',
      'accent.star_yellow/accent.flag_red',
      'gold.400/brown.400',
      'gold.100/brown.500',
    ];
    const actualPairs = new Set(matrix.map((row) => `${row.fg}/${row.bg}`));
    for (const pair of requiredPairs) {
      expect(actualPairs.has(pair)).toBe(true);
    }
  });

  test('documents restrictions for partial and forbidden pairs', () => {
    for (const row of matrix) {
      if (row.verdict === 'PARTIAL' || row.verdict === 'FORBIDDEN') {
        expect(row.notes).not.toHaveLength(0);
      }
    }
  });
});
