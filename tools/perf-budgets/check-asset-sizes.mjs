#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FIVE_MB = 5 * 1024 * 1024;
const DECODER_FAIL_BYTES = 245_760;

export function budgetForAsset(asset, budgets) {
  const lower = asset.toLowerCase();

  if (lower.includes('nonla')) {
    return {
      key: 'assets.nonla_glb_kb',
      target: budgets.assets.nonla_glb_kb.target * 1024,
      fail: budgets.assets.nonla_glb_kb.fail * 1024,
    };
  }

  if (path.basename(lower).startsWith('lumi')) {
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

export function computeVerdict(budgets, reports, options = {}) {
  const fails = [];
  const warns = [];
  const unbudgeted = [];
  const largeAssets = [];

  for (const report of reports) {
    const budget = report.budget ?? budgetForAsset(report.asset, budgets);
    const bytes = report.bytes;

    if (bytes > FIVE_MB && options.allowLargeAssets !== true) {
      largeAssets.push({
        asset: report.asset,
        actual_bytes: bytes,
        fail_threshold: FIVE_MB,
      });
    }

    if (!budget) {
      unbudgeted.push({ asset: report.asset, actual_bytes: bytes });
      continue;
    }

    if (bytes > budget.fail) {
      fails.push({
        asset: report.asset,
        actual_bytes: bytes,
        fail_threshold: budget.fail,
        budget_key: budget.key,
      });
    } else if (bytes > budget.target) {
      warns.push({
        asset: report.asset,
        actual_bytes: bytes,
        target_threshold: budget.target,
        budget_key: budget.key,
      });
    }

  }

  const decoderBytesTotal = options.decoderBytesTotal ?? 0;
  if (decoderBytesTotal > DECODER_FAIL_BYTES) {
    fails.push({
      asset: 'apps/web/public/decoders',
      actual_bytes: decoderBytesTotal,
      fail_threshold: DECODER_FAIL_BYTES,
      budget_key: 'decoder_bundle_total',
    });
  }

  for (const largeAsset of largeAssets) {
    fails.push({ ...largeAsset, budget_key: 'single_asset_gt_5mb' });
  }

  fails.sort((a, b) => (b.actual_bytes - b.fail_threshold) - (a.actual_bytes - a.fail_threshold));
  warns.sort((a, b) => b.actual_bytes - a.actual_bytes);

  return {
    verdict: fails.length > 0 ? 'FAIL' : 'PASS',
    fails,
    warns,
    unbudgeted,
    total_assets: reports.length,
    decoder_bytes_total: decoderBytesTotal,
    cdn_violations: options.cdnViolations ?? [],
  };
}

export function reportToAssetRecord(raw, filePath, budgets) {
  const asset = raw.asset ?? raw.output ?? filePath.replace(/\.report\.json$/i, '.glb');
  const budgetFromReport = raw.bytes_target && raw.bytes_fail
    ? { key: raw.budget_key ?? null, target: raw.bytes_target, fail: raw.bytes_fail }
    : null;
  const budgetFromPipeline = raw.budget
    ? { key: raw.budget.key, target: raw.budget.targetBytes, fail: raw.budget.failBytes ?? budgetForAsset(asset, budgets)?.fail }
    : null;

  return {
    asset: asset.replace(/\\/g, '/'),
    bytes: raw.bytes ?? raw.afterBytes,
    budget: budgetFromReport ?? budgetFromPipeline ?? budgetForAsset(asset, budgets),
  };
}

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

export async function readAssetReports(reportDir, budgets) {
  const files = await listFiles(reportDir, (file) => file.endsWith('.report.json'));
  const reports = [];

  for (const file of files) {
    const raw = JSON.parse(await readFile(file, 'utf8'));
    const report = reportToAssetRecord(raw, file, budgets);
    if (Number.isFinite(report.bytes)) reports.push(report);
  }

  return reports;
}

export async function directoryBytes(root) {
  const files = await listFiles(root, () => true);
  return files.reduce((sum, file) => sum + statSync(file).size, 0);
}

function parseArgs(argv) {
  const args = {
    budgets: 'tools/perf-budgets/budgets.json',
    cdnSummary: undefined,
    decoderDir: 'apps/web/public/decoders',
    report: 'asset-summary.json',
    reportDir: 'assets-built/optimized',
  };

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key === 'budgets') args.budgets = value;
    if (key === 'cdn-summary') args.cdnSummary = value;
    if (key === 'decoder-dir') args.decoderDir = value;
    if (key === 'report') args.report = value;
    if (key === 'report-dir') args.reportDir = value;
  }

  return args;
}

async function readCdnViolations(summaryPath) {
  if (!summaryPath || !existsSync(summaryPath)) return [];
  const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
  return summary.violations ?? [];
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  const args = parseArgs(argv);
  const budgets = JSON.parse(await readFile(args.budgets, 'utf8'));
  const reports = await readAssetReports(args.reportDir, budgets);
  const decoderBytesTotal = await directoryBytes(args.decoderDir);
  const cdnViolations = await readCdnViolations(args.cdnSummary);
  const summary = computeVerdict(budgets, reports, {
    allowLargeAssets: env.ALLOW_LARGE_ASSETS === '1',
    cdnViolations,
    decoderBytesTotal,
  });

  await writeFile(args.report, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));

  if (summary.verdict === 'FAIL') {
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
