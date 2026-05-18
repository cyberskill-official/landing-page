#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const FORBIDDEN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'threejs.org',
  'gstatic.com',
  'googleapis.com',
];

export const DEFAULT_SCAN_PATHS = [
  'apps/web/components',
  'apps/web/app',
  'apps/web/lib',
];

export const DEFAULT_EXCLUDE_PATHS = [
  'apps/web/__fixtures__/',
  'scripts/sync-decoders.mjs',
];

const runtimeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

async function listRuntimeFiles(root) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listRuntimeFiles(entryPath));
    else if (entry.isFile() && runtimeExtensions.has(path.extname(entry.name))) files.push(entryPath);
  }

  return files;
}

function isExcluded(file, excludePaths) {
  const normalized = file.replace(/\\/g, '/');
  return excludePaths.some((excludePath) => normalized.startsWith(excludePath));
}

export async function findForbiddenCdnReferences({
  hosts = FORBIDDEN_HOSTS,
  scanPaths = DEFAULT_SCAN_PATHS,
  excludePaths = DEFAULT_EXCLUDE_PATHS,
} = {}) {
  const files = (await Promise.all(scanPaths.map((scanPath) => listRuntimeFiles(scanPath))))
    .flat()
    .filter((file) => !isExcluded(file, excludePaths));
  const violations = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const lines = source.split('\n');

    for (const [lineIndex, line] of lines.entries()) {
      for (const host of hosts) {
        if (line.includes(host)) {
          violations.push({
            file: file.replace(/\\/g, '/'),
            host,
            line: lineIndex + 1,
            text: line.trim(),
          });
        }
      }
    }
  }

  return violations;
}

function parseArgs(argv) {
  const args = {
    jsonOut: 'asset-cdn-summary.json',
    scanPaths: DEFAULT_SCAN_PATHS,
  };

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key === 'json-out') args.jsonOut = value;
    if (key === 'scan') args.scanPaths = value.split(',').filter(Boolean);
  }

  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const violations = await findForbiddenCdnReferences({ scanPaths: args.scanPaths });
  const summary = {
    verdict: violations.length > 0 ? 'FAIL' : 'PASS',
    violations,
  };

  await writeFile(args.jsonOut, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));

  if (violations.length > 0) {
    process.exitCode = 1;
  }

  return summary;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
