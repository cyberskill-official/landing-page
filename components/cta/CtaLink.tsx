"use client";

import type { ReactNode } from "react";
import { emit } from "@/lib/analytics/taxonomy";

/**
 * FR-CTA-015 §1.3: anchor that emits cta_clicked with location + label.
 */
export function CtaLink({
  href,
  location,
  label,
  className,
  children,
}: {
  href: string;
  location: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => emit("cta_clicked", { location, label })}
    >
      {children}
    </a>
  );
}
