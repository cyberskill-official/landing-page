#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const metricAuditIds = {
  lcp: ['metrics/largest-contentful-paint', 'largest-contentful-paint'],
  inp: ['metrics/interaction-to-next-paint', 'interaction-to-next-paint'],
  cls: ['metrics/cumulative-layout-shift', 'cumulative-layout-shift'],
  fcp: ['metrics/first-contentful-paint', 'first-contentful-paint'],
  tbt: ['metrics/total-blocking-time', 'total-blocking-time'],
  si: ['metrics/speed-index', 'speed-index'],
};

const scoreKeys = {
  performance: 'performance',
  accessibility: 'accessibility',
  bestPractices: 'best-practices',
  seo: 'seo',
};

export async function loadThresholds(budgetPath = '.github/lighthouse/budget.json') {
  const raw = await readFile(budgetPath, 'utf8');
  return JSON.parse(raw).metrics;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function routeLabel(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname || '/'}${parsed.search}`;
  } catch {
    return url;
  }
}

function auditNumeric(lhr, ids) {
  for (const id of ids) {
    const audit = lhr.audits?.[id];
    if (!audit) continue;
    if (typeof audit.numericValue === 'number') return audit.numericValue;
    if (typeof audit.score === 'number') return audit.score;
  }
  return 0;
}

function categoryScore(lhr, key) {
  return lhr.categories?.[key]?.score ?? 0;
}

function normalizeRun(lhr) {
  return {
    url: routeLabel(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? lhr.requestedUrl ?? lhr.url ?? ''),
    scores: {
      performance: categoryScore(lhr, scoreKeys.performance),
      accessibility: categoryScore(lhr, scoreKeys.accessibility),
      bestPractices: categoryScore(lhr, scoreKeys.bestPractices),
      seo: categoryScore(lhr, scoreKeys.seo),
    },
    metrics: {
      lcp: auditNumeric(lhr, metricAuditIds.lcp),
      inp: auditNumeric(lhr, metricAuditIds.inp),
      cls: auditNumeric(lhr, metricAuditIds.cls),
      fcp: auditNumeric(lhr, metricAuditIds.fcp),
      tbt: auditNumeric(lhr, metricAuditIds.tbt),
      si: auditNumeric(lhr, metricAuditIds.si),
    },
  };
}

async function readLhr(entry, manifestRoot) {
  if (entry.lhr) return entry.lhr;
  if (!entry.jsonPath) return entry;
  const reportPath = path.isAbsolute(entry.jsonPath)
    ? entry.jsonPath
    : path.resolve(manifestRoot, entry.jsonPath);
  return JSON.parse(await readFile(reportPath, 'utf8'));
}

export async function computeMedianPerUrl(manifest, options = {}) {
  const manifestRoot = options.manifestRoot ?? process.cwd();
  const entries = Array.isArray(manifest) ? manifest : Object.values(manifest);
  const grouped = new Map();

  for (const entry of entries) {
    const run = normalizeRun(await readLhr(entry, manifestRoot));
    if (!grouped.has(run.url)) grouped.set(run.url, []);
    grouped.get(run.url).push(run);
  }

  const medians = new Map();
  for (const [url, runs] of grouped.entries()) {
    medians.set(url, {
      url,
      runs: runs.length,
      scores: {
        performance: median(runs.map((run) => run.scores.performance)),
        accessibility: median(runs.map((run) => run.scores.accessibility)),
        bestPractices: median(runs.map((run) => run.scores.bestPractices)),
        seo: median(runs.map((run) => run.scores.seo)),
      },
      metrics: {
        lcp: median(runs.map((run) => run.metrics.lcp)),
        inp: median(runs.map((run) => run.metrics.inp)),
        cls: median(runs.map((run) => run.metrics.cls)),
        fcp: median(runs.map((run) => run.metrics.fcp)),
        tbt: median(runs.map((run) => run.metrics.tbt)),
        si: median(runs.map((run) => run.metrics.si)),
      },
    });
  }

  return medians;
}

function scorePercent(value) {
  return `${Math.round(value * 100)}%`;
}

function ms(value) {
  return `${Math.round(value)}ms`;
}

function statusFor(metricName, value, thresholds) {
  const threshold = thresholds[metricName];
  if (!threshold) return 'n/a';
  if (threshold.kind === 'score') {
    if (value < threshold.fail) return 'FAIL';
    if (value < threshold.target) return 'WARN';
    return 'PASS';
  }
  if (value > threshold.fail) return 'FAIL';
  if (value > threshold.target) return 'WARN';
  return 'PASS';
}

function delta(current, baseline, formatValue = ms) {
  if (typeof baseline !== 'number') return 'n/a';
  const raw = current - baseline;
  const prefix = raw > 0 ? '+' : '';
  return `${prefix}${formatValue(raw)}`;
}

export function serializableResults(results) {
  return Object.fromEntries([...results.entries()]);
}

export function resultsFromSerializable(payload) {
  return new Map(Object.entries(payload ?? {}));
}

export function renderMarkdown(results, options = {}) {
  const formFactor = options.formFactor ?? 'mobile';
  const thresholds = options.thresholds ?? {};
  const baseline = options.baseline ?? new Map();
  const rows = [...results.values()].map((result) => {
    const perf = `${scorePercent(result.scores.performance)} ${statusFor('performance', result.scores.performance, thresholds)}`;
    const lcp = `${ms(result.metrics.lcp)} ${statusFor('lcp', result.metrics.lcp, thresholds)}`;
    const inp = `${ms(result.metrics.inp)} ${statusFor('inp', result.metrics.inp, thresholds)}`;
    const cls = `${result.metrics.cls.toFixed(2)} ${statusFor('cls', result.metrics.cls, thresholds)}`;
    const tbt = `${ms(result.metrics.tbt)} ${statusFor('tbt', result.metrics.tbt, thresholds)}`;
    return `| ${result.url} | ${perf} | ${lcp} | ${inp} | ${cls} | ${tbt} |`;
  });

  const deltaRows = [...results.values()].map((result) => {
    const base = baseline.get(result.url);
    return `| ${result.url} | ${delta(result.metrics.lcp, base?.metrics?.lcp)} | ${delta(result.scores.performance, base?.scores?.performance, scorePercent)} |`;
  });

  return `## Lighthouse - median of 3 runs (${formFactor})

| URL | Perf | LCP | INP | CLS | TBT |
|---|---:|---:|---:|---:|---:|
${rows.join('\n')}

| URL | LCP delta vs main | Perf delta vs main |
|---|---:|---:|
${deltaRows.join('\n')}

Full JSON reports are attached to this workflow run and retained for 30 days.

<!-- lighthouse-summary -->
<!-- lighthouse-summary:${formFactor} -->
`;
}

async function loadManifest(manifestPath) {
  const raw = await readFile(manifestPath, 'utf8');
  return JSON.parse(raw);
}

async function maybeLoadBaseline(baselinePath) {
  if (!baselinePath) return new Map();
  try {
    const raw = await readFile(baselinePath, 'utf8');
    return resultsFromSerializable(JSON.parse(raw));
  } catch {
    return new Map();
  }
}

function parseArgs(argv) {
  const args = {
    baseline: undefined,
    baselineOutput: undefined,
    budget: '.github/lighthouse/budget.json',
    formFactor: 'mobile',
    manifest: '.lighthouseci/manifest.json',
    output: undefined,
  };

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key === 'baseline') args.baseline = value;
    if (key === 'baseline-output') args.baselineOutput = value;
    if (key === 'budget') args.budget = value;
    if (key === 'form-factor') args.formFactor = value;
    if (key === 'manifest') args.manifest = value;
    if (key === 'output') args.output = value;
  }

  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const manifest = await loadManifest(args.manifest);
  const results = await computeMedianPerUrl(manifest, {
    manifestRoot: path.dirname(path.resolve(args.manifest)),
  });
  const thresholds = await loadThresholds(args.budget);
  const baseline = await maybeLoadBaseline(args.baseline);
  const markdown = renderMarkdown(results, {
    baseline,
    formFactor: args.formFactor,
    thresholds,
  });

  if (args.output) {
    await mkdir(path.dirname(path.resolve(args.output)), { recursive: true });
    await writeFile(args.output, markdown);
  } else {
    process.stdout.write(markdown);
  }

  if (args.baselineOutput) {
    await mkdir(path.dirname(path.resolve(args.baselineOutput)), { recursive: true });
    await writeFile(args.baselineOutput, `${JSON.stringify(serializableResults(results), null, 2)}\n`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, markdown, { flag: 'a' });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
