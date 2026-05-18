'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  detectLowMemory,
  detectSaveData,
  detectWebGL2,
  getCapabilityDebugSnapshot,
  getLitePref,
  setLitePref,
  type CapabilityDebugSnapshot,
} from '@/lib/capability-detection';
import { trackEvent } from '@/lib/analytics';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { setLowMemoryMode } from '@/lib/stores';
import { SaveDataBanner } from '@/components/perf/SaveDataBanner';

const SAVE_DATA_DISMISS_KEY = 'cyberskill_save_data_dismissed';

function resolveLocale(searchParams: URLSearchParams): SupportedLocale {
  if (searchParams.get('lang') === 'vi') return 'vi';
  if (document.documentElement.lang.toLowerCase().startsWith('vi')) return 'vi';
  return 'en';
}

export function CapabilityGate() {
  const pathname = usePathname();
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(false);
  const [debugSnapshot, setDebugSnapshot] = useState<CapabilityDebugSnapshot | null>(null);
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [debugEnabled, setDebugEnabled] = useState(false);

  const redirectToLite = useCallback(() => {
    try {
      sessionStorage.setItem('cyberskill_lite_redirect_ms', String(Math.round(performance.now())));
    } catch {
      // Session storage is diagnostic-only.
    }
    router.replace('/lite');
  }, [router]);

  const hasCinematicOverride = useCallback(() => {
    try {
      return sessionStorage.getItem('cyberskill_cinematic_override') === '1';
    } catch {
      return false;
    }
  }, []);

  const stayHere = useCallback(() => {
    setLitePref('0');
    try {
      sessionStorage.setItem(SAVE_DATA_DISMISS_KEY, '1');
    } catch {
      // Session persistence is best-effort.
    }
    trackEvent('save_data_banner_stayed', { source: 'save_data_banner' });
    setShowBanner(false);
    if (debugEnabled) setDebugSnapshot(getCapabilityDebugSnapshot());
  }, [debugEnabled]);

  const switchToLite = useCallback(() => {
    setLitePref('1');
    try {
      sessionStorage.setItem(SAVE_DATA_DISMISS_KEY, '1');
    } catch {
      // Session persistence is best-effort.
    }
    trackEvent('save_data_banner_switched', { source: 'save_data_banner' });
    trackEvent('lite_mode_toggled', {
      from: 'cinematic',
      to: 'lite',
      source: 'save_data_banner',
    });
    setShowBanner(false);
    redirectToLite();
  }, [redirectToLite]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextDebugEnabled = params.get('debug') === 'capability';
    setLocale(resolveLocale(params));
    setDebugEnabled(nextDebugEnabled);

    if (pathname?.startsWith('/lite')) return;

    const lowMemory = detectLowMemory();
    if (lowMemory) {
      setLowMemoryMode(true);
    }

    if (nextDebugEnabled) setDebugSnapshot(getCapabilityDebugSnapshot());
    if (pathname !== '/') return;

    const pref = getLitePref();
    if (pref === '1') {
      trackEvent('lite_mode_toggled', {
        from: 'cinematic',
        to: 'lite',
        source: 'auto_redirect',
      });
      redirectToLite();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion && pref !== '0' && !hasCinematicOverride()) {
      setLitePref('1');
      trackEvent('lite_mode_toggled', {
        from: 'cinematic',
        to: 'lite',
        source: 'auto_redirect',
      });
      redirectToLite();
      return;
    }

    if (!detectWebGL2()) {
      redirectToLite();
      return;
    }

    let saveDataDismissed = false;
    try {
      saveDataDismissed = sessionStorage.getItem(SAVE_DATA_DISMISS_KEY) === '1';
    } catch {
      saveDataDismissed = false;
    }

    if (detectSaveData() && pref !== '0' && !saveDataDismissed) {
      trackEvent('save_data_banner_shown', { source: 'save_data_banner' });
      setShowBanner(true);
    }
  }, [hasCinematicOverride, pathname, redirectToLite]);

  return (
    <>
      {showBanner ? (
        <SaveDataBanner locale={locale} onStay={stayHere} onSwitch={switchToLite} />
      ) : null}
      {debugEnabled && debugSnapshot ? (
        <output className="capability-debug" data-capability-debug aria-label="Capability debug">
          webgl2: {String(debugSnapshot.webgl2)} | saveData: {String(debugSnapshot.saveData)} |
          deviceMemory: {debugSnapshot.deviceMemory ?? 'unknown'} | lowMemory:{' '}
          {String(debugSnapshot.lowMemory)} | litePref: {debugSnapshot.litePref ?? 'null'}
        </output>
      ) : null}
    </>
  );
}
