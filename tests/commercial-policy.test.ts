import { describe, it, expect } from "vitest";
import {
  commercialPolicy,
  commercialPolicyHistory,
  isPolicyStale,
  isPolicyPublishable,
  policyReviewDueAt,
  isDecisionPublishable,
  decisionFieldStatus,
  getPublishableCapacity,
  type CommercialPolicy,
  type DecisionHistoryEntry,
} from "@/lib/content/policy";

const PLACEHOLDER_PATTERNS = [
  /\bTBD\b/i,
  /\bTODO\b/i,
  /\bplaceholder\b/i,
  /\bFOR REVIEW\b/i,
  /\$X\b/i,
  /\[.*\]/,
  /\?{2,}/,
  /\bXXX\b/i,
  /\bN\/A\b/i,
  /\blorem ipsum\b/i,
  /\bcoming soon\b/i,
];

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStrings(v, out);
    }
  }
  return out;
}

describe("content/commercial-policy-record", () => {
  it("holds every owner-approved decision with decidedOn and reviewCadence", () => {
    // Drive the shipped export — not a reimplemented copy of the values.
    const policy: CommercialPolicy = commercialPolicy;

    expect(policy.decidedOn).toBe("2026-07-14");
    expect(policy.reviewCadence).toBe("quarterly");

    expect(policy.ctaPromise.en).toBe(
      "Get a production-ready application structure or clear strategy in 7 days",
    );
    expect(policy.ctaPromise.vi).toBe(
      "Nhận cấu trúc ứng dụng sẵn sàng vận hành, hoặc chiến lược rõ ràng, trong 7 ngày",
    );

    expect(policy.engagementModels).toHaveLength(2);

    expect(policy.engagementModels[0]!.name.en).toBe("Dedicated Senior Team");
    expect(policy.engagementModels[0]!.name.vi).toBe(
      "Đội ngũ kỹ sư cấp cao chuyên biệt",
    );
    expect(policy.engagementModels[0]!.range.en).toBe("From $15,000 / month");
    expect(policy.engagementModels[0]!.range.vi).toBe("Từ 15.000 USD / tháng");
    expect(policy.engagementModels[0]!.timeline.en).toBe(
      "Minimum 3 months commitment",
    );
    expect(policy.engagementModels[0]!.timeline.vi).toBe(
      "Cam kết tối thiểu 3 tháng",
    );

    expect(policy.engagementModels[1]!.name.en).toBe("Fixed-Scope Delivery");
    expect(policy.engagementModels[1]!.name.vi).toBe(
      "Bàn giao theo phạm vi cố định",
    );
    expect(policy.engagementModels[1]!.range.en).toBe(
      "From $25,000 per project",
    );
    expect(policy.engagementModels[1]!.range.vi).toBe(
      "Từ 25.000 USD mỗi dự án",
    );
    expect(policy.engagementModels[1]!.timeline.en).toBe(
      "Typically 6 to 12 weeks",
    );
    expect(policy.engagementModels[1]!.timeline.vi).toBe(
      "Thường từ 6 đến 12 tuần",
    );

    expect(policy.capacity.projectsPerQuarter).toBe(3);
    expect(policy.capacity.nextOpenSlot.en).toBe("Q4 2026");
    expect(policy.capacity.nextOpenSlot.vi).toBe("Quý 4/2026");

    expect(policy.registrationNumber).toBe("0316489568");

    expect(policy.partnershipOffer.en).toBe(
      "Outsource development work to HCMC senior engineers with direct communication and timezone alignment",
    );
    expect(policy.partnershipOffer.vi).toBe(
      "Giao việc phát triển cho kỹ sư giàu kinh nghiệm tại TP.HCM, trao đổi trực tiếp và dễ khớp múi giờ",
    );

    expect(policy.heroAudience.en).toBe(
      "fast-growing startups and scaling enterprises",
    );
    expect(policy.heroAudience.vi).toBe(
      "startup tăng trưởng nhanh và doanh nghiệp đang mở rộng quy mô",
    );
  });

  it("exports a complete shape: every LocalizedString has non-empty en and vi", () => {
    const policy = commercialPolicy;
    const localized = [
      policy.ctaPromise,
      ...policy.engagementModels.flatMap((m) => [
        m.name,
        m.range,
        m.timeline,
      ]),
      policy.capacity.nextOpenSlot,
      policy.partnershipOffer,
      policy.heroAudience,
    ];
    for (const ls of localized) {
      expect(ls.en.trim().length).toBeGreaterThan(0);
      expect(ls.vi.trim().length).toBeGreaterThan(0);
    }
  });

  it("records AC 1.4 decision history for every published field as active", () => {
    const requiredFields = [
      "ctaPromise",
      "engagementModels",
      "capacity",
      "registrationNumber",
      "partnershipOffer",
      "heroAudience",
    ];
    for (const field of requiredFields) {
      expect(decisionFieldStatus(field)).toBe("active");
      expect(isDecisionPublishable(field)).toBe(true);
    }
    expect(commercialPolicyHistory.length).toBeGreaterThanOrEqual(
      requiredFields.length,
    );
  });
});

describe("content/no-placeholders", () => {
  it("contains no placeholder, estimate, TBD, or empty commercial strings", () => {
    const strings = collectStrings(commercialPolicy);
    expect(strings.length).toBeGreaterThan(0);

    for (const s of strings) {
      expect(s.trim().length, `empty string in policy: ${JSON.stringify(s)}`).toBeGreaterThan(0);
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(
          pattern.test(s),
          `placeholder-like value "${s}" matched ${pattern}`,
        ).toBe(false);
      }
    }

    // Scalar commitments must be real, not zero/empty stand-ins
    expect(commercialPolicy.capacity.projectsPerQuarter).toBeGreaterThan(0);
    expect(commercialPolicy.registrationNumber.trim().length).toBeGreaterThan(0);
    expect(commercialPolicy.decidedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(commercialPolicy.reviewCadence.trim().length).toBeGreaterThan(0);
  });
});

describe("content/capacity-line", () => {
  it("fresh policy within review cadence is publishable; past cadence is blocked", () => {
    // Real shipped helpers + real shipped record.
    const policy = commercialPolicy;
    expect(policy.reviewCadence).toBe("quarterly");
    expect(policy.decidedOn).toBe("2026-07-14");

    const due = policyReviewDueAt(policy);
    // Quarterly from 2026-07-14 → 2026-10-14
    expect(due.toISOString().slice(0, 10)).toBe("2026-10-14");

    // Within cadence (same day as decided): usable
    expect(isPolicyStale(policy, "2026-07-14")).toBe(false);
    expect(isPolicyPublishable(policy, "2026-07-14")).toBe(true);

    // Last day still within window (due date inclusive as not-yet-stale)
    expect(isPolicyStale(policy, "2026-10-14")).toBe(false);
    expect(isPolicyPublishable(policy, "2026-10-14")).toBe(true);

    // Date path: noon UTC on the due day must stay fresh (calendar-day inclusive)
    const dueNoon = new Date("2026-10-14T12:00:00Z");
    expect(isPolicyStale(policy, dueNoon)).toBe(false);
    expect(isPolicyPublishable(policy, dueNoon)).toBe(true);
    expect(getPublishableCapacity(policy, dueNoon)).not.toBeNull();
    expect(getPublishableCapacity(policy, dueNoon)?.projectsPerQuarter).toBe(
      policy.capacity.projectsPerQuarter,
    );

    // Day after review due: blocked — dependents must not render commercial copy
    expect(isPolicyStale(policy, "2026-10-15")).toBe(true);
    expect(isPolicyPublishable(policy, "2026-10-15")).toBe(false);

    // Far future as-of also blocked
    expect(isPolicyStale(policy, "2027-01-01")).toBe(true);
    expect(isPolicyPublishable(policy, "2027-01-01")).toBe(false);
  });

  it("synthetic stale decidedOn is blocked without building any display section", () => {
    const staleSlice = {
      decidedOn: "2025-01-01",
      reviewCadence: "quarterly",
    };
    expect(isPolicyPublishable(staleSlice, "2026-07-14")).toBe(false);
    expect(isPolicyStale(staleSlice, "2026-07-14")).toBe(true);
  });

  it("withdrawn or changed decisions are not publishable (AC 1.4 history)", () => {
    const history: DecisionHistoryEntry[] = [
      ...commercialPolicyHistory,
      {
        field: "ctaPromise",
        status: "withdrawn",
        at: "2026-08-01",
        previousValue: commercialPolicy.ctaPromise,
        note: "Company cannot keep the 7-day commitment; withhold, do not soften",
      },
    ];
    expect(isDecisionPublishable("ctaPromise", history)).toBe(false);
    expect(decisionFieldStatus("ctaPromise", history)).toBe("withdrawn");
    // Other fields remain active
    expect(isDecisionPublishable("registrationNumber", history)).toBe(true);
  });
});
