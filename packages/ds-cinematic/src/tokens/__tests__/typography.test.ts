import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { family, letterSpacing, size, weight } from '../typography.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..', '..', '..');
const css = readFileSync(resolve(here, '..', 'typography.css'), 'utf8');
const fontRoot = resolve(root, 'apps', 'web', 'public', 'fonts');

function collectWoff2(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectWoff2(path);
    return entry.name.endsWith('.woff2') ? [path] : [];
  });
}

describe('FR-DS-007 — typography tokens', () => {
  test('AC#1, AC#5 and AC#6: token exports match the cinematic type contract', () => {
    expect(family.display).toBe('Inter Display, system-ui, sans-serif');
    expect(family.caption).toBe('JetBrains Mono, ui-monospace, monospace');
    expect(family.body).toBe('system-ui, -apple-system, sans-serif');
    expect(size['display.hero']).toBe('clamp(40px, 6vw, 96px)');
    expect(size['caption.lumi']).toBe('clamp(16px, 1.5vw, 22px)');
    expect(weight).toEqual({ regular: 400, semibold: 600, bold: 700, extrabold: 800 });
    expect(letterSpacing.display).toBe('-0.03em');
  });

  test('AC#2, AC#3, AC#4 and AC#9: typography.css declares self-hosted swapping fonts', () => {
    const fontFaceCount = css.match(/@font-face/g)?.length ?? 0;
    expect(fontFaceCount).toBeGreaterThanOrEqual(3);
    expect(css.match(/font-display: swap/g)?.length).toBe(fontFaceCount);
    expect(css).toContain('U+1EA0-1EF9');
    expect(css).toContain('/fonts/inter-display/InterDisplay-Bold-subset.woff2');
    expect(css).toContain('/fonts/jetbrains-mono/JetBrainsMono-Regular-subset.woff2');
    expect(css).toContain('rel="preload"');
  });

  test('AC#7: self-hosted font files exist and stay under the 200 KB budget', () => {
    const files = collectWoff2(fontRoot);
    expect(files.map((file) => file.replace(`${fontRoot}/`, '')).sort()).toEqual([
      'inter-display/InterDisplay-Bold-subset.woff2',
      'inter-display/InterDisplay-ExtraBold-subset.woff2',
      'jetbrains-mono/JetBrainsMono-Bold-subset.woff2',
      'jetbrains-mono/JetBrainsMono-Regular-subset.woff2',
    ]);
    const totalBytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
    expect(totalBytes).toBeLessThanOrEqual(200 * 1024);
  });

  test('AC#8: subsetting notes document Vietnamese coverage', () => {
    const notes = readFileSync(resolve(fontRoot, 'subsettingNotes.md'), 'utf8');
    expect(notes).toContain('U+1EA0-1EF9');
    expect(notes).toContain('Vietnamese');
    expect(notes).toContain('font-display: swap');
  });
});
