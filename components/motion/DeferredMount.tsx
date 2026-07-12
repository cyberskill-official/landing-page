"use client";

import { useState, useEffect, useRef } from "react";

export function DeferredMount({ children }: { children: React.ReactNode }) {
  const [mount, setMount] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setMount(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" } // trigger when approaching
    );
    if (ref.current) {
      io.observe(ref.current);
    } else {
      // fallback if ref isn't attached (e.g. fixed position global layer without dimensions)
      // For global layers, we might just want to delay until first interaction or scroll
      setMount(true);
    }
    return () => io.disconnect();
  }, []);

  if (!mount) {
    return <div ref={ref} style={{ position: "absolute", width: "1px", height: "1px", pointerEvents: "none" }} aria-hidden="true" />;
  }

  return <>{children}</>;
}
