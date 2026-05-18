import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-A11Y-006 SceneCaption contract', () => {
  test('ships the live caption semantics and debounce behavior', async () => {
    const source = await readFile(path.join(appRoot, 'components/a11y/SceneCaption.tsx'), 'utf8');

    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain('window.setTimeout(() => setDisplayed(narration), 500)');
    expect(source).toContain('Scene {displayed.sceneNumber}:');
    expect(source).toContain('data-scene-caption');
  });

  test('global CSS keeps captions readable and motion-aware', async () => {
    const css = await readFile(path.join(appRoot, 'app/globals.css'), 'utf8');

    expect(css).toContain('.scene-caption');
    expect(css).toContain('bottom: calc(env(safe-area-inset-bottom, 0px) + 16px)');
    expect(css).toContain('font-size: 18px');
    expect(css).toContain('rgba(44, 31, 26, 0.88)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('transition: none');
  });
});
