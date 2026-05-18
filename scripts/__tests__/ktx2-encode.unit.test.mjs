import { describe, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  FLAGS_BY_ROLE,
  KTX2_IDENTIFIER,
  buildEncodePlan,
  computeMipLevels,
  detectRoleFromGltf,
  detectTextureRoles,
  encodeKtx2,
  estimateGpuBytes,
  shouldSkipKtx2,
  toTextureReport,
} from '../ktx2-encode.mjs';

const PNG_1X1 = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154a24f5d0000000049454e44ae426082',
  'hex',
);

function tempDir() {
  return mkdtempSync(join(tmpdir(), 'ktx2-encode-'));
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function fixturePng(dir, name = 'texture.png') {
  const path = join(dir, name);
  writeFileSync(path, PNG_1X1);
  return path;
}

describe('FR-OPS-004 KTX2 encoding contract', () => {
  test('detects PBR texture roles from glTF metadata', () => {
    const gltf = {
      materials: [
        {
          pbrMetallicRoughness: {
            baseColorTexture: { index: 0 },
            metallicRoughnessTexture: { index: 2 },
          },
          normalTexture: { index: 1 },
          occlusionTexture: { index: 2 },
          emissiveTexture: { index: 3 },
        },
      ],
    };

    expect(detectTextureRoles(gltf)).toEqual([
      {
        textureIndex: 0,
        role: 'baseColor',
        slots: ['pbrMetallicRoughness.baseColorTexture'],
      },
      { textureIndex: 1, role: 'normal', slots: ['normalTexture'] },
      {
        textureIndex: 2,
        role: 'orm',
        slots: ['occlusionTexture', 'pbrMetallicRoughness.metallicRoughnessTexture'],
      },
      { textureIndex: 3, role: 'emissive', slots: ['emissiveTexture'] },
    ]);
    expect(detectRoleFromGltf(gltf, 4)).toBeNull();
  });

  test('rejects forbidden multi-role atlas binding', () => {
    const gltf = {
      materials: [
        {
          pbrMetallicRoughness: { baseColorTexture: { index: 0 } },
          emissiveTexture: { index: 0 },
        },
      ],
    };

    expect(() => detectTextureRoles(gltf)).toThrow(/multiple roles: baseColor \+ emissive/);
  });

  test('uses the required encoder flags by role', () => {
    expect(FLAGS_BY_ROLE.normal).toEqual([
      '--uastc',
      '--uastc_quality',
      '2',
      '--normal_map',
      '--genmipmap',
    ]);
    expect(FLAGS_BY_ROLE.baseColor).toEqual(['--bcmp', '--qlevel', '200', '--genmipmap']);
    expect(FLAGS_BY_ROLE.orm).toEqual(['--bcmp', '--qlevel', '200', '--linear', '--genmipmap']);
    expect(FLAGS_BY_ROLE.emissive).toEqual(['--bcmp', '--qlevel', '200', '--genmipmap']);
  });

  test('computes mipmap chain depth from texture bounds', () => {
    expect(computeMipLevels(2048, 2048)).toBe(12);
    expect(computeMipLevels(512, 256)).toBe(10);
    expect(() => computeMipLevels(0, 2048)).toThrow(/width must be a positive integer/);
  });

  test('marks skip escape hatch and already-KTX2 inputs idempotently', () => {
    expect(shouldSkipKtx2('assets-source/textures/foo.skipKtx2.png')).toBe(true);
    expect(shouldSkipKtx2('assets-source/textures/foo.png')).toBe(false);

    const plan = buildEncodePlan({
      inputPath: 'foo.ktx2',
      outputPath: 'foo.ktx2',
      role: 'baseColor',
      width: 512,
      height: 512,
      inputBytes: 100,
    });
    expect(plan.skipped).toBe(true);
    expect(plan.skipReason).toBe('already-ktx2');
  });

  test('plans ETC1S/UASTC modes, color spaces, and Lumi VRAM budget', () => {
    const roles = ['baseColor', 'normal', 'orm', 'emissive'];
    const plans = roles.map((role) =>
      buildEncodePlan({
        inputPath: `${role}.png`,
        outputPath: `${role}.ktx2`,
        role,
        width: 2048,
        height: 2048,
        inputBytes: 1_000_000,
        inputSha256: role,
      }),
    );

    expect(plans.map((plan) => [plan.role, plan.mode, plan.colorSpace])).toEqual([
      ['baseColor', 'ETC1S', 'sRGB'],
      ['normal', 'UASTC', 'linear'],
      ['orm', 'ETC1S', 'linear'],
      ['emissive', 'ETC1S', 'sRGB'],
    ]);
    expect(plans.reduce((total, plan) => total + plan.gpuBytes, 0)).toBeLessThanOrEqual(4_000_000);
    expect(estimateGpuBytes(2048, 2048, 'normal')).toBeGreaterThan(
      estimateGpuBytes(2048, 2048, 'baseColor'),
    );
  });

  test('mock encoder writes deterministic KTX2 payloads with valid identifier', async () => {
    const dir = tempDir();
    const input = fixturePng(dir);
    const outputA = join(dir, 'a.ktx2');
    const outputB = join(dir, 'b.ktx2');

    const first = await encodeKtx2({
      inputPath: input,
      outputPath: outputA,
      role: 'normal',
      mock: true,
      force: true,
    });
    const second = await encodeKtx2({
      inputPath: input,
      outputPath: outputB,
      role: 'normal',
      mock: true,
      force: true,
    });

    expect(readFileSync(outputA).subarray(0, KTX2_IDENTIFIER.length)).toEqual(KTX2_IDENTIFIER);
    expect(sha256(outputA)).toBe(sha256(outputB));
    expect(first.deterministicKey).toBe(second.deterministicKey);
    expect(first.mocked).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  test('second encode skips existing output unless forced', async () => {
    const dir = tempDir();
    const input = fixturePng(dir);
    const output = join(dir, 'texture.ktx2');

    await encodeKtx2({ inputPath: input, outputPath: output, role: 'baseColor', mock: true });
    const before = statSync(output).mtimeMs;
    const second = await encodeKtx2({ inputPath: input, outputPath: output, role: 'baseColor', mock: true });

    expect(second.skipped).toBe(true);
    expect(second.skipReason).toBe('output-exists');
    expect(statSync(output).mtimeMs).toBe(before);

    rmSync(dir, { recursive: true, force: true });
  });

  test('texture sub-report matches the parent asset report contract', async () => {
    const dir = tempDir();
    const input = fixturePng(dir, 'lumi_orm_2k.png');
    const output = join(dir, 'lumi_orm_2k.ktx2');
    const result = await encodeKtx2({
      inputPath: input,
      outputPath: output,
      role: 'orm',
      width: 2048,
      height: 2048,
      mock: true,
      force: true,
    });

    expect(toTextureReport(result)).toMatchObject({
      name: 'lumi_orm_2k.png',
      role: 'orm',
      mode: 'ETC1S',
      original_bytes: PNG_1X1.length,
      ktx2_bytes: statSync(output).size,
      gpu_bytes: result.gpuBytes,
      mip_levels: 12,
      format: 'BC1/ETC1/ASTC LDR',
      color_space: 'linear',
      mocked: true,
      skipped: false,
    });

    rmSync(dir, { recursive: true, force: true });
  });

  test('CLI prints usage on missing args', () => {
    let code = 0;
    let output = '';

    try {
      execFileSync(process.execPath, ['scripts/ktx2-encode.mjs'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (error) {
      code = error.status;
      output = `${error.stdout}${error.stderr}`;
    }

    expect(code).toBe(2);
    expect(output).toContain('usage: ktx2-encode.mjs');
  });

  test('CLI writes output and optional report JSON', () => {
    const dir = tempDir();
    const input = fixturePng(dir);
    const output = join(dir, 'texture.ktx2');
    const report = join(dir, 'texture.report.json');

    const stdout = execFileSync(
      process.execPath,
      [
        'scripts/ktx2-encode.mjs',
        '--input',
        input,
        '--output',
        output,
        '--role',
        'emissive',
        '--mock',
        '--report',
        report,
      ],
      { cwd: process.cwd(), encoding: 'utf8' },
    );

    expect(existsSync(output)).toBe(true);
    expect(JSON.parse(stdout)).toMatchObject({ role: 'emissive', mode: 'ETC1S', mocked: true });
    expect(JSON.parse(readFileSync(report, 'utf8'))).toMatchObject({ color_space: 'sRGB' });

    rmSync(dir, { recursive: true, force: true });
  });
});
