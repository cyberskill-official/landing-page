import type { Locale } from "@/lib/i18n/config";
import {
  commercialPolicy,
  getPublishableCapacity,
} from "@/lib/content/policy";
import { localize } from "@/lib/i18n/types";

/**
 * FR-CTA-018: True capacity line near the contact heading.
 * Hidden entirely when capacity is unset or the commercial policy is stale.
 */
export function CapacityLine({
  locale,
  asOf,
}: {
  locale: Locale;
  asOf?: Date | string;
}) {
  const capacity = getPublishableCapacity(commercialPolicy, asOf ?? new Date());
  if (!capacity) return null;

  const n = capacity.projectsPerQuarter;
  const slot = localize(capacity.nextOpenSlot, locale);
  const decided = commercialPolicy.decidedOn;

  const text =
    locale === "vi"
      ? `Chúng tôi nhận tối đa ${n} dự án mới mỗi quý. Suất mở tiếp theo: ${slot}. (Rà soát: ${decided})`
      : `We start at most ${n} new projects per quarter. Next open slot: ${slot}. (Reviewed: ${decided})`;

  return (
    <p
      className="cs-capacity-line"
      data-capacity-line=""
      data-decided-on={decided}
      data-projects-per-quarter={n}
    >
      {text}
    </p>
  );
}
