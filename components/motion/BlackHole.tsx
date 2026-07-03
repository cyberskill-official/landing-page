"use client";

import { useEffect } from "react";
import {
  getLumiScreen,
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
const DEVOUR_SECONDS = 2.6;
const RESTORE_SECONDS = 1.1;
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
      }
      blocks = [];
      document.documentElement.removeAttribute("data-digesting");
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      p += dt / (holding ? DEVOUR_SECONDS : -RESTORE_SECONDS);
      p = Math.min(1, Math.max(0, p));
      setDigest(p);

      if (p <= 0) {
        running = false;
        clearStyles();
        return;
      }

      const lumi = getLumiScreen();
      // Collapse into Lumi's hand, not her centre: a small down-and-out offset
      // from the projected core, so the page pours into the little black hole
      // she holds rather than her middle.
      const hx = lumi.x + lumi.r * 0.3;
      const hy = lumi.y + lumi.r * 0.42;
      for (const b of blocks) {
        const e = digestEase(p, b.normDist);
        if (e <= 0.001) {
          b.el.style.transform = "";
          b.el.style.opacity = "";
          continue;
        }
        // Spiral in: rotate the straight approach vector by an angle that grows
        // with e, so each block curves into the hole like matter into an
        // accretion disk instead of sliding in on a line. Direction follows the
        // block's own spin sign so the field swirls both ways.
        const dx = (hx - b.cx) * e;
        const dy = (hy - b.cy) * e;
        const ang = e * 1.2 * (b.spin >= 0 ? 1 : -1);
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const sx = dx * ca - dy * sa;
        const sy = dx * sa + dy * ca;
        // Fade out well before the block reaches the hole so the field dissolves
        // into it cleanly instead of a pile-up of shrunken boxes at the centre.
        b.el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) scale(${(1 - e * 0.96).toFixed(3)}) rotate(${(b.spin * e * 0.8).toFixed(1)}deg)`;
        b.el.style.opacity = `${Math.max(0, 1 - e * 1.08).toFixed(3)}`;
      }
      raf = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      if (blocks.length === 0) {
        blocks = collectBlocks();
        for (const b of blocks) b.el.style.willChange = "transform, opacity";
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
