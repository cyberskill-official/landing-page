"use client";

import { useEffect, useState } from "react";
import { ConsentGate } from "@/lib/analytics/consent";

interface AnalyticsScriptsProps {
  nonce?: string;
}

export function AnalyticsScripts({ nonce }: AnalyticsScriptsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // 1. Check if analytics consent is granted
    if (!ConsentGate.canLoad("analytics")) {
      return;
    }

    let lcpPainted = false;
    let loaded = false;

    const loadTag = () => {
      if (loaded || !lcpPainted) return;
      loaded = true;

      // Inject GA4 script tag dynamically
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-C5VJCLKZE7";
      script.async = true;
      if (nonce) {
        script.setAttribute("nonce", nonce);
      }
      document.head.appendChild(script);

      // Inject inline config script
      const inlineScript = document.createElement("script");
      if (nonce) {
        inlineScript.setAttribute("nonce", nonce);
      }
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-C5VJCLKZE7');
      `;
      document.head.appendChild(inlineScript);
    };

    // 2. Set up LCP Observer to detect when the LCP element has painted
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        lcpPainted = true;
        // Trigger load if interaction or idle already happened
        triggerLoadIfReady();
      }
    });

    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      // Fallback if PerformanceObserver is not supported
      lcpPainted = true;
    }

    // Fallback load event in case LCP observer misses
    const handleLoad = () => {
      lcpPainted = true;
      triggerLoadIfReady();
    };
    window.addEventListener("load", handleLoad);

    const triggerLoadIfReady = () => {
      loadTag();
    };

    // 3. First user interaction listener
    const onInteraction = () => {
      triggerLoadIfReady();
      cleanup();
    };

    const interactionEvents = ["scroll", "click", "keydown", "mousemove", "touchstart"];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, onInteraction, { passive: true });
    });

    // 4. Browser idle fallback (requestIdleCallback or setTimeout)
    let idleId: number | undefined;
    let timeoutId: any;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(
        () => {
          triggerLoadIfReady();
          cleanup();
        },
        { timeout: 4000 }
      );
    } else {
      timeoutId = setTimeout(() => {
        triggerLoadIfReady();
        cleanup();
      }, 4000);
    }

    const cleanup = () => {
      window.removeEventListener("load", handleLoad);
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, onInteraction);
      });
      if (idleId && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      observer.disconnect();
    };

    return cleanup;
  }, [nonce]);

  return null;
}
