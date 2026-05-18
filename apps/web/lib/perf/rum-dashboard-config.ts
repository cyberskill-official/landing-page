import type { Breakpoint, LocaleValue } from '@/lib/analytics/events';

export type RumMetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type RumPercentiles = {
  p50: number;
  p75: number;
  p90: number;
};

export type RumSegment = {
  breakpoint: Breakpoint;
  connection: string;
  locale: LocaleValue;
  route: string;
};

export type RumMetric = {
  name: RumMetricName;
  percentiles: RumPercentiles;
  sample_size: number;
  segment: RumSegment;
};

export const RUM_METRICS = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'] as const satisfies readonly RumMetricName[];

export const RUM_TARGETS = {
  CLS: { good: 0.1, needs_improvement: 0.25 },
  FCP: { good: 1800, needs_improvement: 3000 },
  INP: { good: 200, needs_improvement: 500 },
  LCP: { good: 2500, needs_improvement: 4000 },
  TTFB: { good: 800, needs_improvement: 1800 },
} as const satisfies Record<RumMetricName, { good: number; needs_improvement: number }>;

export const ALERT_THRESHOLD_PCT = 10;
export const ROLLING_WINDOW_DAYS = 7;
export const PLAUSIBLE_SITE_ID = 'cyberskill.world';
export const PLAUSIBLE_SHARE_URL_PLACEHOLDER = 'https://plausible.io/share/cyberskill.world?auth=<token>';

export const RUM_DASHBOARD_PANELS = [
  'LCP p50/p75/p90 by route, 7-day rolling window',
  'INP p50/p75/p90 by route, 7-day rolling window',
  'CLS p50/p75/p90 by route, 7-day rolling window',
  'Mobile/tablet/desktop comparison by metric',
  'Connection comparison: 3g, 4g, wifi, unknown',
  'EN vs VI locale comparison',
  'Synthetic Lighthouse p75 correlation notes',
] as const;

export function buildRumEventName(metric: RumMetricName) {
  return `web-vitals/${metric}`;
}

export function localeFromPathname(pathname: string): LocaleValue {
  return pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : 'en';
}

export function normalizeRumRoute(pathname: string) {
  if (pathname === '/' || pathname === '/vi') return pathname;
  if (pathname === '/lite' || pathname === '/vi/lite') return pathname;
  if (pathname === '/accessibility' || pathname === '/vi/accessibility') return pathname;
  if (pathname.startsWith('/vi/work/')) return '/vi/work/*';
  if (pathname.startsWith('/work/')) return '/work/*';
  return pathname;
}

export function percentile(values: number[], p: 50 | 75 | 90) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))] ?? 0;
}

export function summarizeRumMetric(name: RumMetricName, values: number[], segment: RumSegment): RumMetric {
  return {
    name,
    percentiles: {
      p50: percentile(values, 50),
      p75: percentile(values, 75),
      p90: percentile(values, 90),
    },
    sample_size: values.length,
    segment,
  };
}

export function regressionPercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function shouldAlertRegression(current: number, previous: number, thresholdPct = ALERT_THRESHOLD_PCT) {
  return regressionPercent(current, previous) > thresholdPct;
}
