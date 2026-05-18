import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('FR-OPS-012 a11y workflow shape', () => {
  test('runs on non-draft PRs, ignores docs-only changes, and supports a11y skip labels', async () => {
    const workflow = await readRepoFile('.github/workflows/a11y.yml');

    expect(workflow).toContain('name: a11y CI');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('paths-ignore:');
    expect(workflow).toContain("'docs/**'");
    expect(workflow).toContain("'**/*.md'");
    expect(workflow).toContain("github.event.pull_request.draft == false");
    expect(workflow).toContain('a11y:skip');
  });

  test('uses the baseline CI setup and keeps the gate under 8 minutes', async () => {
    const workflow = await readRepoFile('.github/workflows/a11y.yml');

    expect(workflow).toContain('timeout-minutes: 8');
    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toContain('version: 11.1.2');
    expect(workflow).toContain('actions/setup-node@v4');
    expect(workflow).toContain('node-version: 20.x');
    expect(workflow).toContain('pnpm install --frozen-lockfile');
    expect(workflow).toContain('pnpm -F web build');
    expect(workflow).toContain('playwright install chromium --with-deps');
  });

  test('runs the all-routes axe gate and posts retained reports', async () => {
    const workflow = await readRepoFile('.github/workflows/a11y.yml');

    expect(workflow).toContain('tests/a11y/all-routes.spec.ts');
    expect(workflow).toContain('A11Y_REPORT_PATH: a11y-report.json');
    expect(workflow).toContain('a11y-summary.mjs');
    expect(workflow).toContain('actions/github-script@v7');
    expect(workflow).toContain("marker = '<!-- a11y-report -->'");
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('retention-days: 30');
  });

  test('all-routes spec covers required routes, viewports, WCAG tags, and keyboard flow', async () => {
    const spec = await readRepoFile('apps/web/tests/a11y/all-routes.spec.ts');
    const config = await readRepoFile('apps/web/tests/a11y/axe-config.ts');

    for (const route of ["'/'", "'/lite'", "'/work/sample'", "'/accessibility'"]) {
      expect(spec).toContain(route);
    }
    for (const viewport of ['mobile', 'tablet', 'desktop', 'wide']) {
      expect(spec).toContain(`name: '${viewport}'`);
    }
    expect(config).toContain("'wcag2a'");
    expect(config).toContain("'wcag2aa'");
    expect(config).toContain("'wcag22a'");
    expect(config).toContain("'wcag22aa'");
    expect(config).toContain("'best-practice'");
    expect(spec).toContain('keyboard-only skip-story flow');
    expect(spec).toContain('blockingViolations');
  });

  test('exclusion file is machine-readable and starts with no undocumented waivers', async () => {
    const exclusions = JSON.parse(await readRepoFile('.axe-config/exclusions.json'));

    expect(exclusions).toEqual({ exclusions: [] });
  });
});
