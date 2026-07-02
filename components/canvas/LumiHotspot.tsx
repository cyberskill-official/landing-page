"use client";

import { useEffect, useRef, useState } from "react";
import { getLumiScreen, setLumiExcite } from "@/lib/scene/mascot";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { useGenieStore } from "@/lib/genie/store";
import { track } from "@/lib/analytics";

// Anything the mascot must NEVER steal a click from. If one of these sits
// under the pointer, the hotspot stays pointer-transparent and the click goes
// to the real UI straight through Lumi.
const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, label, summary, [role='button'], .cs-genie";

// Lumi IS the chat entry (FR-CHAR-030): a real, focusable button that rides
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
        if (el.dataset.active !== String(active)) el.dataset.active = String(active);
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
      onClick={() => {
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
