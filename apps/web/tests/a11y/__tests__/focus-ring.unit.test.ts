import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-A11Y-008 focus ring CSS', () => {
  test('defines the global 2px gold focus-visible ring for all focusable elements', async () => {
    const css = await readFile(path.join(appRoot, 'app/globals.css'), 'utf8');

    expect(css).toContain(':focus-visible');
    expect(css).toContain('outline: 2px solid var(--focus-ring-color)');
    expect(css).toContain('outline-offset: 2px');
    expect(css).toContain('border-radius: inherit');
    expect(css).not.toMatch(/outline\s*:\s*(none|0)\b/);
  });
});
