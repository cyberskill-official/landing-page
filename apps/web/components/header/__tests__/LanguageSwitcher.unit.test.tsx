import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';
import React from 'react';
import { buildLocalePath, persistLocalePreference } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  usePathname: () => '/work/sample',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

const { LanguageSwitcher } = await import('../LanguageSwitcher');

describe('FR-CMS-007 LanguageSwitcher', () => {
  test('renders the current locale with a 44px-capable trigger class', () => {
    const html = renderToStaticMarkup(<LanguageSwitcher />);

    expect(html).toContain('language-switcher__trigger');
    expect(html).toContain('EN');
    expect(html).toContain('aria-label="Change language"');
  });

  test('preserves path while switching locale prefixes', () => {
    expect(buildLocalePath('/work/sample', 'vi')).toBe('/vi/work/sample');
    expect(buildLocalePath('/vi/work/sample', 'en')).toBe('/work/sample');
    expect(buildLocalePath('/', 'vi')).toBe('/vi');
    expect(buildLocalePath('/vi', 'en')).toBe('/');
  });

  test('persists locale without throwing when storage is available or blocked', () => {
    const writes: Record<string, string> = {};
    persistLocalePreference('vi', {
      setItem: (key, value) => {
        writes[key] = value;
      },
    });

    expect(writes.cyberskill_locale).toBe('vi');
    expect(() => persistLocalePreference('en', {
      setItem: () => {
        throw new Error('blocked');
      },
    })).not.toThrow();
  });
});

