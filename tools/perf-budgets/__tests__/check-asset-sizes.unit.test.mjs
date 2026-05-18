import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  budgetForAsset,
  computeVerdict,
  directoryBytes,
  readAssetReports,
} from '../check-asset-sizes.mjs';

const budgets = {
  assets: {
    lumi_glb_mb: { target: 3.0, fail: 3.5 },
    nonla_glb_kb: { target: 200, fail: 250 },
    hero_scene_props_mb: { target: 1.0, fail: 1.2 },
    each_scene_props_mb: { target: 1.5, fail: 1.8 },
  },
};

function asset(asset, bytes) {
  return { asset, bytes };
}

describe('FR-OPS-013 check-asset-sizes', () => {
  test('maps asset names to canonical budget entries', () => {
    expect(budgetForAsset('lumi.glb', budgets)).toMatchObject({ key: 'assets.lumi_glb_mb' });
    expect(budgetForAsset('nonla.glb', budgets)).toMatchObject({ key: 'assets.nonla_glb_kb' });
    expect(budgetForAsset('scene-0-greybox.glb', budgets)).toMatchObject({ key: 'assets.hero_scene_props_mb' });
    expect(budgetForAsset('scene-4-prop.glb', budgets)).toMatchObject({ key: 'assets.each_scene_props_mb' });
  });

  test('passes when all assets are below fail thresholds', () => {
    const result = computeVerdict(budgets, [
      asset('lumi.glb', 3.1 * 1024 * 1024),
      asset('scene-2-greybox.glb', 1.4 * 1024 * 1024),
    ]);

    expect(result.verdict).toBe('PASS');
    expect(result.fails).toEqual([]);
  });

  test('warns but passes when over target and under fail', () => {
    const result = computeVerdict(budgets, [asset('lumi.glb', 3.2 * 1024 * 1024)]);

    expect(result.verdict).toBe('PASS');
    expect(result.warns).toHaveLength(1);
  });

  test('fails when over fail threshold and sorts fail rows by overage', () => {
    const result = computeVerdict(budgets, [
      asset('lumi.glb', 3.6 * 1024 * 1024),
      asset('scene-2-greybox.glb', 2.3 * 1024 * 1024),
    ]);

    expect(result.verdict).toBe('FAIL');
    expect(result.fails).toHaveLength(2);
    expect(result.fails[0].asset).toBe('scene-2-greybox.glb');
  });

  test('flags single assets over 5 MB unless explicitly approved', () => {
    const withoutApproval = computeVerdict(budgets, [asset('unknown.glb', 5.5 * 1024 * 1024)]);
    const withApproval = computeVerdict(budgets, [asset('unknown.glb', 5.5 * 1024 * 1024)], {
      allowLargeAssets: true,
    });

    expect(withoutApproval.verdict).toBe('FAIL');
    expect(withoutApproval.fails[0]).toMatchObject({ budget_key: 'single_asset_gt_5mb' });
    expect(withApproval.verdict).toBe('PASS');
    expect(withApproval.unbudgeted).toHaveLength(1);
  });

  test('fails decoder bundle over 240 KB', () => {
    const result = computeVerdict(budgets, [], { decoderBytesTotal: 245_761 });

    expect(result.verdict).toBe('FAIL');
    expect(result.fails[0]).toMatchObject({ asset: 'apps/web/public/decoders' });
  });

  test('reads pipeline report files and directory byte totals', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'asset-reports-'));
    await writeFile(path.join(dir, 'lumi.report.json'), JSON.stringify({
      output: 'assets-built/optimized/lumi.glb',
      afterBytes: 1234,
    }));
    await writeFile(path.join(dir, 'decoder.bin'), '12345');

    const reports = await readAssetReports(dir, budgets);
    const bytes = await directoryBytes(dir);

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ asset: 'assets-built/optimized/lumi.glb', bytes: 1234 });
    expect(bytes).toBeGreaterThan(5);
  });
});
