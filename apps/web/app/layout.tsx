import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { LanguageSwitcher } from '@/components/header/LanguageSwitcher';
import { JsonLd } from '@/components/seo/JsonLd';
import { PROFESSIONAL_SERVICE } from '@/components/seo/professional-service';
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { ScrollOrchestrator } from '@/components/orchestrator/ScrollOrchestrator';
import { GlobalCanvasShell } from '@/components/canvas/GlobalCanvasShell';
import { ScenePreloader } from '@/components/canvas/ScenePreloader';
import { StoreHydrator } from '@/components/state/StoreHydrator';
import { CapabilityGate } from '@/components/system/CapabilityGate';
import { LongTaskObserver } from '@/components/perf/LongTaskObserver';
import { WebVitalsReporter } from '@/components/perf/WebVitalsReporter';
import { SceneCaption } from '@/components/a11y/SceneCaption';
import { SkipStoryPill } from '@/components/a11y/SkipStoryPill';
import { MuteToggle } from '@/components/a11y/MuteToggle';
import { Skip3DToggle } from '@/components/a11y/Skip3DToggle';
import { SITE_URL } from '@/lib/metadata-helpers';
import { localeHeaderName, normalizeLocale } from '@/lib/i18n';
import { DEFAULT_OG_ALT, buildOpenGraphTwitterMeta } from '@/lib/seo/og-image-helpers';

const earlyCapabilityGate = `
(function () {
  var pendingEventKey = 'cyberskill_pending_analytics_event';
  var redirectMsKey = 'cyberskill_lite_redirect_ms';

  function locale() {
    return document.documentElement.lang.toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en';
  }

  function drainPendingEvent() {
    try {
      var raw = sessionStorage.getItem(pendingEventKey);
      if (!raw) return;
      var event = JSON.parse(raw);
      window.__cyberskillAnalyticsEvents = window.__cyberskillAnalyticsEvents || [];
      window.__cyberskillAnalyticsEvents.push(event);
      sessionStorage.removeItem(pendingEventKey);
    } catch (error) {
    }
  }

  function queueAutoRedirectEvent() {
    try {
      var payload = { from: 'cinematic', to: 'lite', source: 'auto_redirect', locale: locale() };
      var body = JSON.stringify({
        dedupe_id: 'lite_mode_toggled:' + window.location.pathname + ':' + Date.now(),
        event_name: 'lite_mode_toggled',
        properties: payload,
        referrer: document.referrer || undefined,
        url: window.location.href
      });
      var event = { name: 'lite_mode_toggled', payload: payload };
      sessionStorage.setItem(pendingEventKey, JSON.stringify(event));
      sessionStorage.setItem('cyberskill_last_analytics_event', body);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/analytics', {
          body: body,
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          method: 'POST'
        }).catch(function () {});
      }
    } catch (error) {
    }
  }

  function redirectToLite() {
    try {
      sessionStorage.setItem(redirectMsKey, '0');
    } catch (error) {
    }
    queueAutoRedirectEvent();
    window.location.replace('/lite');
  }

  drainPendingEvent();

  if (window.location.pathname !== '/') return;

  try {
    if (localStorage.getItem('cyberskill_lite_pref') === '1') {
      redirectToLite();
      return;
    }
  } catch (error) {
  }

  try {
    var override = window.__cyberskillCapabilityOverride;
    var webgl2 = false;
    if (override && typeof override.webgl2 === 'boolean') {
      webgl2 = override.webgl2;
    } else {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl2');
      webgl2 = !!(gl && gl.getExtension('EXT_color_buffer_float'));
    }
    if (!webgl2) {
      redirectToLite();
    }
  } catch (error) {
    redirectToLite();
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'CyberSkill — Turn Your Will Into Real',
  description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
  icons: {
    icon: '/favicon.svg',
  },
  ...buildOpenGraphTwitterMeta({
    title: 'CyberSkill — Turn Your Will Into Real',
    description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
    path: '/',
    imageAlt: DEFAULT_OG_ALT,
  }),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = normalizeLocale((await headers()).get(localeHeaderName));

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyCapabilityGate }} />
        <JsonLd schema={PROFESSIONAL_SERVICE} />
      </head>
      <body>
        <SmoothScrollProvider>
          <header className="a11y-control-strip" aria-label="Accessibility controls">
            <SkipStoryPill />
            <MuteToggle />
            <Skip3DToggle />
            <LanguageSwitcher />
          </header>
          <StoreHydrator />
          <CapabilityGate />
          <LongTaskObserver />
          <WebVitalsReporter />
          <SceneCaption />
          <ScenePreloader />
          <ScrollOrchestrator />
          {children}
          <GlobalCanvasShell />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
