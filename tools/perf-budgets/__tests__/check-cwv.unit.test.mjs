import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');

async function tempDir() {
  return mkdtemp(path.join(os.tmpdir(), 'cwv-budget-'));
}

describe('FR-PERF-001 check-cwv', () => {
  test('fails on synthetic Lighthouse CWV breach', async () => {
    const dir = await tempDir();
    try {
      const report = path.join(dir, 'lhr.json');
      await writeFile(report, JSON.stringify({
        finalDisplayedUrl: 'http://127.0.0.1:3000/',
        audits: {
          'largest-contentful-paint': { numericValue: 4000 },
          'interaction-to-next-paint': { numericValue: 350 },
          'cumulative-layout-shift': { numericValue: 0.2 },
        },
      }));

      const result = spawnSync(process.execPath, [
        'tools/perf-budgets/check-cwv.mjs',
        `--output=${path.join(dir, 'summary.json')}`,
        report,
      ], { cwd: repoRoot, encoding: 'utf8' });

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('"verdict": "FAIL"');
      expect(result.stdout).toContain('lcp_ms_p75');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

