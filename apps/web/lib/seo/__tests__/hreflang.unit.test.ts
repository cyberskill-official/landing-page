import { describe, expect, test } from 'vitest';
import { buildAlternates, buildStandardAlternates } from '../hreflang';

describe('FR-CMS-008 hreflang helpers', () => {
  test('builds absolute en, vi, and x-default alternates', () => {
    expect(buildStandardAlternates('/work').languages).toEqual({
      en: 'https://cyberskill.world/work',
      vi: 'https://cyberskill.world/vi/work',
      'x-default': 'https://cyberskill.world/work',
    });
  });

  test('uses x-default as the English default URL', () => {
    const alternates = buildStandardAlternates('/');
    expect(alternates.languages?.['x-default']).toBe(alternates.languages?.en);
  });

  test('uses language-only codes and absolute URLs', () => {
    const alternates = buildStandardAlternates('/team');
    const codes = Object.keys(alternates.languages ?? {}).filter((code) => code !== 'x-default');

    expect(codes).toEqual(['en', 'vi']);
    for (const href of Object.values(alternates.languages ?? {})) {
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test('supports locale-specific Vietnamese case-study slugs', () => {
    const alternates = buildAlternates({
      path: '/work/museum-exhibit-acme',
      vietnameseSlug: 'trien-lam-bao-tang-acme',
    });

    expect(alternates.languages?.en).toBe('https://cyberskill.world/work/museum-exhibit-acme');
    expect(alternates.languages?.vi).toBe('https://cyberskill.world/vi/work/trien-lam-bao-tang-acme');
  });
});

