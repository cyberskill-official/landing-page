import { trackEvent } from '@/lib/analytics';
import type { Breakpoint } from '@/lib/analytics/events';
import { localeFromPathname, normalizeRumRoute } from '@/lib/perf/rum-dashboard-config';

export type WebVitalMetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type WebVitalMetric = {
  name: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
  value: number;
};

export type WebVitalsReportOptions = {
  connection?: string;
  pathname?: string;
  random?: () => number;
  sampleRate?: number;
  track?: typeof trackEvent;
  width?: number;
};

export function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1280) return 'tablet';
  return 'desktop';
}

export function getConnectionType(connection?: { effectiveType?: string }) {
  return connection?.effectiveType ?? 'unknown';
}

export function getWebVitalsSampleRate(value = process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE) {
  const parsed = Number(value ?? '1');
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(1, Math.max(0, parsed));
}

export function shouldSampleWebVital(sampleRate = getWebVitalsSampleRate(), random = Math.random) {
  return random() < sampleRate;
}

export function isWebVitalMetricName(name: string): name is WebVitalMetricName {
  return name === 'CLS' || name === 'FCP' || name === 'INP' || name === 'LCP' || name === 'TTFB';
}

export function reportWebVitalMetric(metric: WebVitalMetric, options: WebVitalsReportOptions = {}) {
  if (!isWebVitalMetricName(metric.name)) return false;

  const sampleRate = options.sampleRate ?? getWebVitalsSampleRate();
  const random = options.random ?? Math.random;
  if (!shouldSampleWebVital(sampleRate, random)) return false;

  const width = options.width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  const pathname = options.pathname ?? (typeof window === 'undefined' ? '/' : window.location.pathname);
  const connection = options.connection
    ?? (typeof navigator === 'undefined'
      ? 'unknown'
      : getConnectionType((navigator as { connection?: { effectiveType?: string } }).connection));
  const track = options.track ?? trackEvent;

  track('web_vitals', {
    breakpoint: getBreakpoint(width),
    connection,
    metric_name: metric.name,
    locale: localeFromPathname(pathname),
    rating: metric.rating,
    route: normalizeRumRoute(pathname),
    value: metric.value,
  });

  return true;
}
