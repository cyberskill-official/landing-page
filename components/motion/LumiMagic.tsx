"use client";

import { useEffect } from "react";
import { getLumiScreen, getDigest, requestBurst } from "@/lib/scene/mascot";

// Lumi, on her own, touches the work (FR-CHAR-033). As she drifts near a content
// card she occasionally brushes it: the card lifts a little and a warm shine
// sweeps across it, then it settles. So she reads as a living mascot playing with
// the page, not a sprite gliding over it - and her passing OVER a card becomes a
// deliberate, legible beat instead of an accidental occlusion.
//
// DOM-only: it reads the screen position the scene already publishes each frame
// (no three import, so nothing heavy is pulled into this chunk) and toggles a
// data-attribute the stylesheet animates. Idle and autonomous - it fires on its
// own cadence, never on a click. Fully suppressed under reduced motion, while a
// digest runs, and when the living mascot is not on stage (mobile / low-end),
// where the cards simply never light.

const TOUCH_SELECTOR = ".cs-service-card, .cs-work-card, .cs-value-item, .cs-proof-card";
const HOLD_MS = 1500; // how long a card stays lit once touched
const MIN_GAP_MS = 2400; // minimum quiet time between touches
const REACH = 300; // px from Lumi's centre a card must be to be brushed

export function LumiMagic() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    let raf = 0;
    let lastCast = 0;
    let lit: HTMLElement | null = null;
    let clearTimer = 0;

    const release = () => {
      if (lit) lit.removeAttribute("data-lumi-touch");
      lit = null;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const html = document.documentElement;
      // Only while the living mascot is on stage and no digest is collapsing the page.
      if (!html.hasAttribute("data-lumi-live") || html.hasAttribute("data-digesting") || getDigest() > 0.02) return;
      if (lit || now - lastCast < MIN_GAP_MS) return;

      const lumi = getLumiScreen();
      if (!lumi.visible) return;

      // Nearest on-screen card within reach of where Lumi is right now.
      let best: HTMLElement | null = null;
      let bestD = REACH;
      document.querySelectorAll<HTMLElement>(TOUCH_SELECTOR).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.bottom < 48 || r.top > window.innerHeight - 48) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(cx - lumi.x, cy - lumi.y);
        if (d < bestD) {
          bestD = d;
          best = el;
        }
      });

      if (best) {
        const el = best as HTMLElement;
        el.setAttribute("data-lumi-touch", "");
        lit = el;
        lastCast = now;
        // A whisper of sparkle from the scene so the touch feels cast, not CSS.
        requestBurst(0.5);
        clearTimer = window.setTimeout(release, HOLD_MS);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clearTimer);
      release();
    };
  }, []);

  return null;
}
