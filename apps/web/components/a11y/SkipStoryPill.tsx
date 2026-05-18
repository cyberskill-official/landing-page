'use client';

import React, { useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export function getSkipStoryBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1280) return 'tablet';
  return 'desktop';
}

export function skipStoryScrollBehavior() {
  if (typeof window === 'undefined') return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export function skipStoryFocusDelay(behavior: ScrollBehavior) {
  return behavior === 'smooth' ? 400 : 0;
}

export function SkipStoryPill() {
  const liveRegionRef = useRef<HTMLSpanElement>(null);
  const clearAnnouncementRef = useRef<number | null>(null);

  const activate = (event: React.MouseEvent<HTMLAnchorElement> | React.KeyboardEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById('cta-hub');
    const behavior = skipStoryScrollBehavior();

    trackEvent('skip_story_used', {
      breakpoint: getSkipStoryBreakpoint(window.innerWidth),
    });

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = 'Skipping to call to action';
      if (clearAnnouncementRef.current !== null) window.clearTimeout(clearAnnouncementRef.current);
      clearAnnouncementRef.current = window.setTimeout(() => {
        if (liveRegionRef.current) liveRegionRef.current.textContent = '';
      }, 2_000);
    }

    if (!target) {
      window.location.hash = 'cta-hub';
      return;
    }

    if (window.location.hash !== '#cta-hub') {
      window.history.pushState(null, '', '#cta-hub');
    }
    target.scrollIntoView({ behavior, block: 'start' });
    window.setTimeout(() => {
      target.focus({ preventScroll: true });
    }, skipStoryFocusDelay(behavior));
  };

  return (
    <>
      <a
        href="#cta-hub"
        className="skip-story-pill"
        aria-label="Skip to call to action"
        data-skip-story-pill
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') activate(event);
        }}
      >
        Skip story
      </a>
      <span
        ref={liveRegionRef}
        className="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
        data-skip-story-status
      />
    </>
  );
}
