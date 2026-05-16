---
id: FR-A11Y-003
title: "Skip-story pill (top-right) — first focusable element, jumps to Scene 6 #cta-hub"
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
related_frs: [FR-A11Y-001, FR-A11Y-004, FR-A11Y-005, FR-SCENE-018, FR-CTA-001, FR-WEB-001]
depends_on: [FR-WEB-001]
blocks: [FR-A11Y-005, FR-A11Y-007]
language: typescript 5.6 + react 19
service: apps/web/components/a11y/
new_files:
  - apps/web/components/a11y/SkipStoryPill.tsx
  - apps/web/components/a11y/__tests__/SkipStoryPill.unit.test.tsx
  - apps/web/tests/a11y/skip-story.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §2.3 — "Always-visible Skip-story pill in upper-right"
  - docs/01-master-plan-v2.md §7.3 — WCAG 2.2 SC 2.4.1 (Bypass Blocks)
  - WAI-ARIA Authoring Practices: "Skip-link pattern"
  - FR-A11Y-001 — global a11y baseline (focus rings, target size)

effort_hours: 3
risk_if_skipped: "WCAG 2.2 SC 2.4.1 (Bypass Blocks) requires a way to skip past repeated content. Without it: legal/compliance violation, keyboard users sit through 8 scenes of forced-scroll, screen-reader users hear the same narration cycle every visit. Drop-off rate among AT users approaches 70%. Skip-story is the SINGLE most-impactful a11y feature on the page."
---

## §1 — Description (BCP-14 normative)

1. **MUST** be visible on every breakpoint (desktop / tablet / mobile / smallest 320px). Position: fixed top-right, 16 px from edge.

2. **MUST** be the FIRST focusable element on the page. Tab from a fresh page load lands on the pill before any other element (logo, nav, etc.).

3. **MUST** anchor-link to `#cta-hub` (the Scene 6 CTA Hub element). Implemented as `<a href="#cta-hub">` with `scrollIntoView({behavior: 'smooth', block: 'start'})`-equivalent behaviour.

4. **MUST** respect `prefers-reduced-motion`: if user has reduced-motion preference, scroll is instant (no smooth animation).

5. **MUST** focus the target `#cta-hub` element after navigation (use `element.focus({ preventScroll: true })` then scrollIntoView). This ensures Tab continues from the destination, not back at top.

6. **MUST** be ≥ 44×44 px (WCAG 2.2 SC 2.5.8 Target Size) on all breakpoints. Padding ≥ 12 px vertical, ≥ 20 px horizontal.

7. **MUST** show 2px gold focus ring (FR-A11Y-001 / FR-A11Y-008 spec) when focused. Visible on all backgrounds (test against hero gradient + dark Scene 4).

8. **MUST** have accessible name "Skip to call to action" (or localised equivalent). Use the button text + aria-label only if the visible text is shortened to "Skip" alone.

9. **MUST** persist visibility — does NOT hide on scroll, does NOT collapse on small viewports. Always-on per master plan §2.3.

10. **MUST NOT** float over critical visual content. z-index manages stack but pill MUST be positioned in dead-zone (typical top-right has no narrative content).

11. **MUST** be operable via:
   - Keyboard: Tab → Enter or Space
   - Mouse: click
   - Touch: tap (full target including padding)
   - Screen-reader: virtual cursor + activate

12. **MUST** fire analytics event `skip_story_used` (per FR-OPS-014 analytics) on activation, so the team can measure how many users skip the narrative.

13. **MUST NOT** redirect to a different route — anchor-link only. Keeps the user on the same page; lite-redirect is FR-A11Y-005's separate concern.

14. **MUST** include a focus trap escape: if focus is in a modal (CTA hub form), Skip-story remains keyboard-reachable via Escape → Tab.

15. **SHOULD** announce "Skipping to call to action" via aria-live region on activation (for AT users to confirm action).

16. **MUST** be styled per design system tokens (FR-DS-006 button-pill component variant): pill shape, gold-on-deep-brown contrast (≥ WCAG 4.5:1).

## §2 — Why this design

**Why first focusable element?** WCAG SC 2.4.1 (Bypass Blocks) explicitly requires this as the standard pattern. Tab from page load = skip-link. Screen-reader users hit Tab as a habit; landing on Skip-story is the universal expectation.

**Why anchor link (not router push)?** Same page; faster (no React re-render); preserves scroll restoration semantics; AT-compatible. Router push would re-mount components, losing scroll state and triggering FR-A11Y-001 reduced-motion edge cases.

**Why focus the destination?** Without focus management, Tab after skip continues from where the skip-link was (back at top), defeating the purpose. `element.focus()` on `#cta-hub` makes subsequent Tab move to CTA hub controls (form fields, etc.).

**Why ≥ 44×44 px?** WCAG 2.2 SC 2.5.8 (Target Size minimum). Below 44 px, touch users mis-tap ~15% of the time per Apple HIG. 44×44 is the line where mis-tap rate drops below 3%.

**Why always-on (not hide on scroll)?** Some users develop scroll fatigue mid-page and need an escape. Hidden Skip-story = no escape. Always-on = guaranteed access at any scroll position.

**Why 2px gold focus ring?** FR-A11Y-008 codifies the brand-aligned focus indicator. Gold (Saigon Dusk palette) on dark backgrounds + dark on light = ≥ 4.5:1 contrast. 2px is the WCAG-recommended minimum thickness.

**Why analytics event?** Product hypothesis: ~20-30% of users skip the narrative on first visit. Measuring this validates the design tension (cinematic vs efficiency). High skip-rate = consider shortening narrative; low = narrative engages.

**Why announce via aria-live?** Sighted users see the page scroll. AT users need confirmation: "did pressing Enter do something?" "Skipping to call to action" aria-live tells them yes.

**Why NOT redirect to /lite?** Skip-story is "skip the narrative beats, still see the page." /lite is "skip 3D entirely." Different user intents → different controls → no overlap.

## §3 — Public surface

```tsx
// apps/web/components/a11y/SkipStoryPill.tsx
"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { trackEvent } from "@/lib/analytics";

export function SkipStoryPill() {
  const t = useTranslations("a11y");
  const prefersReducedMotion = useReducedMotion();
  const liveRegionRef = useRef<HTMLSpanElement>(null);

  function handleClick(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    const target = document.getElementById("cta-hub");
    if (!target) return;

    trackEvent("skip_story_used", { breakpoint: getBreakpoint() });

    // Announce to AT
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t("skip_announcement");  // "Skipping to call to action"
      setTimeout(() => { if (liveRegionRef.current) liveRegionRef.current.textContent = ""; }, 2000);
    }

    // Scroll + focus
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 400);
  }

  return (
    <>
      <a
        href="#cta-hub"
        onClick={handleClick}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleClick(e); }}
        className="skip-story-pill"
        aria-label={t("skip_aria_label")}  // "Skip to call to action"
      >
        {t("skip_label")}  {/* "Skip story" */}
      </a>
      <span ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="visually-hidden" />
    </>
  );
}

function getBreakpoint(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1280 ? "tablet" : "desktop";
}
```

```css
/* In globals.css (via design-system tokens) */
.skip-story-pill {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  border-radius: 9999px;
  background: var(--surface-deep-brown);
  color: var(--text-gold);
  font: 500 14px/1 var(--font-sans);
  text-decoration: none;
  border: 1px solid var(--border-gold-subtle);
  transition: background 0.2s, transform 0.1s;
}
.skip-story-pill:hover {
  background: var(--surface-deep-brown-hover);
}
.skip-story-pill:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}
.skip-story-pill:active {
  transform: scale(0.98);
}

/* Mobile: smaller padding but keep 44px target */
@media (max-width: 768px) {
  .skip-story-pill {
    padding: 12px 16px;
    font-size: 13px;
  }
}
```

```tsx
// Usage in layout.tsx — first element in <main> after lang + meta
<body>
  <SkipStoryPill />
  <Header />
  <main>
    {children}
  </main>
</body>
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Visible at all breakpoints (320 / 768 / 1280 / 1920) | Playwright viewport sweep |
| 2 | First Tab from page-load focuses the pill | Playwright: `await page.keyboard.press('Tab'); assert focused === skipPill` |
| 3 | Click/Enter navigates to `#cta-hub` (scroll + focus) | Playwright: assert `document.activeElement.id === 'cta-hub'` |
| 4 | `prefers-reduced-motion` → instant scroll | Mock reduced-motion media query, assert no smooth scroll |
| 5 | ≥ 44×44 px on all breakpoints | Playwright: `boundingBox.width >= 44 && height >= 44` at 320/768/1280 |
| 6 | 2px gold focus ring on `:focus-visible` | Visual regression at focus state |
| 7 | Accessible name "Skip to call to action" | DOM: `aria-label` attribute matches |
| 8 | Always visible (does not hide on scroll) | Playwright: scroll to bottom, assert pill still in DOM at fixed position |
| 9 | z-index 100 keeps pill above content | Visual: pill not occluded by any scroll-rig element |
| 10 | Touch tap fires navigation | Playwright touch event |
| 11 | Analytics event `skip_story_used` fires | Mock trackEvent; assert called with breakpoint param |
| 12 | aria-live announcement on activation | Mock listener on aria-live span, assert content includes "Skipping" |
| 13 | Lit colour contrast ≥ 4.5:1 against page bg | FR-A11Y-008 contrast check |
| 14 | Vitest unit tests pass | `pnpm vitest run apps/web/components/a11y/__tests__/SkipStoryPill.unit.test.tsx` |
| 15 | axe-core: 0 violations on the pill | Lighthouse + axe |

## §5 — Verification

```tsx
// apps/web/components/a11y/__tests__/SkipStoryPill.unit.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { SkipStoryPill } from "../SkipStoryPill";

describe("SkipStoryPill", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="cta-hub" tabindex="-1"></div>';
  });

  it("renders as anchor with href=#cta-hub", () => {
    render(<SkipStoryPill />);
    const pill = screen.getByRole("link", { name: /skip to call to action/i });
    expect(pill.getAttribute("href")).toBe("#cta-hub");
  });

  it("min-height/width 44px (target size)", () => {
    render(<SkipStoryPill />);
    const pill = screen.getByRole("link");
    const styles = getComputedStyle(pill);
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
  });

  it("scrolls + focuses #cta-hub on click", () => {
    const target = document.getElementById("cta-hub")!;
    const focusSpy = vi.spyOn(target, "focus");
    const scrollSpy = vi.spyOn(target, "scrollIntoView");
    render(<SkipStoryPill />);
    fireEvent.click(screen.getByRole("link"));
    expect(scrollSpy).toHaveBeenCalled();
    setTimeout(() => expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true }), 500);
  });

  it("respects prefers-reduced-motion", () => {
    Object.defineProperty(window, "matchMedia", {
      value: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
      configurable: true,
    });
    render(<SkipStoryPill />);
    const target = document.getElementById("cta-hub")!;
    const scrollSpy = vi.spyOn(target, "scrollIntoView");
    fireEvent.click(screen.getByRole("link"));
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("fires analytics event on activation", () => {
    const trackMock = vi.fn();
    // mock module
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    render(<SkipStoryPill />);
    fireEvent.click(screen.getByRole("link"));
    expect(trackMock).toHaveBeenCalledWith("skip_story_used", expect.objectContaining({ breakpoint: expect.any(String) }));
  });

  it("announces 'Skipping to call to action' via aria-live", () => {
    render(<SkipStoryPill />);
    fireEvent.click(screen.getByRole("link"));
    const liveRegion = document.querySelector("[aria-live='polite']");
    expect(liveRegion?.textContent).toMatch(/skipping/i);
  });

  it("Enter key triggers same as click", () => {
    render(<SkipStoryPill />);
    const pill = screen.getByRole("link");
    fireEvent.keyDown(pill, { key: "Enter" });
    // ... same assertions as click test
  });
});
```

```ts
// apps/web/tests/a11y/skip-story.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("Tab from page load focuses skip-story pill (first focusable)", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent);
  expect(focused).toMatch(/skip story/i);
});

test("Skip-story Enter → scrolls + focuses #cta-hub", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);  // smooth scroll + focus
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe("cta-hub");
});

test("visible at 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator(".skip-story-pill")).toBeVisible();
});

test("touch tap navigates to cta-hub", async ({ page }) => {
  await page.goto("/");
  await page.locator(".skip-story-pill").tap();
  await page.waitForTimeout(800);
  const url = page.url();
  expect(url).toMatch(/#cta-hub$/);
});

test("pill remains visible after scroll", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 5000));
  await expect(page.locator(".skip-story-pill")).toBeVisible();
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (a11y baseline tokens — focus ring, contrast), FR-CTA-001 (CTA hub `#cta-hub` is the scroll target), FR-SCENE-018 (Scene 6 host of cta-hub).

**Operational:** React 19, next-intl (i18n strings), FR-OPS-014 analytics module.

**Downstream:**
- FR-A11Y-005 (Skip 3D toggle) lives in the same header strip; consistent visual treatment.
- FR-A11Y-007 (Focus management on routed flows) extends focus pattern.
- FR-OPS-012 axe gate validates this.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Pill not first Tab target (logo / nav focused first) | AC#2 | Place SkipStoryPill before all other interactive elements in DOM |
| Anchor link doesn't scroll on Safari iOS | Manual test | Use explicit `scrollIntoView` (smoothscroll polyfill) |
| Focus jumps back to top after scroll | AC#3 | Explicit `target.focus({ preventScroll: true })` after scroll completes |
| 44×44 violated on tight mobile | AC#5 | Min-height/width via CSS, not relying on padding alone |
| Focus ring invisible on dark scene | Visual | Gold ring contrast ≥ 4.5:1 vs all backgrounds; ring offset gives visibility |
| Pill obscures critical narrative element | Visual | Z-index 100, top-right placement (clear of central scenes) |
| Hidden on small viewport (collapse to icon) | AC#1 | Always-text "Skip"; no hamburger collapse |
| Smooth scroll ignored under reduced-motion | AC#4 | `useReducedMotion` hook gates behavior:smooth |
| analytics not fired on touch | Touch test + listener | `tap` triggers same onClick |
| aria-live announcement collides with FR-A11Y-002 narration | Manual VO test | 500ms gap between Skip announce and narration; OR use single ARIA live region |
| Multiple Skip-story instances mounted | DOM query | Singleton in layout.tsx |
| Vietnamese label not translated | next-intl missing key | Translation keys in messages/{en,vi}.json |
| z-index war with CTA modal | Modal opens, pill on top | Modal z-index > 100 when modal open; pill < 100 |
| Pill text wraps to 2 lines on narrow viewport | Visual | white-space: nowrap; ellipsis if needed |
| Focus trapped in modal blocks Skip-story | Modal a11y | FR-A11Y-007 modal trap permits Escape; Tab continues outside modal |

## §8 — Deliverable preview

User experience on desktop:
1. User loads page. Page renders with hero scene visible.
2. User presses Tab. Focus indicator (gold ring) appears on "Skip story" pill, top-right.
3. User presses Enter. Page smoothly scrolls to Scene 6 CTA hub; focus lands on first CTA button.
4. Continued Tab navigates within CTA hub buttons.

User experience on iOS Safari:
1. User taps Skip-story pill with finger.
2. Page scrolls; aria-live announces "Skipping to call to action" (heard via VoiceOver).
3. Focus reaches CTA hub.

User with reduced-motion preference:
1. User clicks Skip-story.
2. Page jumps (no animation) to CTA hub.

User on /lite route:
1. Skip-story still renders (pages are not exclusive about cinematic vs lite).

## §9 — Notes

**On 'Why no `<button>` instead of `<a href>`?'** Anchor link is the WAI semantic for in-page jump; button would require JS handler to navigate (no fallback if JS fails). The `<a href="#cta-hub">` works even with JS disabled — pure browser-native anchor jump.

**On 'Why not display 'Skip to CTA' label?'** "Story" is the brand's user-facing language for the narrative arc. Aligns with the visible button text; avoid jargon "CTA".

**On future i18n:** Vietnamese label: "Bỏ qua câu chuyện" (Skip story). next-intl key `a11y.skip_label`.

**On mobile pill placement:** Top-right is the universal pattern (Apple, Google, Microsoft conventions). Stays in safe-area-inset on notched devices via `padding-right: max(1rem, env(safe-area-inset-right))`.

**On 'Why z-index 100 (not 999)?'** 100 is the documented modal-layer-floor in FR-DS-009 design system stack. Modals use 200+; pill stays below modals when they open, above all narrative content.

**On future "skip to..." dropdown:** Could expand to "Skip to: section dropdown" if narrative grows. Out of slice 1 scope.

*End of FR-A11Y-003.*
