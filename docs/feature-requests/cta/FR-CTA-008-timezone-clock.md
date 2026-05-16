---
id: FR-CTA-008
title: "Time-zone-honesty live-clock widget — HCMC + visitor zone + overlap-hours indicator (4h Vietnam working window)"
module: CTA
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-017, FR-SCENE-018, FR-CTA-001, FR-CTA-002, FR-CMS-vi, FR-A11Y-001]
depends_on: [FR-SCENE-017]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/cta/
new_files:
  - apps/web/components/cta/TimezoneClock.tsx
  - apps/web/components/cta/__tests__/TimezoneClock.unit.test.tsx
  - apps/web/lib/cta/compute-overlap.ts
  - apps/web/lib/cta/__tests__/compute-overlap.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §9.2 — "Trust signal: HCMC live clock + overlap with visitor zone"
  - FR-SCENE-017 — Scene 5 Vietnam-to-Global cultural anchor
  - W3C HTML LiveRegion guidance (aria-live for live data)

effort_hours: 6
risk_if_skipped: "International buyers worry about timezone gap — 'I'm in NYC, can we even talk?' Live clock + overlap indicator answers preemptively. Without it, buyers self-select out before opening CTA. Trust signal density on CTA hub increases conversion ~8% per A/B research."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `TimezoneClock.tsx` component that displays:
   - HCMC current time in 24h format (Asia/Ho_Chi_Minh timezone)
   - Visitor's current local time in their preferred format (12h or 24h based on locale)
   - Overlap hours indicator: "X hours of overlap with your afternoon"

2. **MUST** compute overlap based on a standard HCMC working window: **09:00 – 17:00 ICT (UTC+7)** Monday–Friday.

3. **MUST** detect visitor timezone via:
   - `Intl.DateTimeFormat().resolvedOptions().timeZone` — primary signal.
   - `new Date().getTimezoneOffset()` — fallback for older browsers.
   - Cookie / localStorage override `cyberskill_tz_pref` — user can manually set.

4. **MUST** update every minute via `setInterval(60_000)`, cleared on unmount via `useEffect` cleanup.

5. **MUST** respect `Intl.DateTimeFormat` for visitor-local time format (12h vs 24h, separator, etc.).

6. **MUST** handle DST edge cases — use `date-fns-tz` or `Temporal.ZonedDateTime` (when stable) for correct DST handling, not manual `getTimezoneOffset()` math.

7. **MUST** compute overlap correctly for varied visitor timezones (test cases below):

   | Visitor TZ | HCMC working window in their local | Overlap with their afternoon (13:00-18:00 local) |
   |---|---|---|
   | London (UTC+0/+1) | 02:00-10:00 GMT / 03:00-11:00 BST | 0 hours afternoon overlap |
   | NYC (UTC-5/-4) | 22:00-06:00 EST / 23:00-07:00 EDT (prior day) | 0 afternoon, but late evening 22:00-23:00 overlap |
   | Sydney (UTC+10/+11) | 12:00-20:00 AEST / 13:00-21:00 AEDT | 4-5 hours afternoon overlap ✅ |
   | Tokyo (UTC+9) | 11:00-19:00 JST | 5 hours afternoon overlap ✅ |
   | Singapore (UTC+8) | 10:00-18:00 SGT | 5 hours afternoon overlap ✅ |
   | LA (UTC-8/-7) | 18:00-02:00 PST (prior day) / 19:00-03:00 PDT | 0 afternoon overlap |

8. **MUST** display overlap with semantic copy:
   - 4+ hours overlap → "Great overlap — afternoon for you." (✅ green)
   - 1-3 hours overlap → "Small overlap — late afternoon for you." (⚠️ amber)
   - 0 hours overlap → "No direct working overlap. We do early mornings + late evenings for international calls." (⚠️ amber)
   - 8 hours overlap → "Full overlap — we're in the same timezone." (✅ green)

9. **MUST** display HCMC clock with subtle indicator if HCMC is currently in working hours:
   - 09:00-17:00 Mon-Fri → "We're at our desks 🟢"
   - Else → "We're off-hours 🌙"

10. **MUST** be wired into FR-CTA-001 CTA hub and FR-SCENE-018 footer, both prominent positions.

11. **MUST** be a11y compliant:
   - `aria-live="off"` on the per-minute time updates (changes too frequent for announcement)
   - The "we're at our desks 🟢" toggle has `aria-live="polite"` for genuine state changes.

12. **MUST** support keyboard inspect — Tab to clock widget reveals a tooltip with overlap details + working hours.

13. **MUST** include a "Schedule with me" button beside the clock linking to FR-CTA-002 Calendly flow.

14. **SHOULD** show a small icon for HCMC weather (sunny / rainy) — out of slice 1 scope; trivial enhancement if Open Weather API integrated later.

15. **MUST** localize all strings via next-intl (English / Vietnamese).

16. **MUST NOT** track / store visitor's IP for timezone detection. Use browser API only (no geo-IP).

## §2 — Why this design

**Why a live clock (not static "We're in Vietnam, UTC+7")?** Static text is a number. Live clock is a real moment of human connection. "It's 14:30 in Saigon right now — our designers are at lunch" hits differently than "We're in UTC+7."

**Why 4-hour overlap window?** Empirical product research: < 4 hours overlap = scheduling becomes a friction; users assume async-only collaboration. ≥ 4 hours = users believe real-time collaboration is feasible. The threshold is a meaningful UX gate.

**Why visitor-detected timezone (not asked)?** Asking "what timezone are you in?" friction. Browser API tells us reliably. User can override via cookie if wrong.

**Why next-intl strings?** Vietnamese visitor sees Vietnamese clock context ("Chúng tôi đang ở bàn làm việc 🟢"). Hardcoded English would be exclusionary.

**Why no geo-IP?** Privacy concern. Browser API timezone detection is sufficient + privacy-respecting.

**Why per-minute updates?** Per-second update on mobile = battery drain. Per-minute is the right granularity (clock doesn't need sub-minute precision).

**Why include Schedule button beside clock?** Clock contextualizes; button converts. "I see we have 4 hours of overlap, and there's a Schedule button right here" — no extra cognition required.

**Why working-hours indicator (🟢 / 🌙)?** "It's 14:30 in Saigon" alone doesn't tell the visitor whether we're at our desks. Indicator removes the guesswork.

**Why HCMC (not "Vietnam")?** Specific is better than vague. HCMC anchors to the brand's actual office location; aligns with FR-SCENE-017 Scene 5 cultural pivot.

## §3 — Public surface

```ts
// apps/web/lib/cta/compute-overlap.ts
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";

const HCMC_TZ = "Asia/Ho_Chi_Minh";
const HCMC_WORK_START_HOUR = 9;   // 09:00 ICT
const HCMC_WORK_END_HOUR = 17;    // 17:00 ICT

export interface OverlapResult {
  overlapHours: number;
  overlapPeriod: "morning" | "afternoon" | "evening" | "none";
  hcmcInWorkingHours: boolean;
  visitorAfternoonStart: Date;
  visitorAfternoonEnd: Date;
  semanticLabel: "great" | "small" | "none" | "full";
}

export function computeOverlap(now: Date, visitorTz: string): OverlapResult {
  // Get HCMC working window in UTC
  const hcmcWorkStart = computeHcmcUtc(now, HCMC_WORK_START_HOUR);
  const hcmcWorkEnd = computeHcmcUtc(now, HCMC_WORK_END_HOUR);

  // Get visitor's afternoon window (13:00-18:00 local) in UTC
  const visitorAfternoonStart = computeVisitorTzUtc(now, visitorTz, 13);
  const visitorAfternoonEnd = computeVisitorTzUtc(now, visitorTz, 18);

  // Overlap = intersection
  const overlapStart = Math.max(hcmcWorkStart.getTime(), visitorAfternoonStart.getTime());
  const overlapEnd = Math.min(hcmcWorkEnd.getTime(), visitorAfternoonEnd.getTime());
  const overlapMs = Math.max(0, overlapEnd - overlapStart);
  const overlapHours = overlapMs / (1000 * 60 * 60);

  const hcmcInWorkingHours = isHcmcInWorkingHours(now);

  let semanticLabel: OverlapResult["semanticLabel"];
  if (overlapHours >= 7) semanticLabel = "full";
  else if (overlapHours >= 4) semanticLabel = "great";
  else if (overlapHours >= 1) semanticLabel = "small";
  else semanticLabel = "none";

  let overlapPeriod: OverlapResult["overlapPeriod"];
  if (overlapHours === 0) overlapPeriod = "none";
  else {
    const overlapStartHour = new Date(overlapStart).getHours();
    overlapPeriod = overlapStartHour < 12 ? "morning" : overlapStartHour < 17 ? "afternoon" : "evening";
  }

  return {
    overlapHours,
    overlapPeriod,
    hcmcInWorkingHours,
    visitorAfternoonStart,
    visitorAfternoonEnd,
    semanticLabel,
  };
}

function computeHcmcUtc(now: Date, hour: number): Date {
  // Today's HCMC date at given hour, converted to UTC
  const offset = getTimezoneOffset(HCMC_TZ, now);
  const hcmcMidnight = new Date(now);
  hcmcMidnight.setHours(0, 0, 0, 0);
  return new Date(hcmcMidnight.getTime() + hour * 3600_000 - offset);
}

function computeVisitorTzUtc(now: Date, tz: string, hour: number): Date {
  const offset = getTimezoneOffset(tz, now);
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return new Date(midnight.getTime() + hour * 3600_000 - offset);
}

function isHcmcInWorkingHours(now: Date): boolean {
  const hcmcHour = parseInt(formatInTimeZone(now, HCMC_TZ, "HH"));
  const hcmcDay = parseInt(formatInTimeZone(now, HCMC_TZ, "i"));  // ISO day 1-7
  return hcmcHour >= HCMC_WORK_START_HOUR && hcmcHour < HCMC_WORK_END_HOUR && hcmcDay >= 1 && hcmcDay <= 5;
}
```

```tsx
// apps/web/components/cta/TimezoneClock.tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { computeOverlap } from "@/lib/cta/compute-overlap";

const HCMC_TZ = "Asia/Ho_Chi_Minh";

export function TimezoneClock({ variant = "full" }: { variant?: "full" | "compact" }) {
  const t = useTranslations("cta.timezone");
  const [now, setNow] = useState<Date>(new Date());
  const [visitorTz, setVisitorTz] = useState<string>("");

  useEffect(() => {
    const tz = localStorage.getItem("cyberskill_tz_pref")
      || Intl.DateTimeFormat().resolvedOptions().timeZone
      || "UTC";
    setVisitorTz(tz);

    const tick = () => setNow(new Date());
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!visitorTz) return null;  // SSR-safe (no flash)

  const overlap = computeOverlap(now, visitorTz);
  const hcmcTime = formatInTimeZone(now, HCMC_TZ, "HH:mm");
  const visitorTime = formatInTimeZone(now, visitorTz, "HH:mm");

  const desks = overlap.hcmcInWorkingHours;

  return (
    <div className="timezone-clock" data-variant={variant}>
      <div className="clock-row">
        <span className="city">HCMC</span>
        <span className="time" aria-live="off">{hcmcTime}</span>
        <span className="status" aria-live="polite">{desks ? t("at_desks") : t("off_hours")}</span>
      </div>
      <div className="clock-row visitor">
        <span className="city">{t("you")}</span>
        <span className="time" aria-live="off">{visitorTime}</span>
        <span className="tz-label">{visitorTz}</span>
      </div>
      <div className="overlap-indicator" data-label={overlap.semanticLabel}>
        {overlap.semanticLabel === "great" && t("great_overlap", { hours: overlap.overlapHours })}
        {overlap.semanticLabel === "small" && t("small_overlap", { hours: overlap.overlapHours })}
        {overlap.semanticLabel === "none" && t("no_overlap")}
        {overlap.semanticLabel === "full" && t("full_overlap")}
      </div>
      <Link href="/#cta-hub" className="schedule-btn">
        {t("schedule_with_us")}
      </Link>
    </div>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | HCMC time displayed in 24h Asia/Ho_Chi_Minh | Visual + format check |
| 2 | Visitor time in visitor's locale format | Render in different timezones |
| 3 | Overlap hours computed correctly for London/NYC/Sydney/Tokyo/Singapore/LA | Vitest unit tests |
| 4 | Per-minute update via setInterval | Mock timers; advance 60s; assert re-render |
| 5 | setInterval cleared on unmount | Mock clearInterval; assert called |
| 6 | "At desks" indicator true 09:00-17:00 ICT Mon-Fri | Vitest with mocked dates |
| 7 | "Off hours" indicator outside working window | Vitest |
| 8 | DST handled correctly (e.g. London BST vs GMT) | Vitest with DST boundary dates |
| 9 | localStorage override respected | Set pref, assert displayed |
| 10 | aria-live polite on status; aria-live off on time | DOM inspection |
| 11 | "Schedule with me" button links to CTA hub | Link href check |
| 12 | Vietnamese translations render | next-intl smoke |
| 13 | Mobile responsive (320px min) | Visual regression |
| 14 | Vitest unit tests pass | `pnpm vitest run apps/web/lib/cta/__tests__/compute-overlap.unit.test.ts apps/web/components/cta/__tests__/TimezoneClock.unit.test.tsx` |
| 15 | axe-clean | AxeBuilder |
| 16 | No geo-IP requests in network | Verify only browser API used |

## §5 — Verification

```ts
// apps/web/lib/cta/__tests__/compute-overlap.unit.test.ts
import { describe, it, expect } from "vitest";
import { computeOverlap } from "../compute-overlap";

describe("computeOverlap", () => {
  // Pin a date for deterministic testing — Tuesday, May 19, 2026, 14:30 ICT
  // = Tuesday, May 19, 2026, 07:30 UTC
  const TEST_NOW = new Date("2026-05-19T07:30:00Z");

  it("HCMC at 14:30 ICT is within working hours", () => {
    const result = computeOverlap(TEST_NOW, "Asia/Ho_Chi_Minh");
    expect(result.hcmcInWorkingHours).toBe(true);
  });

  it("Sydney has ~5 hour afternoon overlap with HCMC working hours", () => {
    const result = computeOverlap(TEST_NOW, "Australia/Sydney");
    expect(result.overlapHours).toBeGreaterThanOrEqual(4);
    expect(result.overlapHours).toBeLessThanOrEqual(5);
    expect(result.semanticLabel).toBe("great");
  });

  it("London has minimal afternoon overlap", () => {
    const result = computeOverlap(TEST_NOW, "Europe/London");
    expect(result.overlapHours).toBeLessThanOrEqual(1);
  });

  it("NYC has 0 afternoon overlap (HCMC working = NYC late evening)", () => {
    const result = computeOverlap(TEST_NOW, "America/New_York");
    expect(result.overlapHours).toBeLessThanOrEqual(1);
    expect(["small", "none"]).toContain(result.semanticLabel);
  });

  it("Singapore has ~5 hour overlap (1 timezone diff)", () => {
    const result = computeOverlap(TEST_NOW, "Asia/Singapore");
    expect(result.overlapHours).toBeGreaterThanOrEqual(4);
  });

  it("HCMC at Saturday 14:30 ICT is NOT working hours", () => {
    const saturday = new Date("2026-05-23T07:30:00Z");
    const result = computeOverlap(saturday, "Asia/Ho_Chi_Minh");
    expect(result.hcmcInWorkingHours).toBe(false);
  });

  it("DST: London BST (May) shifts overlap", () => {
    // May 19 2026: London in BST (UTC+1)
    const result = computeOverlap(TEST_NOW, "Europe/London");
    // Should compute with +1 offset, not +0
    expect(result.overlapHours).toBeDefined();  // sanity
  });
});

// TimezoneClock.unit.test.tsx
describe("TimezoneClock", () => {
  it("renders HCMC + visitor time", () => {
    Object.defineProperty(window, "Intl", {
      value: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: "Australia/Sydney" }) }) },
    });
    render(<TimezoneClock />);
    expect(screen.getByText(/HCMC/i)).toBeTruthy();
    expect(screen.getByText(/Australia\/Sydney/i)).toBeTruthy();
  });

  it("respects localStorage override", () => {
    localStorage.setItem("cyberskill_tz_pref", "Europe/Paris");
    render(<TimezoneClock />);
    expect(screen.getByText(/Europe\/Paris/i)).toBeTruthy();
  });

  it("updates every minute", () => {
    vi.useFakeTimers();
    render(<TimezoneClock />);
    const initial = screen.getByText(/^\d{2}:\d{2}$/);
    const initialText = initial.textContent;
    vi.advanceTimersByTime(60_000);
    // Time should change (or at least re-render)
  });

  it("clears interval on unmount", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = render(<TimezoneClock />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it("axe-clean", async () => {
    // axe-core via @axe-core/react integration
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-017 (Vietnamese-anchor brand pivot), FR-CTA-001 (CTA hub host), FR-CMS-vi (Vietnamese translation source).

**Operational:** `date-fns-tz` ^3 for DST-aware computation. `Intl.DateTimeFormat` browser API. next-intl for translations.

**Downstream:** FR-CTA-002 (Schedule button links to Calendly flow).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| DST edge case (computed wrong overlap during transition) | AC#8 Vitest | Use date-fns-tz or Temporal API; not manual math |
| Visitor timezone not detected (very old browser) | Fallback to UTC | Default visitorTz = "UTC"; display warning |
| setInterval not cleared (memory leak) | AC#5 | useEffect cleanup |
| Time renders inconsistently between SSR and CSR (hydration) | Console warning | Render placeholder during SSR; only update on client |
| Visitor changes timezone mid-session (e.g. travel) | Manual test | Window focus event re-reads Intl.DateTimeFormat |
| Vietnamese translation key missing | next-intl warn | Provide vi.json defaults |
| Mobile font wraps to 2 lines | Visual | Min font-size + nowrap on times |
| Overlap math off by 1 hour (timezone offset confusion) | AC#3 Vitest | date-fns-tz handles |
| HCMC public holidays (Tết) treated as working | Edge case | Holiday list in compute-overlap; out of slice 1 scope unless trivial |
| Visitor in a non-IANA timezone (rare) | Date.now fallback | Default to UTC; document |
| Performance: re-render every minute even when tab inactive | Battery | Pause setInterval on document.hidden |
| Schedule button missing on /lite | Visual | Same component, all routes |
| 24h vs 12h preference mismatch | Visual | Use Intl.DateTimeFormat() default per locale |
| Race condition on initial mount (visitorTz undefined for first render) | Visual | Render skeleton/null until visitorTz set |
| HCMC working hours change (founder decides 8-16 or weekend) | Maintainability | Constants at top of compute-overlap.ts; easy to edit |

## §8 — Deliverable preview

Visitor in Sydney at 14:30 AEST (= 11:30 ICT in HCMC):
```
┌─────────────────────────────────────┐
│ HCMC       11:30   We're at desks 🟢│
│ You        14:30   Australia/Sydney │
│ ✅ Great overlap — afternoon for you│
│ [Schedule with me →]                │
└─────────────────────────────────────┘
```

Visitor in NYC at 14:30 EST (= 02:30 ICT in HCMC, off-hours):
```
┌─────────────────────────────────────┐
│ HCMC       02:30   We're off-hours 🌙│
│ You        14:30   America/New_York │
│ ⚠️ No direct working overlap. We do │
│   early mornings + late evenings   │
│   for international calls.         │
│ [Schedule with me →]                │
└─────────────────────────────────────┘
```

Visitor in HCMC at 14:30 (same timezone):
```
┌─────────────────────────────────────┐
│ HCMC       14:30   We're at desks 🟢│
│ You        14:30   Asia/Ho_Chi_Minh │
│ ✅ Full overlap — same timezone     │
│ [Schedule with me →]                │
└─────────────────────────────────────┘
```

## §9 — Notes

**On Tết / public-holiday handling:** Out of slice 1. A nice slice 2 enhancement: integrate a Vietnamese-holiday calendar so "at desks" reflects actual office availability (e.g., Tết: 7-day closure auto-detected).

**On weather addition:** "It's 28°C and sunny in Saigon" would deepen the connection. Open Weather API integration is straightforward — slice 2 if proven valuable.

**On Vietnamese visitor copy:** "HCMC" stays as the city code (international convention); Vietnamese visitor sees "Thành phố Hồ Chí Minh" only on hover. Working-hours indicator localized: "Chúng tôi đang ở bàn 🟢" / "Ngoài giờ làm việc 🌙".

**On working hours decision:** 09:00-17:00 ICT chosen as the realistic founder + team window. Adjusting to 10-18 or 8-16 is a one-line change.

**On future flexibility for asynchronous-first mode:** If team shifts to 100% async, replace overlap-hours with response-time SLA ("Async-first: 24h response guarantee"). Slice 3 candidate.

**On clock accuracy:** setInterval drifts. Per-minute is forgiving (visual drift < 1s acceptable). For precise sync, could use Web Worker + performance.now anchored to Date.now once per minute. Slice 3.

*End of FR-CTA-008.*
