"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LumiMagic = dynamic(() => import("@/components/motion/LumiMagic").then(m => m.LumiMagic), { ssr: false });
const HeroPin = dynamic(() => import("@/components/scroll/HeroPin").then(m => m.HeroPin), { ssr: false });

export function HomeMotionBundle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <LumiMagic />
      <HeroPin />
    </>
  );
}
