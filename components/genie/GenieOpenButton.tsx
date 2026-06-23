"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { useGenieStore } from "@/lib/genie/store";

export const GENIE_OPEN_EVENT = "cs:genie:open";

// Dispatches a window event the GenieChat widget listens for. Lets any server
// component (header, hero, persistent CTA) trigger the chat without prop drilling.
// aria-haspopup + aria-expanded announce the launcher-to-dialog relationship and
// the open state to assistive tech (FR-A11Y-004).
export function GenieOpenButton({
  children,
  className = "cs-btn cs-btn-secondary",
}: {
  children: ReactNode;
  className?: string;
}) {
  const open = useGenieStore((s) => s.open);
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => {
        track("genie_open");
        window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT));
      }}
    >
      {children}
    </button>
  );
}
