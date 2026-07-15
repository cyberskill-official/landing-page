"use client";

import { useEffect, useRef, useState } from "react";
import {
  getLumiScreen,
  setLumiExcite,
  LUMI_HOLD_START_EVENT,
  LUMI_HOLD_END_EVENT,
} from "@/lib/scene/mascot";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { useGenieStore } from "@/lib/genie/store";
import { track } from "@/lib/analytics";

// Anything the mascot must NEVER steal a click from. If one of these sits
// under the pointer, the hotspot stays pointer-transparent and the click goes
// to the real UI straight through Lumi.
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, summary, [role='button'], .cs-genie";

// How long a press must last on Lumi before it counts as a hold (starts the
// digest) rather than a tap (opens chat).
const HOLD_MS = 320;

// Lumi IS the chat entry (TASK-CHAR-030): a real, focusable button that rides
// on the mascot's projected screen position every frame, so activating the
// flying genie opens the chat.
//
// Pass-through hit-testing: the button is pointer-events:none by DEFAULT and
// arms itself (data-active) only while the pointer is inside Lumi's radius
// AND nothing interactive lies underneath - elementFromPoint skips
// pointer-events:none elements, so the check sees exactly what the click
// would hit. Result: Lumi never blocks links, cards, buttons, or form fields
// it happens to fly over; on open space it is clickable and excited on
// approach. Keyboard users keep the button in the tab order regardless
// (pointer-events does not affect focus/Enter). The scene writes
// visible:false when unmounted (touch/low-end) or while the chat is open.
export function LumiHotspot({ label, hint }: { label: string; hint: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const hintRef = useRef<HTMLSpanElement | null>(null);
  const pointer = useRef({ x: -1, y: -1 });
  const focused = useRef(false);
  // Press-and-hold detection: a hold past HOLD_MS starts the black-hole digest
  // (via events the BlackHole listens to); a quick tap opens the chat instead.
  const holdTimer = useRef(0);
  const held = useRef(false);
  // True while the pointer is pressed on Lumi; keeps the hotspot armed even if
  // she drifts out from under a still cursor, so a hold-to-digest never drops.
  const pressing = useRef(false);
  const [visible, setVisible] = useState(false);
  // One-time discoverability hint ("click me"): shows the first time the
  // mascot appears in a session, then retires to sessionStorage.
  const [showHint, setShowHint] = useState(false);
  const hintArmed = useRef(false);
  const open = useGenieStore((s) => s.open);

  useEffect(() => {
    if (!visible || hintArmed.current) return;
    hintArmed.current = true;
    try {
      if (window.sessionStorage.getItem("cs-lumi-hint")) return;
      window.sessionStorage.setItem("cs-lumi-hint", "1");
    } catch {
      // storage unavailable: still show once for this page view
    }
    setShowHint(true);
    const t = window.setTimeout(() => setShowHint(false), 6500);
    return () => window.clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      const s = getLumiScreen();
      const el = ref.current;
      if (el && s.visible) {
        const d = s.r * 2;
        el.style.transform = `translate3d(${(s.x - s.r).toFixed(1)}px, ${(s.y - s.r).toFixed(1)}px, 0)`;
        el.style.width = `${d.toFixed(0)}px`;
        el.style.height = `${d.toFixed(0)}px`;
        const hintEl = hintRef.current;
        if (hintEl) {
          // Centred ON Lumi (operator direction), riding its position.
          hintEl.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }

        // Proximity + pass-through check. elementsFromPoint (plural) so the
        // armed hotspot can skip ITSELF in the stack - a single
        // elementFromPoint would see the armed button, count it as
        // "interactive underneath", disarm, and oscillate every frame.
        const dx = pointer.current.x - s.x;
        const dy = pointer.current.y - s.y;
        const near = dx * dx + dy * dy <= s.r * s.r;
        let active = false;
        if (near) {
          const stack = document.elementsFromPoint(pointer.current.x, pointer.current.y);
          const under = stack.find((n) => !n.closest(".cs-lumi-hotspot"));
          active = !(under && under.closest(INTERACTIVE_SELECTOR));
        }
        const armed = active || pressing.current;
        if (el.dataset.active !== String(armed)) el.dataset.active = String(armed);
        setLumiExcite(near || focused.current);
      } else if (el) {
        if (el.dataset.active !== "false") el.dataset.active = "false";
        setLumiExcite(focused.current);
      }
      // Equality-guarded: React bails out when the value has not changed, so
      // this per-frame call re-renders only on actual visibility flips.
      setVisible((v) => (v === s.visible ? v : s.visible));
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf);
      setLumiExcite(false);
    };
  }, []);

  return (
    <>
      {showHint && visible && !open && (
        <span ref={hintRef} className="cs-lumi-hint" aria-hidden="true">
          {hint} ✦
        </span>
      )}
      <button
      ref={ref}
      type="button"
      className="cs-lumi-hotspot"
      data-visible={visible ? "true" : "false"}
      data-active="false"
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={open}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        held.current = false;
        pressing.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // capture unsupported: pointerup still arrives on most setups
        }
        window.clearTimeout(holdTimer.current);
        holdTimer.current = window.setTimeout(() => {
          held.current = true;
          window.dispatchEvent(new CustomEvent(LUMI_HOLD_START_EVENT));
        }, HOLD_MS);
      }}
      onPointerUp={() => {
        pressing.current = false;
        window.clearTimeout(holdTimer.current);
        if (held.current) window.dispatchEvent(new CustomEvent(LUMI_HOLD_END_EVENT));
      }}
      onPointerCancel={() => {
        pressing.current = false;
        window.clearTimeout(holdTimer.current);
        if (held.current) {
          window.dispatchEvent(new CustomEvent(LUMI_HOLD_END_EVENT));
          held.current = false;
        }
      }}
      onClick={() => {
        // A completed hold suppresses the tap so a digest never also opens chat.
        if (held.current) {
          held.current = false;
          return;
        }
        track("genie_open", { source: "mascot" });
        window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT));
      }}
      onFocus={() => {
        focused.current = true;
        setLumiExcite(true);
      }}
      onBlur={() => {
        focused.current = false;
        setLumiExcite(false);
      }}
      />
    </>
  );
}
