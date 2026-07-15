"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Icon } from "@/components/ui/Icon";

// Kinetic keyword band (TASK-DS-012): the practice keywords glide past between
// the value props and the services grid. Purely decorative - the whole band is
// aria-hidden because the Services section right below carries the same offer
// as real, accessible content. The loop is CSS-only (translate3d on a
// max-content track, two identical halves for a seamless -50% wrap), pauses on
// hover, and freezes under prefers-reduced-motion.
//
// TASK-PERF-012: The CSS animation is paused when the section is off-screen to
// conserve CPU and battery.
export function Marquee({ dict }: { dict: Dictionary }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items = dict.marquee.items;
  return (
    <div ref={containerRef} className="cs-marquee cs-no-print" aria-hidden="true">
      <div
        className="cs-marquee-track"
        style={{ animationPlayState: visible ? "running" : "paused" }}
      >
        {[0, 1].map((half) => (
          <div className="cs-marquee-half" key={half}>
            {items.map((item, i) => (
              <span className="cs-marquee-item" key={i}>
                {item}
                <Icon name="sparkle" size="sm" className="cs-marquee-star" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

