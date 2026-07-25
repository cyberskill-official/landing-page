"use client";

import type { ReactNode } from "react";
import { GenieOpenButton, type GenieOpenDetail } from "@/components/genie/GenieOpenButton";
import type { GenieFlowKind } from "@/lib/genie/store";
import { Icon } from "@/components/ui/Icon";
import type { DesignSystemButtonProps } from "@/lib/design-system/button";

/**
 * Conversion CTA that always opens Lumi with a lead flow (never navigates to #contact).
 * Use on marketing CTAs site-wide so every "start a project" path is Lumi → email.
 */
export function LeadCta({
  children,
  variant = "primary",
  size,
  className,
  flow = "contact",
  seed = null,
  showSparkle = true,
}: {
  children: ReactNode;
  variant?: DesignSystemButtonProps["variant"];
  size?: DesignSystemButtonProps["size"];
  /** Lumi-local modifiers layered on the design-system button root. */
  className?: string;
  flow?: GenieFlowKind;
  seed?: string | null;
  showSparkle?: boolean;
}) {
  return (
    <GenieOpenButton
      variant={variant}
      size={size}
      icon={showSparkle ? <Icon name="sparkle" size="sm" /> : undefined}
      className={className}
      flow={flow}
      seed={seed}
    >
      {children}
    </GenieOpenButton>
  );
}

export type { GenieOpenDetail };
