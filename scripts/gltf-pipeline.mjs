#!/usr/bin/env node
/**
 * FR-OPS-001: deterministic stage-2 GLB optimizer.
 *
 * Usage:
 *   node scripts/gltf-pipeline.mjs <input.glb> <output.glb> [--dry-run] [--verbose]
 *
 * Blender exports raw GLBs with compression disabled. This script runs the
 * production pass: dedup, prune, weld, resample, Meshopt for Lumi/rigged assets,
 * Draco for static props, and WebP texture compression for non-VRAM-critical
 * textures. KTX2 role metadata is preserved in the report for FR-OPS-004.
 */
import { Logger, NodeIO, Primitive, Verbosity } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  draco,
  listTextureSlots,
  meshopt,
  prune,
  resample,
  textureCompress,
  weld,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { minimatch } from 'minimatch';
import sharp from 'sharp';
import { constants, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(SCRIPT_DIR, '..');
const CONFIG_PATH = resolve(SCRIPT_DIR, 'gltf-pipeline.config.json');
const BUDGETS_PATH = resolve(ROOT_DIR, 'tools/perf-budgets/budgets.json');
const USAGE = 'usage: gltf-pipeline.mjs <input.glb> <output.glb> [--dry-run] [--verbose]';

function parseArgs(argv) {
  const options = { dryRun: false, verbose: false };
  const files = [];

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      throw Object.assign(new Error(USAGE), { exitCode: 2 });
    } else if (arg.startsWith('--')) {
      throw Object.assign(new Error(`unknown flag: ${arg}\n${USAGE}`), { exitCode: 2 });
    } else {
      files.push(arg);
    }
  }

  if (files.length !== 2) {
    throw Object.assign(new Error(USAGE), { exitCode: 2 });
  }

  return { input: files[0], output: files[1], ...options };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function shrinkPercent(beforeBytes, afterBytes) {
  if (beforeBytes === 0) return '0.0';
  return (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
}

function sizeChangeLabel(beforeBytes, afterBytes) {
  const percent = shrinkPercent(beforeBytes, afterBytes);
  if (Number(percent) >= 0) return `${percent}% smaller`;
  return `${Math.abs(Number(percent)).toFixed(1)}% larger`;
}

function reportPathFor(output) {
  return output.toLowerCase().endsWith('.glb')
    ? `${output.slice(0, -4)}.report.json`
    : `${output}.report.json`;
}

function findStrategy(filename, config) {
  const entry = config.strategies.find((candidate) => minimatch(filename, candidate.match));
  if (!entry) {
    return { strategy: 'meshopt', meshoptLevel: 'medium', source: 'fallback' };
  }

  if (!['meshopt', 'draco'].includes(entry.strategy)) {
    throw new Error(`invalid strategy "${entry.strategy}" for ${entry.match}`);
  }

  return { ...entry, source: entry.match };
}

function collectStats(document) {
  const root = document.getRoot();
  let vertexCount = 0;
  let triangleCount = 0;
  let morphTargetCount = 0;

  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      const count = primitive.getIndices()?.getCount() ?? position?.getCount() ?? 0;

      if (position) vertexCount += position.getCount();
      morphTargetCount += primitive.listTargets().length;

      switch (primitive.getMode()) {
        case Primitive.Mode.TRIANGLES:
          triangleCount += count / 3;
          break;
        case Primitive.Mode.TRIANGLE_STRIP:
        case Primitive.Mode.TRIANGLE_FAN:
          triangleCount += Math.max(0, count - 2);
          break;
        default:
          break;
      }
    }
  }

  return {
    vertexCount,
    triangleCount: Math.round(triangleCount),
    animationCount: root.listAnimations().length,
    morphTargetCount,
    textureCount: root.listTextures().length,
    meshCount: root.listMeshes().length,
    materialCount: root.listMaterials().length,
  };
}

function hasMorphTargets(document) {
  return document
    .getRoot()
    .listMeshes()
    .some((mesh) => mesh.listPrimitives().some((primitive) => primitive.listTargets().length > 0));
}

function hasSkin(document) {
  return document.getRoot().listSkins().length > 0;
}

function classifyTexture(texture) {
  const slots = listTextureSlots(texture).sort();
  const label = `${texture.getURI() ?? ''} ${texture.getName() ?? ''}`.toLowerCase();

  if (slots.includes('normalTexture') || /(^|[-_])normal([-_.]|$)/.test(label)) {
    return { role: 'normalMap', slots };
  }

  if (
    slots.includes('metallicRoughnessTexture') ||
    slots.includes('occlusionTexture') ||
    /(^|[-_])(orm|metal|rough|mr)([-_.]|$)/.test(label)
  ) {
    return { role: 'colorMR', slots };
  }

  if (slots.includes('emissiveTexture') || /(^|[-_])emissive([-_.]|$)/.test(label)) {
    return { role: 'emissive', slots };
  }

  return { role: 'default', slots };
}

function texturePlan(document, config) {
  return document.getRoot().listTextures().map((texture, index) => {
    const { role, slots } = classifyTexture(texture);
    const requested = config.textureCompression[role] ?? config.textureCompression.default;
    const actual =
      requested.format === 'ktx2'
        ? { ...requested, status: 'planned-by-FR-OPS-004' }
        : { ...requested, status: 'applied' };

    return {
      index,
      name: texture.getName() || null,
      uri: texture.getURI() || null,
      mimeType: texture.getMimeType() || null,
      role,
      slots,
      requested,
      actual,
    };
  });
}

function budgetFor(filename, budgets) {
  const lower = filename.toLowerCase();

  if (lower.includes('nonla')) {
    return {
      key: 'assets.nonla_glb_kb',
      targetBytes: budgets.assets.nonla_glb_kb.target * 1024,
      target: budgets.assets.nonla_glb_kb.target,
      unit: 'KB',
    };
  }

  if (lower.startsWith('lumi')) {
    return {
      key: 'assets.lumi_glb_mb',
      targetBytes: budgets.assets.lumi_glb_mb.target * 1024 * 1024,
      target: budgets.assets.lumi_glb_mb.target,
      unit: 'MB',
    };
  }

  if (lower.includes('hero') || lower.includes('scene-0')) {
    return {
      key: 'assets.hero_scene_props_mb',
      targetBytes: budgets.assets.hero_scene_props_mb.target * 1024 * 1024,
      target: budgets.assets.hero_scene_props_mb.target,
      unit: 'MB',
    };
  }

  if (lower.includes('scene') || lower.includes('prop') || lower.includes('footer')) {
    return {
      key: 'assets.each_scene_props_mb',
      targetBytes: budgets.assets.each_scene_props_mb.target * 1024 * 1024,
      target: budgets.assets.each_scene_props_mb.target,
      unit: 'MB',
    };
  }

  return null;
}

function assertRawUnchanged(input, beforeStat) {
  const afterStat = statSync(input);
  if (beforeStat.size !== afterStat.size || beforeStat.mtimeMs !== afterStat.mtimeMs) {
    throw new Error(`raw input mutated: ${input}`);
  }
}

async function createIO(verbose) {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;

  return new NodeIO()
    .setLogger(new Logger(verbose ? Verbosity.WARN : Verbosity.SILENT))
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'meshopt.encoder': MeshoptEncoder,
      'meshopt.decoder': MeshoptDecoder,
    });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readJson(CONFIG_PATH);
  const budgets = readJson(BUDGETS_PATH);

  if (!existsSync(args.input)) {
    throw new Error(`input file missing: ${args.input}`);
  }

  const inputStat = statSync(args.input);
  const outputDir = dirname(args.output);
  if (!args.dryRun) {
    mkdirSync(outputDir, { recursive: true });
    await access(outputDir, constants.W_OK);
  }

  const io = await createIO(args.verbose);
  const document = await io.read(args.input);
  document.setLogger(new Logger(args.verbose ? Verbosity.WARN : Verbosity.SILENT));

  const filename = basename(args.input);
  const configured = findStrategy(filename, config);
  const morphDetected = hasMorphTargets(document);
  const skinDetected = hasSkin(document);
  const nameForcesMeshopt = /^lumi.*\.glb$/i.test(filename) || /-rigged\.glb$/i.test(filename);
  const forcedMeshopt = morphDetected || skinDetected || nameForcesMeshopt;
  const finalStrategy = forcedMeshopt ? 'meshopt' : configured.strategy;
  const meshoptLevel = configured.meshoptLevel ?? 'medium';
  const dracoMethod = configured.dracoMethod ?? 'edgebreaker';
  const warnings = [];

  if (forcedMeshopt && configured.strategy === 'draco') {
    warnings.push(`forcing meshopt for ${filename}; Draco is forbidden for Lumi, morph targets, or skins`);
  }

  if (finalStrategy === 'meshopt' && meshoptLevel === 'medium' && (morphDetected || skinDetected)) {
    warnings.push('meshopt level medium selected; level high may save more bytes on highly rigged meshes');
  }

  const beforeBytes = inputStat.size;
  let measuredBytes = (await io.writeBinary(document)).byteLength;

  const report = {
    input: args.input,
    output: args.output,
    reportPath: reportPathFor(args.output),
    dryRun: args.dryRun,
    strategy: finalStrategy,
    configuredStrategy: configured.strategy,
    configMatch: configured.source,
    compressionBranch: finalStrategy,
    hasMorph: morphDetected,
    hasSkin: skinDetected,
    beforeBytes,
    afterBytes: null,
    shrinkPercent: null,
    statsBefore: collectStats(document),
    statsAfter: null,
    steps: [],
    textures: texturePlan(document, config),
    warnings,
    budget: null,
    extensionsUsed: [],
    rawImmutable: true,
  };

  async function runStep(name, transform) {
    const stepBefore = measuredBytes;
    await document.transform(transform);
    measuredBytes = (await io.writeBinary(document)).byteLength;

    const step = {
      name,
      beforeBytes: stepBefore,
      afterBytes: measuredBytes,
      deltaBytes: measuredBytes - stepBefore,
      shrinkPercent: shrinkPercent(stepBefore, measuredBytes),
    };
    report.steps.push(step);

    if (args.verbose) {
      const direction = step.deltaBytes === 0 ? 'no change' : `${step.deltaBytes < 0 ? '' : '+'}${formatBytes(step.deltaBytes)}`;
      console.error(`${name}: ${formatBytes(stepBefore)} -> ${formatBytes(measuredBytes)} (${direction})`);
    }
  }

  await runStep('dedup', dedup());
  await runStep('prune', prune());
  await runStep('weld', weld({ tolerance: config.weldTolerance }));
  await runStep('resample', resample());

  if (finalStrategy === 'meshopt') {
    await runStep('meshopt', meshopt({ encoder: MeshoptEncoder, level: meshoptLevel }));
  } else {
    await runStep('draco', draco({ method: dracoMethod }));
  }

  await runStep(
    'textureCompress',
    textureCompress({
      encoder: sharp,
      targetFormat: config.textureCompression.default.format,
      quality: config.textureCompression.default.quality,
      slots: /^(?!normalTexture).*$/,
    }),
  );

  const outputBytes = await io.writeBinary(document);
  const jsonDoc = await io.binaryToJSON(outputBytes);
  const afterBytes = outputBytes.byteLength;

  report.afterBytes = afterBytes;
  report.shrinkPercent = shrinkPercent(beforeBytes, afterBytes);
  report.statsAfter = collectStats(document);
  report.textures = texturePlan(document, config);
  report.extensionsUsed = jsonDoc.json.extensionsUsed ?? [];

  const budget = budgetFor(basename(args.output), budgets) ?? budgetFor(filename, budgets);
  if (budget) {
    const earlyWarnBytes = budget.targetBytes * (config.earlyWarnPercent / 100);
    report.budget = {
      ...budget,
      earlyWarnPercent: config.earlyWarnPercent,
      earlyWarnBytes,
      passedEarlyWarn: afterBytes <= earlyWarnBytes,
    };

    if (afterBytes > earlyWarnBytes) {
      throw new Error(
        `EARLY WARN: ${filename} ${formatBytes(afterBytes)} > ${config.earlyWarnPercent}% of target ${budget.target} ${budget.unit} (${budget.key})`,
      );
    }
  }

  assertRawUnchanged(args.input, inputStat);

  if (args.dryRun) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  writeFileSync(args.output, outputBytes);
  writeFileSync(report.reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `OK ${filename}: ${formatBytes(beforeBytes)} -> ${formatBytes(afterBytes)} (${sizeChangeLabel(beforeBytes, afterBytes)}, strategy=${finalStrategy})`,
  );
}

main().catch((error) => {
  const exitCode = error.exitCode ?? 1;
  console.error(error.message);
  process.exit(exitCode);
});
