"use client";

import { useEffect, useRef, useState } from "react";
import { getLumiScreen, setLumiExcite } from "@/lib/scene/mascot";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { useGenieStore } from "@/lib/genie/store";
import { track } from "@/lib/analytics";

// Lumi IS the chat entry (FR-CHAR-030): a real, focusable button that rides
// on the mascot's projected screen position every frame, so clicking (or
// keyboard-activating) the flying genie opens the chat. Hovering it excites
// Lumi (the scene reads the flag and pops a sparkle burst). The scene writes
// visible:false when it is not mounted (touch/low-end devices) or while the
// chat panel is open, and the button then renders display:none - the regular
// GenieOpenButton CTAs remain the entry everywhere else.
export function LumiHotspot({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const open = useGenieStore((s) => s.open);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const s = getLumiScreen();
      const el = ref.current;
      if (el && s.visible) {
        const d = s.r * 2;
        el.style.transform = `translate3d(${(s.x - s.r).toFixed(1)}px, ${(s.y - s.r).toFixed(1)}px, 0)`;
        el.style.width = `${d.toFixed(0)}px`;
        el.style.height = `${d.toFixed(0)}px`;
      }
      // Equality-guarded: React bails out when the value has not changed, so
      // this per-frame call re-renders only on actual visibility flips.
      setVisible((v) => (v === s.visible ? v : s.visible));
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(raf);
      setLumiExcite(false);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="cs-lumi-hotspot"
      data-visible={visible ? "true" : "false"}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => {
        track("genie_open", { source: "mascot" });
        window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT));
      }}
      onPointerEnter={() => setLumiExcite(true)}
      onPointerLeave={() => setLumiExcite(false)}
      onFocus={() => setLumiExcite(true)}
      onBlur={() => setLumiExcite(false)}
    />
  );
}
