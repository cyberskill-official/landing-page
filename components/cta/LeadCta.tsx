"use client";

import type { ReactNode } from "react";
import { GenieOpenButton, type GenieOpenDetail } from "@/components/genie/GenieOpenButton";
import type { GenieFlowKind } from "@/lib/genie/store";
import { Icon } from "@/components/ui/Icon";

/**
 * Conversion CTA that always opens Lumi with a lead flow (never navigates to #contact).
 * Use on marketing CTAs site-wide so every "start a project" path is Lumi → email.
 */
export function LeadCta({
  children,
  className = "cs-btn cs-btn-primary",
  flow = "contact",
  seed = null,
  showSparkle = true,
}: {
  children: ReactNode;
  className?: string;
  flow?: GenieFlowKind;
  seed?: string | null;
  showSparkle?: boolean;
}) {
  return (
    <GenieOpenButton className={className} flow={flow} seed={seed}>
      {showSparkle ? (
        <>
          <Icon name="sparkle" size="sm" /> {children}
        </>
      ) : (
        children
      )}
    </GenieOpenButton>
  );
}

export type { GenieOpenDetail };
