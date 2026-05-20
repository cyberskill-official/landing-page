---
id: FR-A11Y-007
title: "Keyboard nav cycle — Skip story → header → scene anchors → footer, with focus trap for modals + Escape return"
module: A11Y
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead + A11Y reviewer
created: 2026-05-16
related_frs: [FR-A11Y-001, FR-A11Y-003, FR-A11Y-008, FR-CTA-005, FR-SCENE-020]
depends_on: [FR-A11Y-003]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/navigation/ + apps/web/lib/a11y/
new_files:
  - apps/web/components/navigation/NextSceneButton.tsx
  - apps/web/lib/a11y/use-focus-trap.ts
  - apps/web/tests/a11y/keyboard-nav.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §7.4 — "Keyboard nav cycle + focus trap"
  - WCAG 2.2 SC 2.1.1 (Keyboard) / 2.1.2 (No Keyboard Trap) / 2.4.3 (Focus Order)

effort_hours: 4
risk_if_skipped: "Keyboard users (motor-disabled, screen-reader users, power users) can't reach scenes without wheel/trackpad. Forces mouse — breaks ~5% audience entirely. WCAG 2.1.1 violation."
---

## §1 — Description (BCP-14 normative)

1. **MUST** define Tab order: Skip-story (FR-A11Y-003) → header toggles (mute/skip3D/language) → scene NextSceneButtons → in-scene interactives → footer links.
2. **MUST** ship `<NextSceneButton>` per scene — keyboard-focusable "Next scene ↓" button that scrolls to + focuses next scene anchor.
3. **MUST NOT** require wheel/trackpad scroll for keyboard users.
4. **MUST** include `<FocusTrap>` for modal-style CTA forms (FR-CTA-005) — Tab cycles within modal; Escape exits + returns focus to trigger.
5. **MUST** tag landmarks: `<nav>`, `<main>`, `<footer>` properly + aria-labels.
6. **MUST** ship `useFocusTrap(active, onEscape)` hook handling:
   - Capture focusables.
   - Cycle Tab + Shift+Tab.
   - Return focus on cleanup.
   - Escape → onEscape.
7. **MUST** scene `<section id="scene-N" tabIndex="-1">` so programmatic focus works.
8. **MUST** be Playwright-tested via keyboard-only flow (zero mouse events).
9. **MUST** localize button labels via FR-CMS-007.
10. **MUST NOT** show NextSceneButton on mouse-only (visible only on keyboard focus per `:focus-visible`).

## §2 — Why this design

**Why NextSceneButton?** Scroll-snap relies on wheel input. Keyboard users have no scroll-snap. Button bridges.

**Why focus trap for modals?** Without trap, Tab escapes to canvas. User loses context. Cannot return without reverse-Tab through entire page.

**Why focus-return on close?** Standard a11y pattern. Without it, focus lands at body start.

**Why useFocusTrap hook (not lib)?** Lightweight; testable. focus-trap-react adds ~6KB; our needs are simple.

**Why visible-on-focus-only?** Mouse users have wheel; button is visual clutter. Keyboard users need the button. `:focus-visible` is the right toggle.

## §3 — Public surface

```ts
import { useEffect, useRef } from "react";

export function useFocusTrap(active: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    triggerRef.current = document.activeElement as HTMLElement;
    const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"
    ));
    if (focusable.length) focusable[0].focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onEscape?.(); }
      if (e.key !== "Tab") return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [active, onEscape]);

  return containerRef;
}
```

```tsx
"use client";
import { useTranslations } from "next-intl";

export function NextSceneButton({ targetSceneId }: { targetSceneId: number }) {
  const t = useTranslations("a11y");
  function handle(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    const target = document.getElementById(`scene-${targetSceneId}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => target.focus({ preventScroll: true }), 600);
  }
  return (
    <a href={`#scene-${targetSceneId}`} onClick={handle}
       onKeyDown={e => (e.key === "Enter" || e.key === " ") && handle(e)}
       className="next-scene-button">
      {t("next_scene")}
    </a>
  );
}
```

```css
.next-scene-button {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 9999px;
  background: rgba(44,31,26,0.85); color: var(--text-gold);
  font-size: 14px; text-decoration: none;
  opacity: 0; transition: opacity 200ms;
}
.next-scene-button:focus-visible {
  opacity: 1;
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Tab order: Skip → header → scene buttons → footer | Playwright keyboard sweep |
| 2 | NextSceneButton per scene | DOM count |
| 3 | Keyboard reaches scenes 1-6 without mouse | Playwright |
| 4 | Focus trap in CTA modal — Tab cycles | Playwright |
| 5 | Escape closes modal + returns focus | Playwright |
| 6 | No mouse needed | Playwright assertion |
| 7 | Landmarks tagged | DOM |
| 8 | Focus visible on every interactive | Visual |
| 9 | useFocusTrap unit tests pass | pnpm vitest |
| 10 | NextSceneButton visible only on focus | :focus-visible CSS |
| 11 | axe-clean | AxeBuilder |
| 12 | Vietnamese label translated | next-intl |

## §5 — Verification

```ts
import { test, expect } from "@playwright/test";

test("Tab reaches Skip → header → scene 1 → footer", async ({ page }) => {
  await page.goto("/");
  const reached: string[] = [];
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    const text = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 30));
    reached.push(text ?? "");
  }
  expect(reached[0]).toMatch(/skip story/i);
});

test("Focus trap in modal cycles + Escape returns", async ({ page }) => {
  await page.goto("/#cta-hub");
  await page.locator("button:has-text('Partner')").click();
  await page.keyboard.press("Escape");
  // assert modal closed + focus on Partner button
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (a11y baseline), FR-A11Y-003 (Skip-story first focusable), FR-A11Y-008 (focus rings), FR-CTA-005 (modal forms), FR-SCENE-020 (scene anchor IDs).

**Operational:** Browser focus APIs, ref-based focus management.

**Downstream:** FR-A11Y-012 audit; FR-OPS-012 axe gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Focus escapes modal | AC#4 | Trap captures Tab + Shift+Tab |
| Focus return broken | AC#5 | triggerRef restored on cleanup |
| NextSceneButton hidden when focused | AC#10 | `:focus-visible` opacity 1 |
| Scene anchor missing | AC#2 | Every section has `id` + `tabIndex="-1"` |
| Tab skips scene anchor | DOM order | Programmatic focus on click |
| Landmark missing | AC#7 | aria-label on header/footer |
| Modal contains 0 focusable | Edge case | Modal close button always present |
| Multiple modals open (race) | One at a time | CTA hub enforces |
| Programmatic focus jumps scroll | scrollIntoView opt | focus({preventScroll:true}) |
| Vietnamese label too long | Visual | nowrap; ellipsis OK |
| Focus-visible polyfill needed (old browsers) | Manual | Use focus-visible polyfill |
| Modal closes mid-Tab | Race | Detect via active state in handleKey |

## §8 — Deliverable preview

Keyboard flow:
1. Page loads. Tab → Skip-story (gold ring).
2. Tab → Mute / Skip3D / Lang switches.
3. Tab → "Next scene ↓" appears on Scene 0.
4. Enter → smooth scroll to Scene 1, focus on Scene 1 heading.
5. Continue → reaches Scene 6 / footer.

Modal flow:
1. Tab to Partner CTA. Enter → modal opens, focus on first form field.
2. Tab cycles. Tab from last field → first field.
3. Escape → modal closes, focus returns to Partner button.

## §9 — Notes

**On focus-visible vs focus:** :focus-visible shows ring on keyboard nav only, not mouse — better UX.

**On future arrow-key shortcuts:** Down = next scene. Slice 2 enhancement.

**On Vietnamese label:** "Cảnh tiếp theo ↓" — next-intl key.

*End of FR-A11Y-007.*
