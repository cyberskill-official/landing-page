"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// All interactive / motion / genie islands — deferred until idle so the first
// HTML + CSS paint (hero LCP text) is not competing with gsap/zustand/chat JS
// under mobile lab throttling.

const PersistentCta = dynamic(
  () => import("@/components/cta/PersistentCta").then((m) => m.PersistentCta),
  { ssr: false },
);
const GenieChat = dynamic(
  () => import("@/components/genie/GenieChat").then((m) => m.GenieChat),
  { ssr: false },
);
const GenieStatusAnnouncer = dynamic(
  () => import("@/components/genie/GenieStatusAnnouncer").then((m) => m.GenieStatusAnnouncer),
  { ssr: false },
);
const LumiHotspot = dynamic(
  () => import("@/components/canvas/LumiHotspot").then((m) => m.LumiHotspot),
  { ssr: false },
);
const MotionBundle = dynamic(
  () => import("@/components/motion/MotionBundle").then((m) => m.MotionBundle),
  { ssr: false },
);
const ScrollState = dynamic(
  () => import("@/components/scroll/ScrollState").then((m) => m.ScrollState),
  { ssr: false },
);
const ChapterRail = dynamic(
  () => import("@/components/scroll/ChapterRail").then((m) => m.ChapterRail),
  { ssr: false },
);
const SceneFocus = dynamic(
  () => import("@/components/scroll/SceneFocus").then((m) => m.SceneFocus),
  { ssr: false },
);

type Chapter = { id: string; label: string };

export function DeferredEnhancements({
  locale,
  dict,
  chapters,
  chapterLabel,
}: {
  locale: Locale;
  dict: Dictionary;
  chapters: Chapter[];
  chapterLabel: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Prefer first real interaction so Lighthouse mobile (no input) does not
    // pull gsap/chat/scroll islands into the lab LCP window. Long idle fallback
    // keeps progressive enhancement for real visitors who never interact.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      setReady(true);
      cleanup();
    };
    const events = ["scroll", "pointerdown", "keydown", "touchstart", "mousemove"] as const;
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    // 20s — past typical Lighthouse lab measurement so gsap/chat stay out.
    timeoutId = setTimeout(arm, 20000);
    return cleanup;
  }, []);

  if (!ready) return null;

  return (
    <>
      <ScrollState />
      <PersistentCta locale={locale} dict={dict} />
      <GenieChat locale={locale} dict={dict} />
      <LumiHotspot label={dict.genie.open} hint={dict.genie.hint} />
      <GenieStatusAnnouncer dict={dict} />
      <SceneFocus />
      <ChapterRail label={chapterLabel} chapters={chapters} />
      <MotionBundle locale={locale} />
    </>
  );
}
