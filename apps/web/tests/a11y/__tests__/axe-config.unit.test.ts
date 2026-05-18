import { describe, expect, test } from 'vitest';
import {
  assertNoExpiredExclusions,
  blockingViolations,
  exclusionAppliesToRoute,
  isExpiryValid,
  loadAxeExclusions,
  validateAxeExclusions,
  WCAG_TAGS,
  type AxeExclusion,
  type AxeViolation,
} from '../axe-config';

describe('FR-OPS-012 axe config', () => {
  test('uses WCAG 2.2 AA tags for the blocking gate', () => {
    expect(WCAG_TAGS).toEqual(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa']);
  });

  test('loads and validates documented exclusions', () => {
    const exclusions = loadAxeExclusions();

    expect(Array.isArray(exclusions)).toBe(true);
    expect(() => validateAxeExclusions(exclusions, new Date('2026-05-17T00:00:00Z'))).not.toThrow();
  });

  test('validates supported expiry formats and fails expired dates', () => {
    expect(isExpiryValid('p5')).toBe(true);
    expect(isExpiryValid('p6')).toBe(true);
    expect(isExpiryValid('permanent')).toBe(true);
    expect(isExpiryValid('2026-08-01')).toBe(true);
    expect(isExpiryValid('soon')).toBe(false);

    const expired: AxeExclusion = {
      expiry: '2026-01-01',
      justification: 'Synthetic expired exclusion used to prove CI fails stale waivers.',
      ruleId: 'color-contrast',
      scope: 'all',
      selector: '.expired',
    };
    expect(() => assertNoExpiredExclusions([expired], new Date('2026-05-17T00:00:00Z'))).toThrow(/Expired axe exclusions/);
  });

  test('matches exclusions by route scope', () => {
    const scoped: AxeExclusion = {
      expiry: 'p5',
      justification: 'Synthetic scoped exclusion.',
      ruleId: 'aria-hidden-focus',
      scope: ['/lite'],
      selector: 'canvas',
    };
    const global: AxeExclusion = { ...scoped, scope: 'all' };

    expect(exclusionAppliesToRoute(scoped, '/lite')).toBe(true);
    expect(exclusionAppliesToRoute(scoped, '/')).toBe(false);
    expect(exclusionAppliesToRoute(global, '/')).toBe(true);
  });

  test('only serious and critical violations block the gate', () => {
    const violations = [
      { id: 'minor', impact: 'minor', help: '', helpUrl: '', nodes: [] },
      { id: 'moderate', impact: 'moderate', help: '', helpUrl: '', nodes: [] },
      { id: 'serious', impact: 'serious', help: '', helpUrl: '', nodes: [] },
      { id: 'critical', impact: 'critical', help: '', helpUrl: '', nodes: [] },
    ] as AxeViolation[];

    expect(blockingViolations(violations).map((violation) => violation.id)).toEqual(['serious', 'critical']);
  });
});
