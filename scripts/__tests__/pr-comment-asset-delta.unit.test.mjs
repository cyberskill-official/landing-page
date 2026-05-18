import { describe, expect, test } from 'vitest';
import {
  budgetForAsset,
  computeDelta,
  redactAsset,
  renderMarkdown,
  summarizeRows,
} from '../pr-comment-asset-delta.mjs';

const budgets = {
  assets: {
    lumi_glb_mb: { target: 3.0, fail: 3.5 },
    nonla_glb_kb: { target: 200, fail: 250 },
    hero_scene_props_mb: { target: 1.0, fail: 1.2 },
    each_scene_props_mb: { target: 1.5, fail: 1.8 },
  },
};

function asset(overrides = {}) {
  return {
    asset: 'lumi.glb',
    bytes: 2_900_000,
    bytes_target: 3_000_000,
    bytes_fail: 3_500_000,
    ...overrides,
  };
}

describe('PR asset delta', () => {
  test('computes PASS delta when under target', () => {
    const rows = computeDelta([asset({ bytes: 2_800_000 })], [asset({ bytes: 2_900_000 })]);

    expect(rows[0].verdict).toBe('PASS');
    expect(rows[0].delta_bytes).toBe(100_000);
    expect(rows[0].delta_pct).toBeCloseTo(3.57, 2);
  });

  test('computes WARN and FAIL against canonical thresholds', () => {
    const rows = computeDelta(
      [asset({ asset: 'warn.glb' }), asset({ asset: 'fail.glb' })],
      [
        asset({ asset: 'warn.glb', bytes: 3_100_000 }),
        asset({ asset: 'fail.glb', bytes: 3_600_000 }),
      ],
    );

    expect(rows.map((row) => row.verdict)).toEqual(['FAIL', 'WARN']);
    expect(rows[0].asset).toBe('fail.glb');
  });

  test('handles missing main baseline as NEW', () => {
    const rows = computeDelta([], [asset({ bytes: 2_900_000 })]);

    expect(rows[0]).toMatchObject({
      verdict: 'NEW',
      main: null,
      delta_bytes: null,
      delta_pct: null,
    });
  });

  test('sorts FAIL rows before WARN, NEW, and PASS', () => {
    const rows = computeDelta(
      [asset({ asset: 'pass.glb' }), asset({ asset: 'warn.glb' }), asset({ asset: 'fail.glb' })],
      [
        asset({ asset: 'new.glb' }),
        asset({ asset: 'pass.glb', bytes: 2_950_000 }),
        asset({ asset: 'warn.glb', bytes: 3_250_000 }),
        asset({ asset: 'fail.glb', bytes: 3_900_000 }),
      ],
    );

    expect(rows.map((row) => row.verdict)).toEqual(['FAIL', 'WARN', 'NEW', 'PASS']);
  });

  test('renders markdown with sentinel and failure-mode link', () => {
    const rows = computeDelta([asset()], [asset({ bytes: 3_100_000 })]);
    const markdown = renderMarkdown(rows, 42);

    expect(markdown).toContain('PR #42');
    expect(markdown).toContain('<!-- pr-asset-delta -->');
    expect(markdown).toContain('FR-OPS-001');
    expect(markdown).toContain('⚠️ WARN');
  });

  test('renders no-asset summary with sentinel', () => {
    const markdown = renderMarkdown([], 43, {
      staleAssets: [{ path: 'blender/lumi.blend', mtime_iso: '2026-05-17T00:00:00.000Z' }],
    });

    expect(markdown).toContain('✅ No asset changes');
    expect(markdown).toContain('Stale assets detected');
    expect(markdown).toContain('blender/lumi.blend');
    expect(markdown).toContain('<!-- pr-asset-delta -->');
    expect(summarizeRows([])).toEqual({ rowCount: 0, warnCount: 0, failCount: 0 });
  });

  test('redacts private asset names from rendered output', () => {
    const privateName = 'assets-source/internal/founder.private.glb';
    const rows = computeDelta([], [asset({ asset: privateName })]);
    const markdown = renderMarkdown(rows, 44);

    expect(redactAsset(privateName)).toBe('[redacted private asset]');
    expect(markdown).not.toContain('founder.private.glb');
    expect(markdown).toContain('[redacted private asset]');
  });

  test('maps asset names to canonical budgets', () => {
    expect(budgetForAsset('lumi.glb', budgets)).toMatchObject({ key: 'assets.lumi_glb_mb' });
    expect(budgetForAsset('lumi-nonla.glb', budgets)).toMatchObject({ key: 'assets.nonla_glb_kb' });
    expect(budgetForAsset('scene-2-greybox.glb', budgets)).toMatchObject({ key: 'assets.each_scene_props_mb' });
  });
});
