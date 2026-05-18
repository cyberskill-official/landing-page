'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { postTask } from '@/lib/perf/scheduler';
import {
  buildLocalePath,
  localeFromPathname,
  locales,
  persistLocalePreference,
  type Locale,
} from '@/lib/i18n';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const currentLocale = localeFromPathname(pathname);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    persistLocalePreference(currentLocale, globalThis.localStorage);
  }, [currentLocale]);

  function switchTo(targetLocale: Locale) {
    if (targetLocale === currentLocale) {
      setOpen(false);
      return;
    }

    const nextPath = buildLocalePath(pathname, targetLocale);
    trackEvent('locale_switched', { from: currentLocale, to: targetLocale, source: 'switcher' });
    persistLocalePreference(targetLocale, globalThis.localStorage);
    document.documentElement.lang = targetLocale;
    void postTask(() => router.push(nextPath as Parameters<typeof router.push>[0]), 'user-blocking');
    setOpen(false);
  }

  return (
    <div className="language-switcher">
      <button
        ref={triggerRef}
        type="button"
        className="language-switcher__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Change language"
        onClick={() => setOpen((value) => !value)}
      >
        {currentLocale.toUpperCase()}
      </button>
      {open ? (
        <ul className="language-switcher__menu" role="listbox" aria-label="Language">
          {locales.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === currentLocale}>
              <button type="button" onClick={() => switchTo(locale)}>
                {locale === 'en' ? 'EN - English' : 'VI - Tieng Viet'}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
