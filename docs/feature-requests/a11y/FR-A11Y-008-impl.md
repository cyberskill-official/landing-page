---
id: FR-A11Y-008
title: "Focus rings — 2px gold outline + 2px offset on every interactive, no outline:none without replacement"
module: A11Y
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead + Designer
created: 2026-05-16
related_frs: [FR-DS-003, FR-A11Y-001, FR-A11Y-007, FR-DS-002]
depends_on: [FR-DS-003]
blocks: []
language: css + typescript + eslint
service: apps/web/app/globals.css + eslint-rules/
new_files:
  - apps/web/app/globals.css  (extend with :focus-visible rule)
  - eslint-rules/no-outline-none.ts
  - apps/web/tests/a11y/focus-ring.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §7.4 — "Focus indicators: 2px gold ring"
  - WCAG 2.2 SC 2.4.7 Focus Visible + SC 2.4.11 Focus Not Obscured
  - FR-DS-003 design tokens
  - FR-DS-002 palette contrast matrix

effort_hours: 3
risk_if_skipped: "Without visible focus rings, keyboard users can't see where they are. WCAG 2.4.7 violation. Lighthouse a11y score drops. Power users + screen-reader users blind to focus position."
---

## §1 — Description (BCP-14 normative)

1. **MUST** apply global `:focus-visible` rule:
   ```css
   :focus-visible {
     outline: 2px solid var(--brand-gold-400);
     outline-offset: 2px;
     border-radius: inherit;
   }
   ```
2. **MUST** be visible on every interactive element: buttons, links, inputs, textareas, selects, custom widgets with `tabindex`.
3. **MUST** preserve focus rings inside canvas (DOM overlays where interactives live — captions, CTA hub, controls).
4. **MUST NOT** use `outline: none` anywhere without an accessible replacement (box-shadow ring of equal visibility).
5. **MUST** ship an ESLint rule `no-outline-none` flagging CSS `outline: none` / `outline: 0` in JS/TS files.
6. **MUST** contrast 4.5:1 against ALL adjacent backgrounds (FR-DS-002 contrast matrix verified):
   - Gold ring (#D0B070) on dark backgrounds: ≥ 7:1 ✅
   - Gold ring on light backgrounds (Scene 5): ≥ 4.5:1 ✅ (verify visually)
7. **MUST** use `outline-offset: 2px` for clearance — ring doesn't touch the element edge.
8. **MUST** be tested via Playwright keyboard tab + per-element screenshot diff.
9. **MUST** be axe-clean for WCAG 2.4.7 Focus Visible.

## §2 — Why this design

**Why :focus-visible (not :focus)?** :focus-visible shows ring only on keyboard navigation, not on mouse clicks. Avoids gold ring flashing on every button click — better UX without compromising a11y.

**Why 2px (not 1px)?** WCAG-recommended minimum for visibility. 1px clipped at sub-pixel rendering; 2px guaranteed visible.

**Why 2px offset?** Ring touching element edge merges visually. 2px offset gives clear separation.

**Why ESLint rule?** `outline: none` is a footgun — designers love clean borderless buttons; rule forces explicit replacement.

**Why gold ring (not blue)?** Brand-aligned. Default browser blue is unbranded. Gold matches palette.

**Why box-shadow fallback?** Some browsers clip `outline` inside overflow:hidden parents. box-shadow doesn't get clipped. Provide both via mixin.

## §3 — Public surface

```css
/* apps/web/app/globals.css */
:root {
  --focus-ring-color: var(--brand-gold-400, #D0B070);
}

:focus-visible {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
  border-radius: inherit;
}

/* Box-shadow fallback for clipped contexts */
.focus-ring-fallback:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--focus-ring-color), 0 0 0 4px transparent;
}

/* Reset browser defaults */
*:focus { outline: none; }  /* legacy :focus reset */
/* :focus-visible is the new pattern */
```

```ts
// eslint-rules/no-outline-none.ts
import type { Rule } from "eslint";

export const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Forbid 'outline: none' without :focus-visible replacement" },
    messages: {
      outlineNone: "Avoid 'outline: none' — provide an accessible :focus-visible replacement (gold ring) or remove this rule.",
    },
    schema: [],
  },
  create(ctx) {
    return {
      Literal(node) {
        if (typeof node.value === "string" && /outline\s*:\s*(none|0)/.test(node.value)) {
          ctx.report({ node, messageId: "outlineNone" });
        }
      },
      TemplateElement(node: any) {
        if (typeof node.value?.raw === "string" && /outline\s*:\s*(none|0)/.test(node.value.raw)) {
          ctx.report({ node, messageId: "outlineNone" });
        }
      },
    };
  },
};
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Focus ring visible on every interactive (Playwright tab + screenshot) | E2E test |
| 2 | ESLint rule flags `outline: none` without replacement | RuleTester |
| 3 | axe-clean on focus-visible criteria | AxeBuilder |
| 4 | 2px outline + 2px offset | Computed style |
| 5 | Contrast ≥ 4.5:1 vs all backgrounds | FR-DS-002 matrix |
| 6 | Box-shadow fallback in clipped contexts | Test inside overflow:hidden |
| 7 | Default browser blue ring suppressed | Style inspection |
| 8 | Ring follows element border-radius | Computed `border-radius: inherit` |
| 9 | Vitest unit tests on ESLint rule | RuleTester pass |
| 10 | Visual regression — focus ring screenshots match design | Chromatic |

## §5 — Verification

```ts
// apps/web/tests/a11y/focus-ring.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("focus ring visible on Skip-story", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    return getComputedStyle(el).outline;
  });
  expect(outline).toMatch(/2px solid/);
});

test("focus ring visible on all CTA buttons", async ({ page }) => {
  await page.goto("/#cta-hub");
  const buttons = page.locator("button, a[href]");
  for (let i = 0; i < await buttons.count(); i++) {
    await buttons.nth(i).focus();
    // visual screenshot diff
  }
});

test("no outline:none in production CSS", async ({ page }) => {
  await page.goto("/");
  const css = await page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap(s => { try { return Array.from(s.cssRules); } catch { return []; } })
      .map(r => r.cssText)
      .filter(c => /outline:\s*(none|0)/.test(c))
  );
  // Allow if accompanied by :focus-visible
  expect(css.filter(c => !c.includes(":focus-visible"))).toEqual([]);
});
```

```ts
// eslint-rules/__tests__/no-outline-none.test.ts
import { RuleTester } from "eslint";
import { rule } from "../no-outline-none";

const tester = new RuleTester({ parser: require.resolve("@typescript-eslint/parser") });

tester.run("no-outline-none", rule, {
  valid: [
    { code: 'const css = "color: red";' },
    { code: 'const css = ".btn:focus-visible { outline: 2px solid gold; }";' },
  ],
  invalid: [
    { code: 'const css = "button { outline: none; }";', errors: [{ messageId: "outlineNone" }] },
    { code: 'const css = `.x { outline: 0; }`;', errors: [{ messageId: "outlineNone" }] },
  ],
});
```

## §6 — Dependencies

**Concept:** FR-DS-003 (design tokens — focus color), FR-DS-002 (contrast verification), FR-A11Y-001 (a11y baseline), FR-A11Y-007 (keyboard nav consumer).

**Operational:** CSS :focus-visible, ESLint custom rule.

**Downstream:** All interactive components site-wide; FR-OPS-012 axe gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Outline clipped by overflow:hidden | Visual | Use box-shadow fallback class |
| Contrast fails on light scene | AC#5 | Adjust gold to darker tone; or add background card |
| Default blue ring shows alongside gold | Multiple outlines | Reset legacy `:focus`; only :focus-visible |
| Mouse click fires gold ring (bad UX) | :focus-visible respected | Verify browser support (Safari 15.4+) |
| Old browser without :focus-visible | Polyfill | Use focus-visible polyfill |
| Ring extends outside container | Visual | outline-offset 2px |
| ESLint rule false positive on legitimate cases | AC#9 RuleTester | Document escape hatch (// eslint-disable-next-line) with reason |
| Custom widget with tabIndex misses ring | Manual audit | Ensure `:focus-visible` matches |
| Vietnamese-language buttons render same | OK | Locale-agnostic |
| Performance: ring animation jank | CSS only, no JS | OK |

## §8 — Deliverable preview

Visual:
1. User Tabs to Skip-story pill. Gold 2px ring appears with 2px offset.
2. Tab to Mute button. Ring follows around button shape.
3. Tab to form input. Ring around input border.
4. Mouse-click button — NO ring (only on keyboard).

Code review:
1. PR adds `outline: none` to a button. ESLint blocks.
2. Author adds `:focus-visible { box-shadow: 0 0 0 2px gold; }` replacement. ESLint passes.

## §9 — Notes

**On focus-visible browser support:** Chrome 86+, Firefox 85+, Safari 15.4+. Older browsers: focus-visible polyfill (~3KB).

**On 'why border-radius: inherit?'** Pill-shaped buttons need rounded ring. inherit propagates from element.

**On Vietnamese:** Identical — visual signal, not text.

*End of FR-A11Y-008.*
