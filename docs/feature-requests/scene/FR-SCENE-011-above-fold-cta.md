---
id: FR-SCENE-011
title: "Above-fold CTA — primary 'Book Discovery Call' + scroll-pinned sticky variant"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 2
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-SCENE-009, FR-CTA-001, FR-WEB-002, FR-A11Y-008, FR-A11Y-009, FR-DS-007]
depends_on: [FR-SCENE-009, FR-CTA-001]
blocks: [FR-SCENE-012]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §9.1 Track 1 — "Book Discovery Call — buyer-track CTA"
  - docs/01-master-plan-v2.md §2.1 Scene 0 row — "Above-fold CTA visible on first paint"
  - docs/01-master-plan-v2.md §5.2 — "Sticky-on-scroll via GSAP ScrollTrigger reading Lenis progress"
  - docs/01-master-plan-v2.md §7.4 a11y — "Skip-story pill above sticky CTA in z-order"

language: typescript + react 19 + gsap
service: apps/web/components/scenes/scene-0-hero/
new_files:
  - apps/web/components/scenes/scene-0-hero/Scene0CTA.tsx
  - apps/web/components/scenes/scene-0-hero/Scene0CTA.client.tsx
  - apps/web/components/scenes/scene-0-hero/__tests__/cta-sticky.spec.ts

effort_hours: 4
risk_if_skipped: "Above-fold buyer-track CTA is the primary conversion path. Without it visible on first paint, the buyer audience needs to scroll all the way to Scene 6 before encountering the Buy portal — high drop-off. The scroll-pinned sticky variant keeps the CTA reachable through the entire cinematic, preserving conversion intent."
---

## §1 — Description (BCP-14 normative)

1. **MUST** render a primary "Book Discovery Call" CTA below the hero `<h1>` on the Scene 0 viewport. Visible on first paint (in SSR HTML, no client-only render).

2. **MUST** scroll-track-pin: after the Scene 0 section scrolls past the viewport top, the CTA transitions into a sticky button in the page header. Implementation uses GSAP ScrollTrigger reading Lenis scroll progress (FR-WEB-002 bridge).

3. **MUST** be a **DOM element**, NEVER inside Drei `<Html>` (FR-CTA-001 §1 #2 invariant). CTAs in `<Html>` lose keyboard accessibility + bypass form-modal lazy-loading.

4. **MUST** open the same Buy track modal as FR-CTA-001 when clicked. Click handler calls `setFocusedCta('buy')` from FR-WEB-004 useLumiStore + dispatches the modal-open action.

5. **MUST** target **≥ 44×44 CSS pixels** at all breakpoints (FR-A11Y-009 minimum touch target).

6. **MUST** maintain z-index ordering: `skip-story-pill` (FR-A11Y-002) ABOVE this sticky CTA ABOVE all scenes. Both must remain above the canvas.

7. **MUST** include `:focus-visible` ring per FR-A11Y-008 spec (2-px gold-400, 2-px offset).

8. **MUST** crossfade between the above-fold (larger, hero-style) variant and the sticky (smaller, header-style) variant over 200ms ease-genie when crossing the Scene-0 boundary. NO sudden state switch.

9. **MUST NOT** appear in the `/lite` route. FR-A11Y-001 reduced-motion lite path uses the standard 7-panel storyboard with the Buy CTA in panel 7 only.

10. **MUST** support deep-link via `?action=book` — landing with this query param auto-opens the Buy modal after Scene 0 mounts (FR-CTA-001 §1 #15 deep-link contract).

11. **MUST** be SSR-renderable (no `window` access at render time). GSAP ScrollTrigger registration happens in `useEffect`.

12. **MUST** ship Playwright integration tests covering: above-fold render, click-opens-modal, sticky behavior on scroll, z-index ordering, ≥44×44 target size at mobile breakpoint, deep-link.

## §2 — Why this design

**Why above-fold visibility?** Buyer-track conversions correlate with CTA reachability. Putting Buy below the fold (only at Scene 6) loses ~ 30-40% of intent visitors who don't scroll deep. Above-fold + sticky covers the visitor regardless of scroll depth.

**Why sticky-variant via ScrollTrigger (not CSS `position: sticky`)?** CSS sticky positions the element relative to scroll, but doesn't allow crossfade between visual variants. ScrollTrigger lets us swap rendering (hero-style → header-style) at a precise scroll progress with motion-token-driven timing.

**Why DOM-not-Drei-Html?** Drei `<Html>` renders DOM inside R3F canvas tree — it's portaled but the focus-management is broken under reduced-motion + the modal-lazy-load suspends inside canvas (defeating FR-WEB-006 per-scene Suspense rule).

**Why crossfade variant transition?** Sudden visual state change ("the CTA just popped into the header") feels broken. 200ms ease-genie crossfade (FR-DS-006) makes the transition feel like the same element, just resized.

## §3 — Deliverable structure

```
apps/web/components/scenes/scene-0-hero/
├── Scene0CTA.tsx                    # server re-export
├── Scene0CTA.client.tsx             # "use client" implementation
└── __tests__/
    └── cta-sticky.spec.ts           # Playwright
```

```tsx
// Scene0CTA.client.tsx (shape)
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLumiStore } from "@/lib/stores";

gsap.registerPlugin(ScrollTrigger);

export function Scene0CTAClient() {
  const heroRef = useRef<HTMLAnchorElement>(null);
  const stickyRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scene-0-hero",
        start: "bottom top+=100",
        end: "bottom top",
        scrub: 0.2,
      },
    });
    tl.to(heroRef.current, { opacity: 0, duration: 0.2 })
      .to(stickyRef.current, { opacity: 1, duration: 0.2 }, "<");
    return () => tl.kill();
  }, []);

  const onOpen = () => {
    useLumiStore.getState().setFocusedCta("buy");
    // Dispatch FR-CTA-001 modal-open action
  };

  return (
    <>
      <a ref={heroRef} href="#book" onClick={onOpen}
         className="primary-cta block min-h-[44px] focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-400)] focus-visible:ring-offset-2">
        Book Discovery Call
      </a>
      <a ref={stickyRef} href="#book" onClick={onOpen}
         className="primary-cta sticky-cta min-h-[44px] opacity-0 fixed top-4 right-4 z-[var(--z-cta-sticky)] ...">
        Book Discovery Call
      </a>
    </>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | CTA in SSR HTML, not Drei `<Html>` | curl + grep; canvas DOM tree assertion |
| 2 | Sticky variant fades in after Scene 0 scrolls past | Playwright + scroll + visual diff |
| 3 | Click opens Buy modal (FR-CTA-001 integration) | Playwright + modal presence check |
| 4 | Target ≥ 44×44 at mobile breakpoint (390px wide) | Playwright bounding-box check |
| 5 | z-index: skip-story-pill > sticky-CTA > scenes | Playwright computed-style check |
| 6 | `:focus-visible` ring per FR-A11Y-008 spec | Playwright tab + screenshot |
| 7 | Crossfade duration ≈ 200ms ease-genie | Playwright timeline trace |
| 8 | Not present on `/lite` route | Playwright `goto('/lite')` assertion |
| 9 | Deep-link `?action=book` auto-opens modal after Scene 0 | Playwright with query param |
| 10 | SSR build clean (no window access) | `pnpm -F web build` |
| 11 | GSAP ScrollTrigger cleanup on unmount | Vitest spy on tl.kill |
| 12 | useLumiStore.focusedCta becomes 'buy' on click | Playwright eval |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("CTA visible above fold", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /book discovery call/i }).first()).toBeVisible();
});

test("Sticky CTA appears after scroll", async ({ page }) => {
  await page.goto("/");
  const sticky = page.locator(".sticky-cta");
  await expect(sticky).toHaveCSS("opacity", "0");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 200));
  await page.waitForTimeout(400);
  expect(parseFloat(await sticky.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.8);
});

test("Click sets focusedCta='buy'", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /book discovery call/i }).first().click();
  const focused = await page.evaluate(() => (window as any).__stores?.lumi?.focusedCta);
  expect(focused).toBe("buy");
});

test("Target ≥ 44×44 at 390px wide", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const cta = page.getByRole("link", { name: /book discovery call/i }).first();
  const box = await cta.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);
});

test("not present on /lite", async ({ page }) => {
  await page.goto("/lite");
  expect(await page.locator(".sticky-cta").count()).toBe(0);
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-009 (Scene 0 host), FR-CTA-001 (Buy track + modal).

**Operational:** FR-WEB-002 (Lenis + ScrollTrigger bridge), FR-A11Y-008 (focus ring), FR-A11Y-009 (target size), FR-DS-007 (typography), GSAP 3.

**Downstream blocks:** FR-SCENE-012 (particulate dust — needs scroll context Scene0CTA provides).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Sticky CTA covers skip-story pill (z-index drift) | AC#5 + a11y review | Set z-index via FR-A11Y-002 token; skip-pill highest |
| CTA inside Drei Html accidentally | AC#1 grep | Move to DOM tree; FR-CTA-001 §1 #2 invariant |
| Click doesn't open modal (handler missing) | AC#3 | Wire to FR-CTA-001 modal-open dispatch |
| Mobile target too small (<44 px) | AC#4 | Increase padding; min-h-[44px] CSS class |
| Crossfade duration drift (hardcoded ms) | AC#7 | Import from FR-DS-006 motion module |
| Sticky variant visible on `/lite` | AC#8 | Guard via pathname check or route-level component split |
| Deep-link `?action=book` doesn't open modal | AC#9 | useEffect reads URLSearchParams after Scene 0 mount |
| ScrollTrigger registration leak (HMR) | Perf | tl.kill() in useEffect cleanup |
| SSR build fails (window in render) | AC#10 | Move ScrollTrigger registration to useEffect |
| FocusVisible ring missing (a11y) | AC#6 + axe | Add focus-visible:ring-2 utility per FR-A11Y-008 |
| Modal lazy-load fallback flashes too long | Visual smoke | Verify FR-WEB-006 preload chain triggers on CTA hover |
| Both heroRef and stickyRef visible simultaneously | AC#2 | Verify timeline opacity targets opposite values |

## §8 — Deliverable preview

Loading `/`: hero h1 + caption + "Book Discovery Call" button visible above fold. Scrolling: at ~ 80% Scene 0 progress, hero CTA fades out while sticky variant fades in at top-right. Click anywhere triggers the modal lazy-load with `aria-live="polite"` loading state per FR-CTA-001.

## §9 — Notes

**On future enhancement:** Slice 3 may add CTA copy variants per `?ref=` query (e.g. linked-in campaign shows "Book a 30-min consultation"). Out of scope.

**On analytics:** Click should fire an analytics event via FR-SEO-007 `/api/analytics`. Wiring is in FR-CTA-006; this FR doesn't need to know the analytics schema.

*End of FR-SCENE-011.*
