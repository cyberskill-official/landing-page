import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { findForbiddenCdnReferences } from '../check-no-cdn.mjs';

async function writeFixture(root, relativePath, body) {
  const file = path.join(root, relativePath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return file;
}

describe('FR-OPS-013 check-no-cdn', () => {
  test('flags forbidden runtime CDN references', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'cdn-scan-'));
    await writeFixture(dir, 'Component.tsx', "import thing from 'https://unpkg.com/pkg';\n");

    const violations = await findForbiddenCdnReferences({ scanPaths: [dir], excludePaths: [] });

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ host: 'unpkg.com', line: 1 });
  });

  test('flags CDN references even when commented', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'cdn-comment-'));
    await writeFixture(dir, 'Component.tsx', '// https://cdn.jsdelivr.net/npm/three\n');

    const violations = await findForbiddenCdnReferences({ scanPaths: [dir], excludePaths: [] });

    expect(violations).toHaveLength(1);
    expect(violations[0].host).toBe('cdn.jsdelivr.net');
  });

  test('excludes build-time sync scripts and fixtures', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'cdn-exclude-'));
    await writeFixture(dir, 'scripts/sync-decoders.mjs', "fetch('https://cdnjs.cloudflare.com/lib');\n");
    await writeFixture(dir, 'apps/web/__fixtures__/fixture.ts', "fetch('https://unpkg.com/mock');\n");

    const violations = await findForbiddenCdnReferences({
      scanPaths: [dir],
      excludePaths: [
        path.join(dir, 'scripts/sync-decoders.mjs').replace(/\\/g, '/'),
        path.join(dir, 'apps/web/__fixtures__/').replace(/\\/g, '/'),
      ],
    });

    expect(violations).toEqual([]);
  });
});
