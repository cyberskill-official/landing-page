"use client";

import { useEffect } from "react";
import { requestBurst, requestGesture, setAttend } from "@/lib/scene/mascot";

// Cinematic "rack focus" plus a directed scene hand-off (FR-SCENE-012 / -013).
//
// Rack focus: as you scroll, the act nearest the viewport centre is in full
// focus while its neighbours dim and settle back a touch - so the page reads as
// a sequence of shots, not one long column. Sets a per-section --scene (0..1)
// that CSS turns into opacity + a small lift on the scene's inner container ONLY
// (never the section box), so the Lumi flight path and the chapter rail - which
// measure the sections themselves - are untouched.
//
// Scene hand-off: the first time each act crosses into focus, a one-shot gold
// light-sweep passes across it (CSS, via a data-enter flag) and Lumi punctuates
// the arrival with a small sparkle burst. The burst goes through the shared
// mascot queue (lib/scene/mascot has NO three import), so this stays a plain DOM
// signal: the 3D scene drains it at Lumi's current position, and when there is
// no scene (mobile / no WebGL) it is a harmless capped no-op. We never touch the
// rig or the flight path here - Lumi "presents" each act simply by sparkling as
// it arrives beside it.
//
// Content defaults fully visible (SSR and no-JS). Always-on, to match this
// site's motion decision (the 3D scene runs even under OS reduced motion); the
// dimming is gentle, the sweep is brief and low-contrast, and the scene you rest
// on is always at full focus, so readability holds.
export function SceneFocus() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;

    // Per-act state, keyed by a STABLE id (not the element ref, which orphans
    // when React regenerates the client tree - #418). `armed` gives the enter
    // trigger hysteresis so a scene fires once as it arrives, re-arms only after
    // it has clearly left, and never chatters around the threshold.
    const armed: Record<string, boolean> = {};
    const enterTimers = new Map<string, number>();
    let lastBurst = 0;
    let gestureN = 0;
    let first = true;

    const run = () => {
      raf = 0;
      // Re-query live each frame: a cached list orphans if React regenerates the
      // client tree, and we would then be styling detached nodes while the real
      // sections stay at their default.
      const scenes = document.querySelectorAll<HTMLElement>("main .cs-section");
      if (scenes.length === 0) return;
      const vc = window.innerHeight / 2;
      const reach = window.innerHeight * 0.7;
      let maxFocus = 0;

      scenes.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        // Full focus while the viewport centre sits inside the scene; otherwise
        // fall off with the distance from the nearest edge.
        const inside = vc >= r.top && vc <= r.bottom;
        const dist = inside ? 0 : Math.min(Math.abs(r.top - vc), Math.abs(r.bottom - vc));
        const focus = 1 - Math.min(1, dist / reach);
        el.style.setProperty("--scene", focus.toFixed(3));
        if (focus > maxFocus) maxFocus = focus;

        // Directed hand-off on the rising edge into focus. The hero (#wish) is
        // skipped: Lumi is already performing there, and it sits centred at load.
        const key = el.id || `scene-${i}`;
        if (armed[key] === undefined) armed[key] = focus < 0.9;
        const isHero = el.id === "wish";
        if (!first && !isHero && armed[key] && focus >= 0.9) {
          armed[key] = false;
          el.setAttribute("data-enter", "");
          const prevT = enterTimers.get(key);
          if (prevT) window.clearTimeout(prevT);
          enterTimers.set(
            key,
            window.setTimeout(() => el.removeAttribute("data-enter"), 900),
          );
          const now = performance.now();
          // One gentle sparkle per arrival, rate-limited so a fast scroll past
          // several acts does not turn into a stutter of bursts. Lumi also plays
          // a gesture as she arrives - alternating a wave and a cast so she
          // presents each act with a real motion instead of gliding in Idle.
          if (now - lastBurst > 650) {
            lastBurst = now;
            try {
              requestBurst(0.6);
              requestGesture(gestureN++ % 2 === 0 ? "Wave" : "Cast");
            } catch {
              // Scene absent: the queues are capped no-ops, nothing to do.
            }
          }
        }
        // Re-arm only once the act is well clear, so it can present again on a
        // later pass without flickering at the boundary.
        if (focus <= 0.5) armed[key] = true;
      });

      // Tell the 3D rig how strongly to present: 0 until an act is genuinely
      // centred (focus > 0.5), ramping to 1 when one is dead-centre, so Lumi
      // turns toward the page only while holding an act and flies neutrally
      // between them. setAttend clamps and is a no-op when there is no scene.
      setAttend((maxFocus - 0.5) / 0.5);

      first = false;
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
      enterTimers.forEach((t) => window.clearTimeout(t));
      enterTimers.clear();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return null;
}
