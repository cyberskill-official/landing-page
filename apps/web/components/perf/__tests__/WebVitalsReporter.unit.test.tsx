import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-SEO-009 WebVitalsReporter contract', () => {
  test('uses Next web-vitals wrapper and routes through the analytics proxy layer', async () => {
    const [component, layout] = await Promise.all([
      readFile(path.join(appRoot, 'components/perf/WebVitalsReporter.tsx'), 'utf8'),
      readFile(path.join(appRoot, 'app/layout.tsx'), 'utf8'),
    ]);

    expect(component).toContain("import { useReportWebVitals } from 'next/web-vitals'");
    expect(component).toContain('reportWebVitalMetric(metric)');
    expect(layout).toContain('<WebVitalsReporter />');
  });
});
