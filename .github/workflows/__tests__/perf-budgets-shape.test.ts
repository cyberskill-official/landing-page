import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('FR-PERF-001 perf budget workflow shape', () => {
  test('runs the hard budget scripts and Lighthouse CI', async () => {
    const workflow = await readRepoFile('.github/workflows/perf-budgets.yml');

    expect(workflow).toContain('name: perf-budgets');
    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toContain('version: 11.1.2');
    expect(workflow).toContain('check-js-bundle.mjs');
    expect(workflow).toContain('check-asset-sizes.mjs');
    expect(workflow).toContain('check-cwv.mjs');
    expect(workflow).toContain('@lhci/cli@0.15.1');
  });

  test('documents threshold amendment governance and PR comments', async () => {
    const workflow = await readRepoFile('.github/workflows/perf-budgets.yml');
    const readme = await readRepoFile('tools/perf-budgets/README.md');

    expect(workflow).toContain('<!-- perf-budgets -->');
    expect(workflow).toContain('FR-PERF-NNN-budget-amendment-rationale');
    expect(readme).toContain('How To Change A Threshold');
    expect(readme).toContain('AGENTS.md §16.2');
  });

  test('ships Lighthouse native budgets and local pre-push hook', async () => {
    const lighthouseBudgets = JSON.parse(await readRepoFile('apps/web/lighthouse-budgets.json'));
    const hook = await readRepoFile('.hooks/pre-push');

    expect(lighthouseBudgets[0].timings).toEqual(
      expect.arrayContaining([expect.objectContaining({ metric: 'largest-contentful-paint', budget: 2500 })]),
    );
    expect(hook).toContain('check-js-bundle.mjs');
    expect(hook).toContain('check-asset-sizes.mjs');
  });
});

