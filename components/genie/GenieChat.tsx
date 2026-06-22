"use client";

// Thin wrapper: arms the chat on first open and lazy-loads the panel (so the
// chat bundle never costs first paint). The panel itself reads `open` from the
// store and renders null while closed but stays mounted to preserve history.

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { useGenieStore } from "@/lib/genie/store";

const GenieChatPanel = dynamic(
  () => import("@/components/genie/GenieChatPanel").then((m) => m.GenieChatPanel),
  { ssr: false },
);

export function GenieChat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [armed, setArmed] = useState(false);
  const setOpen = useGenieStore((s) => s.setOpen);

  useEffect(() => {
    const open = () => {
      setArmed(true);
      setOpen(true);
    };
    window.addEventListener(GENIE_OPEN_EVENT, open);
    return () => window.removeEventListener(GENIE_OPEN_EVENT, open);
  }, [setOpen]);

  if (!armed) return null;
  return <GenieChatPanel locale={locale} dict={dict} />;
}
