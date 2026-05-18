import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  CORNER_AVATAR_SIZE_PX,
  CORNER_AVATAR_Z_INDEX,
  LUMI_TAGLINE,
  cornerAvatarWorldPosition,
} from '../LumiCornerAvatar';
import { buildLanguageUrl } from '../LanguageSwitcher';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-SCENE-019 footer implementation', () => {
  test('pins the Lumi corner avatar to the top-right viewport and keeps it low-detail', () => {
    expect(CORNER_AVATAR_SIZE_PX).toBe(48);
    expect(CORNER_AVATAR_Z_INDEX).toBeLessThan(95);
    expect(cornerAvatarWorldPosition(10, 8)[0]).toBeCloseTo(3.8);
    expect(cornerAvatarWorldPosition(10, 8)[1]).toBeCloseTo(2.56);
    expect(LUMI_TAGLINE.en).toContain('Lumi');
  });

  test('builds text-only language URLs with a lang query parameter', () => {
    expect(buildLanguageUrl('/work', 'vi')).toBe('/work?lang=vi');
    expect(buildLanguageUrl('/work', 'en', 'foo=1&lang=vi')).toBe('/work?foo=1&lang=en');
  });

  test('mounts footer tunnel, wave_goodbye, trust signals, and no aspirational certifications', async () => {
    const footerClient = await source('components/scenes/footer/Footer.client.tsx');
    const trustSignals = await source('components/scenes/footer/TrustSignalsFooter.tsx');
    const languageSwitcher = await source('components/scenes/footer/LanguageSwitcher.tsx');
    const page = await source('app/page.tsx');

    expect(footerClient).toContain('SceneTunnel id="footer"');
    expect(footerClient).toContain("setCurrentAnim('wave_goodbye', 100)");
    expect(footerClient).toContain('setNonlaVisible(true)');
    expect(trustSignals).toContain('CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY');
    expect(trustSignals).toContain('D-U-N-S 673219568');
    expect(trustSignals).toContain('Stephen Cheng · Trịnh Thái Anh');
    expect(trustSignals).toContain('info@cyberskill.world');
    expect(trustSignals).toContain('/privacy');
    expect(trustSignals).toContain('/terms');
    expect(`${trustSignals}\n${languageSwitcher}`).not.toMatch(/ISO 27001|SOC 2|🇺🇸|🇬🇧|🇻🇳/);
    expect(page).toContain('<Footer locale={locale} />');
  });
});
