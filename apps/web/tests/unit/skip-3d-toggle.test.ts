import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-A11Y-005 skip 3D toggle', () => {
  test('ships a persistent, keyboard-accessible button with a no-JS /lite fallback', async () => {
    const toggle = await source('components/a11y/Skip3DToggle.tsx');

    expect(toggle).toContain('type="button"');
    expect(toggle).toContain('data-skip-3d');
    expect(toggle).toContain('aria-label="Skip 3D entirely"');
    expect(toggle).toContain("setLitePref('1')");
    expect(toggle).toContain("router.push('/lite')");
    expect(toggle).toContain('Switching to lite mode');
    expect(toggle).toContain('aria-live="polite"');
    expect(toggle).toContain("activate('keyboard')");
    expect(toggle).toContain('<noscript>');
    expect(toggle).toContain('href="/lite"');
    expect(toggle).toContain('JavaScript disabled - visit /lite manually for non-3D version.');
  });

  test('back-to-cinematic clears the preference, announces, and returns to /', async () => {
    const backLink = await source('components/a11y/BackToCinematicLink.tsx');

    expect(backLink).toContain('clearLitePref()');
    expect(backLink).toContain("sessionStorage.setItem('cyberskill_cinematic_override', '1')");
    expect(backLink).toContain("router.push('/')");
    expect(backLink).toContain('Switching to cinematic mode');
    expect(backLink).toContain('data-back-cinematic-status');
    expect(backLink).toContain("trackEvent('lite_mode_toggled'");
  });

  test('root capability gate redirects only from / and respects OS reduced-motion', async () => {
    const gate = await source('components/system/CapabilityGate.tsx');

    expect(gate).toContain("if (pathname?.startsWith('/lite')) return;");
    expect(gate).toContain("if (pathname !== '/') return;");
    expect(gate).toContain("pref === '1'");
    expect(gate).toContain("window.matchMedia('(prefers-reduced-motion: reduce)').matches");
    expect(gate).toContain("setLitePref('1')");
    expect(gate).toContain('hasCinematicOverride()');
    expect(gate).toContain("source: 'auto_redirect'");
    expect(gate).toContain("router.replace('/lite')");
  });

  test('CSS keeps the toggle target at least 44px and uses the gold focus ring', async () => {
    const css = await source('app/globals.css');

    expect(css).toMatch(/\.skip-3d-toggle-pill,[\s\S]*?min-width:\s*44px;/);
    expect(css).toMatch(/\.skip-3d-toggle-pill,[\s\S]*?min-height:\s*44px;/);
    expect(css).toContain(':where(a, button):focus-visible');
    expect(css).toContain('outline: 2px solid #e8b523;');
  });
});
