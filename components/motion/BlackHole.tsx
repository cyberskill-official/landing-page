"use client";

import { useEffect } from "react";
import {
  getLumiScreen,
  getLumiHandScreen,
  setDigest,
  LUMI_HOLD_START_EVENT,
  LUMI_HOLD_END_EVENT,
} from "@/lib/scene/mascot";
import { digestEase } from "@/lib/motion/kinetic";

// The black-hole digest (FR-CHAR-032): press and HOLD the mouse on empty
// space and Lumi collapses into a gold-rimmed black hole that progressively
// devours every content block of the page - each block spirals into the
// genie's screen position, nearest first. Release, and digestion reverses:
// everything flows back to its place. Hold again and it resumes from where
// it stopped.
//
// Laws: transform/opacity only (layout never moves - scroll and document
// height are untouched); fine-pointer + hover + motion-allowed + mascot-live
// only; a 350ms arming delay so ordinary clicks and text selection are
// unaffected; holds that start on interactive elements or inside the chat
// never arm; while digestion is active the content is pointer-inert and
// unselectable until fully restored. Purely decorative: no information is
// carried by the effect, and keyboard users simply never enter it.

const HOLD_ARM_MS = 350;
// Slow, cinematic devour - a long draw into the hole rather than a quick flick.
const DEVOUR_SECONDS = 5.5;
const RESTORE_SECONDS = 3.2;
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, summary, [role='button'], .cs-genie, .cs-lumi-hotspot";
const SCATTER_SELECTOR =
  ".cs-services-grid, .cs-work-grid, .cs-value-grid, .cs-proof-grid, .cs-trust-grid, .cs-story-arc, .cs-faq-list, .cs-contact-grid";

type Block = {
  el: HTMLElement;
  cx: number;
  cy: number;
  normDist: number;
  spin: number;
};

function collectBlocks(): Block[] {
  const els: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>("main .cs-container").forEach((container) => {
    Array.from(container.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child.matches(SCATTER_SELECTOR)) {
        Array.from(child.children).forEach((grand) => {
          if (grand instanceof HTMLElement) els.push(grand);
        });
      } else {
        els.push(child);
      }
    });
  });
  document.querySelectorAll<HTMLElement>("main > .cs-marquee, .cs-footer .cs-footer-inner > *").forEach((el) => {
    els.push(el);
  });

  const lumi = getLumiScreen();
  const blocks: Block[] = [];
  let maxDist = 1;
  for (const el of els.slice(0, 160)) {
    const rect = el.getBoundingClientRect();
    // Skip blocks with no on-screen box (collapsed details content etc).
    if (rect.width === 0 && rect.height === 0) continue;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(cx - lumi.x, cy - lumi.y);
    maxDist = Math.max(maxDist, dist);
    blocks.push({ el, cx, cy, normDist: dist, spin: (Math.random() * 2 - 1) * 140 });
  }
  for (const b of blocks) b.normDist /= maxDist;
  return blocks;
}

export function BlackHole() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

    let holding = false;
    let armTimer = 0;
    let raf = 0;
    let running = false;
    let p = 0;
    let last = 0;
    let blocks: Block[] = [];

    const clearStyles = () => {
      for (const b of blocks) {
        b.el.style.transform = "";
        b.el.style.opacity = "";
        b.el.style.willChange = "";
        b.el.style.zIndex = "";
        b.el.style.position = "";
      }
      blocks = [];
      document.documentElement.removeAttribute("data-digesting");
      document.documentElement.style.setProperty("--cs-digest", "0");
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      p += dt / (holding ? DEVOUR_SECONDS : -RESTORE_SECONDS);
      p = Math.min(1, Math.max(0, p));
      setDigest(p);
      // Publish progress to the CSS layer so the whole page fades out to reveal
      // the starry universe behind as p -> 1, and flows back as it reverses.
      document.documentElement.style.setProperty("--cs-digest", p.toFixed(3));

      if (p <= 0) {
        running = false;
        clearStyles();
        return;
      }

      // Aim at Lumi's real hand (bone-projected by GltfLumi) so the page pours
      // into the black hole she actually holds; fall back to a core offset for
      // the procedural Lumi that has no hand bone.
      const hs = getLumiHandScreen();
      const lumi = getLumiScreen();
      const hx = hs.set ? hs.x : lumi.x + lumi.r * 0.3;
      const hy = hs.set ? hs.y : lumi.y + lumi.r * 0.42;
      for (const b of blocks) {
        const e = digestEase(p, b.normDist);
        if (e <= 0.001) {
          b.el.style.transform = "";
          b.el.style.opacity = "";
          b.el.style.zIndex = "";
          continue;
        }
        // Vector from the block's centre to the hole.
        const toX = hx - b.cx;
        const toY = hy - b.cy;
        // Swirl that vector by an angle that grows as the block falls, so it
        // curves into the singularity like an accretion spiral instead of
        // sliding straight in - one coherent vortex. Reversing e on release
        // unwinds the whole thing cleanly back into place.
        const swirl = e * 2.1;
        const cs = Math.cos(swirl);
        const sn = Math.sin(swirl);
        const rx = toX * cs - toY * sn;
        const ry = toX * sn + toY * cs;
        // Accelerating pull that reaches the hole EXACTLY at e=1, so every block
        // ends AT the point - it is bodily drawn in, never stalls mid-air.
        const pull = e * e * (3 - 2 * e);
        const dx = rx * pull;
        const dy = ry * pull;
        const th = (Math.atan2(ry, rx) * 180) / Math.PI;
        // Shrink toward a point is the DOMINANT motion (s: 1 -> 0.08) so the
        // block funnels down into the hole; a tidal stretch ALONG the travel
        // rides on top (spaghettification). Because shrink dominates, even a
        // wide heading collapses to a thin sliver at the singularity instead of
        // smearing across the screen - which was the old failure.
        const s = 1 - 0.92 * e;
        const along = s * (1 + 2.0 * e);
        const across = Math.max(0.012, s * (1 - 0.55 * e));
        // Lift the falling block above its neighbours so it visibly travels
        // OVER the page toward the hole rather than under it.
        b.el.style.zIndex = String(40 + Math.round(e * 40));
        b.el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${th.toFixed(1)}deg) scale(${along.toFixed(3)}, ${across.toFixed(3)}) rotate(${(-th).toFixed(1)}deg)`;
        // Hold opacity while it travels; fade only in the final stretch, when it
        // is already a tiny sliver being swallowed by the point.
        const fade = e < 0.72 ? 1 : Math.max(0, 1 - (e - 0.72) / 0.28);
        b.el.style.opacity = fade.toFixed(3);
      }
      raf = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      if (blocks.length === 0) {
        blocks = collectBlocks();
        for (const b of blocks) {
          b.el.style.willChange = "transform, opacity";
          // Positioned so the per-frame z-index lift takes effect; relative
          // keeps the block exactly in flow (no layout shift).
          if (getComputedStyle(b.el).position === "static") b.el.style.position = "relative";
        }
      }
      document.documentElement.setAttribute("data-digesting", "true");
      last = performance.now();
      raf = window.requestAnimationFrame(frame);
    };

    // Shared hold lifecycle, reused by the empty-space press path and by the
    // press-and-hold ON Lumi (the hotspot dispatches LUMI_HOLD_START/END).
    const beginHold = (force = false) => {
      if (!fine.matches || !hover.matches) return;
      // Reduce-motion suppresses the ACCIDENTAL empty-space press, but an
      // explicit press-and-hold ON Lumi is a deliberate action, so it runs even
      // when the OS asks to reduce motion (that was why it looked "broken").
      if (!force && !motion.matches) return;
      holding = true;
      try {
        window.getSelection()?.removeAllRanges();
      } catch {
        // selection API unavailable: nothing to clear
      }
      start();
    };
    const endHold = () => {
      if (!holding) return;
      holding = false;
      // The frame loop keeps running and unwinds p back to 0.
      if (!running && p > 0) start();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.pointerType && e.pointerType !== "mouse")) return;
      if (!fine.matches || !hover.matches || !motion.matches) return;
      if (!document.documentElement.hasAttribute("data-lumi-live")) return;
      const target = e.target;
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) return;
      // Arm after a beat, so clicks and drag-selections stay untouched.
      window.clearTimeout(armTimer);
      armTimer = window.setTimeout(() => beginHold(false), HOLD_ARM_MS);
    };

    const release = () => {
      window.clearTimeout(armTimer);
      endHold();
    };

    // Hold ON Lumi: the hotspot already timed the hold, so begin immediately;
    // force=true so a deliberate press works even under reduce-motion.
    const onLumiHoldStart = () => beginHold(true);
    const onLumiHoldEnd = () => endHold();

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", release, true);
    window.addEventListener("blur", release);
    window.addEventListener(LUMI_HOLD_START_EVENT, onLumiHoldStart);
    window.addEventListener(LUMI_HOLD_END_EVENT, onLumiHoldEnd);

    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
      window.removeEventListener("blur", release);
      window.removeEventListener(LUMI_HOLD_START_EVENT, onLumiHoldStart);
      window.removeEventListener(LUMI_HOLD_END_EVENT, onLumiHoldEnd);
      window.clearTimeout(armTimer);
      window.cancelAnimationFrame(raf);
      setDigest(0);
      clearStyles();
    };
  }, []);

  return null;
}
