import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  computeMedianPerUrl,
  renderMarkdown,
  serializableResults,
} from '../lighthouse-summary.mjs';

function fakeLhr(url, { performance = 0.82, lcp = 2200, inp = 150, cls = 0.05, tbt = 120 } = {}) {
  return {
    finalDisplayedUrl: `http://127.0.0.1:3000${url}`,
    categories: {
      performance: { score: performance },
      accessibility: { score: 0.98 },
      'best-practices': { score: 0.96 },
      seo: { score: 0.94 },
    },
    audits: {
      'metrics/largest-contentful-paint': { numericValue: lcp },
      'metrics/interaction-to-next-paint': { numericValue: inp },
      'metrics/cumulative-layout-shift': { numericValue: cls },
      'metrics/first-contentful-paint': { numericValue: 1200 },
      'metrics/total-blocking-time': { numericValue: tbt },
      'metrics/speed-index': { numericValue: 2600 },
    },
  };
}

describe('FR-OPS-011 Lighthouse summary', () => {
  test('computes median metrics from three runs per URL', async () => {
    const results = await computeMedianPerUrl([
      { lhr: fakeLhr('/', { lcp: 2400, performance: 0.8 }) },
      { lhr: fakeLhr('/', { lcp: 1900, performance: 0.9 }) },
      { lhr: fakeLhr('/', { lcp: 2200, performance: 0.85 }) },
    ]);

    expect(results.get('/')?.metrics.lcp).toBe(2200);
    expect(results.get('/')?.scores.performance).toBe(0.85);
    expect(results.get('/')?.runs).toBe(3);
  });

  test('reads LHCI manifest jsonPath entries', async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), 'lhci-summary-'));
    await writeFile(path.join(tmp, 'one.json'), JSON.stringify(fakeLhr('/lite', { lcp: 900 })));
    await writeFile(path.join(tmp, 'two.json'), JSON.stringify(fakeLhr('/lite', { lcp: 1100 })));
    await writeFile(path.join(tmp, 'three.json'), JSON.stringify(fakeLhr('/lite', { lcp: 1000 })));

    const results = await computeMedianPerUrl([
      { jsonPath: 'one.json' },
      { jsonPath: 'two.json' },
      { jsonPath: 'three.json' },
    ], { manifestRoot: tmp });

    expect(results.get('/lite')?.metrics.lcp).toBe(1000);
  });

  test('renders markdown with status table, main delta table, and upsert sentinels', async () => {
    const results = await computeMedianPerUrl([
      { lhr: fakeLhr('/work/sample', { lcp: 2600, performance: 0.78 }) },
      { lhr: fakeLhr('/work/sample', { lcp: 2500, performance: 0.8 }) },
      { lhr: fakeLhr('/work/sample', { lcp: 2700, performance: 0.77 }) },
    ]);
    const baseline = new Map([
      ['/work/sample', {
        scores: { performance: 0.82 },
        metrics: { lcp: 2300 },
      }],
    ]);
    const markdown = renderMarkdown(results, {
      baseline,
      formFactor: 'mobile',
      thresholds: {
        performance: { target: 0.8, fail: 0.65, kind: 'score' },
        lcp: { target: 2500, fail: 4000, kind: 'millisecond' },
        inp: { target: 200, fail: 500, kind: 'millisecond' },
        cls: { target: 0.1, fail: 0.25, kind: 'unitless' },
        tbt: { target: 200, fail: 600, kind: 'millisecond' },
      },
    });

    expect(markdown).toContain('## Lighthouse - median of 3 runs (mobile)');
    expect(markdown).toContain('| /work/sample | 78% WARN | 2600ms WARN');
    expect(markdown).toContain('| /work/sample | +300ms | -4% |');
    expect(markdown).toContain('<!-- lighthouse-summary -->');
    expect(markdown).toContain('<!-- lighthouse-summary:mobile -->');
  });

  test('serializes baseline payloads for future main-branch comparisons', async () => {
    const results = await computeMedianPerUrl([
      { lhr: fakeLhr('/', { lcp: 2100 }) },
      { lhr: fakeLhr('/', { lcp: 2200 }) },
      { lhr: fakeLhr('/', { lcp: 2300 }) },
    ]);

    expect(serializableResults(results)['/'].metrics.lcp).toBe(2200);
  });
});
