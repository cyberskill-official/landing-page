import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chunkRoot = path.join(appRoot, '.next/static/chunks');
const mainChunkBudgetBytes = 200 * 1024;

async function productionBuildAvailable(): Promise<boolean> {
  try {
    await access(path.join(appRoot, '.next/BUILD_ID'));
    await access(path.join(appRoot, '.next/required-server-files.json'));
    return true;
  } catch {
    return false;
  }
}

async function findMainChunks(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const chunks: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      chunks.push(...await findMainChunks(entryPath));
    } else if (/^main-[\w-]+\.js$/.test(entry.name)) {
      chunks.push(entryPath);
    }
  }

  return chunks;
}

describe('FR-WEB-001 bundle budget', () => {
  test('keeps the generated main chunk within 200 KB gzip', async () => {
    if (!(await productionBuildAvailable())) {
      if (process.env.CI) {
        throw new Error('Production .next artifacts are missing; run `next build` before bundle-budget tests.');
      }
      console.warn('Skipping bundle budget: production .next artifacts are missing. Run `next build` to enforce it locally.');
      return;
    }

    const chunks = (await findMainChunks(chunkRoot)).filter((chunk) => path.basename(chunk) !== 'main-app.js');
    expect(chunks.length).toBeGreaterThan(0);

    const sizes = await Promise.all(chunks.map(async (chunk) => {
      const gzipBytes = gzipSync(await readFile(chunk)).byteLength;
      return { chunk, gzipBytes };
    }));
    const largest = sizes.sort((a, b) => b.gzipBytes - a.gzipBytes)[0];

    if (!largest) {
      throw new Error('No Next.js main chunks were found under .next/static/chunks');
    }
    expect(largest.gzipBytes, `${path.relative(appRoot, largest.chunk)} is over budget`).toBeLessThanOrEqual(
      mainChunkBudgetBytes,
    );
  });
});
