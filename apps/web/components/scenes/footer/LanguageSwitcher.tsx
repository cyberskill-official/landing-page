'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SupportedLocale } from '@/lib/metadata-helpers';

type FooterLanguageSwitcherProps = {
  locale: SupportedLocale;
};

export function LanguageSwitcher({ locale }: FooterLanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();

  function switchLanguage(targetLocale: SupportedLocale) {
    router.push(buildLanguageUrl(pathname, targetLocale, searchParams?.toString() ?? '') as Parameters<typeof router.push>[0]);
  }

  return (
    <nav className="footer-language-switcher" aria-label="Language switcher">
      <button type="button" aria-current={locale === 'en' ? 'true' : undefined} onClick={() => switchLanguage('en')}>
        EN
      </button>
      <button type="button" aria-current={locale === 'vi' ? 'true' : undefined} onClick={() => switchLanguage('vi')}>
        VI
      </button>
    </nav>
  );
}

export function buildLanguageUrl(pathname: string, targetLocale: SupportedLocale, currentSearch = ''): string {
  const params = new URLSearchParams(currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch);
  params.set('lang', targetLocale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
