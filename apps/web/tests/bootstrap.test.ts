import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { deviceMemoryGB, hasWebGL2, saveDataEnabled } from '../lib/feature-detect';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '../..');

async function readAppFile(filePath: string) {
  return readFile(path.join(appRoot, filePath), 'utf8');
}

describe('FR-WEB-001 bootstrap contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('uses the App Router only', () => {
    expect(existsSync(path.join(appRoot, 'pages'))).toBe(false);
  });

  test('keeps GlobalCanvasShell in root layout and out of route pages', async () => {
    const layout = await readAppFile('app/layout.tsx');
    const homePage = await readAppFile('app/page.tsx');
    const litePage = await readAppFile('app/lite/page.tsx');

    expect(layout).toMatch(/GlobalCanvasShell/);
    expect(homePage).not.toMatch(/GlobalCanvasShell|<GlobalCanvas/);
    expect(litePage).not.toMatch(/GlobalCanvasShell|<GlobalCanvas|CanvasMount/);
  });

  test('pins the required framework line', async () => {
    const pkg = JSON.parse(await readAppFile('package.json')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(pkg.dependencies.next).toMatch(/^\^15/);
    expect(pkg.dependencies.react).toMatch(/^\^19/);
    expect(pkg.dependencies['react-dom']).toMatch(/^\^19/);
    expect(pkg.devDependencies['@react-three/fiber']).toMatch(/^\^9/);
    expect(pkg.devDependencies.three).toMatch(/^\^0\.184/);
    expect(pkg.devDependencies['@14islands/r3f-scroll-rig']).toMatch(/^\^8\.15/);
  });

  test('keeps forbidden motion libraries out of the web package', async () => {
    const pkg = JSON.parse(await readAppFile('package.json')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(Object.keys(deps)).not.toContain('framer-motion');
    expect(Object.keys(deps)).not.toContain('react-spring');
    expect(Object.keys(deps)).not.toContain('react-motion');
  });

  test('sets Next standalone output and tree-shakes three', async () => {
    const config = await readAppFile('next.config.ts');

    expect(config).toMatch(/output:\s*['"]standalone['"]/);
    expect(config).toMatch(/transpilePackages:\s*\[[^\]]*['"]three['"]/s);
    expect(config).toMatch(/usedExports:\s*true/);
  });

  test('uses a dynamic R3F boundary and demand-driven GlobalCanvas bootstrap', async () => {
    const dynamicThree = await readAppFile('lib/dynamic-three.ts');
    const shell = await readAppFile('components/canvas/GlobalCanvasShell.tsx');
    const mount = await readAppFile('components/canvas/CanvasMount.tsx');

    expect(dynamicThree).toMatch(/import\(['"]@\/components\/canvas\/CanvasMount['"]\)/);
    expect(dynamicThree).toMatch(/ssr:\s*false/);
    expect(shell).toMatch(/CanvasMount/);
    expect(mount).toMatch(/GlobalCanvas/);
    expect(mount).toMatch(/frameloop=["']demand["']/);
    expect(mount).toContain('getCanvasDprForTier(deviceTier)');
    expect(mount).toContain('scaleMultiplier={SCENE_UNIT_SCALE}');
  });

  test('renders the Scene 0 headline and read-only route link from SSR page modules', async () => {
    const homePage = await readAppFile('app/page.tsx');
    const heroClient = await readAppFile('components/scenes/scene-0-hero/Scene0Hero.client.tsx');
    const litePage = await readAppFile('app/lite/page.tsx');

    expect(homePage).toContain('What if your will became real?');
    expect(heroClient).toContain('href="/lite"');
    expect(litePage).not.toMatch(/canvas|three|react-three/i);
  });

  test('feature detection reports WebGL2, save-data, and device memory safely', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: (kind: string) =>
          kind === 'webgl2' ? { getExtension: () => ({ supported: true }) } : null,
      }),
    });
    vi.stubGlobal('navigator', {
      connection: { saveData: true },
      deviceMemory: 8,
    });

    expect(hasWebGL2()).toBe(true);
    expect(saveDataEnabled()).toBe(true);
    expect(deviceMemoryGB()).toBe(8);
  });

  test('feature detection fails closed when WebGL2 is unavailable', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => null,
      }),
    });

    expect(hasWebGL2()).toBe(false);
  });

  test('health route returns uptime probe JSON', async () => {
    const { GET } = await import('../app/api/health/route');
    const response = await GET();
    const body = await response.json() as { status?: string; ts?: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(Number.isNaN(Date.parse(body.ts ?? ''))).toBe(false);
  });

  test('workspace registration includes apps/web', async () => {
    const workspace = await readFile(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8');

    expect(workspace).toMatch(/apps\/\*/);
  });
});
