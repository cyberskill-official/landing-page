import { describe, expect, test } from 'vitest';
import {
  ALERT_THRESHOLD_PCT,
  buildRumEventName,
  localeFromPathname,
  normalizeRumRoute,
  percentile,
  ROLLING_WINDOW_DAYS,
  RUM_DASHBOARD_PANELS,
  RUM_TARGETS,
  shouldAlertRegression,
  summarizeRumMetric,
} from '../rum-dashboard-config';

describe('FR-PERF-011 RUM dashboard config', () => {
  test('uses CWV-aligned targets and a 10 percent regression threshold', () => {
    expect(RUM_TARGETS.LCP).toEqual({ good: 2500, needs_improvement: 4000 });
    expect(RUM_TARGETS.INP).toEqual({ good: 200, needs_improvement: 500 });
    expect(RUM_TARGETS.CLS).toEqual({ good: 0.1, needs_improvement: 0.25 });
    expect(ALERT_THRESHOLD_PCT).toBe(10);
    expect(ROLLING_WINDOW_DAYS).toBe(7);
  });

  test('normalizes route and locale segments', () => {
    expect(normalizeRumRoute('/work/sample')).toBe('/work/*');
    expect(normalizeRumRoute('/vi/work/sample')).toBe('/vi/work/*');
    expect(localeFromPathname('/vi/accessibility')).toBe('vi');
    expect(localeFromPathname('/accessibility')).toBe('en');
  });

  test('builds Plausible custom event names', () => {
    expect(buildRumEventName('LCP')).toBe('web-vitals/LCP');
    expect(buildRumEventName('INP')).toBe('web-vitals/INP');
  });

  test('summarizes p50, p75, and p90 percentiles', () => {
    expect(percentile([100, 200, 300, 400], 75)).toBe(300);
    expect(summarizeRumMetric('LCP', [1000, 1800, 2200, 3000], {
      breakpoint: 'mobile',
      connection: '4g',
      locale: 'vi',
      route: '/vi',
    })).toMatchObject({
      percentiles: { p50: 1800, p75: 2200, p90: 3000 },
      sample_size: 4,
    });
  });

  test('alerts only when regression is above threshold and documents required panels', () => {
    expect(shouldAlertRegression(111, 100)).toBe(true);
    expect(shouldAlertRegression(109, 100)).toBe(false);
    expect(RUM_DASHBOARD_PANELS).toContain('EN vs VI locale comparison');
  });
});
