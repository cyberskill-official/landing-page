"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Opacity/transform reveal on scroll. Motion-safe: the CSS already shows the
// element when prefers-reduced-motion is set, and the observer only adds the
// "shown" flag, never hides content (content is present in the DOM for SSR/SEO).
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delayMs = 0,
  id,
}: {
  children: ReactNode;
  as?: "div" | "section" | "li" | "article";
  className?: string;
  delayMs?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-shown", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(() => el.setAttribute("data-shown", "true"), delayMs);
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  const Component = Tag as "div";
  return (
    <Component id={id} ref={ref as never} className={["cs-reveal", className].filter(Boolean).join(" ")}>
      {children}
    </Component>
  );
}
