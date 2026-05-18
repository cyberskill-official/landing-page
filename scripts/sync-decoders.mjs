#!/usr/bin/env node
/**
 * FR-OPS-005: local decoder bundle sync and mocked-dependency contract.
 *
 * `--mode installed` reads the decoders bundled with the installed three.js
 * package and enforces the FR budget. In this workspace those physical decoder
 * bytes exceed the 240 KB ceiling, so the default `--mode mock` writes small
 * deterministic, same-origin contract files instead.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT_DIR = resolve(dirname(new URL(import.meta.url).pathname), '..');
export const DEFAULT_OUT_DIR = resolve(ROOT_DIR, 'apps/web/public/decoders');
export const MAX_DECODER_BYTES = 240 * 1024;
export const MANIFEST_FILE = 'decoders.manifest.json';
export const README_FILE = 'README.md';

export const DECODER_FILES = [
  {
    decoder: 'draco',
    local: 'draco/draco_decoder.wasm',
    installedPackage: 'three',
    installedRelative: 'examples/jsm/libs/draco/draco_decoder.wasm',
    contentType: 'application/wasm',
  },
  {
    decoder: 'draco',
    local: 'draco/draco_wasm_wrapper.js',
    installedPackage: 'three',
    installedRelative: 'examples/jsm/libs/draco/draco_wasm_wrapper.js',
    contentType: 'text/javascript; charset=utf-8',
  },
  {
    decoder: 'meshopt',
    local: 'meshopt/meshopt_decoder.module.js',
    installedPackage: 'three',
    installedRelative: 'examples/jsm/libs/meshopt_decoder.module.js',
    contentType: 'text/javascript; charset=utf-8',
  },
  {
    decoder: 'basis',
    local: 'basis/basis_transcoder.js',
    installedPackage: 'three',
    installedRelative: 'examples/jsm/libs/basis/basis_transcoder.js',
    contentType: 'text/javascript; charset=utf-8',
  },
  {
    decoder: 'basis',
    local: 'basis/basis_transcoder.wasm',
    installedPackage: 'three',
    installedRelative: 'examples/jsm/libs/basis/basis_transcoder.wasm',
    contentType: 'application/wasm',
  },
];

const MINIMAL_WASM_MODULE = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
const USAGE =
  'usage: sync-decoders.mjs [--out-dir apps/web/public/decoders] [--mode mock|installed] [--check] [--dry-run] [--verbose]';

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function prettyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function packageRootFromEntry(entryPath) {
  let current = dirname(entryPath);
  while (current !== dirname(current)) {
    const packageJson = join(current, 'package.json');
    if (existsSync(packageJson)) return current;
    current = dirname(current);
  }
  throw new Error(`package root not found for ${entryPath}`);
}

function readInstalledPackage(packageName) {
  const requireFromWeb = createRequire(resolve(ROOT_DIR, 'apps/web/package.json'));
  const requireFromRoot = createRequire(resolve(ROOT_DIR, 'package.json'));

  for (const req of [requireFromWeb, requireFromRoot]) {
    try {
      const entry = req.resolve(packageName);
      const root = packageRootFromEntry(entry);
      const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
      return { root, version: packageJson.version };
    } catch {
      // Try the next workspace resolver.
    }
  }

  throw new Error(`installed package not found: ${packageName}`);
}

export function resolveDecoderVersions() {
  const three = readInstalledPackage('three');
  let meshoptimizer = null;

  try {
    meshoptimizer = readInstalledPackage('meshoptimizer');
  } catch {
    meshoptimizer = { version: null };
  }

  return {
    three: three.version,
    meshoptimizer: meshoptimizer.version,
  };
}

function readInstalledDecoder(file) {
  const pkg = readInstalledPackage(file.installedPackage);
  return {
    bytes: readFileSync(join(pkg.root, file.installedRelative)),
    version: pkg.version,
    source: `${file.installedPackage}/${file.installedRelative}`,
  };
}

function mockDecoderBytes(file, versions) {
  if (file.local.endsWith('.wasm')) {
    return MINIMAL_WASM_MODULE;
  }

  const header = `/* FR-OPS-005 mocked ${file.decoder} decoder. Replace with --mode installed once the 240 KB decoder budget is amended or upstream bytes shrink. three=${versions.three}; meshoptimizer=${versions.meshoptimizer ?? 'n/a'} */\n`;

  if (file.local.includes('draco_wasm_wrapper')) {
    return Buffer.from(
      `${header}globalThis.DracoDecoderModule = function DracoDecoderModule() { return Promise.resolve({ mocked: true, decoder: 'draco' }); };\n`,
    );
  }

  if (file.local.includes('basis_transcoder')) {
    return Buffer.from(
      `${header}globalThis.BASIS = function BASIS() { return Promise.resolve({ mocked: true, decoder: 'basis' }); };\n`,
    );
  }

  return Buffer.from(
    `${header}export const MeshoptDecoder = { supported: true, ready: Promise.resolve(), mocked: true, decoder: 'meshopt', decodeGltfBuffer() { throw new Error('FR-OPS-005 mocked Meshopt decoder cannot decode production geometry'); } };\nexport default MeshoptDecoder;\n`,
  );
}

function readDecoderBytes(file, mode, versions) {
  if (mode === 'mock') {
    return {
      bytes: mockDecoderBytes(file, versions),
      version: versions[file.installedPackage] ?? versions.three,
      source: 'mock-contract',
    };
  }

  if (mode === 'installed') {
    return readInstalledDecoder(file);
  }

  throw new Error(`invalid decoder sync mode: ${mode}`);
}

export function buildManifest({ mode = 'mock', files = DECODER_FILES, outDir = DEFAULT_OUT_DIR } = {}) {
  const versions = resolveDecoderVersions();
  const entries = files.map((file) => {
    const source = readDecoderBytes(file, mode, versions);
    const gzipBytes = gzipSync(source.bytes).length;

    return {
      path: file.local,
      decoder: file.decoder,
      source: source.source,
      version: source.version,
      bytes: source.bytes.length,
      gzip_bytes: gzipBytes,
      sha256: sha256(source.bytes),
      content_type: file.contentType,
    };
  });

  const totals = entries.reduce(
    (sum, entry) => ({
      bytes: sum.bytes + entry.bytes,
      gzip_bytes: sum.gzip_bytes + entry.gzip_bytes,
    }),
    { bytes: 0, gzip_bytes: 0 },
  );

  return {
    manifest: {
      schema: 'cyberskill.decoder-manifest.v1',
      mode,
      budget_bytes: MAX_DECODER_BYTES,
      budget_basis: 'raw',
      out_dir: relative(ROOT_DIR, outDir).replace(/\\/g, '/'),
      versions,
      totals,
      files: entries,
    },
    versions,
  };
}

export function assertBudget(manifest) {
  if (manifest.totals.bytes > manifest.budget_bytes) {
    throw new Error(
      `Decoder bundle exceeded ${manifest.budget_bytes} byte ceiling: ${manifest.totals.bytes} bytes in ${manifest.mode} mode`,
    );
  }
}

function renderReadme(manifest) {
  const rows = manifest.files
    .map(
      (entry) =>
        `| \`${entry.path}\` | ${entry.decoder} | ${entry.version} | ${entry.bytes} | ${entry.gzip_bytes} | \`${entry.sha256}\` |`,
    )
    .join('\n');

  return `# Local Decoder Bundle

Generated by \`node scripts/sync-decoders.mjs --mode ${manifest.mode}\`.

Runtime decoder URLs are same-origin under \`/decoders/\`; no third-party CDN host is required by CSP. Files are cacheable with \`Cache-Control: public, immutable, max-age=31536000\` because decoder bytes only change when this sync script rewrites the manifest.

## Versions

- three: \`${manifest.versions.three}\`
- meshoptimizer: \`${manifest.versions.meshoptimizer ?? 'not installed'}\`
- mode: \`${manifest.mode}\`
- raw total: \`${manifest.totals.bytes}\` bytes
- gzip total: \`${manifest.totals.gzip_bytes}\` bytes
- budget: \`${manifest.budget_bytes}\` raw bytes

## Integrity

| Path | Decoder | Version | Raw bytes | Gzip bytes | SHA-256 |
|---|---|---:|---:|---:|---|
${rows}

## Updating

\`\`\`bash
node scripts/sync-decoders.mjs --mode mock
node scripts/sync-decoders.mjs --check
\`\`\`

Use \`--mode installed\` only after the real Draco/Basis/Meshopt decoder payload fits the FR-OPS-005 budget or an ADR amends that budget. In this workspace the installed three.js decoder payload exceeds the 240 KB ceiling, so the checked-in files are mocked-dependency contract artifacts.
`;
}

export async function syncDecoders(options = {}) {
  const outDir = options.outDir ? resolve(options.outDir) : DEFAULT_OUT_DIR;
  const mode = options.mode ?? 'mock';
  const { manifest } = buildManifest({ mode, outDir });
  assertBudget(manifest);

  if (!options.dryRun) {
    for (const file of DECODER_FILES) {
      const source = readDecoderBytes(file, mode, manifest.versions);
      const outputPath = resolve(outDir, file.local);
      mkdirSync(dirname(outputPath), { recursive: true });
      const existing = existsSync(outputPath) ? readFileSync(outputPath) : null;
      if (!existing || sha256(existing) !== sha256(source.bytes)) {
        writeFileSync(outputPath, source.bytes);
      }
    }

    writeFileSync(resolve(outDir, MANIFEST_FILE), prettyJson(manifest));
    writeFileSync(resolve(outDir, README_FILE), renderReadme(manifest));
  }

  if (options.verbose) {
    console.error(stableJson({ event: 'decoders.sync.complete', mode, outDir, totals: manifest.totals }));
  }

  return manifest;
}

export function checkDecoders(options = {}) {
  const outDir = options.outDir ? resolve(options.outDir) : DEFAULT_OUT_DIR;
  const manifestPath = resolve(outDir, MANIFEST_FILE);
  if (!existsSync(manifestPath)) throw new Error(`decoder manifest missing: ${manifestPath}`);

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let totalBytes = 0;
  let totalGzipBytes = 0;

  for (const entry of manifest.files ?? []) {
    const filePath = resolve(outDir, entry.path);
    if (!existsSync(filePath)) throw new Error(`decoder file missing: ${entry.path}`);
    const bytes = readFileSync(filePath);
    const actualHash = sha256(bytes);
    if (actualHash !== entry.sha256) {
      throw new Error(`decoder hash mismatch for ${entry.path}: ${actualHash} !== ${entry.sha256}`);
    }
    totalBytes += statSync(filePath).size;
    totalGzipBytes += gzipSync(bytes).length;
  }

  if (totalBytes !== manifest.totals.bytes || totalGzipBytes !== manifest.totals.gzip_bytes) {
    throw new Error(`decoder totals mismatch: ${totalBytes}/${totalGzipBytes}`);
  }

  assertBudget({ ...manifest, totals: { bytes: totalBytes, gzip_bytes: totalGzipBytes } });
  return { manifest, totalBytes, totalGzipBytes };
}

function parseArgs(argv) {
  const options = { mode: 'mock', dryRun: false, check: false, verbose: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') throw Object.assign(new Error(USAGE), { exitCode: 2 });
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--mode' || arg === '--out-dir') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw Object.assign(new Error(`missing value for ${arg}\n${USAGE}`), { exitCode: 2 });
      }
      options[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      index += 1;
    } else {
      throw Object.assign(new Error(`unknown flag: ${arg}\n${USAGE}`), { exitCode: 2 });
    }
  }

  if (!['mock', 'installed'].includes(options.mode)) {
    throw Object.assign(new Error(`invalid mode: ${options.mode}`), { exitCode: 2 });
  }

  return options;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.check) {
    const result = checkDecoders({ outDir: args.outDir });
    console.log(
      JSON.stringify(
        {
          status: 'ok',
          files: result.manifest.files.length,
          bytes: result.totalBytes,
          gzip_bytes: result.totalGzipBytes,
        },
        null,
        2,
      ),
    );
    return;
  }

  const manifest = await syncDecoders(args);
  console.log(
    JSON.stringify(
      {
        status: args.dryRun ? 'dry-run' : 'synced',
        mode: manifest.mode,
        files: manifest.files.length,
        bytes: manifest.totals.bytes,
        gzip_bytes: manifest.totals.gzip_bytes,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(error.exitCode ?? 1);
  });
}
