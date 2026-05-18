import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-A11Y-007 NextSceneButton contract', () => {
  test('scrolls to and focuses the target scene anchor', async () => {
    const source = await readFile(path.join(appRoot, 'components/navigation/NextSceneButton.tsx'), 'utf8');

    expect(source).toContain('data-next-scene-button');
    expect(source).toContain('target.scrollIntoView');
    expect(source).toContain('target.focus({ preventScroll: true })');
    expect(source).toContain("vi: 'Cảnh tiếp theo ↓'");
  });

  test('global CSS keeps the button visible only while keyboard-focused', async () => {
    const css = await readFile(path.join(appRoot, 'app/globals.css'), 'utf8');

    expect(css).toContain('.next-scene-button');
    expect(css).toContain('opacity: 0');
    expect(css).toContain('.next-scene-button:focus-visible');
    expect(css).toContain('opacity: 1');
  });
});
