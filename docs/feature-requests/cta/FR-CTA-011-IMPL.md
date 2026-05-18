---
id: FR-CTA-011
title: "A/B testbed — cookie-based variant assignment + alt-narration testing + force-variant QA + SSR-safe"
module: CTA
priority: SHOULD
status: shipped
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Frontend Lead + Marketing
created: 2026-05-16
related_frs: [FR-CMS-002, FR-SEO-008, FR-SEO-007, FR-CTA-006]
depends_on: [FR-SEO-008]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/lib/ab/
new_files:
  - apps/web/lib/ab/variant-assignment.ts
  - apps/web/lib/ab/use-variant.ts
  - apps/web/lib/ab/__tests__/variant-assignment.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §12.2 — quarterly A/B update cadence
  - FR-CMS-002 — alt-a / alt-b narration line schema
  - FR-SEO-008 — analytics exposure + conversion events

effort_hours: 6
risk_if_skipped: "Without A/B testing, every change is a guess. Marketing decisions (which Lumi narration converts better?) made on opinion. A/B framework enables data-driven iteration post-launch — compounding wins."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship a simple A/B framework via cookie-based variant assignment:
   - Cookie name: `cyberskill_ab_<test_id>`.
   - Value: `"a"` or `"b"` (or more if multi-variant).
   - First-visit: random assignment with configurable split (default 50/50).
   - Persists across sessions (long-life cookie).
2. **MUST** support testing FR-CMS-002 alt-a / alt-b narration lines:
   - Sanity narration record has `variant: "a" | "b"` field.
   - Renderer reads visitor's variant cookie; selects matching narration.
3. **MUST** report exposure + conversion via FR-SEO-008 analytics events:
   - `ab_exposure` fires on first-render with assigned variant.
   - `ab_conversion` fires on relevant conversion event (form submit, CTA click).
4. **MUST** include `?force_variant=a|b` query param for QA — overrides cookie for the session.
5. **MUST** be SSR-safe — variant resolved on server via cookie; no client-side flicker between A and B.
6. **MUST** support configurable tests:
   - `apps/web/lib/ab/tests.ts` config: test_id, variants, split, target (which component or content).
   - Disable a test by removing from config; in-flight assignments stop firing.
7. **MUST** be testable via Vitest unit tests + Playwright integration.
8. **MUST NOT** assign same visitor to different variants on different visits (cookie persistence ensures).

## §2 — Why this design

**Why cookie (not localStorage)?** Cookies are SSR-accessible. localStorage only client-side → flicker on first paint.

**Why 50/50 default?** Equal sample sizes; faster statistical significance.

**Why force-variant?** QA needs to verify both branches. Without override, QA depends on lucky cookie assignment.

**Why exposure event?** Without exposure tracking, can't compute "% of visitors who saw variant X". Conversion rate without exposure denominator = meaningless.

**Why SSR-safe?** First paint flicker (server renders A, client renders B) = bad UX + invalidates test (you're testing flicker, not content).

**Why config-driven tests?** Marketing wants to add tests without code changes. Config file = one PR per test.

**Why long-life cookie?** Visitor seeing variant A on first visit, B on second = confounds. Persistent assignment = clean test.

## §3 — Public surface

```ts
// apps/web/lib/ab/tests.ts
export interface ABTest {
  id: string;
  variants: string[];
  split: number[];  // weights, must sum to 1
  enabled: boolean;
}

export const TESTS: ABTest[] = [
  {
    id: "scene0_narration",
    variants: ["a", "b"],
    split: [0.5, 0.5],
    enabled: true,
  },
  {
    id: "cta_button_color",
    variants: ["gold", "warm-brown"],
    split: [0.5, 0.5],
    enabled: false,  // disabled post-test
  },
];
```

```ts
// apps/web/lib/ab/variant-assignment.ts
import { cookies } from "next/headers";
import { TESTS, type ABTest } from "./tests";

export async function getVariant(testId: string, searchParams?: URLSearchParams): Promise<string | null> {
  const test = TESTS.find(t => t.id === testId && t.enabled);
  if (!test) return null;

  // Force-variant via query param (QA)
  const force = searchParams?.get("force_variant");
  if (force && test.variants.includes(force)) {
    return force;
  }

  // Cookie check
  const cookieStore = await cookies();
  const cookieName = `cyberskill_ab_${testId}`;
  const existing = cookieStore.get(cookieName)?.value;
  if (existing && test.variants.includes(existing)) {
    return existing;
  }

  // New assignment
  const assigned = assignVariant(test);
  cookieStore.set(cookieName, assigned, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 90,  // 90 days
    sameSite: "lax",
  });
  return assigned;
}

function assignVariant(test: ABTest): string {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < test.variants.length; i++) {
    cum += test.split[i];
    if (r < cum) return test.variants[i];
  }
  return test.variants[test.variants.length - 1];
}
```

```tsx
// apps/web/lib/ab/use-variant.ts
"use client";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function useVariant(testId: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    const cookieName = `cyberskill_ab_${testId}`;
    const v = document.cookie.split("; ").find(c => c.startsWith(cookieName + "="))?.split("=")[1];
    if (v) {
      setVariant(v);
      // Fire exposure event once per session per test
      const sessionKey = `cyberskill_ab_exposed_${testId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        trackEvent("ab_exposure", { test_id: testId, variant: v });
        sessionStorage.setItem(sessionKey, "1");
      }
    }
  }, [testId]);

  return variant;
}
```

```tsx
// Usage in narration component
function SceneNarration({ sceneId }: { sceneId: number }) {
  const variant = useVariant("scene0_narration");
  const text = useCurrentNarration(sceneId, variant);  // narration filtered by variant
  return <p>{text}</p>;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Variant assignment persists per visitor (cookie) | Test 2 visits; assert same variant |
| 2 | 50/50 split | 100 mocked assignments; ~50 of each |
| 3 | exposure + conversion events fire | Mock trackEvent |
| 4 | force-variant param works | URL `?force_variant=b` |
| 5 | SSR-safe (no flicker) | Server + client render same variant |
| 6 | Disabled tests stop firing | Set enabled: false; assert no assignment |
| 7 | Vitest unit tests pass | pnpm vitest |
| 8 | Exposure once per session per test | sessionStorage flag |
| 9 | Cookie 90-day max-age | Cookie header inspect |
| 10 | Force-variant only for valid values | Invalid `?force_variant=zzz` ignored |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { getVariant } from "../variant-assignment";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

describe("getVariant", () => {
  it("assigns variant on first visit", async () => {
    // mock cookies.get returns undefined
    const v = await getVariant("scene0_narration");
    expect(["a", "b"]).toContain(v);
  });

  it("respects existing cookie", async () => {
    // mock cookies.get returns "a"
    const v = await getVariant("scene0_narration");
    expect(v).toBe("a");
  });

  it("force-variant param overrides", async () => {
    const params = new URLSearchParams({ force_variant: "b" });
    const v = await getVariant("scene0_narration", params);
    expect(v).toBe("b");
  });

  it("disabled tests return null", async () => {
    // disable test in TESTS
    const v = await getVariant("cta_button_color");  // disabled
    expect(v).toBeNull();
  });

  it("50/50 split is roughly equal", () => {
    const counts: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = Math.random() < 0.5 ? "a" : "b";
      counts[v]++;
    }
    expect(counts.a).toBeGreaterThan(400);
    expect(counts.a).toBeLessThan(600);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-002 (alt-a / alt-b narration), FR-SEO-008 (analytics events), FR-CTA-006 (conversion source).

**Operational:** Next.js cookies() API, sessionStorage.

**Downstream:** Marketing iteration; analytics dashboards consume exposure + conversion ratios.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Variant flicker on first load | AC#5 | SSR resolves cookie; client matches |
| Different variants across visits | Cookie persistence | 90-day max-age + sameSite lax |
| Sample contamination (user clears cookies) | Acceptable | New random assignment |
| Test ID typo | Config inspection | TypeScript const + autocompletion |
| Force-variant in production traffic | Security | Only enable for QA staging or dev |
| Multiple tests interact (test A affects test B sample) | Independence | Use independent random seed per test |
| Cookie blocked by user (privacy) | Fallback | Default to variant "a"; degraded UX |
| Disabled test still assigned cookie (stale) | AC#6 | Don't read stale cookies for disabled tests |
| Split sums > 1.0 (config error) | Lint | Sum to 1.0 validator |
| Exposure event fires repeatedly | AC#8 | sessionStorage flag |
| variant param outside enumerated values | AC#10 | Validate against test.variants |
| Cookie size limit (4KB total) | Edge case | Tests should be < 100 bytes each |

## §8 — Deliverable preview

Visitor 1:
1. First visit. Cookie `cyberskill_ab_scene0_narration` set to "a".
2. Scene 0 narration variant A renders. `ab_exposure { test_id, variant: "a" }` fires.
3. Visitor submits form. `ab_conversion { test_id, variant: "a" }` fires.

Visitor 2:
1. Cookie set to "b". Variant B narration renders. Same flow.

Analytics dashboard after 1000 visitors:
- Variant A: 480 exposures / 60 conversions = 12.5% conversion rate.
- Variant B: 520 exposures / 80 conversions = 15.4% conversion rate.
- Statistical significance: 95% confidence variant B is better. Adopt B.

QA tests both variants:
- `/?force_variant=a` → variant A renders.
- `/?force_variant=b` → variant B renders.

## §9 — Notes

**On 'why not LaunchDarkly / Optimizely?'** Out-of-the-box SDK = expensive + heavy. Simple cookie-based works for our scale. Could upgrade later.

**On statistical significance:** Manual review (don't auto-stop). At least 100 conversions per variant before deciding.

**On Vietnamese audience:** Both variants tested across locales; locale not the variant dimension itself.

**On future bandit algorithms:** Multi-armed bandit (auto-shift traffic to winning variant) — slice 3.

*End of FR-CTA-011.*
