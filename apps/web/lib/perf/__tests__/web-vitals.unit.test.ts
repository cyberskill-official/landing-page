import { describe, expect, test, vi } from 'vitest';
import {
  getBreakpoint,
  getConnectionType,
  getWebVitalsSampleRate,
  reportWebVitalMetric,
  shouldSampleWebVital,
} from '../web-vitals';

describe('FR-SEO-009 web-vitals reporter', () => {
  test('classifies breakpoints and connection types', () => {
    expect(getBreakpoint(390)).toBe('mobile');
    expect(getBreakpoint(1024)).toBe('tablet');
    expect(getBreakpoint(1440)).toBe('desktop');
    expect(getConnectionType({ effectiveType: '4g' })).toBe('4g');
    expect(getConnectionType()).toBe('unknown');
  });

  test('clamps sample-rate config and samples deterministically', () => {
    expect(getWebVitalsSampleRate('2')).toBe(1);
    expect(getWebVitalsSampleRate('-1')).toBe(0);
    expect(getWebVitalsSampleRate('0.1')).toBe(0.1);
    expect(shouldSampleWebVital(0.5, () => 0.49)).toBe(true);
    expect(shouldSampleWebVital(0.5, () => 0.5)).toBe(false);
  });

  test('reports supported metrics through typed analytics payloads', () => {
    const track = vi.fn();
    expect(reportWebVitalMetric(
      { name: 'LCP', rating: 'good', value: 1400 },
      {
        connection: '4g',
        pathname: '/vi',
        random: () => 0,
        sampleRate: 1,
        track,
        width: 390,
      },
    )).toBe(true);

    expect(track).toHaveBeenCalledWith('web_vitals', {
      breakpoint: 'mobile',
      connection: '4g',
      metric_name: 'LCP',
      locale: 'vi',
      rating: 'good',
      route: '/vi',
      value: 1400,
    });
  });

  test('normalizes case-study routes for RUM dashboard segments', () => {
    const track = vi.fn();
    expect(reportWebVitalMetric(
      { name: 'INP', rating: 'needs-improvement', value: 240 },
      {
        connection: '3g',
        pathname: '/vi/work/sample',
        random: () => 0,
        sampleRate: 1,
        track,
        width: 1024,
      },
    )).toBe(true);

    expect(track).toHaveBeenCalledWith('web_vitals', expect.objectContaining({
      breakpoint: 'tablet',
      locale: 'vi',
      route: '/vi/work/*',
    }));
  });

  test('skips unsupported metrics and sample misses', () => {
    expect(reportWebVitalMetric({ name: 'FID', value: 10 }, { track: vi.fn() })).toBe(false);
    expect(reportWebVitalMetric(
      { name: 'CLS', value: 0.02 },
      { random: () => 0.9, sampleRate: 0.1, track: vi.fn() },
    )).toBe(false);
  });
});
