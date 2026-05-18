import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function readRepoFile(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('FR-OPS-013 asset-size workflow shape', () => {
  test('runs only for asset and runtime paths and supports emergency skip', async () => {
    const workflow = await readRepoFile('.github/workflows/asset-size.yml');

    expect(workflow).toContain('name: Asset size + decoder gate');
    expect(workflow).toContain("'assets-built/**'");
    expect(workflow).toContain("'assets-source/**'");
    expect(workflow).toContain("'apps/web/public/**/*.glb'");
    expect(workflow).toContain("'apps/web/public/**/*.ktx2'");
    expect(workflow).toContain("'apps/web/public/decoders/**'");
    expect(workflow).toContain("'apps/web/components/**'");
    expect(workflow).toContain("'apps/web/app/**'");
    expect(workflow).toContain("'apps/web/lib/**'");
    expect(workflow).toContain('assets-budget:skip');
  });

  test('uses baseline CI setup, rebuilds GLBs, and runs hard gates', async () => {
    const workflow = await readRepoFile('.github/workflows/asset-size.yml');

    expect(workflow).toContain('timeout-minutes: 12');
    expect(workflow).toContain('pnpm/action-setup@v4');
    expect(workflow).toContain('version: 11.1.2');
    expect(workflow).toContain('actions/setup-node@v4');
    expect(workflow).toContain('pnpm install --frozen-lockfile');
    expect(workflow).toContain('pnpm gltf-pipeline "$raw" "$out"');
    expect(workflow).toContain('check-no-cdn.mjs');
    expect(workflow).toContain('check-asset-sizes.mjs');
    expect(workflow).toContain('aria-hidden=');
  });

  test('reuses FR-OPS-003 comment integration and uploads structured summaries', async () => {
    const workflow = await readRepoFile('.github/workflows/asset-size.yml');

    expect(workflow).toContain('scripts/pr-comment-asset-delta.mjs');
    expect(workflow).toContain('<!-- pr-asset-delta -->');
    expect(workflow).toContain('asset-summary.json');
    expect(workflow).toContain('asset-cdn-summary.json');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('retention-days: 30');
  });

  test('asset gate scripts expose required summary fields and forbidden CDN hosts', async () => {
    const assetScript = await readRepoFile('tools/perf-budgets/check-asset-sizes.mjs');
    const cdnScript = await readRepoFile('tools/perf-budgets/check-no-cdn.mjs');

    expect(assetScript).toContain("verdict: fails.length > 0 ? 'FAIL' : 'PASS'");
    expect(assetScript).toContain('decoder_bytes_total');
    expect(assetScript).toContain('cdn_violations');
    expect(assetScript).toContain('single_asset_gt_5mb');
    for (const host of ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'threejs.org', 'gstatic.com', 'googleapis.com']) {
      expect(cdnScript).toContain(host);
    }
  });
});
