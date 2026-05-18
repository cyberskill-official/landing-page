import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { findUseFrameAllocationViolations } from '../../../../eslint-rules/no-alloc-in-use-frame';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scanRoots = ['app', 'components', 'lib'].map((directory) => path.join(appRoot, directory));

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSourceFiles(entryPath));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(entryPath);
  }

  return files;
}

describe('FR-PERF-006 useFrame allocation guardrail', () => {
  test('keeps app, component, and lib code free of Three.js allocations in useFrame', async () => {
    const sourceFiles = (await Promise.all(scanRoots.map(collectSourceFiles))).flat();
    const offenders: string[] = [];

    for (const sourceFile of sourceFiles) {
      const source = await readFile(sourceFile, 'utf8');
      const violations = findUseFrameAllocationViolations(source, sourceFile);
      offenders.push(
        ...violations.map(
          (violation) =>
            `${path.relative(appRoot, sourceFile)}:${violation.line}:${violation.column} ${violation.message}`,
        ),
      );
    }

    expect(offenders).toEqual([]);
  });

  test('registers the custom rule in the app lint config', async () => {
    const config = await readFile(path.join(appRoot, '.eslintrc.js'), 'utf8');

    expect(config).toContain('cyberskill-rules/no-alloc-in-use-frame');
    expect(config).toContain('cyberskill-rules/no-undisposed-three-ref');
    expect(config).toContain('*.stories.{ts,tsx}');
  });
});
