#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

function auditNumeric(report, ...keys) {
  for (const key of keys) {
    const value = report.audits?.[key]?.numericValue;
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

function checkUpperBound(metric, value, budget, summary) {
  if (!Number.isFinite(value)) {
    summary.fails.push({ metric, reason: 'missing_metric' });
    return;
  }

  if (value > budget.fail) {
    summary.fails.push({ metric, actual: value, fail: budget.fail });
  } else if (value > budget.target) {
    summary.warns.push({ metric, actual: value, target: budget.target });
  }
}

export function summarizeLighthouseReports(reports, budgets) {
  const summary = {
    verdict: 'PASS',
    fails: [],
    warns: [],
    reports: [],
  };

  for (const report of reports) {
    const url = report.finalDisplayedUrl ?? report.finalUrl ?? report.requestedUrl ?? 'unknown';
    const metrics = {
      lcp_ms_p75: auditNumeric(report, 'largest-contentful-paint', 'metrics/largest-contentful-paint'),
      inp_ms_p75: auditNumeric(report, 'interaction-to-next-paint', 'metrics/interaction-to-next-paint', 'interactive', 'max-potential-fid'),
      cls: auditNumeric(report, 'cumulative-layout-shift', 'metrics/cumulative-layout-shift'),
    };

    const beforeFails = summary.fails.length;
    const beforeWarns = summary.warns.length;
    checkUpperBound('lcp_ms_p75', metrics.lcp_ms_p75, budgets.cwv.lcp_ms_p75, summary);
    checkUpperBound('inp_ms_p75', metrics.inp_ms_p75, budgets.cwv.inp_ms_p75, summary);
    checkUpperBound('cls', metrics.cls, budgets.cwv.cls, summary);

    summary.reports.push({
      url,
      metrics,
      fails: summary.fails.length - beforeFails,
      warns: summary.warns.length - beforeWarns,
    });
  }

  summary.verdict = summary.fails.length > 0 ? 'FAIL' : 'PASS';
  return summary;
}

function parseArgs(argv) {
  const args = {
    budgets: 'tools/perf-budgets/budgets.json',
    output: 'cwv-summary.json',
    reports: [],
  };

  for (const arg of argv) {
    if (arg.startsWith('--budgets=')) args.budgets = arg.slice('--budgets='.length);
    else if (arg.startsWith('--output=')) args.output = arg.slice('--output='.length);
    else args.reports.push(arg);
  }

  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.reports.length === 0) {
    console.error('usage: check-cwv.mjs [--budgets=path] [--output=path] <lighthouse-report.json>...');
    process.exitCode = 2;
    return null;
  }

  const budgets = JSON.parse(await readFile(args.budgets, 'utf8'));
  const reports = [];

  for (const reportPath of args.reports) {
    if (!existsSync(reportPath)) {
      console.error(`missing Lighthouse report: ${reportPath}`);
      process.exitCode = 2;
      return null;
    }
    reports.push(JSON.parse(await readFile(reportPath, 'utf8')));
  }

  const summary = summarizeLighthouseReports(reports, budgets);
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

