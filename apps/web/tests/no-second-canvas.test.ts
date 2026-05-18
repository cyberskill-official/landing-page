import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['app', 'components', 'lib'];

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

describe('FR-WEB-003 single canvas invariant', () => {
  test('only CanvasMount creates a Canvas/GlobalCanvas element', async () => {
    const files = (
      await Promise.all(sourceRoots.map((root) => collectSourceFiles(path.join(appRoot, root))))
    ).flat();

    const offenders: string[] = [];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const relative = path.relative(appRoot, file);
      if (relative === 'components/canvas/CanvasMount.tsx') continue;
      if (relative.includes('/__tests__/')) continue;
      if (/<Canvas\b|<GlobalCanvas\b/.test(source)) offenders.push(relative);
    }

    expect(offenders).toEqual([]);
  });
});
