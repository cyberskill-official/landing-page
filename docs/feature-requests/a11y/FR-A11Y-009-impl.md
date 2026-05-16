---
id: FR-A11Y-009
title: "Target size 44×44 (WCAG 2.5.5 AAA) for all interactive controls — bounding-box gate + hit-area audit"
module: A11Y
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead + Designer
created: 2026-05-16
related_frs: [FR-CTA-001, FR-A11Y-001, FR-A11Y-003, FR-A11Y-004, FR-DS-003]
depends_on: [FR-CTA-001]
blocks: []
language: css + typescript
service: apps/web/app/globals.css + apps/web/tests/a11y/
new_files:
  - apps/web/tests/a11y/target-size.e2e.spec.ts
  - apps/web/app/globals.css  (extend with min-target-size utility)

source_pages:
  - docs/01-master-plan-v2.md §7.5 — "Target size 44×44 AAA"
  - WCAG 2.2 SC 2.5.5 Target Size (Enhanced AAA) + SC 2.5.8 Target Size Minimum (AA, 24×24)
  - Apple HIG + Google Material Design target size recommendations

effort_hours: 2
risk_if_skipped: "Mis-tap rate on mobile spikes from 3% to ~15% when targets < 44px. User frustration → bounce. WCAG 2.5.8 (AA) requires 24×24 minimum; we exceed at 44 (AAA) for premium UX. Master plan §7.5 mandate."
---

## §1 — Description (BCP-14 normative)

1. **MUST** every CTA + interactive control ≥ **44×44 px** on all breakpoints (320px through 1920px).
2. **MUST** apply via CSS utility class `.min-target` (`min-width: 44px; min-height: 44px`).
3. **MUST** verify via Playwright bounding-box assertion across all routes.
4. **MUST NOT** allow padding-only target expansion that doesn't include hit-area:
   - Bad: 32px text + 6px padding = visual 44px BUT hit-area extends only 32px (HTML behavior).
   - Good: 44px min-height + centered text via flex.
5. **MUST** for icon-only buttons (mute, lang, skip3D), the visible icon may be smaller (24×24) but `<button>` element is 44×44 minimum.
6. **MUST** support hit-area expansion via `::before` pseudo-element when visual button is smaller than 44×44:
   ```css
   .small-icon-button::before {
     content: "";
     position: absolute;
     inset: -8px; /* expand to 44+ */
   }
   ```
7. **MUST** be axe-clean for WCAG 2.5.5/2.5.8.
8. **MUST** ship Playwright integration test that enumerates all `<button>`, `<a>`, `<input>` on each route + asserts bounding-box ≥ 44×44.

## §2 — Why this design

**Why 44×44 (AAA, not 24×24 AA)?** Master plan §7.5 chose AAA over AA — premium UX positioning. Apple HIG also recommends 44pt. Below 44 = measurable mis-tap rate increase.

**Why min-target utility (not per-component)?** Centralized; one source. Per-component sizing drifts.

**Why hit-area = visual area (not larger)?** Larger hit area surprises users (clicking "near" a button activates it). Visual = hit is the right contract.

**Why ::before pseudo-element for small icons?** Some icon buttons (corner avatar, small toggles) need to look smaller. Pseudo-element expands hit area invisibly.

## §3 — Public surface

```css
/* apps/web/app/globals.css */
.min-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.small-icon-button {
  position: relative;
}
.small-icon-button::before {
  content: "";
  position: absolute;
  inset: -8px;  /* 28px visual + 16px expanded = 44px hit-area */
  cursor: pointer;
}
```

```tsx
// All button/link variants in design system get .min-target
import { ButtonHTMLAttributes } from "react";

export function Button({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-target ${className}`} {...rest}>{children}</button>;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | All CTAs ≥ 44×44 on mobile (375px) + desktop (1280px) | Playwright boundingBox |
| 2 | Hit area extends to visual border (not pseudo-expansion misalignment) | Visual test |
| 3 | Icon-only buttons have 44×44 wrapper | DOM inspection |
| 4 | ::before hit-area expansion when needed | CSS check |
| 5 | axe-clean WCAG 2.5.5 + 2.5.8 | AxeBuilder |
| 6 | E2E test enumerates all routes + interactives | pnpm playwright |
| 7 | Vietnamese-text buttons (longer copy) still ≥ 44 | /vi smoke |
| 8 | No padding-only target expansion regressions | Code review |

## §5 — Verification

```ts
// apps/web/tests/a11y/target-size.e2e.spec.ts
import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/lite", "/work/sample", "/accessibility"];
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "desktop", width: 1280, height: 800 },
];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`target size 44×44 on ${route} ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      const interactives = page.locator("button, a[href], input:not([type='hidden']), textarea, select");
      const count = await interactives.count();
      for (let i = 0; i < count; i++) {
        const el = interactives.nth(i);
        const visible = await el.isVisible();
        if (!visible) continue;
        const box = await el.boundingBox();
        if (!box) continue;
        expect.soft(box.width).toBeGreaterThanOrEqual(44);
        expect.soft(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
```

## §6 — Dependencies

**Concept:** FR-CTA-001 (CTA hub host), FR-DS-003 (design tokens), FR-A11Y-001 (a11y baseline), FR-A11Y-003/004 (controls).

**Operational:** CSS min-width/min-height, Playwright boundingBox.

**Downstream:** All interactive components site-wide; FR-OPS-012 axe gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Decorative button < 44 | AC#1 | Add .min-target class or extend via ::before |
| Padding-only expansion regression | AC#8 | Use min-width/min-height, not padding alone |
| Icon visible too small | UX | Pseudo-element hit-area; visual icon 24px wrapper 44px |
| Mobile keyboard pushes button off-screen | OK | Min-size doesn't break flex layouts |
| Vietnamese label too long for 44×44 | AC#7 | Allow wider; min-height stays 44 |
| Touch + hover both fire | OK | onClick handles both |
| Test enumerates hidden elements | Filter | Skip if !visible |
| Custom Drei controls bypass min-target | Manual audit | Wrap in min-target div |
| Performance: testing 100+ controls per route | Parallelize | expect.soft allows continuation |
| iOS Safari rendering rounding | Visual smoke | Use box.width/height (browser-reported) |

## §8 — Deliverable preview

User taps "Schedule" CTA on iPhone:
- Visual button: 44×44 px (padding around 14px text).
- Tap success rate: 99%+.

User Tabs through site:
- Every focusable element passes target-size test.
- Playwright report: 0 violations.

## §9 — Notes

**On AAA vs AA threshold:** AA is 24×24. AAA is 44×44. We chose AAA for premium UX. Could relax to AA for ultra-tight space if budget constrained — out of slice 1 scope.

**On Vietnamese:** Some Vietnamese labels run longer ("Đi tới phần liên hệ" vs "Skip to CTA"). Width may grow; height stays 44.

**On future densification:** Compact-mode design system variant for power users could relax to 32×32. Slice 3.

*End of FR-A11Y-009.*
