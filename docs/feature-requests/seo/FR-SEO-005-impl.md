---
id: FR-SEO-005
title: "Title + meta description budgets — ≤ 60 chars title, ≤ 158 chars description, EN + VI localized"
module: SEO
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: SEO + Content
created: 2026-05-16
related_frs: [FR-CMS-007, FR-CMS-006, FR-SEO-004, FR-CMS-009]
depends_on: [FR-CMS-007]
blocks: []
language: typescript 5.6 + next 15 metadata
service: apps/web/app/ + apps/web/messages/
new_files:
  - apps/web/lib/seo/meta-budgets.ts
  - apps/web/lib/seo/__tests__/meta-budgets.unit.test.ts
  - eslint-rules/no-long-title.ts

source_pages:
  - docs/01-master-plan-v2.md §8.3 — "Title + meta description budgets"
  - Google SERP truncation guidelines
  - Bing + DuckDuckGo title rules

effort_hours: 2
risk_if_skipped: "Google SERP truncates titles > 60 chars + descriptions > 158 chars with '...' mid-word. Truncated previews look unprofessional. Click-through rate drops ~10%. Easy win to enforce."
---

## §1 — Description (BCP-14 normative)

1. **MUST** set per-route `<title>` ≤ **60 characters** (Google SERP truncation point ~580 px ≈ 60 char average).
2. **MUST** set `<meta name="description">` ≤ **158 characters** (Google SERP truncation ~920 px ≈ 158 char average).
3. **MUST** localize both for /vi/ routes — Vietnamese characters may be wider; budget remains 60/158 char counts (not pixels).
4. **MUST** use Next 15 `generateMetadata()` API:
   ```ts
   export async function generateMetadata({ params }): Promise<Metadata> {
     const { locale } = await params;
     const t = await getTranslations({ locale, namespace: "seo" });
     return { title: t("page_title"), description: t("page_description") };
   }
   ```
5. **MUST** ship a CI lint check or runtime warning if any route exceeds budgets.
6. **MUST** break at word boundaries — never mid-word truncation.
7. **MUST** include brand name in title where natural ("Page — CyberSkill").
8. **MUST** be unique per route — duplicate titles harm SEO.
9. **MUST** validate via Vitest + Playwright on every route.

## §2 — Why this design

**Why 60 char title?** Google SERP renders titles at ~580 pixels. Title with mostly normal chars truncates at ~60. Some chars (W, M) wider; safety margin built in.

**Why 158 char description?** Mobile SERP cuts at ~120; desktop ~158. Front-loading important content + staying under 158 = best of both.

**Why Vietnamese same char count?** Vietnamese diacritic chars may render slightly wider, but character count is the closer proxy than pixel width. Empirical: 60 Vietnamese chars renders OK.

**Why brand in title?** Aids recall + builds brand. Excessive ("CyberSkill — Page — Subtitle | CyberSkill") = wasted chars.

**Why unique per route?** Duplicate titles confuse Google + indicate thin content. Each route signals its own value.

**Why CI lint?** Title length is small; easy to miss in PR review. Lint enforces.

## §3 — Public surface

```ts
// apps/web/lib/seo/meta-budgets.ts
export const TITLE_BUDGET = 60;
export const DESCRIPTION_BUDGET = 158;

export function validateMetadata(title: string, description: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (title.length > TITLE_BUDGET) errors.push(`Title ${title.length} chars > ${TITLE_BUDGET}`);
  if (description.length > DESCRIPTION_BUDGET) errors.push(`Description ${description.length} chars > ${DESCRIPTION_BUDGET}`);
  return { ok: errors.length === 0, errors };
}

export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const sub = text.slice(0, max);
  const lastSpace = sub.lastIndexOf(" ");
  return lastSpace > max * 0.7 ? sub.slice(0, lastSpace) + "…" : sub + "…";
}
```

```tsx
// apps/web/app/page.tsx
import { getTranslations } from "next-intl/server";
import { validateMetadata } from "@/lib/seo/meta-budgets";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.home");
  const title = t("title");
  const description = t("description");

  if (process.env.NODE_ENV === "development") {
    const result = validateMetadata(title, description);
    if (!result.ok) console.warn("[SEO budget]", result.errors);
  }

  return { title, description };
}
```

```json
// apps/web/messages/en.json (excerpt)
{
  "seo": {
    "home": {
      "title": "CyberSkill — Turn Your Will Into Real",   // 36 chars
      "description": "Vietnamese software studio for cinematic web, AI, and global delivery. Founded 2020 in HCMC. Let's build."  // 116 chars
    },
    "work": {
      "title": "Our work — case studies | CyberSkill",   // 38 chars
      "description": "Selected case studies from CyberSkill — museum exhibits, AI products, design systems, web apps."  // 99 chars
    }
  }
}
```

```json
// apps/web/messages/vi.json
{
  "seo": {
    "home": {
      "title": "CyberSkill — Biến Ý Chí Thành Hiện Thực",   // 40 chars
      "description": "Studio phần mềm Việt Nam cho web điện ảnh, AI, và phân phối toàn cầu. Thành lập 2020 tại HCMC. Cùng xây dựng nhé."  // 117 chars
    }
  }
}
```

```ts
// eslint-rules/no-long-title.ts (sketch)
import type { Rule } from "eslint";

export const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Title in generateMetadata must be ≤ 60 chars" },
    messages: { tooLong: "title exceeds 60 chars ({{len}})" },
    schema: [],
  },
  create(ctx) {
    return {
      Property(node: any) {
        if (node.key.name === "title" && node.value.type === "Literal" && typeof node.value.value === "string") {
          if (node.value.value.length > 60) {
            ctx.report({ node, messageId: "tooLong", data: { len: node.value.value.length } });
          }
        }
      },
    };
  },
};
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Title ≤ 60 chars on every route | Playwright DOM check |
| 2 | Description ≤ 158 chars on every route | DOM check |
| 3 | Vietnamese variants meet same budgets | /vi/* DOM |
| 4 | Use Next 15 metadata API (no next/head) | Code grep |
| 5 | Each route has unique title | DOM sweep + uniqueness check |
| 6 | CI lint flags long titles | Synthetic PR with > 60 char title fails |
| 7 | Vitest unit tests pass | pnpm vitest |
| 8 | Word-boundary truncation works | truncateAtWord test |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { validateMetadata, truncateAtWord } from "../meta-budgets";

describe("meta budgets", () => {
  it("validates passing title + description", () => {
    const r = validateMetadata("CyberSkill — Turn Your Will Into Real", "Vietnamese studio.");
    expect(r.ok).toBe(true);
  });

  it("flags long title", () => {
    const r = validateMetadata("x".repeat(61), "ok");
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/Title/);
  });

  it("flags long description", () => {
    const r = validateMetadata("ok", "x".repeat(159));
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/Description/);
  });

  it("truncateAtWord cuts at last space within budget", () => {
    expect(truncateAtWord("Hello world foo bar baz", 12)).toBe("Hello world…");
  });

  it("truncateAtWord cuts hard if no space available", () => {
    expect(truncateAtWord("Verylongwordherexxxxxxxxxxxxxxx", 10)).toBe("Verylongwo…");
  });
});

// Playwright per-route title check
test.describe("SEO meta budgets", () => {
  const ROUTES = ["/", "/work", "/work/sample", "/capabilities", "/team", "/careers", "/accessibility", "/lite", "/vi/"];
  for (const route of ROUTES) {
    test(`${route} title ≤ 60`, async ({ page }) => {
      await page.goto(route);
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(60);
    });
    test(`${route} description ≤ 158`, async ({ page }) => {
      await page.goto(route);
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect((desc ?? "").length).toBeLessThanOrEqual(158);
    });
  }
});
```

## §6 — Dependencies

**Concept:** FR-CMS-007 (locale source), FR-CMS-006 (case-study titles + descriptions), FR-CMS-009 (Vietnamese review).

**Operational:** Next 15 `generateMetadata()`, next-intl, ESLint custom rule.

**Downstream:** FR-OPS-011 Lighthouse SEO score; FR-SEO-006 sitemap consumer.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Title truncated mid-word in SERP | AC#8 | Max 60 + word boundary if needed |
| Duplicate titles | AC#5 | DOM sweep across all routes; CI uniqueness check |
| Vietnamese diacritic widens too much | Visual SERP check | Stay under 60 chars even if pixel-width spills |
| Wrong API used (next/head) | AC#4 grep | Build fails on next 15 (next/head deprecated) |
| User-generated case study title > 60 chars | CMS validation | Sanity title field max length validator (FR-CMS-004) |
| Brand name dropped (no "CyberSkill") | UX | Convention: include where natural |
| Locale missing key | next-intl fallback | EN fallback; CI warns |
| Hardcoded title overrides locale | grep | Use t() always |
| Description front-load broken | Manual review | Important content first 120 chars |
| SERP rendering changes (Google updates) | Periodic re-check | Adjust budgets if Google reduces SERP width |

## §8 — Deliverable preview

Google SERP for "Vietnam software studio":
```
CyberSkill — Turn Your Will Into Real
https://cyberskill.world › ...
Vietnamese software studio for cinematic web, AI, and global delivery. Founded 2020 in HCMC. Let's build.
```

All under SERP truncation; full preview visible.

## §9 — Notes

**On 'why 60 char budget vs Google's effective 65-70 pixel-based limit?'** Hedging. Some letters wider; 60 chars is the conservative floor.

**On Vietnamese:** Vietnamese diacritic Unicode chars count as 1 character but may render slightly wider in some fonts. 60 char count is acceptable proxy.

**On future title templates:** Could derive from H1 + brand template. Slice 2.

*End of FR-SEO-005.*
