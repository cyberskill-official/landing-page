'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { setLitePref } from '@/lib/lite-pref-storage';

function LiteModeIcon() {
  return (
    <svg className="skip-3d-toggle-pill__icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 9h10M7 13h7M7 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Skip3DToggle({ label = 'Skip 3D' }: { label?: string }) {
  const router = useRouter();
  const liveRegionRef = useRef<HTMLSpanElement>(null);
  const clearAnnouncementRef = useRef<number | null>(null);

  const activate = (source: 'click' | 'keyboard') => {
    setLitePref('1');
    try {
      sessionStorage.removeItem('cyberskill_cinematic_override');
    } catch {
      // Session override is best-effort.
    }
    trackEvent('lite_mode_toggled', {
      from: 'cinematic',
      to: 'lite',
      source,
    });

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = 'Switching to lite mode';
      if (clearAnnouncementRef.current !== null) window.clearTimeout(clearAnnouncementRef.current);
      clearAnnouncementRef.current = window.setTimeout(() => {
        if (liveRegionRef.current) liveRegionRef.current.textContent = '';
      }, 2_000);
    }

    router.push('/lite');
  };

  return (
    <>
      <button
        type="button"
        className="skip-3d-toggle-pill"
        data-skip-3d
        aria-label="Skip 3D entirely"
        onClick={() => activate('click')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activate('keyboard');
          }
        }}
      >
        <LiteModeIcon />
        <span>{label}</span>
      </button>
      <noscript>
        <style>{'.skip-3d-toggle-pill{display:none}'}</style>
        <a className="skip-3d-noscript" href="/lite" rel="alternate">
          Skip 3D entirely
        </a>
        <span className="visually-hidden">JavaScript disabled - visit /lite manually for non-3D version.</span>
      </noscript>
      <span
        ref={liveRegionRef}
        className="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
        data-skip-3d-status
      />
    </>
  );
}
