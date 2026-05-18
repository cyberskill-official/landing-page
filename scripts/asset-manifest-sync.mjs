#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const LFS_EXTENSIONS = new Set(['.blend', '.psd', '.sbs', '.sbsar', '.fig', '.exr', '.hdr', '.spp', '.aep']);

export const TYPE_BY_EXTENSION = {
  '.blend': 'blender',
  '.psd': 'photoshop',
  '.sbs': 'substance',
  '.sbsar': 'substance',
  '.fig': 'figma',
  '.exr': 'hdri',
  '.hdr': 'hdri',
  '.spp': 'substance',
  '.aep': 'after-effects',
};

export class ManifestCheckError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

export async function syncManifest(options = {}) {
  const sourceDir = options.sourceDir ?? 'assets-source';
  const manifestPath = options.manifestPath ?? join(sourceDir, 'manifest.json');
  const existing = await readManifestOrEmpty(manifestPath);
  const files = await walkSourceAssets(sourceDir);
  const entries = {};
  const linkTargets = {};
  let newestMtime = 0;

  for (const file of files) {
    const relPath = normalizePath(relative(sourceDir, file));
    if (isPrivatePath(relPath)) continue;

    const stats = await stat(file);
    const bytes = await readFile(file);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const previous = existing.assets[relPath];
    const linkedTo = extname(file).toLowerCase() === '.blend' ? await parseBlenderLinks(file, sourceDir) : [];

    newestMtime = Math.max(newestMtime, stats.mtimeMs);
    linkTargets[relPath] = linkedTo;
    entries[relPath] = {
      path: relPath,
      type: TYPE_BY_EXTENSION[extname(file).toLowerCase()] ?? 'other',
      sha256,
      size_bytes: stats.size,
      mtime_iso: stats.mtime.toISOString(),
      linked_from: [],
      linked_to: linkedTo,
      latest_built_iso: previous?.latest_built_iso ?? null,
      latest_built_sha256: previous?.latest_built_sha256 ?? null,
      stale: Boolean(previous?.latest_built_sha256 && previous.latest_built_sha256 !== sha256),
    };
  }

  for (const [source, targets] of Object.entries(linkTargets)) {
    for (const target of targets) {
      if (entries[target]) {
        entries[target].linked_from.push(source);
      }
    }
  }

  for (const entry of Object.values(entries)) {
    entry.linked_from.sort();
    entry.linked_to.sort();
  }

  const sortedAssets = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
  const manifest = {
    version: 1,
    generated_at: newestMtime > 0 ? new Date(newestMtime).toISOString() : '1970-01-01T00:00:00.000Z',
    assets: sortedAssets,
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const previousJson = existsSync(manifestPath) ? await readFile(manifestPath, 'utf8') : '';
  const changed = json !== previousJson;
  const staleCount = Object.values(sortedAssets).filter((entry) => entry.stale).length;

  if (options.checkMode) {
    if (changed) {
      throw new ManifestCheckError('manifest divergence detected. Run pnpm asset-manifest-sync.', 2);
    }
    if (staleCount > 0) {
      throw new ManifestCheckError(`${staleCount} stale asset(s). Run pnpm asset:optimize.`, 3);
    }
  } else if (changed) {
    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, json);
  }

  return { manifest, changed, staleCount };
}

export async function recordBuildEvent(manifestPath, builtAssets, options = {}) {
  const manifest = await readManifestOrEmpty(manifestPath);
  const now = options.timestamp ?? new Date().toISOString();

  for (const assetPath of builtAssets) {
    const entry = manifest.assets[assetPath];
    if (!entry) continue;
    entry.latest_built_iso = now;
    entry.latest_built_sha256 = entry.sha256;
    entry.stale = false;
  }

  await writeFile(manifestPath, `${JSON.stringify(sortManifest(manifest), null, 2)}\n`);
}

export async function readManifestOrEmpty(manifestPath) {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch {
    return { version: 1, generated_at: '1970-01-01T00:00:00.000Z', assets: {} };
  }
}

export async function walkSourceAssets(sourceDir) {
  if (!existsSync(sourceDir)) return [];

  const entries = await readdir(sourceDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      files.push(...(await walkSourceAssets(fullPath)));
    } else if (entry.isFile() && LFS_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

export async function parseBlenderLinks(file, sourceDir) {
  const bytes = await readFile(file);
  const text = bytes.toString('latin1');
  const matches = new Set();
  const blendPathPattern = /(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.blend/g;
  const sourceRelativePath = normalizePath(relative(sourceDir, file));
  const sourceRelativeDir = dirname(sourceRelativePath);

  for (const match of text.matchAll(blendPathPattern)) {
    const raw = normalizePath(match[0]).replace(/^\/\//, '');
    const normalized =
      raw.startsWith('../') || raw.startsWith('./') || !raw.includes('/')
        ? normalizePath(normalize(join(sourceRelativeDir, raw)))
        : raw;

    if (normalized && !normalized.startsWith('../') && normalized !== sourceRelativePath) {
      matches.add(normalized);
    }
  }

  return [...matches].sort();
}

function sortManifest(manifest) {
  return {
    version: manifest.version,
    generated_at: manifest.generated_at,
    assets: Object.fromEntries(Object.entries(manifest.assets).sort(([a], [b]) => a.localeCompare(b))),
  };
}

function isPrivatePath(path) {
  return path.includes('.private.') || path.startsWith('internal/');
}

function normalizePath(path) {
  return path.split('\\').join('/');
}

function parseArgs(argv) {
  const args = {
    sourceDir: 'assets-source',
    manifestPath: 'assets-source/manifest.json',
    checkMode: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--source-dir') {
      args.sourceDir = next;
      index += 1;
    } else if (arg === '--manifest') {
      args.manifestPath = next;
      index += 1;
    } else if (arg === '--check') {
      args.checkMode = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }

  return args;
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const result = await syncManifest(args);
  console.log(`asset manifest: ${Object.keys(result.manifest.assets).length} asset(s), ${result.staleCount} stale`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(error.exitCode ?? 1);
  });
}
