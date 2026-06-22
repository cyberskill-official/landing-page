"use client";

import { useEffect, useState } from "react";

const KEY = "cs-motion-pref";

// Lets users force reduced motion regardless of the OS setting, persisted in
// localStorage. Sets [data-cs-motion="reduce"] on <html>, which globals.css
// uses to neutralise transitions/animations.
export function MotionToggle({ labelOn, labelOff }: { labelOn: string; labelOff: string }) {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const osReduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const initial = stored ? stored === "reduce" : osReduce;
    setReduced(initial);
  }, []);

  useEffect(() => {
    if (reduced === null) return;
    const root = document.documentElement;
    if (reduced) root.setAttribute("data-cs-motion", "reduce");
    else root.removeAttribute("data-cs-motion");
    window.localStorage.setItem(KEY, reduced ? "reduce" : "allow");
  }, [reduced]);

  if (reduced === null) return null;

  return (
    <button
      type="button"
      className="cs-motion-toggle"
      aria-pressed={reduced}
      onClick={() => setReduced((v) => !v)}
    >
      {reduced ? labelOff : labelOn}
    </button>
  );
}
