"use client";

import { useState, useRef } from "react";
import { track } from "@/lib/analytics";
import { useGenieStore } from "@/lib/genie/store";
import { GENIE_OPEN_EVENT } from "./GenieOpenButton";

// CSS-only sparkles (no gsap) — keeps gsap out of any first-load path that
// might import WishForm.

export function WishForm({
  placeholder,
  ctaText,
}: {
  placeholder: string;
  ctaText: string;
}) {
  const [wish, setWish] = useState("");
  const setPendingWish = useGenieStore((s) => s.setPendingWish);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = wish.trim();
    if (!val) return;

    if (formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    setPendingWish(val);
    track("hero_wish", { length: val.length });

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT));
      setWish("");
    }, 400);
  };

  const createSparkles = (x: number, y: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.className = "cs-wish-dust";
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("i");
      const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
      const d = 28 + Math.random() * 56;
      p.style.setProperty("--dx", `${Math.cos(a) * d}px`);
      p.style.setProperty("--dy", `${Math.sin(a) * d - 12}px`);
      p.style.setProperty("--s", `${0.5 + Math.random() * 0.9}`);
      p.style.animationDelay = `${Math.random() * 80}ms`;
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    window.setTimeout(() => layer.remove(), 1100);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="cs-wish-form" style={{ display: "flex", gap: "8px", maxWidth: "480px", margin: "24px 0", position: "relative" }}>
      <input
        type="text"
        value={wish}
        onChange={(e) => setWish(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          flex: 1,
          padding: "16px 20px",
          borderRadius: "24px",
          border: "1px solid rgba(244,186,23,0.3)",
          background: "rgba(255,255,255,0.05)",
          color: "#fff",
          fontSize: "16px",
          outline: "none",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(244,186,23,0.8)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(244,186,23,0.3)")}
      />
      <button
        type="submit"
        className="cs-btn cs-btn-primary cs-lumi-alt"
        style={{ borderRadius: "24px", padding: "0 24px" }}
      >
        {ctaText}
      </button>
    </form>
  );
}
