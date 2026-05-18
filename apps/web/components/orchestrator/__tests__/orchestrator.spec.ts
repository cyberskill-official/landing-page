import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-SCENE-020 ScrollOrchestrator integration', () => {
  test('mounts once in the root layout inside the smooth-scroll provider', async () => {
    const layout = await source('app/layout.tsx');

    expect(layout).toContain("import { ScrollOrchestrator } from '@/components/orchestrator/ScrollOrchestrator'");
    expect(layout).toContain('<SmoothScrollProvider>');
    expect(layout).toContain('<ScrollOrchestrator />');
  });

  test('updates body data-scene, scene progress, active scene, and transitioning state', async () => {
    const client = await source('components/orchestrator/ScrollOrchestrator.client.tsx');

    expect(client).toContain('document.body.dataset.scene = sceneId');
    expect(client).toContain('setActiveScene(range.index)');
    expect(client).toContain('setSceneProgress(range.id');
    expect(client).toContain('setTransitioning(true)');
    expect(client).toContain("new URLSearchParams(window.location.search).get('debug') === 'orchestrator'");
    expect(client).not.toContain('.scrollTo(');
  });

  test('scene sections expose data-scene-id attributes consumed by the orchestrator', async () => {
    const files = [
      'components/scenes/scene-0-hero/Scene0Hero.client.tsx',
      'components/scenes/scene-1-origin/Scene1Origin.client.tsx',
      'components/scenes/scene-2-transformation/Scene2Transformation.tsx',
      'components/scenes/scene-3-capabilities/Scene3Capabilities.tsx',
      'components/scenes/scene-4-team/Scene4Team.tsx',
      'components/scenes/scene-5-vietnam-global/Scene5VietnamGlobal.tsx',
      'components/scenes/scene-6-cta-hub/Scene6CtaHub.tsx',
      'components/scenes/footer/Footer.client.tsx',
    ];
    const sources = await Promise.all(files.map((file) => source(file)));

    for (const text of sources) {
      expect(text).toContain('data-scene-id=');
    }
  });
});
