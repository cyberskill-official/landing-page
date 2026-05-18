import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('FR-OPS-011 Lighthouse workflow shape', () => {
  test('runs on non-draft PRs, ignores docs-only changes, and supports skip labels', async () => {
    const workflow = await readRepoFile('.github/workflows/lighthouse.yml');

    expect(workflow).toContain('name: Lighthouse CI');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('paths-ignore:');
    expect(workflow).toContain("'docs/**'");
    expect(workflow).toContain("'**/*.md'");
    expect(workflow).toContain("github.event.pull_request.draft == false");
    expect(workflow).toContain('lighthouse:skip');
  });

  test('runs mobile before desktop and retains JSON artifacts for 30 days', async () => {
    const workflow = await readRepoFile('.github/workflows/lighthouse.yml');

    expect(workflow).toContain('max-parallel: 1');
    expect(workflow).toContain('formFactor: [mobile, desktop]');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('retention-days: 30');
    expect(workflow).toContain('.lighthouseci/');
  });

  test('uses the baseline CI install/build pattern and cached Lighthouse runner', async () => {
    const workflow = await readRepoFile('.github/workflows/lighthouse.yml');

    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toContain('version: 11.1.2');
    expect(workflow).toContain('actions/setup-node@v4');
    expect(workflow).toContain('node-version: 20.x');
    expect(workflow).toContain('pnpm install --frozen-lockfile');
    expect(workflow).toContain('pnpm -F web build');
    expect(workflow).toContain('~/.cache/lighthouse');
    expect(workflow).toContain('@lhci/cli@${LIGHTHOUSE_CI_VERSION}');
  });

  test('posts median summaries with main deltas and saves main baselines', async () => {
    const workflow = await readRepoFile('.github/workflows/lighthouse.yml');

    expect(workflow).toContain('lighthouse-summary.mjs');
    expect(workflow).toContain('--baseline=.lighthouseci-main/${{ matrix.formFactor }}.json');
    expect(workflow).toContain('--baseline-output=.lighthouseci-main/${{ matrix.formFactor }}.json');
    expect(workflow).toContain('actions/github-script@v7');
    expect(workflow).toContain("marker = '<!-- lighthouse-summary:${{ matrix.formFactor }} -->'");
    expect(workflow).toContain('actions/cache/save@v4');
  });

  test('configures three URLs, three runs, mobile throttling, and fail thresholds', async () => {
    const config = JSON.parse(await readRepoFile('apps/web/lighthouserc.json'));
    const budget = JSON.parse(await readRepoFile('.github/lighthouse/budget.json'));

    expect(config.ci.collect.url).toEqual([
      'http://127.0.0.1:3000/',
      'http://127.0.0.1:3000/lite',
      'http://127.0.0.1:3000/work/sample',
    ]);
    expect(config.ci.collect.numberOfRuns).toBe(3);
    expect(config.ci.collect.settings.formFactor).toBe('mobile');
    expect(config.ci.collect.settings.throttlingMethod).toBe('simulate');
    expect(config.ci.collect.settings.throttling.cpuSlowdownMultiplier).toBe(4);
    expect(config.ci.assert.assertions['metrics/largest-contentful-paint'][1].maxNumericValue).toBe(3000);
    expect(config.ci.assert.assertions['metrics/interaction-to-next-paint'][1].maxNumericValue).toBe(300);
    expect(config.ci.assert.assertions['metrics/cumulative-layout-shift'][1].maxNumericValue).toBe(0.15);
    expect(budget.metrics.lcp).toMatchObject({ target: 2500, fail: 4000 });
    expect(budget.metrics.performance).toMatchObject({ target: 0.8, fail: 0.65 });
  });
});
