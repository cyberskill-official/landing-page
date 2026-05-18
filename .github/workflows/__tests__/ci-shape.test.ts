import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

function lineIndex(source: string, needle: string) {
  const index = source.indexOf(needle);
  expect(index, `${needle} should exist`).toBeGreaterThanOrEqual(0);
  return index;
}

function countMatches(source: string, pattern: RegExp) {
  return source.match(pattern)?.length ?? 0;
}

describe('FR-OPS-010 CI workflow shape', () => {
  test('runs on PRs and main pushes with minimal permissions and a required check label', async () => {
    const ci = await readRepoFile('.github/workflows/ci.yml');

    expect(ci).toContain('name: CI');
    expect(ci).toContain('pull_request: {}');
    expect(ci).toContain('branches: [main]');
    expect(ci).toContain('contents: read');
    expect(ci).toContain('pull-requests: write');
    expect(ci).toContain('CI_REQUIRED_CHECK: CI / ci');
    expect(ci).toContain('name: ci');
  });

  test('keeps the install, lint, typecheck, build, and test steps in fail-fast order', async () => {
    const ci = await readRepoFile('.github/workflows/ci.yml');
    const orderedMarkers = [
      'actions/checkout@v4',
      'pnpm/action-setup@v4',
      'actions/setup-node@v4',
      'pnpm install --frozen-lockfile',
      'pnpm lint',
      'pnpm typecheck',
      'pnpm -F web build',
      'pnpm test',
    ];

    const indexes = orderedMarkers.map((marker) => lineIndex(ci, marker));
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
    expect(countMatches(ci, /pnpm install --frozen-lockfile/g)).toBe(1);
    expect(ci).not.toContain('continue-on-error: true');
  });

  test('pins Node 20 and the pnpm version declared by packageManager', async () => {
    const ci = await readRepoFile('.github/workflows/ci.yml');
    const pkg = JSON.parse(await readRepoFile('package.json')) as { packageManager: string };
    const pnpmVersion = pkg.packageManager.replace('pnpm@', '');

    expect(ci).toContain('node-version: 20.x');
    expect(ci).toContain(`version: ${pnpmVersion}`);
    expect(ci).not.toContain('pnpm/action-setup@v2');
  });

  test('sets a 10 minute budget, caches pnpm and Next, and writes a job summary', async () => {
    const ci = await readRepoFile('.github/workflows/ci.yml');

    expect(ci).toContain('timeout-minutes: 10');
    expect(ci).toContain('pnpm store path --silent');
    expect(ci).toContain('actions/cache@v4');
    expect(ci).toContain('pnpm-lock.yaml');
    expect(ci).toContain('apps/web/.next/cache');
    expect(ci).toContain('GITHUB_STEP_SUMMARY');
    expect(ci).toContain('Tests:');
    expect(ci).toContain('Build static size:');
    expect(ci).toContain('pnpm cache hit:');
    expect(ci).toContain('Next.js cache hit:');
  });
});
