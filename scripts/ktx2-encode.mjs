#!/usr/bin/env node
/**
 * FR-OPS-004: role-aware KTX2/Basis texture encoder contract.
 *
 * The production path uses toktx + ktx2check when both binaries are installed.
 * Local zero-touch runs fall back to a deterministic mock KTX2 payload so the
 * pipeline can validate request/response shape without hiding the dependency.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

export const TEXTURE_ROLES = ['baseColor', 'normal', 'orm', 'emissive'];

export const FLAGS_BY_ROLE = {
  normal: ['--uastc', '--uastc_quality', '2', '--normal_map', '--genmipmap'],
  baseColor: ['--bcmp', '--qlevel', '200', '--genmipmap'],
  orm: ['--bcmp', '--qlevel', '200', '--linear', '--genmipmap'],
  emissive: ['--bcmp', '--qlevel', '200', '--genmipmap'],
};

export const MODE_BY_ROLE = {
  normal: 'UASTC',
  baseColor: 'ETC1S',
  orm: 'ETC1S',
  emissive: 'ETC1S',
};

export const COLOR_SPACE_BY_ROLE = {
  normal: 'linear',
  baseColor: 'sRGB',
  orm: 'linear',
  emissive: 'sRGB',
};

export const FORMAT_BY_MODE = {
  UASTC: 'BC7/ASTC LDR',
  ETC1S: 'BC1/ETC1/ASTC LDR',
};

export const KTX2_IDENTIFIER = Buffer.from([
  0xab, 0x4b, 0x54, 0x58, 0x20, 0x32, 0x30, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const USAGE =
  'usage: ktx2-encode.mjs --input <png|ktx2> --output <ktx2|png> --role <baseColor|normal|orm|emissive> [--width n --height n] [--mock] [--force] [--report path] [--verbose]';

function assertRole(role) {
  if (!TEXTURE_ROLES.includes(role)) {
    throw Object.assign(new Error(`invalid texture role: ${role}`), { exitCode: 2 });
  }
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function commandExists(command) {
  return spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' }).status === 0;
}

function readPositiveInt(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw Object.assign(new Error(`${label} must be a positive integer`), { exitCode: 2 });
  }
  return parsed;
}

function readPngDimensions(inputPath) {
  const bytes = readFileSync(inputPath);
  const isPng =
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes.toString('ascii', 12, 16) === 'IHDR';

  if (!isPng) {
    return null;
  }

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

export function computeMipLevels(width, height) {
  const w = readPositiveInt(width, 'width');
  const h = readPositiveInt(height, 'height');
  return Math.floor(Math.log2(Math.max(w, h))) + 1;
}

export function shouldSkipKtx2(inputPath) {
  return /\.skipKtx2\.png$/i.test(inputPath);
}

export function isKtx2Path(inputPath) {
  return extname(inputPath).toLowerCase() === '.ktx2';
}

export function detectTextureRoles(gltf) {
  const byIndex = new Map();

  function addRole(textureIndex, role, slot) {
    if (!Number.isInteger(textureIndex)) return;
    const existing = byIndex.get(textureIndex);

    if (existing && existing.role !== role) {
      const roles = [existing.role, role].sort().join(' + ');
      throw new Error(`texture index ${textureIndex} is bound to multiple roles: ${roles}`);
    }

    if (existing) {
      existing.slots.push(slot);
    } else {
      byIndex.set(textureIndex, { textureIndex, role, slots: [slot] });
    }
  }

  for (const material of gltf?.materials ?? []) {
    const pbr = material.pbrMetallicRoughness ?? {};
    addRole(pbr.baseColorTexture?.index, 'baseColor', 'pbrMetallicRoughness.baseColorTexture');
    addRole(material.normalTexture?.index, 'normal', 'normalTexture');
    addRole(material.occlusionTexture?.index, 'orm', 'occlusionTexture');
    addRole(pbr.metallicRoughnessTexture?.index, 'orm', 'pbrMetallicRoughness.metallicRoughnessTexture');
    addRole(material.emissiveTexture?.index, 'emissive', 'emissiveTexture');
  }

  return [...byIndex.values()].sort((a, b) => a.textureIndex - b.textureIndex);
}

export function detectRoleFromGltf(gltf, textureIndex) {
  return detectTextureRoles(gltf).find((entry) => entry.textureIndex === textureIndex)?.role ?? null;
}

export function estimateGpuBytes(width, height, role, mipLevels = computeMipLevels(width, height)) {
  assertRole(role);
  const basePixels = readPositiveInt(width, 'width') * readPositiveInt(height, 'height');
  const mipOverhead = mipLevels > 1 ? 4 / 3 : 1;
  const bytesPerPixel = role === 'normal' ? 0.25 : 0.135;
  return Math.ceil(basePixels * bytesPerPixel * mipOverhead);
}

export function buildEncodePlan(options) {
  const { inputPath, outputPath, role } = options;
  if (!inputPath) throw Object.assign(new Error('inputPath is required'), { exitCode: 2 });
  if (!outputPath) throw Object.assign(new Error('outputPath is required'), { exitCode: 2 });
  assertRole(role);

  const inputExists = existsSync(inputPath);
  if (!inputExists && options.inputBytes == null) {
    throw new Error(`input file missing: ${inputPath}`);
  }

  const dimensions =
    options.width && options.height
      ? { width: readPositiveInt(options.width, 'width'), height: readPositiveInt(options.height, 'height') }
      : inputExists
        ? readPngDimensions(inputPath)
        : null;

  if (!dimensions) {
    throw Object.assign(new Error('width and height are required for non-PNG inputs'), { exitCode: 2 });
  }

  const inputBytes = options.inputBytes ?? statSync(inputPath).size;
  const flags = FLAGS_BY_ROLE[role];
  const mode = MODE_BY_ROLE[role];
  const colorSpace = options.linear === true ? 'linear' : options.linear === false ? 'sRGB' : COLOR_SPACE_BY_ROLE[role];
  const mipLevels = computeMipLevels(dimensions.width, dimensions.height);
  const deterministicKey = sha256(
    Buffer.from(
      stableJson({
        inputSha256: inputExists ? sha256(readFileSync(inputPath)) : options.inputSha256 ?? null,
        role,
        flags,
        width: dimensions.width,
        height: dimensions.height,
        colorSpace,
      }),
    ),
  );

  return {
    inputPath,
    outputPath,
    role,
    flags,
    mode,
    colorSpace,
    width: dimensions.width,
    height: dimensions.height,
    inputBytes,
    gpuBytes: estimateGpuBytes(dimensions.width, dimensions.height, role, mipLevels),
    mipLevels,
    deterministicKey,
    skipped: isKtx2Path(inputPath) || shouldSkipKtx2(inputPath),
    skipReason: isKtx2Path(inputPath)
      ? 'already-ktx2'
      : shouldSkipKtx2(inputPath)
        ? 'skipKtx2-escape-hatch'
        : null,
  };
}

export function toTextureReport(result) {
  return {
    name: basename(result.inputPath),
    role: result.role,
    mode: result.mode,
    original_bytes: result.inputBytes,
    ktx2_bytes: result.outputBytes,
    gpu_bytes: result.gpuBytes,
    mip_levels: result.mipLevels,
    format: FORMAT_BY_MODE[result.mode],
    color_space: result.colorSpace,
    encode_seconds: Number(result.encodeSeconds.toFixed(6)),
    deterministic_key: result.deterministicKey,
    encoder_flags: result.flags,
    mocked: result.mocked,
    skipped: result.skipped,
    skip_reason: result.skipReason,
  };
}

function structuredLog(enabled, event, details) {
  if (!enabled) return;
  console.error(stableJson({ event, level: 'info', ts: new Date().toISOString(), ...details }));
}

function writeMockKtx2(plan, inputBuffer) {
  const payload = Buffer.from(
    stableJson({
      mockFormat: 'FR-OPS-004-KTX2-CONTRACT',
      version: 1,
      inputSha256: sha256(inputBuffer),
      deterministicKey: plan.deterministicKey,
      role: plan.role,
      mode: plan.mode,
      flags: plan.flags,
      width: plan.width,
      height: plan.height,
      mipLevels: plan.mipLevels,
      colorSpace: plan.colorSpace,
    }),
  );
  const paddingSeed = createHash('sha256').update(payload).digest();
  const targetBytes = Math.max(1024, Math.min(1024 * 1024, Math.ceil(plan.inputBytes * (plan.role === 'normal' ? 0.28 : 0.16))));
  const paddingLength = Math.max(0, targetBytes - KTX2_IDENTIFIER.length - payload.length);
  const padding = Buffer.alloc(paddingLength);

  for (let index = 0; index < padding.length; index += 1) {
    padding[index] = paddingSeed[index % paddingSeed.length];
  }

  mkdirSync(dirname(plan.outputPath), { recursive: true });
  writeFileSync(plan.outputPath, Buffer.concat([KTX2_IDENTIFIER, payload, padding]));
}

export async function encodeKtx2(options) {
  const start = performance.now();
  const plan = buildEncodePlan(options);
  structuredLog(options.verbose, 'ktx2.encode.plan', {
    input: plan.inputPath,
    output: plan.outputPath,
    role: plan.role,
    mode: plan.mode,
    colorSpace: plan.colorSpace,
  });

  if (plan.skipped) {
    if (options.copyRawOnSkip && plan.inputPath !== plan.outputPath) {
      mkdirSync(dirname(plan.outputPath), { recursive: true });
      copyFileSync(plan.inputPath, plan.outputPath);
    }

    const outputBytes = existsSync(plan.outputPath) ? statSync(plan.outputPath).size : plan.inputBytes;
    return {
      ...plan,
      outputBytes,
      encodeSeconds: (performance.now() - start) / 1000,
      mocked: false,
      skipped: true,
    };
  }

  if (existsSync(plan.outputPath) && options.force !== true) {
    return {
      ...plan,
      outputBytes: statSync(plan.outputPath).size,
      encodeSeconds: (performance.now() - start) / 1000,
      mocked: false,
      skipped: true,
      skipReason: 'output-exists',
    };
  }

  const inputBuffer = readFileSync(plan.inputPath);
  const canUseRealEncoder = options.mock !== true && commandExists('toktx') && commandExists('ktx2check');

  if (canUseRealEncoder) {
    mkdirSync(dirname(plan.outputPath), { recursive: true });
    const encode = spawnSync('toktx', [...plan.flags, plan.outputPath, plan.inputPath], {
      encoding: 'utf8',
      stdio: options.verbose ? 'inherit' : 'pipe',
    });
    if (encode.status !== 0) {
      throw new Error(`toktx exit ${encode.status}: ${encode.stderr ?? ''}`.trim());
    }

    const validate = spawnSync('ktx2check', [plan.outputPath], {
      encoding: 'utf8',
      stdio: options.verbose ? 'inherit' : 'pipe',
    });
    if (validate.status !== 0) {
      throw new Error(`ktx2check failed: ${validate.stderr ?? ''}`.trim());
    }
  } else {
    writeMockKtx2(plan, inputBuffer);
  }

  if (!readFileSync(plan.outputPath).subarray(0, KTX2_IDENTIFIER.length).equals(KTX2_IDENTIFIER)) {
    throw new Error(`invalid KTX2 identifier: ${plan.outputPath}`);
  }

  const result = {
    ...plan,
    outputBytes: statSync(plan.outputPath).size,
    encodeSeconds: (performance.now() - start) / 1000,
    mocked: !canUseRealEncoder,
    skipped: false,
    skipReason: null,
  };
  structuredLog(options.verbose, 'ktx2.encode.complete', {
    output: plan.outputPath,
    bytes: result.outputBytes,
    mocked: result.mocked,
  });
  return result;
}

function parseArgs(argv) {
  const parsed = { mock: false, force: false, verbose: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      throw Object.assign(new Error(USAGE), { exitCode: 2 });
    }
    if (arg === '--mock') parsed.mock = true;
    else if (arg === '--force') parsed.force = true;
    else if (arg === '--verbose') parsed.verbose = true;
    else if (['--input', '--output', '--role', '--width', '--height', '--report'].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw Object.assign(new Error(`missing value for ${arg}\n${USAGE}`), { exitCode: 2 });
      }
      parsed[arg.slice(2)] = value;
      index += 1;
    } else {
      throw Object.assign(new Error(`unknown flag: ${arg}\n${USAGE}`), { exitCode: 2 });
    }
  }

  if (!parsed.input || !parsed.output || !parsed.role) {
    throw Object.assign(new Error(USAGE), { exitCode: 2 });
  }

  if (parsed.width) parsed.width = readPositiveInt(parsed.width, 'width');
  if (parsed.height) parsed.height = readPositiveInt(parsed.height, 'height');
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await encodeKtx2({
    inputPath: args.input,
    outputPath: args.output,
    role: args.role,
    width: args.width,
    height: args.height,
    mock: args.mock,
    force: args.force,
    verbose: args.verbose,
  });
  const report = toTextureReport(result);

  if (args.report) {
    mkdirSync(dirname(args.report), { recursive: true });
    writeFileSync(args.report, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    const exitCode = error.exitCode ?? 1;
    console.error(error.message);
    process.exit(exitCode);
  });
}
