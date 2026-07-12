"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Skip animation if motion is reduced
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const node = nodeRef.current;
    if (!node) return;

    const startValue = value > 2000 ? 2000 : 0; // Better starting point for years

    const obj = { val: startValue };

    const anim = gsap.to(obj, {
      val: value,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(obj.val).toString();
        }
      },
    });

    const st = ScrollTrigger.create({
      trigger: node,
      start: "top 85%",
      onEnter: () => anim.play(),
      onEnterBack: () => anim.play(),
      onLeave: () => anim.pause(),
      onLeaveBack: () => anim.pause(),
    });

    anim.pause(); // wait for ScrollTrigger

    return () => {
      st.kill();
      anim.kill();
    };
  }, [value]);

  return <span ref={nodeRef}>{value}</span>;
}

export function AnimatedStat({ text }: { text: string }) {
  // Simple parser: split by digits and wrap numbers in AnimatedNumber
  const parts = text.split(/(\d+)/);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\d+$/.test(part)) {
          return <AnimatedNumber key={i} value={parseInt(part, 10)} />;
        }
        return part;
      })}
    </>
  );
}
