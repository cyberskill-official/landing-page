#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

async function listFiles(root, predicate) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath, predicate));
    else if (entry.isFile() && predicate(entryPath)) files.push(entryPath);
  }

  return files.sort();
}

async function filesFromManifest(nextDir) {
  const manifestPath = path.join(nextDir, 'build-manifest.json');
  if (!existsSync(manifestPath)) return [];

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const rootFiles = [
    ...(manifest.rootMainFiles ?? []),
    ...(manifest.pages?.['/_app'] ?? []),
    ...(manifest.pages?.['/'] ?? []),
  ];

  return rootFiles
    .filter((file) => file.endsWith('.js') && /(^|\/)(main|main-app)-/.test(file))
    .map((file) => path.join(nextDir, file));
}

export async function findMainChunks(nextDir) {
  const fromManifest = await filesFromManifest(nextDir);
  if (fromManifest.length > 0) return fromManifest.filter((file) => existsSync(file));
  return listFiles(path.join(nextDir, 'static', 'chunks'), (file) => /\/main(?:-app)?-[^/]+\.js$/.test(file));
}

export async function summarizeJsBundle({ budgetsPath, nextDir }) {
  const budgets = JSON.parse(await readFile(budgetsPath, 'utf8'));
  const chunks = await findMainChunks(nextDir);

  if (chunks.length === 0) {
    return {
      verdict: 'FAIL',
      fails: [{ reason: 'missing_main_chunk', next_dir: nextDir }],
      warns: [],
      chunks: [],
      main_chunk_kb_gz: 0,
    };
  }

  const chunkSummaries = chunks.map((file) => {
    const bytes = statSync(file).size;
    const gzipBytes = gzipSync(readFileSync(file)).byteLength;
    return {
      file: file.replace(/\\/g, '/'),
      bytes,
      gzip_bytes: gzipBytes,
    };
  });
  const gzipBytesTotal = chunkSummaries.reduce((sum, chunk) => sum + chunk.gzip_bytes, 0);
  const gzipKb = gzipBytesTotal / 1024;
  const budget = budgets.js_bundle.main_chunk_kb_gz;
  const fails = gzipKb > budget.fail
    ? [{ metric: 'js_bundle.main_chunk_kb_gz', actual: gzipKb, fail: budget.fail }]
    : [];
  const warns = fails.length === 0 && gzipKb > budget.target
    ? [{ metric: 'js_bundle.main_chunk_kb_gz', actual: gzipKb, target: budget.target }]
    : [];

  return {
    verdict: fails.length > 0 ? 'FAIL' : 'PASS',
    fails,
    warns,
    chunks: chunkSummaries,
    main_chunk_kb_gz: Number(gzipKb.toFixed(2)),
  };
}

function parseArgs(argv) {
  const args = {
    budgets: 'tools/perf-budgets/budgets.json',
    nextDir: 'apps/web/.next',
    output: 'js-bundle-summary.json',
  };

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key === 'budgets') args.budgets = value;
    if (key === 'next-dir') args.nextDir = value;
    if (key === 'output') args.output = value;
  }

  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const summary = await summarizeJsBundle({
    budgetsPath: args.budgets,
    nextDir: args.nextDir,
  });

  await writeFile(args.output, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.verdict === 'FAIL') process.exitCode = 1;
  return summary;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
