'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { AB_COOKIE_PREFIX } from './variant-assignment';

export function readClientVariant(testId: string) {
  if (typeof document === 'undefined') return null;
  const prefix = `${AB_COOKIE_PREFIX}${testId}=`;
  const pair = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return pair ? decodeURIComponent(pair.slice(prefix.length)) : null;
}

export function useVariant(testId: string, initialVariant: string | null = null) {
  const [variant, setVariant] = useState<string | null>(initialVariant);

  useEffect(() => {
    const resolved = initialVariant ?? readClientVariant(testId);
    if (!resolved) return;
    setVariant(resolved);

    const sessionKey = `cyberskill_ab_exposed_${testId}`;
    try {
      if (sessionStorage.getItem(sessionKey) === '1') return;
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // Exposure tracking remains best-effort.
    }

    trackEvent('ab_exposure', { test_id: testId, variant: resolved });
  }, [initialVariant, testId]);

  return variant;
}
