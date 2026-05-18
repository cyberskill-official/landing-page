import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');

async function tempDir() {
  return mkdtemp(path.join(os.tmpdir(), 'js-budget-'));
}

describe('FR-PERF-001 check-js-bundle', () => {
  test('fails when gzipped main bundle exceeds the fail threshold', async () => {
    const dir = await tempDir();
    try {
      const nextDir = path.join(dir, '.next');
      const chunkDir = path.join(nextDir, 'static/chunks');
      await mkdir(chunkDir, { recursive: true });
      await writeFile(path.join(chunkDir, 'main-test.js'), randomBytes(240 * 1024));
      await writeFile(path.join(nextDir, 'build-manifest.json'), JSON.stringify({
        rootMainFiles: ['static/chunks/main-test.js'],
      }));

      const result = spawnSync(process.execPath, [
        'tools/perf-budgets/check-js-bundle.mjs',
        `--next-dir=${nextDir}`,
        `--output=${path.join(dir, 'summary.json')}`,
      ], { cwd: repoRoot, encoding: 'utf8' });

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('"verdict": "FAIL"');
      expect(result.stdout).toContain('js_bundle.main_chunk_kb_gz');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

