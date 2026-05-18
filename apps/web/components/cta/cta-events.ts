'use client';

import type { TrackId } from './tracks';

export const CTA_OPEN_EVENT = 'cyberskill:cta-open';

export type CtaOpenSource = 'scene-0-hero' | 'scene-0-sticky' | 'scene-0-deeplink' | 'scene-6-portal';

export type CtaOpenRequest = {
  track: TrackId;
  source: CtaOpenSource;
  scrollIntoView?: boolean;
};

type CtaOpenEventRecord = CtaOpenRequest & {
  timestamp: number;
};

declare global {
  interface Window {
    __pendingCtaOpen?: CtaOpenRequest;
    __ctaOpenEvents?: CtaOpenEventRecord[];
  }
}

export function requestCtaOpen(request: CtaOpenRequest) {
  if (typeof window === 'undefined') return;

  window.__pendingCtaOpen = request;
  window.__ctaOpenEvents = window.__ctaOpenEvents ?? [];
  window.__ctaOpenEvents.push({ ...request, timestamp: Date.now() });
  window.dispatchEvent(new CustomEvent<CtaOpenRequest>(CTA_OPEN_EVENT, { detail: request }));
}

export function consumePendingCtaOpen() {
  if (typeof window === 'undefined') return undefined;
  const pending = window.__pendingCtaOpen;
  window.__pendingCtaOpen = undefined;
  return pending;
}
