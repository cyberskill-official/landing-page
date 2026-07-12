"use client";

import { useState, useRef } from "react";
import { track } from "@/lib/analytics";
import { useGenieStore } from "@/lib/genie/store";
import { GENIE_OPEN_EVENT } from "./GenieOpenButton";
import gsap from "gsap";

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
    
    // Sparkle effect
    if (formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    
    setPendingWish(val);
    track("hero_wish", { length: val.length });
    
    // Slight delay so the user sees the sparkles before the chat pops up
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT));
      setWish("");
    }, 400);
  };
  
  const createSparkles = (x: number, y: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "cs-sparkle";
      document.body.appendChild(sparkle);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 80 + 20;
      
      gsap.fromTo(sparkle, 
        { 
          x, 
          y, 
          opacity: 1, 
          scale: Math.random() * 1.5 + 0.5,
          backgroundColor: "#f4ba17",
          borderRadius: "50%",
          width: "4px",
          height: "4px",
          position: "fixed",
          pointerEvents: "none",
          zIndex: 10000
        },
        {
          x: x + Math.cos(angle) * velocity,
          y: y + Math.sin(angle) * velocity + 50, // Slight gravity
          opacity: 0,
          duration: Math.random() * 0.5 + 0.5,
          ease: "power2.out",
          onComplete: () => {
            sparkle.remove();
          }
        }
      );
    }
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
