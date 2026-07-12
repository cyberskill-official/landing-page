"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProcessCircuit() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run if not prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    
    if (!lineRef.current) return;

    const st = ScrollTrigger.create({
      trigger: lineRef.current.parentElement,
      start: "top center",
      end: "bottom center",
      animation: gsap.to(lineRef.current, {
        height: "100%",
        ease: "none",
      }),
      scrub: true,
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: "24px",
        width: "2px",
        height: "0%",
        backgroundColor: "#f4ba17", // Gold
        zIndex: 0,
        boxShadow: "0 0 10px #f4ba17",
      }}
      ref={lineRef}
    />
  );
}
