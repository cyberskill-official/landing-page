#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SENTINEL = '<!-- pr-asset-delta -->';
const FIX_LINK = 'docs/feature-requests/ops/FR-OPS-001-gltf-transform-pipeline.md#7--failure-modes';
const VERDICT_ORDER = { FAIL: 0, WARN: 1, NEW: 2, PASS: 3 };

export function budgetForAsset(asset, budgets) {
  const lower = asset.toLowerCase();

  if (lower.includes('nonla')) {
    return {
      key: 'assets.nonla_glb_kb',
      target: budgets.assets.nonla_glb_kb.target * 1024,
      fail: budgets.assets.nonla_glb_kb.fail * 1024,
    };
  }

  if (basename(lower).startsWith('lumi')) {
    return {
      key: 'assets.lumi_glb_mb',
      target: budgets.assets.lumi_glb_mb.target * 1024 * 1024,
      fail: budgets.assets.lumi_glb_mb.fail * 1024 * 1024,
    };
  }

  if (lower.includes('hero') || lower.includes('scene-0')) {
    return {
      key: 'assets.hero_scene_props_mb',
      target: budgets.assets.hero_scene_props_mb.target * 1024 * 1024,
      fail: budgets.assets.hero_scene_props_mb.fail * 1024 * 1024,
    };
  }

  if (lower.includes('scene') || lower.includes('prop') || lower.includes('footer')) {
    return {
      key: 'assets.each_scene_props_mb',
      target: budgets.assets.each_scene_props_mb.target * 1024 * 1024,
      fail: budgets.assets.each_scene_props_mb.fail * 1024 * 1024,
    };
  }

  return null;
}

export function isRedactedAsset(asset) {
  const normalized = asset.replace(/\\/g, '/');
  return /\.private\.glb$/i.test(normalized) || normalized.includes('assets-source/internal/');
}

export function redactAsset(asset) {
  return isRedactedAsset(asset) ? '[redacted private asset]' : asset;
}

export function computeDelta(mainReports, prReports) {
  const mainMap = new Map(mainReports.map((report) => [redactAsset(report.asset), report]));

  return prReports
    .map((report) => {
      const asset = redactAsset(report.asset);
      const main = mainMap.get(asset);
      const verdict =
        report.bytes > report.bytes_fail
          ? 'FAIL'
          : report.bytes > report.bytes_target
            ? 'WARN'
            : !main
              ? 'NEW'
              : 'PASS';

      return {
        asset,
        main: main?.bytes ?? null,
        pr: report.bytes,
        delta_bytes: main ? report.bytes - main.bytes : null,
        delta_pct: main && main.bytes > 0 ? ((report.bytes - main.bytes) / main.bytes) * 100 : null,
        verdict,
        target: report.bytes_target,
        fail: report.bytes_fail,
        budget_key: report.budget_key ?? null,
      };
    })
    .sort((a, b) => VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] || a.asset.localeCompare(b.asset));
}

export function renderMarkdown(rows, prNum, options = {}) {
  const failCount = rows.filter((row) => row.verdict === 'FAIL').length;
  const warnCount = rows.filter((row) => row.verdict === 'WARN').length;
  const header = `## Asset budget report - PR #${prNum}\n\n`;
  const staleBlock = renderStaleBlock(options.staleAssets ?? []);

  if (rows.length === 0) {
    return `${header}✅ No asset changes in this PR - budget unchanged from main.\n\n${staleBlock}${renderFixBlock()}\n\n${SENTINEL}\n`;
  }

  const table = [
    '| Asset | Main | PR | Δ bytes | Δ % | Budget verdict |',
    '|---|---:|---:|---:|---:|---|',
    ...rows.map((row) => {
      const main = row.main === null ? 'no baseline' : formatBytes(row.main);
      const deltaBytes = row.delta_bytes === null ? 'new' : formatBytes(row.delta_bytes, true);
      const deltaPct = row.delta_pct === null ? '—' : `${row.delta_pct > 0 ? '+' : ''}${row.delta_pct.toFixed(1)}%`;
      return `| \`${row.asset}\` | ${main} | ${formatBytes(row.pr)} | ${deltaBytes} | ${deltaPct} | ${verdictLabel(row)} |`;
    }),
  ].join('\n');

  const summary =
    failCount > 0
      ? `**Verdict: ${warnCount} WARN, ${failCount} FAIL.** PR blocked - please address FAIL rows.`
      : warnCount > 0
        ? `**Verdict: ${warnCount} WARN, ${failCount} FAIL.** PR mergeable; please address WARN before next release.`
        : `**Verdict: ${warnCount} WARN, ${failCount} FAIL.** PR mergeable.`;

  return `${header}${table}\n\n${summary}\n\n${staleBlock}${renderFixBlock()}\n\n${SENTINEL}\n`;
}

export function summarizeRows(rows) {
  return {
    rowCount: rows.length,
    warnCount: rows.filter((row) => row.verdict === 'WARN').length,
    failCount: rows.filter((row) => row.verdict === 'FAIL').length,
  };
}

export async function readAssetReports(dir, budgets) {
  if (!existsSync(dir)) return [];

  const files = await listReportFiles(dir);
  const reports = [];

  for (const file of files) {
    const raw = JSON.parse(await readFile(file, 'utf8'));
    const asset = assetNameFromReport(raw, file, dir);
    const budget = budgetForAsset(asset, budgets);
    reports.push({
      asset,
      bytes: raw.bytes ?? raw.afterBytes,
      bytes_target: raw.bytes_target ?? budget?.target ?? Number.POSITIVE_INFINITY,
      bytes_fail: raw.bytes_fail ?? budget?.fail ?? Number.POSITIVE_INFINITY,
      budget_key: raw.budget_key ?? budget?.key ?? null,
      vert_count: raw.vert_count ?? raw.statsAfter?.vertexCount ?? raw.vertexCount,
      tri_count: raw.tri_count ?? raw.statsAfter?.triangleCount ?? raw.triangleCount,
      draw_calls_estimate: raw.draw_calls_estimate,
      texture_bytes: raw.texture_bytes,
    });
  }

  return reports.filter((report) => Number.isFinite(report.bytes));
}

export async function readStaleAssets(manifestPath) {
  if (!manifestPath || !existsSync(manifestPath)) return [];

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  return Object.values(manifest.assets ?? {})
    .filter((entry) => entry.stale)
    .map((entry) => ({
      path: entry.path,
      mtime_iso: entry.mtime_iso,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function verdictLabel(row) {
  if (row.verdict === 'PASS') return `✅ PASS (target ${formatBytes(row.target)})`;
  if (row.verdict === 'WARN') return `⚠️ WARN (target ${formatBytes(row.target)} / fail ${formatBytes(row.fail)})`;
  if (row.verdict === 'FAIL') return `❌ FAIL (fail ${formatBytes(row.fail)})`;
  return `🆕 NEW (target ${formatBytes(row.target)} / fail ${formatBytes(row.fail)})`;
}

function renderFixBlock() {
  return `<details><summary>How to fix WARN / FAIL</summary>\n\nSee [FR-OPS-001 §7 failure modes](${FIX_LINK}) for diagnosis steps.\n\n</details>`;
}

function renderStaleBlock(staleAssets) {
  if (staleAssets.length === 0) return '';

  const rows = staleAssets
    .map((asset) => `- \`${asset.path}\` was modified at ${asset.mtime_iso}; run \`pnpm asset:optimize\` and commit rebuilt outputs.`)
    .join('\n');

  return `⚠️ **Stale assets detected:**\n${rows}\n\n`;
}

function formatBytes(bytes, signed = false) {
  if (!Number.isFinite(bytes)) return 'no budget';

  const abs = Math.abs(bytes);
  const sign = signed && bytes > 0 ? '+' : '';

  if (abs >= 1024 * 1024) return `${sign}${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (abs >= 1024) return `${sign}${(bytes / 1024).toFixed(1)} KB`;
  return `${sign}${bytes} B`;
}

function assetNameFromReport(report, file, rootDir) {
  if (report.asset) return report.asset;
  if (report.output) return basename(report.output);

  const rel = relative(rootDir, file).split('\\').join('/');
  return rel.replace(/\.report\.json$/i, '.glb');
}

async function listReportFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listReportFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith('.report.json')) {
      files.push(path);
    }
  }

  return files.sort();
}

function parseArgs(argv) {
  const args = {
    mainDir: '/tmp/main-reports',
    prDir: 'assets-built/optimized',
    prNumber: process.env.PR_NUMBER ?? process.env.GITHUB_REF_NAME ?? '0',
    out: 'asset-delta-comment.md',
    jsonOut: 'asset-delta-summary.json',
    budgets: 'tools/perf-budgets/budgets.json',
    manifest: 'assets-source/manifest.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--main-dir') {
      args.mainDir = next;
      index += 1;
    } else if (arg === '--pr-dir') {
      args.prDir = next;
      index += 1;
    } else if (arg === '--pr-number') {
      args.prNumber = next;
      index += 1;
    } else if (arg === '--out') {
      args.out = next;
      index += 1;
    } else if (arg === '--json-out') {
      args.jsonOut = next;
      index += 1;
    } else if (arg === '--budgets') {
      args.budgets = next;
      index += 1;
    } else if (arg === '--manifest') {
      args.manifest = next;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return args;
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const budgets = JSON.parse(await readFile(args.budgets, 'utf8'));
  const mainReports = await readAssetReports(args.mainDir, budgets);
  const prReports = await readAssetReports(args.prDir, budgets);
  const staleAssets = await readStaleAssets(args.manifest);
  const rows = computeDelta(mainReports, prReports);
  const body = renderMarkdown(rows, args.prNumber, { staleAssets });
  const summary = { ...summarizeRows(rows), staleCount: staleAssets.length };

  await writeFile(args.out, body);
  await writeFile(args.jsonOut, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`asset delta: ${summary.rowCount} row(s), ${summary.warnCount} warn, ${summary.failCount} fail`);

  if (summary.failCount > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
