import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  canTransition,
  getStageHistory,
  LifecycleBadge,
  LIFECYCLE_RULES,
  LIFECYCLE_STAGE,
} from '../lifecycle.js';

const here = dirname(fileURLToPath(import.meta.url));
const tableMd = readFileSync(resolve(here, '..', '..', 'MIGRATION_TABLE.md'), 'utf8');

describe('FR-DS-009 — lifecycle marker', () => {
  test('AC#1: stage starts at Experimental', () => {
    expect(LIFECYCLE_STAGE).toBe('Experimental');
  });

  test('AC#2: rules match master plan §12.1', () => {
    expect(LIFECYCLE_RULES.experimental_to_stable_min_days).toBe(28);
    expect(LIFECYCLE_RULES.stable_to_promoted_min_days).toBe(180);
    expect(LIFECYCLE_RULES.deprecation_sunset_days).toBe(90);
    expect(LIFECYCLE_RULES.promoted_min_consumers).toBe(2);
  });

  test('AC#3 and AC#4: canTransition gates by stage, days, and consumers', () => {
    expect(canTransition('Experimental', 'Stable', 27)).toBe(false);
    expect(canTransition('Experimental', 'Stable', 28)).toBe(true);
    expect(canTransition('Stable', 'Promoted', 200, 1)).toBe(false);
    expect(canTransition('Stable', 'Promoted', 200, 2)).toBe(true);
    expect(canTransition('Experimental', 'Promoted', 999, 99)).toBe(false);
    expect(canTransition('Promoted', 'Deprecated', 0)).toBe(true);
  });

  test('AC#5: migration table is parseable', () => {
    const colorsHistory = getStageHistory('colors', tableMd);
    expect(colorsHistory).toEqual([
      expect.objectContaining({
        componentId: 'colors',
        stage: 'Experimental',
        enteredAt: '2026-05-17',
        consumerCount: 1,
      }),
    ]);
  });

  test('AC#7: LifecycleBadge renders a Storybook-friendly pill without React', () => {
    expect(LifecycleBadge({ stage: 'Experimental' })).toContain('data-lifecycle-stage="Experimental"');
    expect(LifecycleBadge({ stage: 'Stable', label: '<Stable>' })).toContain('&lt;Stable&gt;');
  });
});
