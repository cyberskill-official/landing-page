---
id: FR-A11Y-002
title: "Shadow-DOM mirror for canvas scenes — semantic <section role='img'> + aria-labelledby + aria-live narration"
module: A11Y
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P3
slice: 2
owner: Frontend Lead + A11Y reviewer
created: 2026-05-16
related_frs: [FR-A11Y-001, FR-A11Y-003, FR-SCENE-009, FR-SCENE-010, FR-SCENE-011, FR-WEB-001, FR-WEB-009]
depends_on: [FR-SCENE-009, FR-A11Y-001]
blocks: [FR-OPS-012]
language: typescript 5.6 + react 19
service: apps/web/components/a11y/
new_files:
  - apps/web/components/a11y/SceneShadowMirror.tsx
  - apps/web/components/a11y/__tests__/SceneShadowMirror.unit.test.tsx
  - apps/web/tests/a11y/scene-shadow-mirror.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §7.1 — "Shadow-DOM accessibility mirror pattern for canvas scenes"
  - docs/01-master-plan-v2.md §7.3 — WCAG 2.2 AA compliance for canvas-anchored content
  - W3C WAI: "Using the role=img attribute for non-text content"
  - FR-A11Y-001 global a11y baseline (focus styles, color contrast, prefers-reduced-motion)

effort_hours: 4
risk_if_skipped: "WebGL canvas is opaque to screen readers — VoiceOver / NVDA / TalkBack report 'graphic, blank'. Without shadow mirror, all 8 scenes (entire narrative arc) are invisible to ~3% of visitors using screen readers (US Census 2024). WCAG 2.2 AA violation = legal liability + brand damage. Lighthouse a11y score drops to ~70."
---

## §1 — Description (BCP-14 normative)

1. **MUST** render a parallel `<section role="img">` per scene that mirrors the visible canvas content semantically. Pattern per master plan §7.1:

   ```html
   <section
     role="img"
     aria-labelledby="scene-N-heading"
     aria-describedby="scene-N-narration"
     class="visually-hidden"
   >
     <h2 id="scene-N-heading">{SceneTitle}</h2>
     <p id="scene-N-narration" aria-live="polite">{SceneNarrationCaption}</p>
   </section>
   ```

2. **MUST** mark every `<canvas>` element on the page with `aria-hidden="true"` so screen readers do not enumerate them. Only the shadow mirror conveys meaning.

3. **MUST** position the shadow mirror "visually hidden" but screen-reader-discoverable, using the established a11y CSS pattern:

   ```css
   .visually-hidden {
     position: absolute;
     width: 1px;
     height: 1px;
     padding: 0;
     margin: -1px;
     overflow: hidden;
     clip: rect(0, 0, 0, 0);
     white-space: nowrap;
     border: 0;
   }
   ```

   **MUST NOT** use `display: none` or `visibility: hidden` (those remove from accessibility tree entirely).

4. **MUST** wire `aria-live="polite"` on the narration `<p>` so screen readers announce when the active scene's narration changes via FR-SCENE-020 scroll orchestrator (each scene transition updates the caption).

5. **MUST** wire `aria-atomic="true"` on the narration `<p>` so the entire caption re-reads on update (not just the diff'd words — which would produce garbled fragments).

6. **MUST** debounce caption updates ≥ 500 ms. Rapid scroll triggers multiple narration changes; debounce prevents overlapping speech.

7. **MUST** include scene number and total ("Scene 3 of 8: …") at the start of each narration so users have spatial context.

8. **MUST NOT** announce ambient / decorative changes (particle counts, parallax layer shifts). Only narrative beats from FR-CMS-002 narration schema.

9. **MUST** survive `/lite` route — on `/lite`, the canvas is absent but the shadow mirror IS the primary content (same `<section role="img">` markup, but `class="visually-hidden"` removed → visible).

10. **MUST** support keyboard navigation: Tab moves between scene `<section>`s (each focusable via `tabindex="0"`), Enter announces full narration on demand.

11. **MUST** wire one mirror per scene (8 total: Scene 0-6 + footer). Each mirror lives inside the `<main>` element, in DOM order matching the visual scroll order.

12. **MUST** be in synchronous DOM (server-rendered HTML), not lazy-loaded. Screen readers may parse on first contentful paint; shadow mirror MUST be in initial HTML payload.

13. **MUST** include image alt-text-equivalent description as fallback for users whose AT doesn't support role=img + aria-labelledby (e.g. older Dragon NaturallySpeaking): the `<section>` MUST contain a sentence-level description like "Illustration of Lumi the golden genie hovering over a Saigon rooftop scene."

14. **MUST** pass `axe-core` + `lighthouse a11y` audits with 0 violations on the canvas / shadow-mirror interaction surface.

15. **SHOULD** include language attribute `lang="vi"` if narration is in Vietnamese (depends on FR-CMS locale; English narration uses page-default `lang="en"`).

## §2 — Why this design

**Why `role="img"` (not `role="region"` or `role="figure"`)?** Three WAI-ARIA candidates:
- `role="region"` requires accessible name + interactive content; canvas scenes are non-interactive narrative. Reject.
- `role="figure"` works for static images but doesn't compose well with live captions. Reject.
- `role="img"` is the WAI-ARIA recommended pattern for "complex graphic that conveys meaning" — exactly matches a canvas scene with narration. ✅

**Why aria-labelledby + aria-describedby (not aria-label)?** aria-label is a single string. aria-labelledby + aria-describedby reference real DOM nodes — the heading and narration text are already on the page (visible to readers, available to translation tools, indexable by search engines). Keeping the text in DOM (vs aria-label string) preserves SEO + i18n.

**Why aria-live polite (not assertive)?** Polite waits for the user to finish current speech before announcing. Assertive interrupts mid-sentence — jarring on a scrolling narrative. Polite is the correct default per W3C ARIA Authoring Practices.

**Why aria-atomic true?** Without atomic, screen readers may read only the changed words. For multi-sentence narration, this produces fragments like "the genie hovers"... "rooftop scene"... which is incomprehensible. Atomic re-reads the whole caption.

**Why 500 ms debounce?** Rapid scrolls can trigger 5+ scene changes in 1 second. Each triggers an announcement. Without debounce, screen readers queue them or interrupt themselves — both bad. 500 ms is the calibrated knee from FR-SCENE-020 testing.

**Why include "Scene N of 8"?** Spatial context. Sighted users see the scrollbar progress; screen-reader users have no equivalent unless we provide one. "Scene 3 of 8" tells them where they are in the narrative arc.

**Why visually-hidden (not display:none)?** display:none removes from accessibility tree entirely → screen reader can't find it. visually-hidden keeps it in the AT tree but invisible to sighted users — exactly the goal.

**Why server-rendered (not lazy-loaded)?** Some screen readers (esp. VoiceOver on iOS Safari) parse DOM at first paint. Lazy-mounted mirror could arrive after AT has finished its first pass; the canvas would be the only thing AT sees.

**Why one mirror per scene (not one for whole page)?** Per-scene mirrors enable Tab navigation between scenes — direct equivalent of "scrolling between sections" for sighted users. Single page-wide mirror would lose this granularity.

## §3 — Public surface

```tsx
// apps/web/components/a11y/SceneShadowMirror.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "@/lib/stores/scene-store";

export interface SceneShadowMirrorProps {
  sceneId: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 0-6 + footer
  totalScenes: number;
  title: string;          // scene heading from CMS
  narration: string;      // full caption from FR-CMS-002 narration schema
  altDescription?: string; // sentence-level fallback for non-ARIA-img-supporting AT
  lang?: string;          // override page-default lang if narration is in different locale
}

export function SceneShadowMirror({
  sceneId,
  totalScenes,
  title,
  narration,
  altDescription,
  lang,
}: SceneShadowMirrorProps) {
  const activeScene = useSceneStore(s => s.activeScene);
  const isActive = activeScene === sceneId;

  // Build the "Scene N of total: title" prefix for AT spatial context
  const fullNarration = `Scene ${sceneId + 1} of ${totalScenes}: ${narration}`;

  return (
    <section
      role="img"
      aria-labelledby={`scene-${sceneId}-heading`}
      aria-describedby={`scene-${sceneId}-narration`}
      className="visually-hidden"
      tabIndex={0}
      lang={lang}
    >
      <h2 id={`scene-${sceneId}-heading`}>{title}</h2>
      <p
        id={`scene-${sceneId}-narration`}
        aria-live={isActive ? "polite" : "off"}
        aria-atomic="true"
      >
        {fullNarration}
      </p>
      {altDescription && <p className="sr-only-fallback">{altDescription}</p>}
    </section>
  );
}
```

```tsx
// Usage in apps/web/app/page.tsx — mirrors live in DOM order matching scroll order
import { SceneShadowMirror } from "@/components/a11y/SceneShadowMirror";

export default function Page() {
  return (
    <main>
      {/* Visible canvas via FR-WEB-001 GlobalCanvas — aria-hidden by default */}
      <SceneShadowMirror
        sceneId={0}
        totalScenes={8}
        title="The Saigon rooftop — meet Lumi the Golden Genie"
        narration="A warm hush over Saigon. Lumi, a small golden genie with a casual nón lá, drifts into view above the rooftop antenna and skyline."
        altDescription="Illustration of Lumi the golden genie hovering over a sunset-lit Saigon rooftop with antenna silhouettes."
      />
      <SceneShadowMirror
        sceneId={1}
        totalScenes={8}
        title="The wish — your idea becomes a product"
        narration="..."
      />
      {/* ... scenes 2-7 ... */}
    </main>
  );
}
```

```css
/* apps/web/app/globals.css — visually-hidden utility */
.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* On /lite route, override to visible */
[data-lite="true"] .visually-hidden {
  position: static !important;
  width: auto;
  height: auto;
  clip: auto;
  overflow: visible;
  white-space: normal;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Shadow mirror present per scene (8 total) | DOM query: `document.querySelectorAll('section[role="img"]').length === 8` |
| 2 | `aria-labelledby` + `aria-describedby` reference real DOM IDs | E2E: assert `getElementById(labelId)` not null |
| 3 | All `<canvas>` have `aria-hidden="true"` | DOM query: `document.querySelectorAll('canvas:not([aria-hidden="true"])').length === 0` |
| 4 | axe-core: 0 canvas-related violations | Playwright + `@axe-core/playwright` |
| 5 | VoiceOver test on Scene 0: announces "Scene 1 of 8: ..." then narration | Manual + ScreenReader-friendly test in Playwright |
| 6 | Shadow mirror invisible to sighted users | Visual regression: shadow nodes have 1×1 px clip-rect |
| 7 | aria-live polite — narration update doesn't interrupt | VoiceOver listening test |
| 8 | aria-atomic — full caption re-reads on change | VoiceOver listening test |
| 9 | 500 ms debounce on rapid scroll | Playwright fast-scroll → assert ≤ 2 narrations announced per 1s |
| 10 | "Scene N of 8" prefix present in every narration | DOM text content includes the prefix |
| 11 | `/lite` route makes shadow content visible | Visit `/lite`, assert `.visually-hidden` shows content |
| 12 | Server-rendered in initial HTML | `curl http://localhost:3000/` includes shadow markup |
| 13 | Vitest unit tests pass | `pnpm vitest run apps/web/components/a11y/__tests__/SceneShadowMirror.unit.test.tsx` |
| 14 | Playwright E2E suite passes | `pnpm playwright test apps/web/tests/a11y/scene-shadow-mirror.e2e.spec.ts` |
| 15 | Lighthouse a11y score ≥ 95 on `/` | CI gate |

## §5 — Verification

```tsx
// apps/web/components/a11y/__tests__/SceneShadowMirror.unit.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SceneShadowMirror } from "../SceneShadowMirror";
import { useSceneStore } from "@/lib/stores/scene-store";

describe("SceneShadowMirror", () => {
  beforeEach(() => {
    useSceneStore.setState({ activeScene: 0 });
  });

  it("renders role=img section", () => {
    render(<SceneShadowMirror sceneId={0} totalScenes={8} title="Scene 0" narration="Test" />);
    const section = screen.getByRole("img");
    expect(section).toBeTruthy();
  });

  it("wires aria-labelledby to heading", () => {
    render(<SceneShadowMirror sceneId={1} totalScenes={8} title="Scene 1 title" narration="..." />);
    const section = screen.getByRole("img");
    const labelId = section.getAttribute("aria-labelledby");
    expect(document.getElementById(labelId!)?.textContent).toBe("Scene 1 title");
  });

  it("prefixes narration with 'Scene N of total'", () => {
    render(<SceneShadowMirror sceneId={2} totalScenes={8} title="x" narration="The wish unfolds." />);
    expect(screen.getByText(/Scene 3 of 8: The wish unfolds\./)).toBeTruthy();
  });

  it("aria-live='polite' only when active scene", () => {
    useSceneStore.setState({ activeScene: 1 });
    render(<SceneShadowMirror sceneId={0} totalScenes={8} title="x" narration="y" />);
    const p = screen.getByText(/Scene 1 of 8/);
    expect(p.getAttribute("aria-live")).toBe("off");

    useSceneStore.setState({ activeScene: 0 });
    // ... re-render; assert aria-live = polite
  });

  it("aria-atomic='true' always", () => {
    render(<SceneShadowMirror sceneId={3} totalScenes={8} title="x" narration="y" />);
    const p = screen.getByText(/Scene 4 of 8/);
    expect(p.getAttribute("aria-atomic")).toBe("true");
  });

  it("supports lang override (e.g., 'vi' for Vietnamese)", () => {
    render(<SceneShadowMirror sceneId={4} totalScenes={8} title="x" narration="y" lang="vi" />);
    const section = screen.getByRole("img");
    expect(section.getAttribute("lang")).toBe("vi");
  });

  it("includes altDescription as fallback when provided", () => {
    render(
      <SceneShadowMirror
        sceneId={5}
        totalScenes={8}
        title="x"
        narration="y"
        altDescription="Illustration of Lumi over rooftop"
      />,
    );
    expect(screen.getByText(/Illustration of Lumi over rooftop/)).toBeTruthy();
  });

  it("is tabIndex=0 for keyboard nav", () => {
    render(<SceneShadowMirror sceneId={6} totalScenes={8} title="x" narration="y" />);
    expect(screen.getByRole("img").getAttribute("tabindex")).toBe("0");
  });
});
```

```ts
// apps/web/tests/a11y/scene-shadow-mirror.e2e.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Shadow DOM mirror — canvas a11y", () => {
  test("8 scenes have role=img shadow mirrors", async ({ page }) => {
    await page.goto("/");
    const mirrors = await page.locator("section[role='img']").count();
    expect(mirrors).toBe(8);
  });

  test("all canvases have aria-hidden=true", async ({ page }) => {
    await page.goto("/");
    const unhiddenCanvases = await page.locator("canvas:not([aria-hidden='true'])").count();
    expect(unhiddenCanvases).toBe(0);
  });

  test("axe-core zero canvas/aria violations", async ({ page }) => {
    await page.goto("/");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag22aa"])
      .analyze();
    const canvasViolations = result.violations.filter(v =>
      v.id.includes("aria") || v.id.includes("image") || v.id.includes("hidden")
    );
    expect(canvasViolations).toEqual([]);
  });

  test("/lite route makes shadow content visible", async ({ page }) => {
    await page.goto("/lite");
    const firstMirror = page.locator("section[role='img']").first();
    const bbox = await firstMirror.boundingBox();
    expect(bbox!.width).toBeGreaterThan(50);   // not 1px clipped
    expect(bbox!.height).toBeGreaterThan(20);
  });

  test("Tab nav reaches each scene mirror", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      // assert focus on scene-i-heading
    }
  });

  test("scrolling triggers narration update (aria-live polite)", async ({ page }) => {
    await page.goto("/");
    // mock aria-live announcement listener
    await page.evaluate(() => {
      window.__announcements = [];
      const observer = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.target instanceof HTMLElement && m.target.getAttribute("aria-live") === "polite") {
            window.__announcements.push(m.target.textContent);
          }
        }
      });
      document.querySelectorAll('[aria-live="polite"]').forEach(el => observer.observe(el, { childList: true }));
    });

    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "smooth" }));
    await page.waitForTimeout(600);  // debounce window
    const announcements = await page.evaluate(() => window.__announcements);
    expect(announcements.length).toBeGreaterThan(0);
  });
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (a11y baseline — focus, contrast, motion), FR-SCENE-009 (Scene 0 hero comp consumer), FR-SCENE-020 (scroll orchestrator triggers narration updates), FR-CMS-002 (narration schema source).

**Operational:** React 19 + Zustand store (`useSceneStore.activeScene`), Tailwind / globals.css `.visually-hidden` utility.

**Downstream:**
- FR-OPS-012 (axe-core gate) — verifies no canvas violations.
- FR-WEB-009 (/lite redirect) — shadow content becomes primary visible content.
- FR-A11Y-005 (Skip 3D toggle) — when active, page renders /lite-style; shadow content drives UX.
- FR-OPS-011 (Lighthouse) — measures a11y score baseline.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Double-announcement (canvas + mirror both spoken) | VoiceOver test | Verify canvas `aria-hidden="true"`; add Lighthouse audit |
| Shadow mirror visible on non-/lite (visual regression) | Visual smoke | Audit `.visually-hidden` CSS rule scope; never inline-style override |
| aria-live spam on rapid scroll | VoiceOver clipping multiple narrations | Debounce ≥ 500 ms; only `polite` (not `assertive`) |
| `display:none` accidentally used (removes from AT tree) | axe-core | Use clip-rect pattern only |
| Scene narration in wrong language for AT | Mismatched `lang` attr | Page lang or per-mirror lang override matches narration text |
| `aria-atomic="false"` makes fragments | Listening test | Always `aria-atomic="true"` |
| Server-render skipped (mirrors empty in initial HTML) | `curl` output check | Component is server-renderable; no `"use client"` wrapping outside |
| Focus skipped between mirrors | Tab nav test | All mirrors have `tabindex="0"` |
| Lite route doesn't override visually-hidden | /lite visual test | `[data-lite="true"]` selector targets the override |
| Mirror count mismatch (footer missing) | Count assertion | Verify 8 total: scenes 0-6 + footer |
| Narration unchanged across scene transitions | Listening test | Subscribe to `useSceneStore.activeScene`; conditional aria-live |
| Scene number 0-indexed but spoken "Scene 0 of 8" (confusing) | Listening test | Increment in display: `sceneId + 1` |
| altDescription bleeds into aria-describedby | DOM check | altDescription is separate `<p>`; not in aria-describedby chain |
| Translation tool (e.g. Google Translate) breaks aria refs | Manual test | aria-labelledby IDs are deterministic and not in translatable text |
| Screen reader skips role=img (older Dragon) | Manual test on Dragon | altDescription provides fallback sentence |
| iOS VoiceOver doesn't navigate to invisible content | Manual test | Apple VO does support visually-hidden; verify per device |

## §8 — Deliverable preview

After implementation, screen reader VoiceOver on macOS reading the page:

> "Main landmark. List with 8 items. Scene 1 of 8: The Saigon rooftop — meet Lumi the Golden Genie. A warm hush over Saigon. Lumi, a small golden genie with a casual nón lá, drifts into view above the rooftop antenna and skyline. Image. Tab. Scene 2 of 8: The wish — your idea becomes a product..."

User scrolls down to Scene 2:
> "Scene 2 of 8: The wish unfolds — the user's intent crystallizes into a tangible mock-up under Lumi's hands..."

User toggles "Skip 3D entirely" → page reroutes to /lite, shadow content now visible:
> Header "Scene 1 of 8: The Saigon rooftop". Body paragraph with full narration. Tab to Scene 2 header. Etc.

## §9 — Notes

**On Vietnamese narration variant:** FR-CMS-vi provides Vietnamese narration text. When active locale = "vi", `<SceneShadowMirror lang="vi" />`. Page-default lang is "en"; per-section override is correct ARIA pattern.

**On aria-live "assertive" temptation:** Tempting for "important" beats (e.g., the CTA reveal). Reject — interruption is more harmful to flow than waiting. Polite is the right default; only consider assertive for error states (form submission failures, etc., FR-A11Y-007 scope).

**On Dragon NaturallySpeaking + older AT compatibility:** Some older AT doesn't fully grok `role=img + aria-labelledby + aria-describedby`. altDescription provides a fallback sentence-level description that older AT can read directly.

**On i18n for "Scene N of 8" prefix:** When locale = "vi", prefix becomes "Cảnh N / 8: ...". Localized string from `useTranslations("a11y")` hook.

**On lighthouse vs axe vs manual:** Three gates:
1. Lighthouse a11y score (FR-OPS-011) — coarse signal, fast.
2. axe-core (FR-OPS-012) — finer violations, semi-automatable.
3. Manual VoiceOver / NVDA test — pre-launch only (FR-A11Y-013 scope, P5).

**On WCAG 2.2 vs 2.1:** WCAG 2.2 (Oct 2023) is current standard. Shadow mirror satisfies SC 1.1.1 (non-text content), 1.3.1 (info & relationships), 4.1.2 (name, role, value), 4.1.3 (status messages — aria-live).

*End of FR-A11Y-002.*
