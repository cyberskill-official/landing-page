import { beforeEach, describe, expect, test } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ManifestCheckError, recordBuildEvent, syncManifest } from '../asset-manifest-sync.mjs';

let tmp;

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'asset-manifest-'));
  await mkdir(join(tmp, 'blender'), { recursive: true });
});

describe('asset-manifest-sync', () => {
  test('creates manifest for empty source dir', async () => {
    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, 'manifest.json'),
    });

    expect(result.manifest.version).toBe(1);
    expect(result.manifest.assets).toEqual({});
  });

  test('tracks LFS source asset extensions and ignores normal docs', async () => {
    await writeFile(join(tmp, 'blender/lumi.v01.blend'), Buffer.alloc(1024, 1));
    await writeFile(join(tmp, 'texture.psd'), Buffer.alloc(32, 2));
    await writeFile(join(tmp, 'README.md'), 'not a source asset');

    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, 'manifest.json'),
    });

    expect(result.manifest.assets['blender/lumi.v01.blend']).toMatchObject({
      type: 'blender',
      size_bytes: 1024,
      stale: false,
    });
    expect(result.manifest.assets['texture.psd']).toMatchObject({ type: 'photoshop' });
    expect(result.manifest.assets['README.md']).toBeUndefined();
  });

  test('is byte-identical on unchanged input', async () => {
    const manifestPath = join(tmp, 'manifest.json');
    await writeFile(join(tmp, 'blender/y.blend'), Buffer.alloc(2048));

    await syncManifest({ sourceDir: tmp, manifestPath });
    const first = await readFile(manifestPath, 'utf8');
    await syncManifest({ sourceDir: tmp, manifestPath });
    const second = await readFile(manifestPath, 'utf8');

    expect(second).toBe(first);
  });

  test('detects stale content after a recorded build event', async () => {
    const manifestPath = join(tmp, 'manifest.json');
    await writeFile(join(tmp, 'blender/x.blend'), Buffer.alloc(1024, 1));
    await syncManifest({ sourceDir: tmp, manifestPath });
    await recordBuildEvent(manifestPath, ['blender/x.blend'], { timestamp: '2026-05-17T00:00:00.000Z' });

    await writeFile(join(tmp, 'blender/x.blend'), Buffer.alloc(1024, 2));
    const result = await syncManifest({ sourceDir: tmp, manifestPath });

    expect(result.staleCount).toBe(1);
    expect(result.manifest.assets['blender/x.blend'].stale).toBe(true);
  });

  test('recordBuildEvent clears stale state', async () => {
    const manifestPath = join(tmp, 'manifest.json');
    await writeFile(join(tmp, 'blender/x.blend'), Buffer.alloc(1024, 1));
    await syncManifest({ sourceDir: tmp, manifestPath });
    await recordBuildEvent(manifestPath, ['blender/x.blend'], { timestamp: '2026-05-17T00:00:00.000Z' });

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    expect(manifest.assets['blender/x.blend']).toMatchObject({
      latest_built_iso: '2026-05-17T00:00:00.000Z',
      stale: false,
    });
    expect(manifest.assets['blender/x.blend'].latest_built_sha256).toBe(manifest.assets['blender/x.blend'].sha256);
  });

  test('excludes private source paths', async () => {
    await writeFile(join(tmp, 'blender/public.blend'), Buffer.alloc(512));
    await writeFile(join(tmp, 'blender/secret.private.blend'), Buffer.alloc(512));

    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, 'manifest.json'),
    });

    expect(result.manifest.assets['blender/public.blend']).toBeDefined();
    expect(result.manifest.assets['blender/secret.private.blend']).toBeUndefined();
  });

  test('extracts simple linked .blend references in both directions', async () => {
    await writeFile(join(tmp, 'blender/base.blend'), Buffer.from('BLENDER'));
    await writeFile(join(tmp, 'blender/variant.blend'), Buffer.from('//blender/base.blend'));

    const result = await syncManifest({
      sourceDir: tmp,
      manifestPath: join(tmp, 'manifest.json'),
    });

    expect(result.manifest.assets['blender/variant.blend'].linked_to).toEqual(['blender/base.blend']);
    expect(result.manifest.assets['blender/base.blend'].linked_from).toEqual(['blender/variant.blend']);
  });

  test('check mode throws on divergence', async () => {
    await writeFile(join(tmp, 'blender/x.blend'), Buffer.alloc(1024, 1));

    await expect(
      syncManifest({
        sourceDir: tmp,
        manifestPath: join(tmp, 'manifest.json'),
        checkMode: true,
      }),
    ).rejects.toBeInstanceOf(ManifestCheckError);
  });
});
