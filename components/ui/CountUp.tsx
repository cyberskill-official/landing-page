"use client";

import { useEffect, useRef, useState } from "react";

// Counts from 0 up to `end` once it scrolls into view. SSR-renders the final
// value (so crawlers and no-JS readers see the real number), then animates from
// 0 on first intersection. Honours reduced motion by skipping the animation.
export function CountUp({
  end,
  durationMs = 1200,
  suffix = "",
  className,
}: {
  end: number;
  durationMs?: number;
  suffix?: string;
  className?: string;
}) {
  const [value, setValue] = useState(end);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // keep the final value, no animation

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        setValue(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [end, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
