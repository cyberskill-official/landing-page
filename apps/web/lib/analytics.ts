import { onIdle, postTask } from './perf/scheduler';
import type { AnalyticsEventName, AnalyticsProperties, EventProps } from './analytics/events';

export type { AnalyticsEventName, AnalyticsProperties as AnalyticsPayload, EventProps };

declare global {
  interface Window {
    __cyberskillAnalyticsEvents?: Array<{
      name: AnalyticsEventName;
      payload: AnalyticsProperties;
    }>;
  }
}

export function trackEvent<T extends AnalyticsEventName>(name: T, payload: EventProps<T>) {
  if (typeof window === 'undefined') return;

  const enriched = enrichPayload(payload as AnalyticsProperties);
  const body = JSON.stringify({
    dedupe_id: buildDedupeId(name, enriched),
    event_name: name,
    properties: enriched,
    referrer: document.referrer || undefined,
    url: window.location.href,
  });

  window.__cyberskillAnalyticsEvents = window.__cyberskillAnalyticsEvents ?? [];
  window.__cyberskillAnalyticsEvents.push({ name, payload: enriched });

  try {
    sessionStorage.setItem('cyberskill_last_analytics_event', body);
  } catch {
    // Session storage is diagnostic-only.
  }

  onIdle(() => {
    void postTask(() => sendAnalyticsBeacon(body), 'background');
  }, 1000);
}

function enrichPayload(payload: AnalyticsProperties): AnalyticsProperties {
  const locale = document.documentElement.lang?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const sceneId = currentSceneId();

  return {
    ...payload,
    locale,
    ...(sceneId && payload.scene_id == null ? { scene_id: sceneId } : {}),
  };
}

function currentSceneId() {
  const hash = window.location.hash.replace(/^#/, '');
  if (/^scene-\d+$/.test(hash) || hash === 'cta-hub') return hash;
  return undefined;
}

function buildDedupeId(name: AnalyticsEventName, payload: AnalyticsProperties) {
  const slot = Math.floor(Date.now() / 2_000);
  return `${name}:${window.location.pathname}:${JSON.stringify(payload)}:${slot}`;
}

function sendAnalyticsBeacon(body: string) {
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
    return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    // Analytics must never block navigation or accessibility controls.
  });
}
