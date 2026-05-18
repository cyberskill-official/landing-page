import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(appRoot, '../..');
const scanRoots = ['app', 'components', 'lib'].map((directory) => path.join(appRoot, directory));

function isThreeFamily(source: string) {
  return source === 'three' || source.startsWith('@react-three/');
}

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

function hasInlineException(source: string, position: number) {
  const lines = source.slice(0, position).split(/\r?\n/);
  const previousLine = lines.at(-2)?.trim() ?? '';
  return /eslint-disable-next-line\s+no-namespace-three\s+--\s+\S/.test(previousLine);
}

function namespaceImportOffenders(filePath: string, source: string) {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const offenders: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const sourceName = node.moduleSpecifier.text;
      const namespaceImport = node.importClause?.namedBindings;

      if (
        isThreeFamily(sourceName) &&
        namespaceImport &&
        ts.isNamespaceImport(namespaceImport) &&
        !hasInlineException(source, node.getFullStart())
      ) {
        offenders.push(
          `${path.relative(appRoot, filePath)} uses namespace import from ${sourceName}`,
        );
      }
    }

    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'require') {
      const [argument] = node.arguments;
      if (
        argument &&
        ts.isStringLiteral(argument) &&
        isThreeFamily(argument.text) &&
        !hasInlineException(source, node.getFullStart())
      ) {
        offenders.push(
          `${path.relative(appRoot, filePath)} uses CommonJS require for ${argument.text}`,
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return offenders;
}

describe('FR-WEB-007 Three import and bundle config guardrails', () => {
  test('keeps app, component, and lib code on named Three imports only', async () => {
    const sourceFiles = (await Promise.all(scanRoots.map(collectSourceFiles))).flat();
    const offenders: string[] = [];

    for (const sourceFile of sourceFiles) {
      offenders.push(...namespaceImportOffenders(sourceFile, await readFile(sourceFile, 'utf8')));
    }

    expect(offenders).toEqual([]);
  });

  test('ships the custom ESLint rule that bans namespace and CommonJS Three imports', async () => {
    const ruleSource = await readFile(path.join(appRoot, '.eslintrc.imports.js'), 'utf8');

    expect(ruleSource).toContain('no-namespace-three');
    expect(ruleSource).toContain('ImportNamespaceSpecifier');
    expect(ruleSource).toContain("callee.name !== 'require'");
    expect(ruleSource).toContain("source.startsWith('@react-three/')");
  });

  test('pins Next config to minimal Three transpilation and production tree-shaking', async () => {
    const config = await readFile(path.join(appRoot, 'next.config.ts'), 'utf8');

    expect(config).toMatch(/transpilePackages:\s*\[\s*['"]three['"]\s*\]/);
    expect(config).toMatch(/compress:\s*true/);
    expect(config).toMatch(/optimizePackageImports:\s*\[[^\]]*['"]@react-three\/drei['"]/s);
    expect(config).toMatch(/if\s*\(\s*!dev\s*&&\s*!isServer\s*\)/);
    expect(config).toMatch(/sideEffects:\s*true/);
    expect(config).toMatch(/usedExports:\s*true/);
    expect(config).not.toMatch(/transpileModules/);
    expect(config).not.toMatch(/swcMinify:\s*false/);
    expect(config).not.toMatch(/module\.rules\s*=/);
  });

  test('documents bundle config rationale next to next.config.ts', () => {
    expect(existsSync(path.join(appRoot, 'bundle.config.notes.md'))).toBe(true);
  });

  test('marks first-party ESM packages as side-effect free when safe', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(repoRoot, 'packages/ds-cinematic/package.json'), 'utf8'),
    ) as { sideEffects?: boolean };

    expect(packageJson.sideEffects).toBe(false);
  });

  test('keeps named unused Three imports valid for future tree-shake probes', () => {
    const fixture = 'import { Texture, AnimationClip, BufferAttribute } from "three";\n';

    expect(namespaceImportOffenders('fixture.ts', fixture)).toEqual([]);
  });
});
