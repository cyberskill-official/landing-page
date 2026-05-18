import { describe, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const PIPE = 'scripts/gltf-pipeline.mjs';
const LUMI_FIXTURE = 'scripts/__tests__/fixtures/lumi.raw.glb';
const STATIC_FIXTURE = 'scripts/__tests__/fixtures/static-prop.raw.glb';

function tempPath(name) {
  return join(mkdtempSync(join(tmpdir(), 'gltf-pipeline-')), name);
}

function runPipeline(args) {
  return execFileSync(process.execPath, [PIPE, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

async function extensionsFor(path) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const bytes = readFileSync(path);
  const jsonDoc = await io.binaryToJSON(bytes);
  return jsonDoc.json.extensionsUsed ?? [];
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('FR-OPS-001 gltf-pipeline', () => {
  test('prints usage on no args', () => {
    let code = 0;
    let output = '';

    try {
      execFileSync(process.execPath, [PIPE], { cwd: process.cwd(), encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      code = error.status;
      output = `${error.stdout}${error.stderr}`;
    }

    expect(code).toBe(2);
    expect(output).toContain('usage: gltf-pipeline.mjs');
  });

  test('uses Meshopt for Lumi/morph-bearing input', async () => {
    const output = tempPath('lumi.glb');
    runPipeline([LUMI_FIXTURE, output]);

    const extensions = await extensionsFor(output);
    const report = JSON.parse(readFileSync(output.replace(/\.glb$/, '.report.json'), 'utf8'));

    expect(report.strategy).toBe('meshopt');
    expect(report.hasMorph).toBe(true);
    expect(extensions).toContain('EXT_meshopt_compression');
    expect(extensions).not.toContain('KHR_draco_mesh_compression');
  });

  test('uses Draco for static props', async () => {
    const output = tempPath('static-prop.glb');
    runPipeline([STATIC_FIXTURE, output]);

    const extensions = await extensionsFor(output);
    const report = JSON.parse(readFileSync(output.replace(/\.glb$/, '.report.json'), 'utf8'));

    expect(report.strategy).toBe('draco');
    expect(report.hasMorph).toBe(false);
    expect(report.hasSkin).toBe(false);
    expect(extensions).toContain('KHR_draco_mesh_compression');
    expect(extensions).not.toContain('EXT_meshopt_compression');
  });

  test('reports pre-pass order and required shape', () => {
    const output = tempPath('lumi.glb');
    runPipeline([LUMI_FIXTURE, output]);

    const report = JSON.parse(readFileSync(output.replace(/\.glb$/, '.report.json'), 'utf8'));
    expect(report).toMatchObject({
      input: LUMI_FIXTURE,
      output,
      strategy: 'meshopt',
      hasMorph: true,
      hasSkin: false,
    });
    expect(typeof report.beforeBytes).toBe('number');
    expect(typeof report.afterBytes).toBe('number');
    expect(typeof report.shrinkPercent).toBe('string');
    expect(report.steps.map((step) => step.name)).toEqual([
      'dedup',
      'prune',
      'weld',
      'resample',
      'meshopt',
      'textureCompress',
    ]);
  });

  test('is deterministic for identical input and config', () => {
    const outputA = tempPath('a.glb');
    const outputB = tempPath('b.glb');

    runPipeline([LUMI_FIXTURE, outputA]);
    runPipeline([LUMI_FIXTURE, outputB]);

    expect(sha256(outputA)).toBe(sha256(outputB));
  });

  test('does not mutate raw input', () => {
    const before = statSync(LUMI_FIXTURE);
    const output = tempPath('lumi.glb');

    runPipeline([LUMI_FIXTURE, output]);

    const after = statSync(LUMI_FIXTURE);
    expect(after.size).toBe(before.size);
    expect(after.mtimeMs).toBe(before.mtimeMs);
  });

  test('dry-run writes no files and prints report JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gltf-pipeline-dry-'));
    const output = join(dir, 'dry.glb');

    const stdout = runPipeline([LUMI_FIXTURE, output, '--dry-run']);
    const report = JSON.parse(stdout);

    expect(report.dryRun).toBe(true);
    expect(report.output).toBe(output);
    expect(existsSync(output)).toBe(false);
    expect(existsSync(output.replace(/\.glb$/, '.report.json'))).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });
});
