"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GENIE_OPEN_EVENT, type GenieOpenDetail } from "@/components/genie/GenieOpenButton";
import { useGenieStore, type GenieFlowKind } from "@/lib/genie/store";

const GenieChatPanel = dynamic(
  () => import("@/components/genie/GenieChatPanel").then((m) => m.GenieChatPanel),
  { ssr: false },
);

export function GenieChat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [armed, setArmed] = useState(false);
  const setOpen = useGenieStore((s) => s.setOpen);
  const openFlow = useGenieStore((s) => s.openFlow);

  useEffect(() => {
    const open = (ev: Event) => {
      const detail = (ev as CustomEvent<GenieOpenDetail>).detail || {};
      setArmed(true);
      const kind = (detail.flow || "default") as GenieFlowKind;
      if (detail.seed != null || detail.flow) {
        openFlow(kind, detail.seed ?? null);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener(GENIE_OPEN_EVENT, open);
    return () => window.removeEventListener(GENIE_OPEN_EVENT, open);
  }, [setOpen, openFlow]);

  // Also arm when store opens from GenieOpenButton.openFlow without event
  const storeOpen = useGenieStore((s) => s.open);
  useEffect(() => {
    if (storeOpen) setArmed(true);
  }, [storeOpen]);

  if (!armed) return null;
  return <GenieChatPanel locale={locale} dict={dict} />;
}
