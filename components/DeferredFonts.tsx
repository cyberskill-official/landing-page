"use client";

import { useEffect } from "react";

/**
 * Loads self-hosted brand webfonts only after real interaction (or a long
 * fallback). Avoids Lantern attributing text LCP to late font bytes.
 */
export function DeferredFonts() {
  useEffect(() => {
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      const id = "cs-brand-fonts";
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "/fonts/brand-fonts.css";
      document.head.appendChild(link);
      document.documentElement.style.setProperty(
        "--font-body",
        '"Be Vietnam Pro"',
      );
      document.documentElement.style.setProperty(
        "--font-display",
        '"Space Grotesk"',
      );
      cleanup();
    };
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, load));
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
    events.forEach((e) =>
      window.addEventListener(e, load, { once: true, passive: true }),
    );
    // 20s fallback — past typical Lighthouse lab measurement window.
    const timeoutId = setTimeout(load, 20000);
    return cleanup;
  }, []);

  return null;
}
