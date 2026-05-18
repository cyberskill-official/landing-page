import { describe, expect, test } from 'vitest';
import {
  AB_COOKIE_MAX_AGE_SECONDS,
  assignVariant,
  buildVariantCookie,
  readVariantCookie,
  resolveForcedVariant,
  resolveVariantAssignment,
} from '../variant-assignment';
import { AB_TESTS } from '../tests';

const scene0 = AB_TESTS[0]!;

describe('FR-CTA-011 A/B variant assignment', () => {
  test('assigns variants by configured split', () => {
    expect(assignVariant(scene0, () => 0.1)).toBe('a');
    expect(assignVariant(scene0, () => 0.75)).toBe('b');
  });

  test('reads and builds persistent SSR-safe cookies', () => {
    const cookie = buildVariantCookie('scene0_narration', 'b');
    expect(cookie).toContain('cyberskill_ab_scene0_narration=b');
    expect(cookie).toContain(`Max-Age=${AB_COOKIE_MAX_AGE_SECONDS}`);
    expect(cookie).toContain('SameSite=Lax');
    expect(readVariantCookie('scene0_narration', 'other=x; cyberskill_ab_scene0_narration=b')).toBe('b');
  });

  test('force_variant overrides only valid configured variants', () => {
    expect(resolveForcedVariant(scene0, new URLSearchParams({ force_variant: 'b' }))).toBe('b');
    expect(resolveForcedVariant(scene0, new URLSearchParams({ force_variant: 'zzz' }))).toBeNull();
  });

  test('resolves disabled, existing, forced, and new assignments', () => {
    expect(resolveVariantAssignment({ testId: 'cta_button_color' })).toEqual({
      reason: 'disabled',
      setCookie: null,
      variant: null,
    });
    expect(resolveVariantAssignment({
      cookieHeader: 'cyberskill_ab_scene0_narration=a',
      testId: 'scene0_narration',
    })).toEqual({ reason: 'cookie', setCookie: null, variant: 'a' });
    expect(resolveVariantAssignment({
      searchParams: new URLSearchParams({ force_variant: 'b' }),
      testId: 'scene0_narration',
    })).toMatchObject({ reason: 'forced', variant: 'b' });
    expect(resolveVariantAssignment({
      random: () => 0.9,
      testId: 'scene0_narration',
    })).toMatchObject({ reason: 'assigned', variant: 'b' });
  });

  test('client hook source fires exposure once per session', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('../use-variant.ts', import.meta.url), 'utf8'),
    );

    expect(source).toContain("trackEvent('ab_exposure'");
    expect(source).toContain('cyberskill_ab_exposed_');
    expect(source).toContain('sessionStorage.getItem');
  });
});
