"use client";

import { useRef, useState } from "react";
import { openGenie } from "@/components/genie/GenieOpenButton";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";

// The signature moment (TASK-CHAR-026): type a wish, a puff of gold dust bursts
// from the button, and Lumi's chat opens with the wish already in hand.
export function HeroWish({ placeholder, cta }: { placeholder: string; cta: string }) {
  const [value, setValue] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);

  function burst() {
    const btn = btnRef.current;
    if (!btn) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = btn.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "cs-wish-dust";
    layer.style.left = `${r.left + r.width / 2}px`;
    layer.style.top = `${r.top + r.height / 2}px`;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("i");
      const a = (Math.PI * 2 * i) / 18 + Math.random() * 0.5;
      const d = 34 + Math.random() * 66;
      p.style.setProperty("--dx", `${Math.cos(a) * d}px`);
      p.style.setProperty("--dy", `${Math.sin(a) * d - 16}px`);
      p.style.setProperty("--s", `${0.5 + Math.random() * 0.9}`);
      p.style.animationDelay = `${Math.random() * 90}ms`;
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    window.setTimeout(() => layer.remove(), 1200);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wish = value.trim();
    burst();
    track("hero_wish", wish ? { hasText: true } : { hasText: false });
    openGenie(wish ? { flow: "default", seed: wish } : { flow: "default" });
    setValue("");
  }

  return (
    <form className="cs-wish" onSubmit={onSubmit} role="search">
      <span className="cs-wish-spark" aria-hidden="true">
        <Icon name="sparkle" size="sm" />
      </span>
      <input
        className="cs-wish-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={200}
      />
      <button ref={btnRef} className="cs-btn cs-btn-primary cs-wish-go" type="submit">
        {cta}
      </button>
    </form>
  );
}
