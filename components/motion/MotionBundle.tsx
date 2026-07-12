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
    // We defer rendering until after the initial hydration is complete.
    // This moves all the heavy GSAP/Three.js code out of the critical rendering path.
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
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
