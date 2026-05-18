'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { setFocusedCta } from '@/lib/stores';
import { CTA_OPEN_EVENT, consumePendingCtaOpen, type CtaOpenRequest } from './cta-events';
import { CtaPortal } from './CtaPortal';
import { isTrackId, TRACKS, trackById, type TrackId } from './tracks';

type CtaHubProps = {
  locale?: 'en' | 'vi';
};

export function CtaHub({ locale = 'en' }: CtaHubProps) {
  const [focusedTrack, setFocusedTrackState] = useState<TrackId | null>(null);
  const [openTrack, setOpenTrack] = useState<TrackId | null>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(false);

  const activeTrack = openTrack ? trackById(openTrack) : undefined;
  const OpenForm = useMemo(() => activeTrack?.formFactory() ?? null, [activeTrack]);

  const copy =
    locale === 'vi'
      ? {
          eyebrow: 'Ba loi vao',
          title: 'Ban muon bien dieu gi thanh that?',
          deck: 'Chon dung loi cho muc tieu cua ban. Moi cong thong tin la DOM thuan, dieu huong bang ban phim, va san sang de gan form rieng.',
        }
      : {
          eyebrow: 'Three tracks',
          title: 'What do you want to make real?',
          deck: 'Pick the path that matches your intent. Each portal is keyboard-first, analytics-ready, and decoupled from the canvas.',
        };

  const setFocusedTrack = useCallback((track: TrackId | null) => {
    setFocusedTrackState(track);
    setFocusedCta(track);
  }, []);

  const activateTrack = useCallback(
    (track: TrackId, source: CtaOpenRequest['source'] = 'scene-6-portal') => {
      setOpenTrack(track);
      setFocusedTrack(track);
      trackEvent('cta_click', {
        cta_id: track,
        scene_id: source.startsWith('scene-0') ? 'scene-0' : 'scene-6',
        track,
        scroll_depth: scrollDepth(),
      });
    },
    [setFocusedTrack],
  );

  useEffect(() => () => setFocusedCta(null), []);

  useEffect(() => {
    const track = new URLSearchParams(window.location.search).get('track');
    if (!isTrackId(track)) return;

    setFocusedTrack(track);
    hubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.requestAnimationFrame(() => {
      document.getElementById(`cta-portal-${track}`)?.focus({ preventScroll: true });
    });
  }, [setFocusedTrack]);

  useEffect(() => {
    const openFromRequest = (request: CtaOpenRequest | undefined) => {
      if (!request || !isTrackId(request.track)) return;
      if (request.scrollIntoView) hubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      activateTrack(request.track, request.source);
      window.__pendingCtaOpen = undefined;
    };

    openFromRequest(consumePendingCtaOpen());

    const onOpen = (event: Event) => {
      openFromRequest((event as CustomEvent<CtaOpenRequest>).detail);
    };

    window.addEventListener(CTA_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CTA_OPEN_EVENT, onOpen);
  }, [activateTrack]);

  useEffect(() => {
    if (!hubRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (!visible || viewTrackedRef.current) return;
        viewTrackedRef.current = true;
        for (const track of TRACKS) {
          trackEvent('cta_view', {
            cta_id: track.id,
            scene_id: 'scene-6',
          });
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(hubRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hubRef} className="cta-hub" data-cta-hub>
      <p className="cta-hub__eyebrow">{copy.eyebrow}</p>
      <h2 id="cta-hub-title">{copy.title}</h2>
      <p className="cta-hub__deck">{copy.deck}</p>
      <div className="cta-hub__portals" aria-label="Conversion tracks">
        {TRACKS.map((track) => (
          <CtaPortal
            key={track.id}
            track={track}
            isCurrent={focusedTrack === track.id}
            onActivate={activateTrack}
            onFocusTrack={setFocusedTrack}
            onBlurTrack={() => setFocusedTrack(null)}
          />
        ))}
      </div>
      {OpenForm ? (
        <Suspense fallback={<div role="status" className="cta-modal-loading">Loading track details...</div>}>
          <OpenForm onClose={() => setOpenTrack(null)} />
        </Suspense>
      ) : null}
    </div>
  );
}

function scrollDepth() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.round((window.scrollY / scrollable) * 100);
}
