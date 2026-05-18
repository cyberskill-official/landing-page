import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-CMS-010 LumiTaglineReveal contract', () => {
  test('component is accessible, keyboard discoverable, and analytics-instrumented', async () => {
    const source = await readFile(path.join(appRoot, 'components/lumi/LumiTaglineReveal.tsx'), 'utf8');

    expect(source).toContain('data-lumi-tagline-reveal');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("event.key === 'Enter' || event.key === ' '");
    expect(source).toContain("trackEvent('vi_tagline_revealed'");
    expect(source).toContain("trigger_type: triggerType");
  });

  test('hook uses sessionStorage for EN once-per-session and never localStorage', async () => {
    const source = await readFile(path.join(appRoot, 'lib/lumi/use-tagline-state.ts'), 'utf8');

    expect(source).toContain('LUMI_TAGLINE_SESSION_KEY');
    expect(source).toContain('sessionStorage.getItem');
    expect(source).toContain('sessionStorage.setItem');
    expect(source).not.toContain('localStorage');
    expect(source).toContain("locale === 'vi'");
    expect(source).toContain('LUMI_TAGLINE_VISIBLE_MS = 3_000');
  });

  test('tagline is read from the Vietnamese message file byte-identically', async () => {
    const [source, messages] = await Promise.all([
      readFile(path.join(appRoot, 'lib/lumi/tagline.ts'), 'utf8'),
      readFile(path.join(appRoot, 'messages/vi.json'), 'utf8'),
    ]);

    expect(source).toContain("viMessages.lumi['lumi-tagline-hover']");
    expect(messages).toContain('"lumi-tagline-hover": "Lumi — vì ánh sáng biến nguyện ước thành sự thật"');
  });
});
