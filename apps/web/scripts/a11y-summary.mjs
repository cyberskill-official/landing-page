#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function flattenBlockingViolations(report) {
  return report.flatMap((entry) =>
    (entry.blockingViolations ?? []).flatMap((violation) =>
      (violation.nodes ?? []).map((node) => ({
        help: violation.help,
        helpUrl: violation.helpUrl,
        impact: violation.impact,
        route: entry.route,
        ruleId: violation.id,
        selector: node.target?.join(' ') ?? 'n/a',
        viewport: entry.viewport,
      })),
    ),
  );
}

export function renderA11yMarkdown(report) {
  const blocking = flattenBlockingViolations(report);
  const bestPracticeCount = report.reduce((sum, entry) => sum + (entry.bestPracticeViolations?.length ?? 0), 0);

  if (blocking.length === 0) {
    return `## a11y - axe-core results

Verdict: PASS. No serious or critical WCAG 2.2 AA axe violations across ${report.length} route/viewport checks.

Best-practice warnings: ${bestPracticeCount} informational findings.

Full JSON reports are attached to this workflow run and retained for 30 days.

<!-- a11y-report -->
`;
  }

  const rows = blocking.map((violation) =>
    `| ${violation.route} | ${violation.viewport} | \`${violation.ruleId}\` | ${violation.impact} | \`${violation.selector}\` | [${violation.help}](${violation.helpUrl}) |`,
  );

  return `## a11y - axe-core results

Verdict: FAIL. ${blocking.length} serious/critical WCAG 2.2 AA axe findings.

| Route | Viewport | Rule | Impact | Selector | Suggested fix |
|---|---|---|---|---|---|
${rows.join('\n')}

Best-practice warnings: ${bestPracticeCount} informational findings.

Full JSON reports are attached to this workflow run and retained for 30 days.

<!-- a11y-report -->
`;
}

function parseArgs(argv) {
  const args = {
    output: undefined,
    report: 'apps/web/a11y-report.json',
  };

  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key === 'output') args.output = value;
    if (key === 'report') args.report = value;
  }

  return args;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = JSON.parse(await readFile(args.report, 'utf8'));
  const markdown = renderA11yMarkdown(report);

  if (args.output) {
    await mkdir(path.dirname(path.resolve(args.output)), { recursive: true });
    await writeFile(args.output, markdown);
  } else {
    process.stdout.write(markdown);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
