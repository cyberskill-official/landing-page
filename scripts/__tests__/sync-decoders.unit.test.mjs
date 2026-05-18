import { describe, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  DECODER_FILES,
  MAX_DECODER_BYTES,
  assertBudget,
  buildManifest,
  checkDecoders,
  syncDecoders,
} from '../sync-decoders.mjs';

function tempDir() {
  return mkdtempSync(join(tmpdir(), 'sync-decoders-'));
}

function readRuntimeFiles(dir) {
  const entries = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) entries.push(...readRuntimeFiles(path));
    else entries.push(path);
  }
  return entries;
}

describe('FR-OPS-005 sync-decoders contract', () => {
  test('dry-run mock manifest computes all required decoder files without writing', async () => {
    const dir = tempDir();
    const manifest = await syncDecoders({ outDir: dir, dryRun: true, mode: 'mock' });

    expect(manifest.files.map((entry) => entry.path)).toEqual(DECODER_FILES.map((file) => file.local));
    expect(manifest.totals.bytes).toBeLessThanOrEqual(MAX_DECODER_BYTES);
    expect(existsSync(join(dir, 'decoders.manifest.json'))).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  test('writes local mock decoders, README, manifest, hashes, and budget', async () => {
    const dir = tempDir();
    const manifest = await syncDecoders({ outDir: dir, mode: 'mock' });
    const check = checkDecoders({ outDir: dir });

    expect(check.totalBytes).toBe(manifest.totals.bytes);
    expect(check.totalBytes).toBeLessThanOrEqual(MAX_DECODER_BYTES);
    expect(existsSync(join(dir, 'README.md'))).toBe(true);
    expect(existsSync(join(dir, 'decoders.manifest.json'))).toBe(true);

    for (const entry of manifest.files) {
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.bytes).toBe(statSync(join(dir, entry.path)).size);
    }

    rmSync(dir, { recursive: true, force: true });
  });

  test('mock WASM files are streaming-compilable minimal modules', async () => {
    const dir = tempDir();
    await syncDecoders({ outDir: dir, mode: 'mock' });

    await WebAssembly.compile(readFileSync(join(dir, 'draco/draco_decoder.wasm')));
    await WebAssembly.compile(readFileSync(join(dir, 'basis/basis_transcoder.wasm')));

    rmSync(dir, { recursive: true, force: true });
  });

  test('sync is idempotent for unchanged versions', async () => {
    const dir = tempDir();
    await syncDecoders({ outDir: dir, mode: 'mock' });
    const before = readRuntimeFiles(dir).map((path) => [path, readFileSync(path).toString('hex')]);
    await syncDecoders({ outDir: dir, mode: 'mock' });
    const after = readRuntimeFiles(dir).map((path) => [path, readFileSync(path).toString('hex')]);

    expect(after).toEqual(before);

    rmSync(dir, { recursive: true, force: true });
  });

  test('installed decoder payload currently exceeds the FR budget and stays isolated', () => {
    const { manifest } = buildManifest({ mode: 'installed' });

    expect(manifest.totals.bytes).toBeGreaterThan(MAX_DECODER_BYTES);
    expect(() => assertBudget(manifest)).toThrow(/exceeded 245760 byte ceiling/);
  });

  test('runtime code points to same-origin decoder paths and avoids CDN hosts', () => {
    const runtimeRoots = ['apps/web/app', 'apps/web/components', 'apps/web/lib'];
    const runtimeFiles = runtimeRoots.flatMap((root) => readRuntimeFiles(resolve(root)));
    const cdnPattern = /unpkg|jsdelivr|cdnjs|threejs\.org/;

    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(cdnPattern);
    }

    const decoderConfig = readFileSync('apps/web/lib/canvas/decoder-config.ts', 'utf8');
    expect(decoderConfig).toContain("draco: '/decoders/draco/'");
    expect(decoderConfig).toContain("basis: '/decoders/basis/'");
    expect(decoderConfig).toContain("meshoptModule: '/decoders/meshopt/meshopt_decoder.module.js'");
    expect(decoderConfig).toContain('setDecoderPath');
    expect(decoderConfig).toContain('setMeshoptDecoder');
    expect(decoderConfig).toContain('setKTX2Loader');
  });

  test('Next headers serve decoders immutably and wasm with application/wasm', () => {
    const nextConfig = readFileSync('apps/web/next.config.ts', 'utf8');

    expect(nextConfig).toContain('/decoders/:path*');
    expect(nextConfig).toContain('public, immutable, max-age=31536000');
    expect(nextConfig).toContain('/decoders/draco/draco_decoder.wasm');
    expect(nextConfig).toContain('/decoders/basis/basis_transcoder.wasm');
    expect(nextConfig).toContain('application/wasm');
  });

  test('CLI check validates synced files', () => {
    const dir = tempDir();
    execFileSync(process.execPath, ['scripts/sync-decoders.mjs', '--out-dir', dir, '--mode', 'mock'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    const stdout = execFileSync(process.execPath, ['scripts/sync-decoders.mjs', '--out-dir', dir, '--check'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(JSON.parse(stdout)).toMatchObject({ status: 'ok', files: 5 });

    rmSync(dir, { recursive: true, force: true });
  });
});
