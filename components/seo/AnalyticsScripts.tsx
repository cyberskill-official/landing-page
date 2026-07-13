"use client";

import { useEffect } from "react";
import { ConsentGate } from "@/lib/analytics/consent";

interface AnalyticsScriptsProps {
  nonce?: string;
}

export function AnalyticsScripts({ nonce }: AnalyticsScriptsProps) {
  useEffect(() => {
    // 1. Google Analytics 4 (GA4) loader
    let gaLoaded = false;
    const loadGa = () => {
      if (gaLoaded) return;
      if (!ConsentGate.canLoad("analytics")) return;
      gaLoaded = true;

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

    // 2. Microsoft Clarity loader
    let clarityLoaded = false;
    const loadClarity = () => {
      if (clarityLoaded) return;
      
      const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
      const isProd = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
      const isTest = process.env.NODE_ENV === "test";

      if (!clarityId || (!isProd && !isTest)) return;
      if (!ConsentGate.canLoad("session-replay")) return;

      clarityLoaded = true;

      // Inject Clarity script tag with inline config
      const script = document.createElement("script");
      if (nonce) {
        script.setAttribute("nonce", nonce);
      }
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
        window.clarity("consent", false);
      `;
      document.head.appendChild(script);
    };

    let lcpPainted = false;
    const triggerLoadIfReady = () => {
      if (!lcpPainted) return;
      loadGa();
      loadClarity();
    };

    // Set up LCP Observer to detect when the LCP element has painted
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        lcpPainted = true;
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

    // First user interaction listener
    const onInteraction = () => {
      triggerLoadIfReady();
      cleanup();
    };

    const interactionEvents = ["scroll", "click", "keydown", "mousemove", "touchstart"];
    interactionEvents.forEach((event) => {
      window.addEventListener(event, onInteraction, { passive: true });
    });

    // Browser idle fallback (requestIdleCallback or setTimeout)
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
