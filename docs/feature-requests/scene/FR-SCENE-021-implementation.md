---
id: FR-SCENE-021
title: "Mobile compressed scene flow — Scenes 1+2 merge + Scenes 3+4 merge → 5-scene flow at < 768px"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: R3F Architect + Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-013, FR-SCENE-014, FR-SCENE-015, FR-SCENE-016, FR-SCENE-017, FR-SCENE-020, FR-CMS-002, FR-PERF-010]
depends_on: [FR-SCENE-020]
blocks: [FR-PERF-010]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.5 — "Mobile compressed scene flow: merge 1+2 and 3+4; preserve Scene 5 + 6 + footer"
  - docs/01-master-plan-v2.md §6.3 — mobile DPR + perf budgets
  - docs/01-master-plan-v2.md §3.3b — "Scene 5 cultural beat NEVER merges"

language: typescript + react 19
service: apps/web/components/orchestrator/
new_files:
  - apps/web/components/orchestrator/MobileSceneFlow.ts
  - apps/web/components/orchestrator/mobile-scene-ranges.ts
  - apps/web/components/orchestrator/__tests__/mobile-flow.unit.test.ts

effort_hours: 10
risk_if_skipped: "Mobile users (50%+ of traffic in Vietnam market) see 7 scrolling sections of 100vh each = 7000px scroll height. Scrolling fatigue. Engagement drops at Scene 3 because users haven't reached Scene 5 cultural anchor yet. Compressed mobile flow brings cultural beat closer to start of scroll. Without this, mobile conversion suffers."
---

## §1 — Description (BCP-14 normative)

1. **MUST** detect mobile breakpoint via `window.matchMedia('(max-width: 767px)').matches`. Triggered at viewport resize + on initial mount.

2. **MUST** merge **Scenes 1 + 2** into one combined section on mobile:
   - Scroll range: 100vh → 200vh (was 100vh → 300vh combined).
   - Both Scene 1 narration ("Saigon, 2020...") and Scene 2 narration ("Most software dies... We close it.") render in sequence within this single section.
   - Lumi animations: `coil_idle` for first half, then crossfade to `paint` for second half.

3. **MUST** merge **Scenes 3 + 4** similarly:
   - Scroll range: 200vh → 300vh.
   - Scene 3 capability satellites display, then dissolve into Scene 4 team avatars.
   - Caption transitions: Scene 3 beats → Scene 4 caption.

4. **MUST NOT** merge **Scene 5** (Vietnam→Global cultural anchor). Master plan §3.3b: Scene 5 keeps its own dedicated scroll range (300vh → 400vh on mobile). The cultural beat needs space to breathe.

5. **MUST NOT** merge Scene 6 CTA Hub or footer. Each retains dedicated section (400vh → 500vh and 500vh+ respectively).

6. **MUST** result in 5 scrolling sections on mobile:
   - Scene 0 Hero (0 → 100vh)
   - Scenes 1+2 merged (100vh → 200vh)
   - Scenes 3+4 merged (200vh → 300vh)
   - Scene 5 Vietnam→Global (300vh → 400vh)
   - Scene 6 CTA Hub (400vh → 500vh)
   - Footer (500vh → bottom)

7. **MUST** preserve narration line IDs from FR-CMS-002. The `content/narrative/lines/en.json` keys don't change — only the render schedule does. Scene 1 narration MUST still display in the merged Scenes 1+2 section.

8. **MUST** extend per-merged-scene dwell time:
   - Standard scene: full caption types over ~ 1.4s.
   - Merged Scenes 1+2: first caption + transition + second caption over ~ 3.0s.
   - This requires the orchestrator to extend ScrollTrigger duration accordingly.

9. **MUST** ship `mobile-scene-ranges.ts` as the data source for the orchestrator:
   - Exports `MOBILE_SCENE_RANGES: SceneRange[]` (5 entries vs desktop's 8).
   - Orchestrator (FR-SCENE-020) reads breakpoint and swaps between desktop and mobile range arrays.

10. **MUST** respect FR-PERF-010 mobile perf budgets: combined scenes don't double-up GPU draw calls (only one scene's content renders at a time within the merged range; the other crossfades in/out).

11. **MUST** ship Vitest unit tests for mobile-scene-ranges logic (range counts, Scene 5 isolation).

12. **MUST** ship Playwright integration tests at 390px viewport: 5 scrolling sections detected, Scene 5 has dedicated range, narration line IDs preserved.

## §2 — Why this design

**Why merge 1+2 and 3+4 but not Scene 5?** Master plan §5.5: cultural beat needs space. Scene 5 (the "you're from Vietnam, here's why that's a strength" moment) is the cinematic's emotional payoff for international buyers. Cramming it into a merged range diminishes the beat. The other scenes have narrative continuity that survives merging (1→2 is "founding story → transformation"; 3→4 is "capability → team behind capability") — they share thematic ground.

**Why 5 sections on mobile (not 4 or 6)?** Scrolling research: 7 sections at 100vh each is 7000px scroll = ~ 30 thumb-flicks on a typical phone. Engagement drops after ~ 4-5 flicks for cinematic content. 5 sections at 100vh = 5000px = ~ 20-25 flicks, within engagement tolerance. Merging more (down to 3) compresses Scene 5 cultural beat, which we must preserve.

**Why preserve narration line IDs?** FR-CMS-002 is the source-of-truth for narration content. Mobile compression is a render-schedule change, not a content change. Translation work (FR-CMS-003 VI variants) shouldn't have to mirror new line IDs.

**Why extend dwell time?** Scrolling speed on mobile is faster (thumb-flick) than mouse-wheel. Without extending dwell, captions in merged scenes flash by before reading. 3.0s gives reading time for both captions + the cross-transition.

## §3 — Deliverable structure

```
apps/web/components/orchestrator/
├── ScrollOrchestrator.client.tsx       # EXISTING (FR-SCENE-020) — modified to read both range arrays
├── scene-timeline.ts                   # EXISTING — desktop ranges
├── mobile-scene-ranges.ts              # NEW — mobile range definitions
├── MobileSceneFlow.ts                  # NEW — breakpoint detection + range-swap logic
└── __tests__/
    └── mobile-flow.unit.test.ts
```

### §3.2 — `mobile-scene-ranges.ts` shape

```ts
import type { SceneRange } from "./scene-timeline";

export const MOBILE_SCENE_RANGES: SceneRange[] = [
  { id: "scene-0-hero",                index: 0, startVh: 0,   endVh: 100, reduced: false },
  { id: "scene-1-2-merged",            index: 1, startVh: 100, endVh: 200, reduced: false },
  { id: "scene-3-4-merged",            index: 2, startVh: 200, endVh: 300, reduced: false },
  { id: "scene-5-vietnam-global",      index: 3, startVh: 300, endVh: 400, reduced: false },  // dedicated
  { id: "scene-6-cta-hub",             index: 4, startVh: 400, endVh: 500, reduced: false },
  { id: "footer",                      index: 5, startVh: 500, endVh: 600, reduced: false },
];

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}
```

### §3.3 — `MobileSceneFlow.ts` shape

```ts
import { SCENE_RANGES } from "./scene-timeline";
import { MOBILE_SCENE_RANGES, isMobileViewport } from "./mobile-scene-ranges";
import type { SceneRange } from "./scene-timeline";

export function getActiveSceneRanges(): SceneRange[] {
  return isMobileViewport() ? MOBILE_SCENE_RANGES : SCENE_RANGES;
}

/**
 * Map a desktop scene id to its mobile-merged equivalent (or itself).
 * Used by scene impls to know whether their content is being rendered in a merged context.
 */
export function getMobileMappedSceneId(desktopId: string): string {
  if (!isMobileViewport()) return desktopId;
  if (desktopId === "scene-1-origin" || desktopId === "scene-2-transformation") return "scene-1-2-merged";
  if (desktopId === "scene-3-capabilities" || desktopId === "scene-4-team") return "scene-3-4-merged";
  return desktopId;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Mobile (< 768px) renders 5 scrolling sections, desktop 7 | Playwright with mobile viewport vs desktop |
| 2 | Scene 5 keeps its own range on mobile | MOBILE_SCENE_RANGES contains scene-5-vietnam-global |
| 3 | Scene 6 + footer keep their ranges on mobile | MOBILE_SCENE_RANGES check |
| 4 | Narration line IDs unchanged | content/narrative/lines/en.json has same keys |
| 5 | Merged scenes have ~ 3.0s extended dwell | Playwright timing test |
| 6 | Mobile orchestrator picks mobile ranges; desktop picks desktop | isMobileViewport() flow |
| 7 | Resize from mobile → desktop swaps ranges | Playwright viewport resize event |
| 8 | Vitest unit tests pass | CI |
| 9 | Reduced-motion + mobile: scenes render as static panels (no merging gymnastics) | Playwright reducedMotion + mobile |
| 10 | Cultural anchor (Scene 5) unmerged in all scenarios | Smoke test on every mobile flow path |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { MOBILE_SCENE_RANGES, isMobileViewport } from "../mobile-scene-ranges";
import { getMobileMappedSceneId } from "../MobileSceneFlow";

describe("mobile scene ranges", () => {
  it("has 6 entries (5 cinematic + footer)", () => {
    expect(MOBILE_SCENE_RANGES.length).toBe(6);
  });
  it("Scene 5 has dedicated range", () => {
    expect(MOBILE_SCENE_RANGES.find(r => r.id === "scene-5-vietnam-global")).toBeDefined();
  });
  it("maps Scene 1 + Scene 2 to merged scene", () => {
    expect(getMobileMappedSceneId("scene-1-origin")).toBe("scene-1-2-merged");
    expect(getMobileMappedSceneId("scene-2-transformation")).toBe("scene-1-2-merged");
  });
  it("does NOT map Scene 5 to anything else", () => {
    expect(getMobileMappedSceneId("scene-5-vietnam-global")).toBe("scene-5-vietnam-global");
  });
});

// Playwright:
test("mobile shows 5 scenes", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const sectionCount = await page.evaluate(() =>
    document.querySelectorAll("[data-scene-id]").length
  );
  expect(sectionCount).toBe(6);  // 5 + footer
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-013..017 (each scene impl reads `getMobileMappedSceneId` to know merged context), FR-SCENE-020 (orchestrator consumes range array), FR-CMS-002 (narration ids preserved).

**Operational:** FR-WEB-004 (stores), FR-A11Y-001 (reduced-motion).

**Downstream:** FR-PERF-010 (mobile perf budgets verify compressed flow stays within budget).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Scene 5 merged with another scene (cultural-arc break) | AC#2, AC#10 + master-plan §3.3b | Hard constraint: never merge Scene 5; PR-review rule |
| Caption clipping on merged scene (text overflows) | Visual smoke + line-break audit | Adjust line breaks in en.json; extend dwell time |
| Narration drift (mobile-only line IDs added) | AC#4 | Mobile is render-schedule only; never add mobile-specific content |
| Resize mid-session doesn't swap ranges | AC#7 | resize event listener triggers re-evaluation |
| Mobile breakpoint inconsistent (768 vs 767) | Cross-FR audit | Use `(max-width: 767px)` everywhere; document in FR-DS-007 |
| Scene 1+2 merged but Scene 5 unmerged → 4 sections (not 5) | AC#1 count | Verify range count exactly 5 cinematic + footer = 6 |
| Frame budget exceeded on mobile during merged crossfade | FR-PERF-010 | Disable post-FX during merge transitions; FR-SCENE-022 DPR scaling |
| Mobile-only bugs not caught (Playwright runs desktop) | AC#1 + CI matrix | Add mobile viewport to CI test matrix |

## §8 — Deliverable preview

After shipping:
- Desktop user: 7 scrolling sections as today.
- Mobile user (390×844): 5 cinematic sections + footer = 6 total. Scene 5 cultural beat occupies its own section. Merged scenes show both narration lines + both Lumi clips over extended 3.0s dwell.
- Reduced-motion + mobile: static panels for each merged section, no animation.

## §9 — Notes

**On future tablet breakpoint:** Slice 2 might introduce a tablet flow (768-1023px) that uses 6 sections (compressing only one pair). Out of scope for slice 1.

**On translation budget:** Mobile compression keeps narration line count constant — no extra translation work for FR-CMS-003 VI variants.

*End of FR-SCENE-021.*
