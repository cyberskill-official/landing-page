import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const sceneRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('FR-SCENE-014 Scene 2 implementation shape', () => {
  test('mounts through SceneTunnel and drives the paint clip on entry', async () => {
    const source = await readFile(path.join(sceneRoot, 'Scene2Transformation.tsx'), 'utf8');
    const canvas = await readFile(path.join(sceneRoot, 'Scene2Canvas.tsx'), 'utf8');

    expect(source).toContain('<SceneTunnel id="scene-2-transformation"');
    expect(source).toContain('data-scene-index="2"');
    expect(source).toContain('data-caption-beat="1"');
    expect(source).toContain('data-caption-beat="2"');
    expect(canvas).toContain("setCurrentAnim('paint', 100)");
  });

  test('keeps pull quote in DOM and avoids cool-tone scene colors', async () => {
    const pullQuote = await readFile(path.join(sceneRoot, 'PullQuote.tsx'), 'utf8');
    const canvas = await readFile(path.join(sceneRoot, 'Scene2Canvas.tsx'), 'utf8');

    expect(pullQuote).toContain('<blockquote');
    expect(pullQuote).toContain('cite=');
    expect(canvas).toContain('#fef6d9');
    expect(canvas).toContain('#f9d966');
    expect(canvas).not.toMatch(/cyan|magenta|#00|#0ff/i);
  });
});
