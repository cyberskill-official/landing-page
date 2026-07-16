"use client";

import { useEffect } from "react";
import { ConsentGate } from "@/lib/analytics/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Post-LCP analytics loaders. No inline <script> injection (static pages use
 * hash-based CSP without per-request nonces); gtag bootstrap runs in this
 * module which is already allowed via script-src 'self'.
 */
export function AnalyticsScripts(_props: { nonce?: string } = {}) {
  useEffect(() => {
    let gaLoaded = false;
    const loadGa = () => {
      if (gaLoaded) return;
      if (!ConsentGate.canLoad("analytics")) return;
      gaLoaded = true;

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", "G-C5VJCLKZE7");

      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-C5VJCLKZE7";
      script.async = true;
      document.head.appendChild(script);
    };

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

      // Clarity bootstrap without an inline script tag (CSP-safe).
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
    const triggerLoadIfReady = () => {
      if (!lcpPainted) return;
      loadGa();
      loadClarity();
    };

    const observer = new PerformanceObserver((list) => {
      if (list.getEntries().length > 0) {
        lcpPainted = true;
        triggerLoadIfReady();
      }
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      lcpPainted = true;
    }

    const handleLoad = () => {
      lcpPainted = true;
      triggerLoadIfReady();
    };
    window.addEventListener("load", handleLoad);

    const onInteraction = () => {
      triggerLoadIfReady();
      cleanup();
    };
    const interactionEvents = [
      "scroll",
      "click",
      "keydown",
      "mousemove",
      "touchstart",
    ];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, onInteraction, { passive: true });
    });

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          triggerLoadIfReady();
          cleanup();
        },
        { timeout: 8000 },
      );
    } else {
      timeoutId = setTimeout(() => {
        triggerLoadIfReady();
        cleanup();
      }, 8000);
    }

    const cleanup = () => {
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

    return cleanup;
  }, []);

  return null;
}
