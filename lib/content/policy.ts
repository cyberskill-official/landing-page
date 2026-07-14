import type { LocalizedString } from "@/lib/i18n/types";

/**
 * FR-BIZ-013: Single source of truth for commercial policy the site may publish.
 *
 * Downstream FRs (CTA-015/017/018, CMS-014/019/020) MUST import from this module.
 * Never hard-code commercial promises, ranges, capacity, registration, partnership
 * copy, or hero audience wording in components.
 */

export interface CommercialPolicy {
  decidedOn: string;
  reviewCadence: string;
  ctaPromise: LocalizedString;
  engagementModels: {
    name: LocalizedString;
    range: LocalizedString;
    timeline: LocalizedString;
  }[];
  capacity: {
    projectsPerQuarter: number;
    nextOpenSlot: LocalizedString;
  };
  registrationNumber: string;
  partnershipOffer: LocalizedString;
  heroAudience: LocalizedString;
}

/** Owner-approved commercial policy — recorded 2026-07-14. */
export const commercialPolicy: CommercialPolicy = {
  decidedOn: "2026-07-14",
  reviewCadence: "quarterly",
  ctaPromise: {
    en: "Get a production-ready application structure or clear strategy in 7 days",
    vi: "Nhận cấu trúc ứng dụng sẵn sàng vận hành hoặc chiến lược rõ ràng trong 7 ngày",
  },
  engagementModels: [
    {
      name: {
        en: "Dedicated Senior Team",
        vi: "Đội ngũ kỹ sư cấp cao chuyên biệt",
      },
      range: {
        en: "From $15,000 / month",
        vi: "Từ 15.000 USD / tháng",
      },
      timeline: {
        en: "Minimum 3 months commitment",
        vi: "Cam kết tối thiểu 3 tháng",
      },
    },
    {
      name: {
        en: "Fixed-Scope Delivery",
        vi: "Bàn giao theo phạm vi cố định",
      },
      range: {
        en: "From $25,000 per project",
        vi: "Từ 25.000 USD mỗi dự án",
      },
      timeline: {
        en: "Typically 6 to 12 weeks",
        vi: "Thường từ 6 đến 12 tuần",
      },
    },
  ],
  capacity: {
    projectsPerQuarter: 3,
    nextOpenSlot: {
      en: "Q4 2026",
      vi: "Quý 4/2026",
    },
  },
  registrationNumber: "0316489568",
  partnershipOffer: {
    en: "Outsource development work to HCMC senior engineers with direct communication and timezone alignment",
    vi: "Ủy thác phát triển phần mềm cho kỹ sư cấp cao tại TP.HCM với kết nối trực tiếp và phù hợp múi giờ",
  },
  heroAudience: {
    en: "fast-growing startups and scaling enterprises",
    vi: "các startup tăng trưởng nhanh và doanh nghiệp đang mở rộng",
  },
};

/** Supported review cadence strings and their duration in calendar months. */
const CADENCE_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  "semi-annual": 6,
  annual: 12,
};

/**
 * Parse a YYYY-MM-DD (or ISO) date at UTC midnight for stable comparisons.
 */
function parseIsoDate(iso: string): Date {
  const day = iso.slice(0, 10);
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Normalize any Date | string to the UTC calendar day (00:00:00.000Z).
 * Ensures `new Date('YYYY-MM-DDT12:00:00Z')` and `"YYYY-MM-DD"` compare equal
 * for review-cadence checks — due day stays inclusive for both paths.
 */
function toUtcCalendarDay(asOf: Date | string): Date {
  if (typeof asOf === "string") return parseIsoDate(asOf);
  return new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()),
  );
}

/**
 * Add whole calendar months in UTC (preserves day-of-month where possible;
 * clamps to end of month when needed).
 */
function addMonthsUtc(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const target = new Date(Date.UTC(y, m + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target;
}

/**
 * Review-due instant: decidedOn + reviewCadence duration (UTC).
 * Unknown cadence falls back to quarterly (3 months).
 */
export function policyReviewDueAt(
  policy: Pick<CommercialPolicy, "decidedOn" | "reviewCadence">,
): Date {
  const months = CADENCE_MONTHS[policy.reviewCadence] ?? 3;
  return addMonthsUtc(parseIsoDate(policy.decidedOn), months);
}

/**
 * True when `asOf`'s UTC calendar day is strictly after the review-due day —
 * the decision is past its cadence and dependents MUST refuse to render
 * commercial copy. The review-due day itself is still fresh (inclusive).
 */
export function isPolicyStale(
  policy: Pick<CommercialPolicy, "decidedOn" | "reviewCadence">,
  asOf: Date | string = new Date(),
): boolean {
  const asOfDay = toUtcCalendarDay(asOf);
  return asOfDay.getTime() > policyReviewDueAt(policy).getTime();
}

/**
 * True when the policy is still within its review window and may be published.
 * Inverse of {@link isPolicyStale}.
 */
export function isPolicyPublishable(
  policy: Pick<CommercialPolicy, "decidedOn" | "reviewCadence">,
  asOf: Date | string = new Date(),
): boolean {
  return !isPolicyStale(policy, asOf);
}

/**
 * AC 1.4: decisions the company cannot keep are recorded as changed or
 * withdrawn — never softened into vaguer public copy. Entries are append-only.
 */
export type DecisionHistoryStatus = "active" | "changed" | "withdrawn";

export interface DecisionHistoryEntry {
  /** Field path on CommercialPolicy, e.g. "ctaPromise" or "capacity.projectsPerQuarter". */
  field: string;
  status: DecisionHistoryStatus;
  /** ISO date (YYYY-MM-DD) of the history event. */
  at: string;
  /** Prior published value when status is changed or withdrawn. */
  previousValue?: unknown;
  /** Human note explaining why (never used as public copy). */
  note?: string;
}

/**
 * Append-only decision history for FR-BIZ-013 AC 1.4.
 * Initial owner approval seeds every field as active; later withdraw/change
 * events MUST be appended here rather than rewriting the published string
 * into a softer substitute.
 */
export const commercialPolicyHistory: DecisionHistoryEntry[] = [
  {
    field: "ctaPromise",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved outcome-led CTA promise",
  },
  {
    field: "engagementModels",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved Dedicated Senior Team + Fixed-Scope Delivery models",
  },
  {
    field: "capacity",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved capacity: 3 projects/quarter, next open Q4 2026",
  },
  {
    field: "registrationNumber",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved business registration number for verify-us",
  },
  {
    field: "partnershipOffer",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved partnership offer for agencies/studios abroad",
  },
  {
    field: "heroAudience",
    status: "active",
    at: "2026-07-14",
    note: "Owner-approved hero audience naming",
  },
];

/**
 * Latest history status for a field. Defaults to active if never recorded
 * (should not happen for published fields).
 */
export function decisionFieldStatus(
  field: string,
  history: DecisionHistoryEntry[] = commercialPolicyHistory,
): DecisionHistoryStatus {
  const matching = history.filter((e) => e.field === field);
  if (matching.length === 0) return "active";
  return matching[matching.length - 1]!.status;
}

/**
 * Whether a named decision field may still be published (active only).
 * Withdrawn/changed fields MUST not render as softened public copy.
 */
export function isDecisionPublishable(
  field: string,
  history: DecisionHistoryEntry[] = commercialPolicyHistory,
): boolean {
  return decisionFieldStatus(field, history) === "active";
}

/**
 * Publishable capacity numbers for FR-CTA-018.
 * Returns null when the policy is stale or capacity decision is withdrawn —
 * dependents MUST render nothing in that case.
 */
export function getPublishableCapacity(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): CommercialPolicy["capacity"] | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("capacity")) return null;
  return policy.capacity;
}

/**
 * Publishable CTA promise for FR-CTA-015. Null when stale or withdrawn.
 */
export function getPublishableCtaPromise(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): LocalizedString | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("ctaPromise")) return null;
  return policy.ctaPromise;
}

/**
 * Publishable engagement models for FR-CTA-017.
 */
export function getPublishableEngagementModels(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): CommercialPolicy["engagementModels"] | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("engagementModels")) return null;
  return policy.engagementModels;
}

/**
 * Publishable registration number for FR-CMS-014. Empty/unset → omit.
 */
export function getPublishableRegistrationNumber(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): string | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("registrationNumber")) return null;
  const n = policy.registrationNumber?.trim();
  return n ? n : null;
}

/**
 * Publishable partnership offer for FR-CMS-019.
 */
export function getPublishablePartnershipOffer(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): LocalizedString | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("partnershipOffer")) return null;
  return policy.partnershipOffer;
}

/**
 * Publishable hero audience for FR-CMS-020.
 */
export function getPublishableHeroAudience(
  policy: CommercialPolicy = commercialPolicy,
  asOf: Date | string = new Date(),
): LocalizedString | null {
  if (!isPolicyPublishable(policy, asOf)) return null;
  if (!isDecisionPublishable("heroAudience")) return null;
  return policy.heroAudience;
}
