import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const serverRoot = path.join(appRoot, '.next/server');
const forbiddenImportPatterns = [
  /require\(["']three(?:\/|["'])/,
  /require\(["']@react-three(?:\/|["'])/,
  /require\(["']@14islands\/r3f-scroll-rig["']/,
  /from ["']three(?:\/|["'])/,
  /from ["']@react-three(?:\/|["'])/,
  /from ["']@14islands\/r3f-scroll-rig["']/,
];

function stripComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

async function collectServerChunks(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectServerChunks(entryPath));
    else if (entry.name.endsWith('.js')) files.push(entryPath);
  }

  return files;
}

describe('FR-WEB-005 no Three/R3F in SSR bundles', () => {
  test('server chunks contain no direct Three/R3F imports', async () => {
    const chunks = await collectServerChunks(serverRoot);
    const offenders: string[] = [];

    for (const chunk of chunks) {
      const source = stripComments(await readFile(chunk, 'utf8'));
      if (forbiddenImportPatterns.some((pattern) => pattern.test(source))) {
        offenders.push(path.relative(appRoot, chunk));
      }
    }

    expect(offenders).toEqual([]);
  });
});
