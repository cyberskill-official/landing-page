"use client";

import { useEffect } from "react";

// Cinematic "rack focus" between scenes (FR-SCENE-012). As you scroll, the act
// nearest the viewport centre is in full focus while its neighbours dim and
// settle back a touch - so the page reads as a sequence of shots, not one long
// column. Sets a per-section --scene (0..1) that CSS turns into opacity + a
// small lift on the scene's inner container ONLY (transform/opacity, never the
// section box), so the Lumi flight path and the chapter rail - which measure the
// sections themselves - are untouched. Content defaults fully visible (SSR and
// no-JS). Always-on, to match this site's motion decision (the 3D scene runs
// even under OS reduced motion); the dimming is gentle and the scene you rest on
// is always at full focus, so readability holds.
export function SceneFocus() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const run = () => {
      raf = 0;
      // Re-query live each frame: a cached list orphans if React regenerates the
      // client tree (#418), and we would then be styling detached nodes while
      // the real sections stay at their default.
      const scenes = document.querySelectorAll<HTMLElement>("main .cs-section");
      if (scenes.length === 0) return;
      const vc = window.innerHeight / 2;
      const reach = window.innerHeight * 0.7;
      scenes.forEach((el) => {
        const r = el.getBoundingClientRect();
        // Full focus while the viewport centre sits inside the scene; otherwise
        // fall off with the distance from the nearest edge.
        const inside = vc >= r.top && vc <= r.bottom;
        const dist = inside ? 0 : Math.min(Math.abs(r.top - vc), Math.abs(r.bottom - vc));
        const focus = 1 - Math.min(1, dist / reach);
        el.style.setProperty("--scene", focus.toFixed(3));
      });
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(run);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Poll briefly so the heavy page settling after hydration is caught (same
    // reason the chapter rail polls); each tick re-queries live nodes.
    let polls = 0;
    let timer = 0;
    const poll = () => {
      schedule();
      if (polls++ < 25) timer = window.setTimeout(poll, 200);
    };
    poll();
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return null;
}
