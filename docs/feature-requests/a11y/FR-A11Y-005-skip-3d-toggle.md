---
id: FR-A11Y-005
title: "'Skip 3D entirely' toggle — /lite redirect with localStorage persistence + back-to-cinematic link"
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
related_frs: [FR-A11Y-001, FR-A11Y-003, FR-A11Y-004, FR-WEB-009, FR-SCENE-009, FR-CMS-007]
depends_on: [FR-A11Y-003, FR-A11Y-001, FR-WEB-009]
blocks: [FR-CMS-007]
language: typescript 5.6 + react 19
service: apps/web/components/a11y/
new_files:
  - apps/web/components/a11y/Skip3DToggle.tsx
  - apps/web/components/a11y/BackToCinematicLink.tsx
  - apps/web/components/a11y/__tests__/Skip3DToggle.unit.test.tsx
  - apps/web/tests/a11y/skip-3d.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §2.3 — "Skip 3D entirely toggle, persisted in localStorage"
  - docs/01-master-plan-v2.md §7.5 — "/lite route as cinematic-free fallback"
  - WCAG 2.2 SC 2.3.3 — Animation from Interactions (user can disable)
  - WCAG 2.2 SC 1.4.13 — Content on Hover or Focus (escape mechanism)

effort_hours: 2
risk_if_skipped: "Some users cannot use the 3D cinematic at all — vestibular-disorder sufferers, slow devices, low bandwidth, focus-aware low-vision users. Without an escape hatch to /lite, these users either bounce or struggle. WCAG SC 2.3.3 violation = legal risk. FR-CMS-007 /lite route needs the entry path."
---

## §1 — Description (BCP-14 normative)

1. **MUST** be a `<button>` in the page header, beside FR-A11Y-003 SkipStoryPill and FR-A11Y-004 MuteToggle. Vertically aligned trio of always-visible a11y controls.

2. **MUST** on click:
   - Set `localStorage.cyberskill_lite_pref = '1'`.
   - Navigate the user to `/lite` route.
   - Announce "Switching to lite mode" via aria-live.

3. **MUST** on subsequent visits to `/` (root), if `localStorage.cyberskill_lite_pref === '1'`, auto-redirect to `/lite`. Implemented client-side in FR-WEB-009 lite-redirect logic.

4. **MUST** auto-redirect MUST NOT loop on `/lite` itself — guard with origin path check.

5. **MUST** include a 'Back to cinematic' link on /lite that:
   - Clears `localStorage.cyberskill_lite_pref` (sets to empty string or removes key).
   - Navigates back to `/`.
   - Announces "Switching to cinematic mode" via aria-live.

6. **MUST** be ≥ 44×44 px (WCAG SC 2.5.8) on all breakpoints.

7. **MUST** show 2px gold focus ring (FR-A11Y-001 / FR-A11Y-008).

8. **MUST** include visible text label ("Skip 3D" or longer "Switch to lite mode") + icon (cinematic-vs-document icon variant).

9. **MUST** support keyboard activation (Enter or Space).

10. **MUST** fire analytics event `lite_mode_toggled` with `{from: 'cinematic'|'lite', to: 'cinematic'|'lite', source: 'click'|'keyboard'|'auto_redirect'}`.

11. **MUST** respect `prefers-reduced-motion` from the OS level — if user has the system preference set on first visit, AUTO set `cyberskill_lite_pref = '1'` and redirect to `/lite` on first load. This makes the OS-level preference authoritative.

12. **MUST** be discoverable without first toggling Skip-story. Pill placement is independent.

13. **MUST NOT** require JS to function — fallback `<a href="/lite">` works even with JS disabled. JS adds localStorage + auto-redirect; HTML provides baseline.

14. **MUST** include screen-reader-only `<noscript>` fallback: "JavaScript disabled — visit /lite manually for non-3D version."

15. **SHOULD** show a one-time confirmation toast on /lite for first-time visitors: "You're now in lite mode. [Back to cinematic]".

16. **MUST NOT** reset on session-end. localStorage means preference persists across browser restarts, days, months.

## §2 — Why this design

**Why a separate toggle (not just /lite route)?** Discoverability. /lite as a URL alone is invisible unless the user knows to type it. Toggle in header announces "this option exists."

**Why localStorage (not cookie or URL param)?** Three reasons:
1. **Privacy** — localStorage is per-origin, no cross-site leakage.
2. **Speed** — synchronous read on page load (cookies require parsing all cookies).
3. **Simplicity** — no GDPR cookie-banner concern since it's pure preference data (not tracking).

**Why auto-redirect on subsequent visits?** Returning user expects "the same site they last saw." If they chose /lite once, /lite is what they want next time.

**Why guard against loop?** Without `if (pathname === '/')` check, the redirect logic on /lite would still fire (because lite_pref === '1') → infinite loop. Path-aware redirect prevents.

**Why prefers-reduced-motion auto-set?** OS-level preference is a stronger signal than per-site choice. A user with vestibular disorder has set their OS to "Reduce motion"; they expect every site to respect that immediately, without having to discover and click site-specific toggles. Master plan §7.5 codifies this.

**Why NO-JS fallback?** Some screen-readers (NVDA + IE legacy modes), some browsers in restricted environments. `<a href="/lite">` ensures the escape hatch works for everyone.

**Why one-time confirmation toast?** Discoverability of "Back to cinematic." Without the toast, user on /lite might think they're stuck. Toast announces the reversal path.

**Why no expiry on the preference?** vestibular preferences don't change. "I chose lite mode" should mean "lite mode forever, until I undo it." Expiry would feel like the site forgot the user.

## §3 — Public surface

```tsx
// apps/web/components/a11y/Skip3DToggle.tsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import { CinematicIcon, LiteIcon } from "@/components/icons";

export function Skip3DToggle() {
  const t = useTranslations("a11y");
  const router = useRouter();
  const liveRegionRef = useRef<HTMLSpanElement>(null);

  function handleClick(e: React.MouseEvent | React.KeyboardEvent, source: "click" | "keyboard") {
    e.preventDefault();
    localStorage.setItem("cyberskill_lite_pref", "1");
    trackEvent("lite_mode_toggled", { from: "cinematic", to: "lite", source });
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t("switching_to_lite");
      setTimeout(() => { if (liveRegionRef.current) liveRegionRef.current.textContent = ""; }, 2000);
    }
    router.push("/lite");
  }

  return (
    <>
      <a
        href="/lite"  // NO-JS fallback
        onClick={e => handleClick(e, "click")}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleClick(e, "keyboard"); }}
        aria-label={t("skip_3d_aria_label")}  // "Switch to lite mode (no 3D)"
        className="skip-3d-toggle-pill"
      >
        <LiteIcon aria-hidden="true" />
        <span>{t("skip_3d_label")}</span>  {/* "Skip 3D" */}
      </a>
      <span ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="visually-hidden" />
    </>
  );
}
```

```tsx
// apps/web/components/a11y/BackToCinematicLink.tsx (rendered on /lite route)
"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function BackToCinematicLink() {
  const t = useTranslations("a11y");
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    localStorage.removeItem("cyberskill_lite_pref");
    trackEvent("lite_mode_toggled", { from: "lite", to: "cinematic", source: "click" });
    router.push("/");
  }

  return (
    <a
      href="/"
      onClick={handleClick}
      className="back-to-cinematic-link"
    >
      {t("back_to_cinematic")}  {/* "Back to cinematic" */}
    </a>
  );
}
```

```ts
// apps/web/lib/a11y/lite-redirect.ts (consumed by FR-WEB-009)
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useLiteRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;  // never redirect on /lite or other routes

    const litePref = localStorage.getItem("cyberskill_lite_pref");
    const osReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (osReducedMotion && !litePref) {
      // First visit + OS reduced-motion → auto set + redirect
      localStorage.setItem("cyberskill_lite_pref", "1");
    }

    if (litePref === "1" || osReducedMotion) {
      router.replace("/lite");
    }
  }, [pathname, router]);
}
```

```tsx
// apps/web/app/layout.tsx (toggle in header)
<header>
  <SkipStoryPill />
  <MuteToggle />
  <Skip3DToggle />
</header>
```

```tsx
// apps/web/app/lite/layout.tsx (lite layout with back link)
<header>
  <BackToCinematicLink />
</header>
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Click → /lite + localStorage set to '1' | Playwright: click, assert pathname `/lite`, localStorage.cyberskill_lite_pref === '1' |
| 2 | Subsequent visit to / auto-redirects | Set localStorage, visit /, assert redirect to /lite |
| 3 | NO infinite redirect (lite stays lite) | Visit /lite directly, assert no redirect loop |
| 4 | Back-to-cinematic clears pref + returns to / | Click on /lite, assert localStorage cleared + path / |
| 5 | OS prefers-reduced-motion → auto-set lite on first visit | Mock media query, first visit, assert auto-redirect to /lite |
| 6 | ≥ 44×44 target size | boundingBox |
| 7 | Keyboard Enter/Space activates | Playwright |
| 8 | aria-live announcement on toggle | Listen + assert |
| 9 | Analytics event with correct payload | Mock trackEvent |
| 10 | NO-JS fallback (anchor still works) | Disable JS in Playwright; click; assert /lite reached |
| 11 | Toast confirmation on first /lite visit | Visual or DOM check |
| 12 | 2px gold focus ring | Visual regression |
| 13 | Vitest unit tests pass | `pnpm vitest run` |
| 14 | Playwright E2E tests pass | `pnpm playwright test` |
| 15 | axe-core: 0 violations | AxeBuilder |

## §5 — Verification

```tsx
// apps/web/components/a11y/__tests__/Skip3DToggle.unit.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Skip3DToggle } from "../Skip3DToggle";

describe("Skip3DToggle", () => {
  beforeEach(() => { localStorage.clear(); });

  it("renders as anchor with /lite href (NO-JS fallback)", () => {
    render(<Skip3DToggle />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/lite");
  });

  it("sets localStorage on click", () => {
    render(<Skip3DToggle />);
    fireEvent.click(screen.getByRole("link"));
    expect(localStorage.getItem("cyberskill_lite_pref")).toBe("1");
  });

  it("fires analytics with source=click", () => {
    const trackMock = vi.fn();
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    render(<Skip3DToggle />);
    fireEvent.click(screen.getByRole("link"));
    expect(trackMock).toHaveBeenCalledWith("lite_mode_toggled", expect.objectContaining({ source: "click" }));
  });

  it("announces 'Switching to lite mode' via aria-live", () => {
    render(<Skip3DToggle />);
    fireEvent.click(screen.getByRole("link"));
    const live = document.querySelector("[aria-live='polite']");
    expect(live?.textContent).toMatch(/switching to lite/i);
  });

  it("Space key toggles", () => {
    render(<Skip3DToggle />);
    const link = screen.getByRole("link");
    fireEvent.keyDown(link, { key: " " });
    expect(localStorage.getItem("cyberskill_lite_pref")).toBe("1");
  });

  it("min 44x44 target size", () => {
    render(<Skip3DToggle />);
    const link = screen.getByRole("link");
    const cs = getComputedStyle(link);
    expect(parseInt(cs.minHeight)).toBeGreaterThanOrEqual(44);
  });
});

describe("useLiteRedirect", () => {
  it("redirects to /lite when localStorage pref = '1'", () => {
    localStorage.setItem("cyberskill_lite_pref", "1");
    // mock pathname = '/', useRouter
    // assert router.replace called with '/lite'
  });

  it("does NOT redirect when on /lite", () => {
    localStorage.setItem("cyberskill_lite_pref", "1");
    // mock pathname = '/lite'
    // assert router.replace NOT called
  });

  it("auto-sets pref when OS prefers-reduced-motion", () => {
    Object.defineProperty(window, "matchMedia", {
      value: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
      configurable: true,
    });
    // mock pathname = '/'
    // first call should setItem
    expect(localStorage.getItem("cyberskill_lite_pref")).toBe("1");
  });
});

describe("BackToCinematicLink", () => {
  it("clears pref + navigates to /", () => {
    localStorage.setItem("cyberskill_lite_pref", "1");
    // render, click, assert localStorage cleared + router.push('/') called
  });
});
```

```ts
// apps/web/tests/a11y/skip-3d.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("Skip 3D click sets localStorage + navigates to /lite", async ({ page }) => {
  await page.goto("/");
  await page.locator("text=Skip 3D").click();
  await expect(page).toHaveURL(/\/lite$/);
  const pref = await page.evaluate(() => localStorage.getItem("cyberskill_lite_pref"));
  expect(pref).toBe("1");
});

test("subsequent visit to / redirects to /lite", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("cyberskill_lite_pref", "1"));
  await page.goto("/");
  await expect(page).toHaveURL(/\/lite$/);
});

test("no infinite redirect on /lite", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("cyberskill_lite_pref", "1"));
  await page.goto("/lite");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/lite$/);  // stays on /lite
});

test("Back-to-cinematic clears pref + returns to /", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("cyberskill_lite_pref", "1"));
  await page.goto("/lite");
  await page.locator("text=Back to cinematic").click();
  await expect(page).toHaveURL("/");
  const pref = await page.evaluate(() => localStorage.getItem("cyberskill_lite_pref"));
  expect(pref).toBeNull();
});

test("OS reduced-motion auto-redirects on first visit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page).toHaveURL(/\/lite$/);
});

test("NO-JS fallback — anchor still navigates", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.locator("a[href='/lite']").click();
  await expect(page).toHaveURL("/lite");
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (a11y baseline tokens), FR-WEB-009 (lite-mode runtime — consumes the pref and renders the lite route), FR-CMS-007 (/lite content rendering).

**Operational:** Next.js App Router (`useRouter`, `usePathname`), next-intl for labels, FR-OPS-014 analytics module.

**Downstream:** FR-CMS-007 (lite-mode CMS content), FR-A11Y-002 (shadow mirror visible on /lite), FR-OPS-012 axe gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Infinite redirect /lite → /lite | AC#3 | Path check in useLiteRedirect: `if (pathname !== '/') return` |
| localStorage write fails (private mode) | Set throws | Fall back to in-memory state; user re-toggles per session |
| Auto-redirect ignores prefers-reduced-motion (regression) | AC#5 | matchMedia check on first useLiteRedirect call |
| NO-JS fallback broken | AC#10 | `<a href="/lite">` works without onClick |
| Toggle hidden when offline | AC missing | Toggle independent of network; always shown |
| Toast bug: shows on every /lite visit | AC#11 | Set sessionStorage flag; show only first time per session |
| Auto-redirect breaks SEO crawl | Googlebot sees redirect | Allow Googlebot to crawl both /, /lite via robots.txt; meta-canonical points to / |
| Back-to-cinematic doesn't clear pref | AC#4 | localStorage.removeItem('cyberskill_lite_pref') in handler |
| User with OS reduced-motion CAN'T get to cinematic | After auto-redirect, want to opt back into cinematic | Back-to-cinematic clears pref + overrides OS for the session |
| Analytics fires multiple times | Multiple click handlers | Single event handler; debounce if needed |
| router.replace vs router.push semantics | History pollution | replace on auto-redirect (back button works), push on user click |
| useEffect runs twice in dev mode (React strict) | Local-only annoyance | Idempotent operations; no harm in production |
| Toggle obscured by Skip-story focus indicator | Visual stack | Gap between pills; z-index neutral |
| Vietnamese label "Bỏ qua 3D" cultural fit | Localization review | Verify with founder |
| pref persisted across logged-in / anonymous user contexts | Privacy concern | Pref is per-origin localStorage; not cross-user |

## §8 — Deliverable preview

User experience scenarios:

**Cinematic user discovering /lite:**
1. User on `/` sees [Skip 3D] in header.
2. Clicks. Page navigates to `/lite`. Toast: "You're now in lite mode."
3. Refreshes — stays on /lite (auto-redirect because pref).
4. Closes browser, comes back next day. Direct to /lite.
5. Decides to try cinematic again. Clicks "Back to cinematic". Lands on `/` (cinematic).

**OS reduced-motion user (first visit ever):**
1. User has macOS "Reduce motion" enabled OR Windows "Show animations" disabled.
2. User goes to cyberskill.world.
3. Page auto-detects → silently redirects to /lite. No surprise animation.
4. Toast: "You're now in lite mode. [Back to cinematic]"
5. User satisfied; never sees the 3D unless they explicitly want to.

**Lit-only user:**
1. User on /lite. Sees [Back to cinematic] link top-right.
2. Clicks. Lands on cinematic /. Sees [Skip 3D] in header again.
3. Auto-redirect cleared — can freely move between modes.

## §9 — Notes

**On OS prefers-reduced-motion authority:** This is the strongest user signal. We override it only when user explicitly clicks "Back to cinematic" (one-way override; we don't re-impose lite mode after that).

**On /lite vs /accessibility route:** /lite is the no-3D variant. /accessibility is a separate page documenting our a11y commitments (FR-A11Y-006 scope). Different concerns.

**On future: a11y settings panel:** Could expand to a settings page with mute / lite / motion / contrast preferences. Slice 2 candidate.

**On Vietnamese label:** "Bỏ qua 3D" (Skip 3D), "Quay lại chế độ điện ảnh" (Back to cinematic).

**On data privacy:** localStorage preference is anonymous and per-origin. Not synced to any backend; not tied to any account. GDPR-clean.

**On reduced-motion OS detection edge cases:** Windows 7 / older OS may not expose the preference. Defensive: if matchMedia fails, default to cinematic. User can manually opt to /lite.

*End of FR-A11Y-005.*
