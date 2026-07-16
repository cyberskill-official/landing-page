"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LumiMagic = dynamic(() => import("@/components/motion/LumiMagic").then(m => m.LumiMagic), { ssr: false });
const HeroPin = dynamic(() => import("@/components/scroll/HeroPin").then(m => m.HeroPin), { ssr: false });

export function HomeMotionBundle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const arm = () => setMounted(true);
    if ("requestIdleCallback" in window) {
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
      <LumiMagic />
      <HeroPin />
    </>
  );
}
