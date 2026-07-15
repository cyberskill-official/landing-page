"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { useGenieStore, type GenieFlowKind } from "@/lib/genie/store";

export const GENIE_OPEN_EVENT = "cs:genie:open";

export type GenieOpenDetail = {
  flow?: GenieFlowKind;
  seed?: string | null;
};

/** Open Lumi modal, optionally with a seeded lead flow. */
export function openGenie(detail: GenieOpenDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT, { detail }));
}

export function GenieOpenButton({
  children,
  className = "cs-btn cs-btn-secondary",
  flow = "default",
  seed = null,
}: {
  children: ReactNode;
  className?: string;
  /** Lead funnel kind for this CTA */
  flow?: GenieFlowKind;
  seed?: string | null;
}) {
  const open = useGenieStore((s) => s.open);
  const openFlow = useGenieStore((s) => s.openFlow);

  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => {
        track("genie_open", { flow });
        openFlow(flow, seed);
        openGenie({ flow, seed });
      }}
    >
      {children}
    </button>
  );
}
