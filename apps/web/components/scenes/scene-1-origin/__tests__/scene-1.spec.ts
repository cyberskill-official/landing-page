import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const sceneRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('FR-SCENE-013 Scene 1 implementation shape', () => {
  test('mounts through SceneTunnel and keeps caption in DOM instead of Drei Html', async () => {
    const clientSource = await readFile(path.join(sceneRoot, 'Scene1Origin.client.tsx'), 'utf8');
    const canvasSource = await readFile(path.join(sceneRoot, 'Scene1Canvas.tsx'), 'utf8');

    expect(clientSource).toContain('<SceneTunnel id="scene-1-origin"');
    expect(clientSource).toContain('data-scene-index="1"');
    expect(clientSource).toContain('<TypedCaption text={caption}');
    expect(clientSource).not.toContain('@react-three/drei');
    expect(canvasSource).toContain("setCurrentAnim('coil_idle', 100)");
  });

  test('uses warm sepia/gold art direction and the idea-spark contract', async () => {
    const sparkSource = await readFile(path.join(sceneRoot, 'IdeaSpark.tsx'), 'utf8');
    const canvasSource = await readFile(path.join(sceneRoot, 'Scene1Canvas.tsx'), 'utf8');

    expect(sparkSource).toContain('IDEA_SPARK_POSITION = [0.4, 0.6, -0.2]');
    expect(sparkSource).toContain('uTime');
    expect(canvasSource).toContain('#6e3a18');
    expect(canvasSource).toContain('#f9d966');
  });
});
