#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frRoot = path.join(root, 'docs/feature-requests');
const defaultReport = path.join(root, 'docs/qa/FR-DELIVERABLE-AUDIT-2026-05-18.md');
const decoderBudgetBytes = 245_760;

const blockedToolHints = [
  {
    id: 'blender-missing',
    applies: (fr) => declaredPaths(fr).some((item) => item.includes('.blend') || item.includes('blender/')),
    available: () => commandExists('blender'),
    reason: 'Blender is not installed; Blender-authored production assets cannot be validated or honestly shipped here.',
  },
  {
    id: 'decoder-budget-current-deps',
    applies: (fr) => fr.id === 'FR-OPS-005',
    available: () => {
      const size = currentDecoderBrotliSize();
      return size == null || size <= decoderBudgetBytes;
    },
    reason: () => {
      const size = currentDecoderBrotliSize();
      if (size == null) {
        return 'Required decoder candidates could not be located in current dependencies.';
      }
      return `Current pinned decoder candidates total ${formatBytes(size)} Brotli, exceeding the FR-OPS-005 240 KB budget (${formatBytes(decoderBudgetBytes)}).`;
    },
  },
];

function commandExists(name) {
  const pathParts = (process.env.PATH ?? '').split(path.delimiter);
  return pathParts.some((part) => existsSync(path.join(part, name)));
}

function packageRoot(packageName) {
  const pnpmRoot = path.join(root, 'node_modules/.pnpm');
  if (!existsSync(pnpmRoot)) return null;
  const prefix = `${packageName.replace('/', '+')}@`;
  const entry = readdirSync(pnpmRoot, { withFileTypes: true })
    .filter((item) => item.isDirectory() && item.name.startsWith(prefix))
    .sort()
    .at(-1);
  if (!entry) return null;
  return path.join(pnpmRoot, entry.name, 'node_modules', packageName);
}

function currentDecoderFiles() {
  const threeRoot = packageRoot('three');
  if (!threeRoot) return [];

  return [
    'examples/jsm/libs/draco/draco_decoder.wasm',
    'examples/jsm/libs/draco/draco_wasm_wrapper.js',
    'examples/jsm/libs/meshopt_decoder.module.js',
    'examples/jsm/libs/basis/basis_transcoder.js',
    'examples/jsm/libs/basis/basis_transcoder.wasm',
  ].map((item) => path.join(threeRoot, item));
}

function currentDecoderBrotliSize() {
  const files = currentDecoderFiles();
  if (files.length === 0 || files.some((file) => !existsSync(file))) return null;
  return files.reduce((total, file) => total + brotliCompressSync(readFileSync(file)).byteLength, 0);
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && /^FR-.*\.md$/.test(entry.name) && !entry.name.endsWith('.audit.md')) {
      out.push(full);
    }
  }
  return out.sort();
}

function parseScalar(value) {
  const trimmed = stripInlineComment(value).trim();
  if (trimmed === '[]') return [];
  if (/^\[.*\]$/.test(trimmed)) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  if (trimmed === 'null') return null;
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  if (!match) return {};

  const frontmatter = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    const keyMatch = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const parsed = parseScalar(keyMatch[2]);
      frontmatter[currentKey] = parsed === '' ? [] : parsed;
      continue;
    }

    const listItem = /^\s*-\s+(.+)$/.exec(line);
    if (listItem && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) frontmatter[currentKey] = [];
      frontmatter[currentKey].push(cleanDeclaredPath(listItem[1]));
    }
  }
  return frontmatter;
}

function cleanDeclaredPath(value) {
  return stripInlineComment(value)
    .replace(/^['"]|['"]$/g, '')
    .replace(/`/g, '')
    .trim();
}

function stripInlineComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if ((char === '"' || char === "'") && value[i - 1] !== '\\') {
      quote = quote === char ? null : quote ?? char;
    }
    if (char === '#' && quote == null && /\s/.test(value[i - 1] ?? ' ')) {
      return value.slice(0, i).trimEnd();
    }
  }
  return value;
}

function declaredPaths(fr) {
  return [...array(fr.new_files), ...array(fr.modified_files)]
    .map(cleanDeclaredPath)
    .filter((item) => item && !item.startsWith('docs/feature-requests/'));
}

function array(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
}

function expandBraces(pattern) {
  const match = /\{([^{}]+)\}/.exec(pattern);
  if (!match) return [pattern];
  const values = match[1].split(',').flatMap((part) => expandRange(part.trim())).filter(Boolean);
  return values.flatMap((value) => expandBraces(pattern.slice(0, match.index) + value + pattern.slice(match.index + match[0].length)));
}

function expandRange(value) {
  const match = /^(\d+)\.\.(\d+)$/.exec(value);
  if (!match) return [value];
  const start = Number(match[1]);
  const end = Number(match[2]);
  const step = start <= end ? 1 : -1;
  const out = [];
  for (let item = start; step > 0 ? item <= end : item >= end; item += step) {
    out.push(String(item));
  }
  return out;
}

function isConcretePath(item) {
  return !/[()[\]*?]/.test(item) && !item.includes('...') && !/\s/.test(item);
}

function deliverableStatus(fr) {
  const raw = declaredPaths(fr);
  const expanded = raw.flatMap(expandBraces);
  const concrete = expanded.filter(isConcretePath);
  const manual = expanded.filter((item) => !isConcretePath(item));
  const missing = concrete.filter((item) => !existsSync(path.join(root, item)));
  return {
    declared: raw.length,
    concrete: concrete.length,
    present: concrete.length - missing.length,
    missing,
    manual,
  };
}

function phaseSort(phase) {
  const match = /^P(\d+)/.exec(phase ?? '');
  return match ? Number(match[1]) : 99;
}

function loadFrs() {
  return walk(frRoot).map((file) => {
    const source = readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(source);
    return {
      ...frontmatter,
      file,
      relFile: path.relative(root, file),
      auditFile: file.replace(/\.md$/, '.audit.md'),
    };
  }).sort((a, b) =>
    phaseSort(a.phase) - phaseSort(b.phase) ||
    String(a.module).localeCompare(String(b.module)) ||
    String(a.id).localeCompare(String(b.id)),
  );
}

function isShippedStatus(status) {
  return String(status ?? '').trim().startsWith('shipped');
}

function classify(fr, shippedIds) {
  const deliverables = deliverableStatus(fr);
  const missingDeps = array(fr.depends_on).filter((dep) => !shippedIds.has(dep));
  const toolBlockers = blockedToolHints
    .filter((hint) => hint.applies(fr) && !hint.available())
    .map((hint) => `${hint.id}: ${typeof hint.reason === 'function' ? hint.reason() : hint.reason}`);

  if (fr.status === 'blocked') return { outcome: 'blocked', reason: 'FR frontmatter status is blocked.' };
  if (toolBlockers.length > 0 && !isShippedStatus(fr.status)) return { outcome: 'blocked', reason: toolBlockers.join(' ') };
  if (missingDeps.length > 0 && !isShippedStatus(fr.status)) return { outcome: 'blocked', reason: `Dependencies not shipped: ${missingDeps.join(', ')}.` };
  if (deliverables.missing.length > 0) return { outcome: 'missing-deliverables', reason: `${deliverables.missing.length} declared concrete file(s) missing.` };
  if (isShippedStatus(fr.status)) return { outcome: 'shipped-verified', reason: 'Marked shipped and declared concrete deliverables are present.' };
  return { outcome: 'ready-for-implementation', reason: 'Dependencies satisfied but FR is not marked shipped.' };
}

function renderReport(frs) {
  const shippedIds = new Set(frs.filter((fr) => isShippedStatus(fr.status)).map((fr) => fr.id));
  const rows = frs.map((fr) => {
    const deliverables = deliverableStatus(fr);
    const classification = classify(fr, shippedIds);
    return { fr, deliverables, classification };
  });

  const counts = rows.reduce((acc, row) => {
    acc[row.classification.outcome] = (acc[row.classification.outcome] ?? 0) + 1;
    return acc;
  }, {});

  const lines = [
    '# FR Deliverable Audit',
    '',
    'Generated: 2026-05-18',
    '',
    'This report checks every `docs/feature-requests/**/FR-*.md` file one by one against its declared frontmatter, dependency status, audit companion, and concrete deliverable paths. It deliberately does not treat spec text as implementation.',
    '',
    '## Summary',
    '',
    `- Total FRs checked: ${rows.length}`,
    `- Shipped with declared deliverables present: ${counts['shipped-verified'] ?? 0}`,
    `- Blocked: ${counts.blocked ?? 0}`,
    `- Missing deliverables: ${counts['missing-deliverables'] ?? 0}`,
    `- Ready for implementation: ${counts['ready-for-implementation'] ?? 0}`,
    '',
    '## One-By-One Results',
    '',
    '| FR | Phase | Module | Frontmatter status | Outcome | Deliverables | Reason |',
    '|---|---:|---|---|---|---:|---|',
  ];

  for (const row of rows) {
    const { fr, deliverables, classification } = row;
    const deliverableCell = `${deliverables.present}/${deliverables.concrete}`;
    const reason = classification.reason.replace(/\|/g, '\\|');
    lines.push(
      `| [${fr.id}](${path.relative(path.dirname(defaultReport), fr.file).replaceAll(path.sep, '/')}) | ${fr.phase ?? ''} | ${fr.module ?? ''} | ${fr.status ?? ''} | ${classification.outcome} | ${deliverableCell} | ${reason} |`,
    );
  }

  lines.push('', '## Missing Deliverable Detail', '');
  for (const row of rows.filter((item) => item.deliverables.missing.length > 0)) {
    lines.push(`### ${row.fr.id}`);
    lines.push('');
    for (const missing of row.deliverables.missing) {
      lines.push(`- Missing: \`${missing}\``);
    }
    lines.push('');
  }

  lines.push('## Blocker Notes', '');
  lines.push('- Blender-dependent asset FRs are blocked in this environment because `blender` is not installed. Placeholder `.blend` manifests do not satisfy production asset FRs.');
  lines.push('- External-launch FRs remain blocked until production deployment, DNS, paid/native review, or manual submission evidence exists.');
  lines.push('- For implementation work, use this report as the queue: resolve `missing-deliverables` only when dependencies and tools are genuinely available; do not promote `accepted` spec files to `shipped` without live verification.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
  const output = outputArg ? path.resolve(root, outputArg.slice('--output='.length)) : defaultReport;
  const report = renderReport(loadFrs());
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, report);
  console.log(`Wrote ${path.relative(root, output)}`);

  if (args.has('--strict')) {
    const hasMissingShipped = report.includes('| shipped | missing-deliverables |');
    if (hasMissingShipped) process.exitCode = 1;
  }
}

main();
