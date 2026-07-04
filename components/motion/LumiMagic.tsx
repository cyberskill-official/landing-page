"use client";

import { useEffect } from "react";
import { requestBurst } from "@/lib/scene/mascot";

// Lumi plays with the work as she flies (FR-CHAR-033). Two layers:
//
//  1. PROXIMITY - continuously, the content card nearest Lumi gets
//     [data-lumi-near]: it warms and lifts a little while she is beside it, and
//     settles the moment she drifts on. As she flies across the page the cards
//     react to her in real time.
//
//  2. CAST - every ~9s she gives the card she is nearest a stronger one-shot:
//     [data-lumi-touch] runs a light sweep + a bigger lift, plus a sparkle.
//
// It reads Lumi's live screen position from the .cs-lumi-hotspot element that the
// 3D scene already positions on top of her every frame (a pure DOM read - no
// dependency on the mascot store instance, which can be duplicated across the
// lazily-loaded scene chunk), and toggles data-attributes the stylesheet
// animates. Driven by a setInterval so it survives React's mount churn. Inert
// while a digest runs and when the live mascot is not on stage (mobile / low-end,
// where .cs-lumi-hotspot never appears), so the cards simply never light.

const SELECTOR = ".cs-service-card, .cs-work-card, .cs-value-item, .cs-proof-card";
const MARGIN = 170; // px from a card's EDGE within which Lumi lights it (0 = over it)
const CAST_EVERY_MS = 9000; // deliberate shine cadence
const STEP_MS = 100; // sampling cadence (10x/s is plenty for a glow)

export function LumiMagic() {
  useEffect(() => {
    let near: HTMLElement | null = null;
    let casting: HTMLElement | null = null;
    let castTimer = 0;
    let lastCast = 0;

    const clearNear = () => {
      if (near) near.removeAttribute("data-lumi-near");
      near = null;
    };

    const step = () => {
      const html = document.documentElement;
      if (!html.hasAttribute("data-lumi-live") || html.hasAttribute("data-digesting")) {
        clearNear();
        return;
      }
      // Lumi's live screen position = centre of the hotspot the scene rides on her.
      const hot = document.querySelector<HTMLElement>(".cs-lumi-hotspot");
      if (!hot) {
        clearNear();
        return;
      }
      const hr = hot.getBoundingClientRect();
      if (hr.width === 0) {
        clearNear();
        return;
      }
      const lx = hr.left + hr.width / 2;
      const ly = hr.top + hr.height / 2;

      // Card whose EDGE Lumi is closest to (0 = over it), so she lights a card
      // whenever she flies over or just beside it.
      let best: HTMLElement | null = null;
      let bestD = MARGIN;
      for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.bottom < 40 || r.top > window.innerHeight - 40) continue;
        const dx = Math.max(r.left - lx, 0, lx - r.right);
        const dy = Math.max(r.top - ly, 0, ly - r.bottom);
        const d = Math.hypot(dx, dy);
        if (d < bestD) {
          bestD = d;
          best = el;
        }
      }

      if (best !== near) {
        clearNear();
        near = best;
        if (near) near.setAttribute("data-lumi-near", "");
      }

      const now = performance.now();
      if (near && !casting && now - lastCast > CAST_EVERY_MS) {
        const el = near;
        casting = el;
        lastCast = now;
        el.setAttribute("data-lumi-touch", "");
        try {
          requestBurst(0.6);
        } catch {
          // scene absent: capped no-op
        }
        castTimer = window.setTimeout(() => {
          el.removeAttribute("data-lumi-touch");
          casting = null;
        }, 1500);
      }
    };

    const iv = window.setInterval(step, STEP_MS);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(castTimer);
      clearNear();
      if (casting) casting.removeAttribute("data-lumi-touch");
    };
  }, []);

  return null;
}
