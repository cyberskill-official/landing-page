"use client";

import { useEffect } from "react";

/**
 * Loads package brand webfonts after first paint / first interaction.
 *
 * Critical: do NOT mutate --font-body / --font-display after paint. Swapping
 * the font-family CSS variables mid-session was the field CLS ~0.33 culprit
 * (CrUX origin p75): users scroll → stylesheet loads → variables flip → every
 * text block reflows.
 *
 * Family *roles* come from `@cyberskill/design` (`--cs-font-family-ui` /
 * `--cs-font-family-display` + `.cs-display-face`). Bytes are the package
 * faces synced by `scripts/sync-ds-fonts.mjs` into `/fonts/brand-fonts.css`
 * with font-display: optional so late downloads never swap glyphs. This
 * loader only discovers those bytes.
 */
export function DeferredFonts() {
  useEffect(() => {
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      const id = "cs-brand-fonts";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = "/fonts/brand-fonts.css";
        document.head.appendChild(link);
      }
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
    // Idle-first when the browser is quiet; 12s fallback past typical lab window.
    let idleId: number | undefined;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => load(), { timeout: 8000 });
    }
    const timeoutId = setTimeout(load, 12000);
    return () => {
      cleanup();
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  return null;
}
