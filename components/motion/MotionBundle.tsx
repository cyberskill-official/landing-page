"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ScrollStoryProvider = dynamic(() => import("@/components/scroll/ScrollStoryProvider").then(m => m.ScrollStoryProvider), { ssr: false });
const MotionExtras = dynamic(() => import("@/components/motion/MotionExtras").then(m => m.MotionExtras), { ssr: false });
const SoundCues = dynamic(() => import("@/components/sound/SoundCues").then(m => m.SoundCues), { ssr: false });
const BlackHole = dynamic(() => import("@/components/motion/BlackHole").then(m => m.BlackHole), { ssr: false });
const DepthField = dynamic(() => import("@/components/motion/DepthField").then(m => m.DepthField), { ssr: false });
const IntroVeil = dynamic(() => import("@/components/motion/IntroVeil").then(m => m.IntroVeil), { ssr: false });

import type { Locale } from "@/lib/i18n/config";

export function MotionBundle({ locale }: { locale: Locale }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer heavy GSAP/scroll/3D-adjacent work until the browser is idle (or a
    // long timeout). A 10ms setTimeout still pulled gsap/lenis into the mobile
    // lab LCP window and inflated simulated LCP via main-thread work.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const arm = () => setMounted(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(arm, 2000);
    }
    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ScrollStoryProvider />
      <MotionExtras />
      <SoundCues />
      <BlackHole />
      <DepthField />
      <IntroVeil locale={locale} />
    </>
  );
}
