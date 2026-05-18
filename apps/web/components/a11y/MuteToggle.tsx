'use client';

import React, { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { MUTE_PREF_KEY, useAudioStore } from '@/lib/stores/audioStore';
import { useLowMemoryMode } from '@/lib/stores';

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg className="mute-toggle-pill__icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      {muted ? (
        <>
          <path d="m17 9 4 6M21 9l-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M16 9.5c1.2 1.3 1.2 3.7 0 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 7c2.4 2.8 2.4 7.2 0 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function stateName(muted: boolean) {
  return muted ? 'muted' : 'unmuted';
}

export function MuteToggle() {
  const muted = useAudioStore((state) => state.muted);
  const hydrateMutePreference = useAudioStore((state) => state.hydrateMutePreference);
  const initAudioContext = useAudioStore((state) => state.initAudioContext);
  const setMuted = useAudioStore((state) => state.setMuted);
  const syncFromStorageValue = useAudioStore((state) => state.syncFromStorageValue);
  const lowMemoryMode = useLowMemoryMode();
  const liveRegionRef = useRef<HTMLSpanElement>(null);
  const clearAnnouncementRef = useRef<number | null>(null);

  useEffect(() => {
    hydrateMutePreference();

    const onStorage = (event: StorageEvent) => {
      if (event.key === MUTE_PREF_KEY) syncFromStorageValue(event.newValue);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hydrateMutePreference, syncFromStorageValue]);

  if (lowMemoryMode) return null;

  const announce = (nextMuted: boolean) => {
    if (!liveRegionRef.current) return;
    liveRegionRef.current.textContent = nextMuted ? 'Audio muted' : 'Audio enabled';
    if (clearAnnouncementRef.current !== null) window.clearTimeout(clearAnnouncementRef.current);
    clearAnnouncementRef.current = window.setTimeout(() => {
      if (liveRegionRef.current) liveRegionRef.current.textContent = '';
    }, 2_000);
  };

  const toggle = (source: 'click' | 'keyboard') => {
    const nextMuted = !muted;

    if (!nextMuted) initAudioContext();
    setMuted(nextMuted);
    trackEvent('mute_toggled', {
      from: stateName(muted),
      to: stateName(nextMuted),
      source,
    });
    announce(nextMuted);
  };

  return (
    <>
      <button
        type="button"
        className="mute-toggle-pill"
        aria-pressed={muted}
        data-mute-toggle
        onClick={() => toggle('click')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle('keyboard');
          }
        }}
      >
        <SpeakerIcon muted={muted} />
        <span>{muted ? 'Muted' : 'Audio on'}</span>
      </button>
      <span
        ref={liveRegionRef}
        className="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
        data-mute-toggle-status
      />
    </>
  );
}
