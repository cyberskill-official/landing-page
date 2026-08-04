"use client";

import { useEffect } from "react";
import {
  CONSENT_CHANGE_EVENT,
  ConsentGate,
} from "@/lib/analytics/consent";
import {
  GA_MEASUREMENT_ID,
  GA_SCRIPT_SRC,
} from "@/lib/analytics/ga";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

function applyGaConsentFromGate(): void {
  if (typeof window.gtag !== "function") return;
  if (ConsentGate.canLoad("analytics")) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
  } else {
    window.gtag("consent", "update", { analytics_storage: "denied" });
  }
}

/**
 * Ensures gtag exists (layout head normally ships it for Google install
 * detection), upgrades Consent Mode from ConsentGate, and loads Clarity
 * after LCP only when session-replay is granted.
 *
 * Reacts to ConsentBanner via `cs-consent-change` so Accept after first paint
 * upgrades GA storage and loads Clarity without a full page reload.
 */
export function AnalyticsScripts(_props: { nonce?: string } = {}) {
  useEffect(() => {
    ConsentGate.hydrate();

    let gaEnsured = false;
    const ensureGa = () => {
      if (gaEnsured) return;
      gaEnsured = true;

      if (typeof window.gtag !== "function") {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
          window.dataLayer?.push(args);
        };
        window.gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          wait_for_update: 500,
        });
        window.gtag("js", new Date());
        window.gtag("config", GA_MEASUREMENT_ID);
      }

      if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        const script = document.createElement("script");
        script.src = GA_SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }

      applyGaConsentFromGate();
    };

    // Head snippet is present for install detection; still ensure + sync consent
    // immediately so Accept/hydrate is not gated on LCP.
    ensureGa();

    let clarityLoaded = false;
    const loadClarity = () => {
      if (clarityLoaded) return;

      const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
      const isProd =
        process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
      const isTest = process.env.NODE_ENV === "test";

      if (!clarityId || (!isProd && !isTest)) return;
      if (!ConsentGate.canLoad("session-replay")) return;

      clarityLoaded = true;

      const w = window as Window & { clarity?: (...args: unknown[]) => void };
      w.clarity =
        w.clarity ||
        function (...args: unknown[]) {
          (w.clarity as unknown as { q?: unknown[] }).q =
            (w.clarity as unknown as { q?: unknown[] }).q || [];
          (w.clarity as unknown as { q: unknown[] }).q.push(args);
        };
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarityId}`;
      document.head.appendChild(script);
      w.clarity("consent", false);
    };

    let lcpPainted = false;
    const triggerClarityIfReady = () => {
      if (!lcpPainted) return;
      loadClarity();
    };

    const onConsentChange = () => {
      ensureGa();
      applyGaConsentFromGate();
      loadClarity();
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);

    const observer = new PerformanceObserver((list) => {
      if (list.getEntries().length > 0) {
        lcpPainted = true;
        triggerClarityIfReady();
      }
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      lcpPainted = true;
    }

    const handleLoad = () => {
      lcpPainted = true;
      triggerClarityIfReady();
    };
    window.addEventListener("load", handleLoad);

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const interactionEvents = [
      "scroll",
      "click",
      "keydown",
      "mousemove",
      "touchstart",
    ] as const;

    const cleanupInteraction = () => {
      window.removeEventListener("load", handleLoad);
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, onInteraction);
      });
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      observer.disconnect();
    };

    const onInteraction = () => {
      triggerClarityIfReady();
      cleanupInteraction();
    };
    interactionEvents.forEach((event) => {
      window.addEventListener(event, onInteraction, { passive: true });
    });

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          triggerClarityIfReady();
          cleanupInteraction();
        },
        { timeout: 8000 },
      );
    } else {
      timeoutId = setTimeout(() => {
        triggerClarityIfReady();
        cleanupInteraction();
      }, 8000);
    }

    return () => {
      cleanupInteraction();
      window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, []);

  return null;
}
