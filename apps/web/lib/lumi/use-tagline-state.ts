'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';

export type LumiTaglineTrigger = 'hover' | 'tap' | 'keyboard';

export const LUMI_TAGLINE_SESSION_KEY = 'cyberskill_vi_tagline_shown';
export const LUMI_TAGLINE_VISIBLE_MS = 3_000;

export function useTaglineState(locale: Locale) {
  const [canReveal, setCanReveal] = useState(locale === 'vi');
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (locale === 'vi') {
      setCanReveal(true);
      return;
    }

    try {
      setCanReveal(sessionStorage.getItem(LUMI_TAGLINE_SESSION_KEY) !== '1');
    } catch {
      setCanReveal(true);
    }
  }, [locale]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const trigger = useCallback(() => {
    if (!canReveal || active) return false;

    setActive(true);
    if (locale === 'en') {
      try {
        sessionStorage.setItem(LUMI_TAGLINE_SESSION_KEY, '1');
      } catch {
        // Session-only Easter egg state is a progressive enhancement.
      }
      setCanReveal(false);
    }

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, LUMI_TAGLINE_VISIBLE_MS);

    return true;
  }, [active, canReveal, locale]);

  return { active, canReveal, trigger };
}
