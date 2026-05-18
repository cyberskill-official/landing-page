'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitalMetric } from '@/lib/perf/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    reportWebVitalMetric(metric);
  });

  return null;
}
