"use client";

import type { ReactNode } from "react";

export const GENIE_OPEN_EVENT = "cs:genie:open";

// Dispatches a window event the GenieChat widget listens for. Lets any server
// component (header, hero, persistent CTA) trigger the chat without prop drilling.
export function GenieOpenButton({
  children,
  className = "cs-btn cs-btn-secondary",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(GENIE_OPEN_EVENT))}
    >
      {children}
    </button>
  );
}
