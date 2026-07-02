"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clamp, magneticOffset, tiltFromPointer } from "@/lib/motion/kinetic";

// Premium pointer + scroll polish layer (FR-DS-012), mounted once in the locale
// layout. One component owns: the gold scroll-progress bar, the custom cursor
// (dot + trailing ring + spotlight glow), magnetic CTAs, 3D card tilt, and the
// masked heading reveals.
//
// Gating (hard requirements):
// - Cursor, magnet, and tilt run ONLY on fine pointers that can hover, and
//   never under prefers-reduced-motion; media-query changes attach/detach live.
// - The progress bar mirrors scroll 1:1 (position feedback, not autonomous
//   animation), so it stays for touch and reduced-motion users.
// - Every element here is aria-hidden + pointer-events:none, and all movement
//   is transform/opacity only, so nothing shifts layout (CLS-safe).

const MAGNET_SELECTOR = ".cs-btn, .cs-theme-toggle";
const TILT_SELECTOR = ".cs-service-card, .cs-work-card, .cs-proof-card";
const HOVER_SELECTOR = "a, button, [role='button'], summary, label, select";
const TEXT_SELECTOR = "input, textarea";

export function MotionExtras() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  // Thin gold scroll-progress bar (rAF-throttled, passive; scaleX only).
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max, 0, 1) : 0})`;
      // Scroll depth as a CSS length for paint-only parallax (the hero aurora
      // reads it); consumers apply it under prefers-reduced-motion:
      // no-preference only.
      document.documentElement.style.setProperty("--cs-scroll", `${Math.round(window.scrollY)}px`);
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  // Masked heading reveals + line draws: flip [data-mask-reveal] /
  // [data-line-reveal] to "shown" once in view. Same contract as Reveal.tsx -
  // the observer only ever SHOWS content, and the reduced-motion /
  // scripting:none CSS rules force-show as safety nets. Re-scans on route
  // change so client navigations get their reveals too.
  useEffect(() => {
    const ATTRS = ["data-mask-reveal", "data-line-reveal", "data-pop"] as const;
    const show = (el: Element) => {
      for (const name of ATTRS) {
        if (el.hasAttribute(name)) el.setAttribute(name, "shown");
      }
    };
    const pending = (el: Element) => ATTRS.some((name) => el.getAttribute(name) === "");
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-mask-reveal], [data-line-reveal], [data-pop]"),
    ).filter(pending);
    if (els.length === 0) return;
    if (typeof IntersectionObserver === "undefined") {
      for (const el of els) show(el);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  // Custom cursor + spotlight glow + magnetic CTAs + card tilt.
  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow || typeof window.matchMedia !== "function") return;

    const queries = [
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(hover: hover)"),
      window.matchMedia("(prefers-reduced-motion: no-preference)"),
    ];
    const enabled = () => queries.every((q) => q.matches);

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    const glowPos = { x: pos.x, y: pos.y };
    let ringScale = 1;
    let raf = 0;
    let running = false;
    let hidden = true;
    let pressed = false;
    let overText = false;
    let hoverEl: Element | null = null;
    let magnetEl: HTMLElement | null = null;
    let tiltEl: HTMLElement | null = null;

    const setVisible = (visible: boolean) => {
      const value = visible ? "1" : "0";
      dot.style.opacity = overText ? "0" : value;
      ring.style.opacity = overText ? "0" : value;
      glow.style.opacity = value;
    };

    const releaseMagnet = () => {
      if (magnetEl) magnetEl.style.transform = "";
      magnetEl = null;
    };
    const releaseTilt = () => {
      if (tiltEl) tiltEl.style.transform = "";
      tiltEl = null;
    };

    const frame = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      glowPos.x += (pos.x - glowPos.x) * 0.09;
      glowPos.y += (pos.y - glowPos.y) * 0.09;
      const targetScale = pressed ? 0.8 : hoverEl ? 1.5 : 1;
      ringScale += (targetScale - ringScale) * 0.22;
      ring.style.transform = `translate3d(${ringPos.x.toFixed(1)}px, ${ringPos.y.toFixed(1)}px, 0) scale(${ringScale.toFixed(3)})`;
      glow.style.transform = `translate3d(${glowPos.x.toFixed(1)}px, ${glowPos.y.toFixed(1)}px, 0)`;
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        const pull = magneticOffset(
          pos.x - (r.left + r.width / 2),
          pos.y - (r.top + r.height / 2),
          Math.max(r.width, r.height),
          0.28,
          8,
        );
        magnetEl.style.transform = `translate(${pull.x.toFixed(1)}px, ${pull.y.toFixed(1)}px)`;
      }
      if (tiltEl) {
        const r = tiltEl.getBoundingClientRect();
        const { rx, ry } = tiltFromPointer(pos.x, pos.y, r, 4);
        tiltEl.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
      }
      raf = window.requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (hidden) {
        hidden = false;
        ringPos.x = glowPos.x = pos.x;
        ringPos.y = glowPos.y = pos.y;
        setVisible(true);
      }
    };

    // pointerover (capturing) tracks what the pointer is over; moving onto any
    // element outside a magnet/tilt target releases it, so no pointerout
    // bookkeeping is needed. Leaving the window is handled separately.
    const onOver = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      hoverEl = target.closest(HOVER_SELECTOR);
      overText = target.closest(TEXT_SELECTOR) !== null;
      if (!hidden) setVisible(true);
      const magnet = target.closest<HTMLElement>(MAGNET_SELECTOR);
      if (magnet !== magnetEl) {
        releaseMagnet();
        magnetEl = magnet;
      }
      const tilt = target.closest<HTMLElement>(TILT_SELECTOR);
      if (tilt !== tiltEl) {
        releaseTilt();
        tiltEl = tilt;
      }
    };

    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };
    const onLeaveWindow = () => {
      hidden = true;
      hoverEl = null;
      setVisible(false);
      releaseMagnet();
      releaseTilt();
    };

    const start = () => {
      if (running) return;
      running = true;
      document.documentElement.setAttribute("data-cs-cursor", "on");
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, true);
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("pointerup", onUp, true);
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);
      window.addEventListener("blur", onLeaveWindow);
      raf = window.requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-cs-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver, true);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("blur", onLeaveWindow);
      hidden = true;
      hoverEl = null;
      overText = false;
      setVisible(false);
      releaseMagnet();
      releaseTilt();
    };

    const onQueryChange = () => (enabled() ? start() : stop());
    for (const q of queries) {
      if (typeof q.addEventListener === "function") q.addEventListener("change", onQueryChange);
    }
    onQueryChange();

    return () => {
      for (const q of queries) {
        if (typeof q.removeEventListener === "function") q.removeEventListener("change", onQueryChange);
      }
      stop();
    };
  }, []);

  return (
    <>
      <div className="cs-progress cs-no-print" aria-hidden="true">
        <div ref={barRef} className="cs-progress-bar" />
      </div>
      <div ref={glowRef} className="cs-cursor-glow" aria-hidden="true" />
      <div ref={ringRef} className="cs-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cs-cursor-dot" aria-hidden="true" />
    </>
  );
}
