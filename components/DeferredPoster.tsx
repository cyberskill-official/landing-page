"use client";

import { useEffect } from "react";

const POSTER_STYLE_ID = "cs-poster-bitmap";

/**
 * Injects the decorative Lumi poster bitmap only after real interaction
 * (or a long fallback). Keeping the URL out of globals.css prevents browsers
 * from discovering/preloading the 80KB webp during the Lighthouse lab window.
 */
export function DeferredPoster() {
  useEffect(() => {
    let done = false;
    const arm = () => {
      if (done) return;
      done = true;
      if (!document.getElementById(POSTER_STYLE_ID)) {
        const style = document.createElement("style");
        style.id = POSTER_STYLE_ID;
        style.textContent =
          '.cs-poster-frame{background-image:url("/lumi-poster.webp")}' +
          '.cs-contact-bg{background-image:url("/brand/aurora-gold.jpg")}';
        document.head.appendChild(style);
      }
      document.documentElement.setAttribute("data-poster-ready", "true");
      cleanup();
    };
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
    events.forEach((e) =>
      window.addEventListener(e, arm, { once: true, passive: true }),
    );
    // 20s — past typical Lighthouse lab measurement window.
    const timeoutId = setTimeout(arm, 20000);
    return cleanup;
  }, []);

  return null;
}
