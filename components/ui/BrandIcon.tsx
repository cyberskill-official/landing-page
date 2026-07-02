import type { ReactNode } from "react";

// Bespoke gold line-art icon set (FR-WEB-ART). One consistent hand for every
// card section so the middle of the page reads as an art-directed system, not a
// stack of text grids. 24x24, stroke = currentColor (the card tints it gold),
// round joins, no fill. Purely decorative -> aria-hidden.

export type BrandIconName =
  | "web-apps"
  | "mobile-apps"
  | "internal-systems"
  | "discover"
  | "shape"
  | "build"
  | "support"
  | "since"
  | "practices"
  | "outcome"
  | "answer"
  | "honesty"
  | "durability";

const glyphs: Record<BrandIconName, ReactNode> = {
  // Services
  "web-apps": (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.2" />
      <path d="M3 9h18" />
      <circle cx="6" cy="6.75" r="0.5" />
      <circle cx="8" cy="6.75" r="0.5" />
      <path d="M7 12.5h6M7 15.5h9" />
    </>
  ),
  "mobile-apps": (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
      <path d="M10.5 5h3" />
      <path d="M11 18.5h2" />
      <path d="M14.5 8.5l1.2 1.2 2.3-2.3" />
    </>
  ),
  "internal-systems": (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1.6" />
      <rect x="3" y="12.5" width="18" height="5" rx="1.6" />
      <circle cx="6.5" cy="6.5" r="0.6" />
      <circle cx="6.5" cy="15" r="0.6" />
      <path d="M12 9v3.5" />
    </>
  ),
  // Process
  discover: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
      <path d="M10.5 7.5v6M7.5 10.5h6" opacity="0.55" />
    </>
  ),
  shape: (
    <>
      <path d="M4 20l1-3.5 9.5-9.5 2.5 2.5L7.5 19 4 20z" />
      <path d="M13 8l3 3" />
      <path d="M16.5 4.5l2 2" />
    </>
  ),
  build: (
    <>
      <path d="M8.5 8l-4 4 4 4" />
      <path d="M15.5 8l4 4-4 4" />
      <path d="M13 6.5l-2 11" />
    </>
  ),
  support: (
    <>
      <path d="M12 3l7 2.6v5.1c0 4.2-2.9 7-7 8.3-4.1-1.3-7-4.1-7-8.3V5.6L12 3z" />
      <path d="M7.5 12h2.2l1.3-2.4 1.8 4.6 1.3-2.2h2.4" />
    </>
  ),
  // Value props
  since: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="M8.5 13.5L7 21l5-2.4L17 21l-1.5-7.5" />
      <path d="M12 6.4l1 2 2.2.2-1.7 1.5.5 2.2-2-1.2-2 1.2.5-2.2-1.7-1.5 2.2-.2 1-2z" />
    </>
  ),
  practices: (
    <>
      <circle cx="12" cy="7" r="3" />
      <circle cx="6.8" cy="15.5" r="3" />
      <circle cx="17.2" cy="15.5" r="3" />
    </>
  ),
  outcome: (
    <>
      <circle cx="11" cy="13" r="7" />
      <circle cx="11" cy="13" r="3" />
      <path d="M11 13l8-8M15.5 5h3.5v3.5" />
    </>
  ),
  // Commitments
  answer: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0.8-3.8 3.5-5.8 7-5.8s6.2 2 7 5.8" />
      <path d="M15.5 10.5l1.3 1.3 2.4-2.6" />
    </>
  ),
  honesty: (
    <>
      <path d="M12 4v15M7 19h10" />
      <path d="M5 8.5h14" />
      <circle cx="12" cy="6" r="1" />
      <path d="M5 8.5l-2 4a3 3 0 006 0l-2-4M19 8.5l-2 4a3 3 0 006 0l-2-4" />
    </>
  ),
  durability: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v12.5" />
      <path d="M7.5 12.5H5c0 4 3 6.2 7 7.2 4-1 7-3.2 7-7.2h-2.5" />
      <path d="M8.5 16.5l3.5 3 3.5-3" />
    </>
  ),
};

export function BrandIcon({ name, className }: { name: BrandIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`cs-icon${className ? ` ${className}` : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyphs[name]}
    </svg>
  );
}
