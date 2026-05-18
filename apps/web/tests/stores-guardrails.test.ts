import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(entryPath));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(entryPath);
  }

  return files;
}

describe('FR-WEB-004 store guardrails', () => {
  test('does not add Valtio or persist middleware', async () => {
    const pkg = JSON.parse(await readFile(path.join(appRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(deps.valtio).toBeUndefined();
  });

  test('no store writes appear inside useFrame callbacks', async () => {
    const files = await collectFiles(appRoot);
    const offenders: string[] = [];

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const useFrameBlocks = source.match(/useFrame\s*\([\s\S]*?\n\s*\}\s*\)/g) ?? [];
      if (useFrameBlocks.some((block) => /set[A-Z][A-Za-z]*\s*\(|use[A-Z][A-Za-z]+Store\.setState/.test(block))) {
        offenders.push(path.relative(appRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  test('stores ESLint rule is present', async () => {
    const config = await readFile(path.join(appRoot, '.eslintrc.stores.js'), 'utf8');

    expect(config).toContain('no-setstate-in-useframe');
    expect(config).toContain('useFrame');
  });

  test('runtime components use the stores barrel instead of raw store modules', async () => {
    const files = await collectFiles(path.join(appRoot, 'components'));
    const allowed = new Set(['components/state/StoreHydrator.client.tsx']);
    const offenders: string[] = [];

    for (const file of files) {
      const relative = path.relative(appRoot, file);
      if (allowed.has(relative)) continue;
      const source = await readFile(file, 'utf8');
      if (/from ['"]@\/lib\/stores\/(?:sceneStore|lumiStore|scrollStore)['"]/.test(source)) {
        offenders.push(relative);
      }
    }

    expect(offenders).toEqual([]);
  });
});
