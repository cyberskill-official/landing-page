import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { TRACKS } from '../tracks';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-CTA-001 CTA hub', () => {
  test('defines exactly the three master-plan tracks with lazy factories', () => {
    expect(TRACKS.map((track) => track.id)).toEqual(['buy', 'partner', 'join']);
    expect(TRACKS).toHaveLength(3);

    for (const track of TRACKS) {
      expect(track.label.length).toBeGreaterThan(8);
      expect(track.describedBy.length).toBeGreaterThan(40);
      expect(track.formFactory()).toHaveProperty('$$typeof');
    }
  });

  test('CtaHub stays pure DOM, emits analytics, and hands focus to Lumi store', async () => {
    const hub = await source('components/cta/CtaHub.tsx');

    expect(hub).not.toMatch(/from ['"]three['"]/);
    expect(hub).not.toContain('<Canvas');
    expect(hub).not.toContain('<Html');
    expect(hub).toContain("trackEvent('cta_view'");
    expect(hub).toContain("trackEvent('cta_click'");
    expect(hub).toContain('setFocusedCta(track)');
    expect(hub).toContain('scroll_depth');
    expect(hub).toContain("new URLSearchParams(window.location.search).get('track')");
  });

  test('CtaPortal is keyboard-addressable and exposes accessible descriptions', async () => {
    const portal = await source('components/cta/CtaPortal.tsx');

    expect(portal).toContain('type="button"');
    expect(portal).toContain('data-cta-track={track.id}');
    expect(portal).toContain('aria-describedby={descId}');
    expect(portal).toContain("aria-current={isCurrent ? 'page' : undefined}");
    expect(portal).toContain('onFocus={() => onFocusTrack(track.id)}');
    expect(portal).toContain('onPointerEnter={() => onFocusTrack(track.id)}');
  });

  test('homepage mounts the hub at the Scene 6 CTA anchor', async () => {
    const page = await source('app/page.tsx');
    const scene6 = await source('components/scenes/scene-6-cta-hub/Scene6CtaHub.tsx');

    expect(page).toContain('<Scene6CtaHub locale={locale} />');
    expect(scene6).toContain("id=\"cta-hub\"");
    expect(scene6).toContain('<CtaHub locale={locale} />');
  });
});
