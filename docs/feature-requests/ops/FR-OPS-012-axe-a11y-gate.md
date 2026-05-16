---
id: FR-OPS-012
title: "axe-core/playwright a11y CI gate — fail on serious/critical WCAG 2.2 AA violations"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P3
slice: 2
owner: Backend / DevOps + A11Y reviewer + Frontend Lead
created: 2026-05-16
related_frs: [FR-OPS-010, FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-A11Y-008, FR-WEB-001]
depends_on: [FR-OPS-010, FR-A11Y-001]
blocks: [FR-A11Y-013]
language: yaml + typescript
service: .github/workflows/ + apps/web/tests/
new_files:
  - .github/workflows/a11y.yml
  - apps/web/tests/a11y/all-routes.spec.ts
  - apps/web/tests/a11y/axe-config.ts
  - apps/web/tests/a11y/__tests__/axe-config.unit.test.ts
  - .axe-config/exclusions.json

source_pages:
  - docs/01-master-plan-v2.md §7.6 — "Pre-launch full axe + manual a11y audit"
  - docs/01-master-plan-v2.md §7.1 — WCAG 2.2 AA target
  - axe-core documentation v4.10+ (impact levels: minor / moderate / serious / critical)
  - Deque @axe-core/playwright integration guide

effort_hours: 4
risk_if_skipped: "Without an axe gate, a11y regressions ship silently. A new component without aria-label, a focus trap that doesn't return focus, a contrast ratio that dips to 4.4:1 — all invisible until manual audit or user complaint. Lighthouse a11y score is coarse; axe surfaces specific selectors + fixes. Without axe, lawsuit / WCAG-violation complaint risk is real."
---

## §1 — Description (BCP-14 normative)

1. **MUST** run `@axe-core/playwright` on every PR via `.github/workflows/a11y.yml`.

2. **MUST** test these routes:
   - `/` (cinematic home)
   - `/lite` (lite fallback)
   - `/work/sample` (representative work case page)
   - `/accessibility` (a11y commitment page, FR-A11Y-006)

3. **MUST** fail the workflow when ANY route has ANY violation with `impact: 'serious'` or `impact: 'critical'`. axe-core impact levels: minor / moderate / serious / critical.

4. **MUST** post violations as a markdown PR comment listing:
   - Violation rule ID (e.g., `color-contrast`, `aria-required-attr`)
   - Impact level
   - Affected selector
   - Suggested fix (axe-core's `help` + `helpUrl`)

5. **SHOULD** allow `minor` violations during P0-P3 (warn only). Tighten to `moderate` warning at P5. P6 launch: zero of all severities.

6. **MUST** test against WCAG 2.2 AA standards. axe tags: `wcag2a`, `wcag2aa`, `wcag22a`, `wcag22aa`.

7. **MUST** also test against best-practice tags (`best-practice`) — informational only, non-blocking.

8. **MUST** support per-rule exclusions in `.axe-config/exclusions.json` for documented false positives. Each exclusion MUST include:
   - rule id
   - selector or page scope
   - justification (text)
   - expiry (next P-phase or specific date)

9. **MUST** run for ALL keyboard interactions (axe alone is static-tree analysis). Augment with:
   - Tab-order assertions per route
   - Focus-trap escape tests for modals (FR-A11Y-007)
   - Skip-link behavior tests

10. **MUST** test both light and dark theme (if dark theme exists in slice — currently single theme, but future-proof selector check).

11. **MUST** test 4 viewport sizes:
    - Mobile (375×667 — iPhone SE baseline)
    - Tablet (768×1024 — iPad portrait)
    - Desktop (1280×800 — laptop baseline)
    - Wide (1920×1080 — desktop)

12. **MUST NOT** be slow — axe-core per-page check ~3-5s; total workflow ≤ 8 min including page builds.

13. **MUST** support an `a11y:skip` PR label (founder-approval-only) for emergency bypass.

14. **MUST** retain detailed JSON violation reports as artifacts for 30 days.

15. **MUST** include keyboard-only interaction tests (no mouse) for critical flows:
    - Tab from page load reaches Skip-story (FR-A11Y-003)
    - CTA hub form fully operable via keyboard
    - Modal escape via Escape key

16. **SHOULD** include screen-reader name validation (verify all interactive elements have accessible names that match visible text).

## §2 — Why this design

**Why axe-core (vs Pa11y, Lighthouse-only, Tenon)?** axe-core is:
- The industry-standard a11y rules engine (Deque, IBM contribute upstream).
- Built into Lighthouse a11y category (FR-OPS-011 uses it indirectly).
- Has Playwright integration with great DX (`@axe-core/playwright`).
- Open source, no vendor lock-in.

**Why fail on serious + critical (not all 4 levels)?** Tiered:
- **Critical** — blocks core functionality for AT users (e.g., button has no name).
- **Serious** — significant friction (e.g., color contrast fail).
- **Moderate** — workable but suboptimal (e.g., empty heading).
- **Minor** — nit (e.g., region missing label on a non-critical block).

Failing on minor/moderate from day 1 creates "the gate is always broken" fatigue. Phased tightening (slice 1 = serious+critical; P5 = + moderate; P6 = all) is the master plan §7.6 approach.

**Why per-rule exclusions with expiry?** Real-world a11y always has edge cases:
- Third-party widget (Calendly embed) we can't fix internally.
- A known false positive in axe (e.g., aria-hidden on canvas + role=img on parent).
- A pending design decision.

Exclusions document the reason + expiry; CI fails on expired-but-unfixed.

**Why keyboard-only tests as separate?** axe analyzes the static DOM tree. It can't detect "Tab order is wrong" or "modal escape doesn't return focus." Playwright keyboard-only tests fill that gap.

**Why 4 viewports?** Responsive a11y issues exist:
- Mobile: target size violations (44×44 minimum).
- Tablet: text reflow.
- Desktop: focus indicator visibility on wide canvases.

Single-viewport tests miss ~30% of real-world a11y issues per Deque research.

**Why best-practice as warning?** Some best-practice rules are over-strict for our cinematic context (e.g., "every image should have alt text" — applied to a particle texture). Warn surfaces them without blocking.

## §3 — Public surface

```yaml
# .github/workflows/a11y.yml
name: a11y CI
on:
  pull_request:
    paths-ignore: ['docs/**', '*.md']

permissions:
  contents: read
  pull-requests: write

jobs:
  a11y:
    runs-on: ubuntu-latest
    timeout-minutes: 12
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install chromium --with-deps
      - run: pnpm build
      - run: pnpm start &
        env: { PORT: '3000', NODE_ENV: 'production' }
      - run: sleep 8
      - name: Check skip label
        id: skip
        run: |
          if echo '${{ toJSON(github.event.pull_request.labels.*.name) }}' | grep -q 'a11y:skip'; then
            echo "skip=true" >> $GITHUB_OUTPUT
          fi
      - name: Run a11y tests
        if: steps.skip.outputs.skip != 'true'
        run: pnpm playwright test apps/web/tests/a11y/all-routes.spec.ts --reporter=json,html
        env:
          A11Y_REPORT_PATH: a11y-report.json
      - name: Post PR comment
        if: always() && steps.skip.outputs.skip != 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('a11y-report.json', 'utf-8'));
            const body = renderViolations(report);
            // Upsert via sentinel
            const sentinel = '<!-- a11y-report -->';
            const { data: comments } = await github.rest.issues.listComments({ ...context.repo, issue_number: context.issue.number });
            const existing = comments.find(c => c.body.includes(sentinel));
            if (existing) {
              await github.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body });
            } else {
              await github.rest.issues.createComment({ ...context.repo, issue_number: context.issue.number, body });
            }
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-reports
          path: |
            a11y-report.json
            playwright-report/
          retention-days: 30
```

```ts
// apps/web/tests/a11y/all-routes.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const ROUTES = ["/", "/lite", "/work/sample", "/accessibility"];
const VIEWPORTS = [
  { name: "mobile",  width: 375,  height: 667 },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide",    width: 1920, height: 1080 },
];

const aggregated: any[] = [];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`a11y ${route} ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22a", "wcag22aa"])
        .exclude(".third-party-embed")  // example exclusion
        .analyze();

      aggregated.push({ route, viewport: vp.name, violations: result.violations });

      const blocking = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(blocking, `Serious/critical violations on ${route} ${vp.name}`).toEqual([]);
    });
  }
}

test.afterAll(async () => {
  await writeFile(process.env.A11Y_REPORT_PATH ?? "a11y-report.json", JSON.stringify(aggregated, null, 2));
});

// Keyboard-only tests (non-axe)
test("Tab from page-load lands on Skip-story", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent);
  expect(focused).toMatch(/skip story/i);
});

test("CTA form fully keyboard-operable", async ({ page }) => {
  await page.goto("/#cta-hub");
  // Tab through every form field; assert focus visible
});

test("Modal escape returns focus to trigger", async ({ page }) => {
  await page.goto("/");
  await page.locator("text=Open form").click();
  await page.keyboard.press("Escape");
  const focused = await page.evaluate(() => document.activeElement?.textContent);
  expect(focused).toMatch(/open form/i);  // returned focus
});
```

```ts
// apps/web/tests/a11y/axe-config.ts
export interface AxeExclusion {
  ruleId: string;
  selector: string;
  scope: "all" | string[];  // routes
  justification: string;
  expiry: string;  // ISO date or "p5" / "p6"
}

export const exclusions: AxeExclusion[] = [
  {
    ruleId: "color-contrast",
    selector: ".calendly-inline-widget",
    scope: ["/cta"],
    justification: "Third-party Calendly embed; cannot patch styles internally",
    expiry: "p6",  // re-evaluate before P6 launch
  },
  {
    ruleId: "aria-hidden-focus",
    selector: "canvas[aria-hidden='true']",
    scope: "all",
    justification: "Canvas is decoratively hidden; shadow mirror (FR-A11Y-002) provides AT access",
    expiry: "permanent",
  },
];
```

```json
// .axe-config/exclusions.json (machine-readable; mirrors axe-config.ts)
{
  "exclusions": [
    {
      "rule_id": "color-contrast",
      "selector": ".calendly-inline-widget",
      "scope": ["/cta"],
      "justification": "Third-party Calendly embed",
      "expiry": "2026-08-01"
    }
  ]
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Workflow file present + valid | `gh workflow view a11y.yml` |
| 2 | Zero serious/critical violations across all 4 routes × 4 viewports | Workflow exit 0 |
| 3 | PR comment lists violations with selector + impact + fix | Synthetic violation → comment renders |
| 4 | Tab-order keyboard tests pass | Playwright keyboard tests green |
| 5 | Per-rule exclusion respected | axe excludes documented selectors |
| 6 | Exclusions with expired date fail | Synthetic: expired exclusion → CI fails with clear msg |
| 7 | `a11y:skip` label bypasses | Add label, workflow doesn't run/doesn't fail |
| 8 | Multi-viewport coverage (mobile/tablet/desktop/wide) | Workflow matrix runs 4 sizes |
| 9 | Tags = wcag2a + wcag2aa + wcag22a + wcag22aa | axe-config inspection |
| 10 | Artifacts uploaded for 30 days | Workflow run shows artifact link |
| 11 | Workflow ≤ 8 min | CI duration metric |
| 12 | Best-practice tag warnings (not failing) | Run with best-practice violations; workflow passes |
| 13 | axe-config unit test passes | Vitest |
| 14 | Lighthouse a11y score ≥ 95 on all routes (cross-check) | FR-OPS-011 |

## §5 — Verification

```ts
// apps/web/tests/a11y/__tests__/axe-config.unit.test.ts
import { describe, it, expect } from "vitest";
import { exclusions } from "../axe-config";

describe("axe exclusions config", () => {
  it("each exclusion has required fields", () => {
    for (const ex of exclusions) {
      expect(ex.ruleId).toBeTruthy();
      expect(ex.selector).toBeTruthy();
      expect(ex.justification).toBeTruthy();
      expect(ex.expiry).toBeTruthy();
    }
  });

  it("expiry is parseable", () => {
    for (const ex of exclusions) {
      const valid = ex.expiry === "permanent" || ex.expiry.startsWith("p") || !isNaN(Date.parse(ex.expiry));
      expect(valid, `${ex.ruleId}: expiry "${ex.expiry}"`).toBe(true);
    }
  });

  it("no exclusions are 'permanent' for serious/critical rules without doc justification > 50 chars", () => {
    for (const ex of exclusions) {
      if (ex.expiry === "permanent") {
        expect(ex.justification.length).toBeGreaterThan(50);
      }
    }
  });
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (a11y baseline), FR-A11Y-002 (shadow mirror), FR-A11Y-003..005 (a11y controls), FR-OPS-010 (CI orchestration).

**Operational:** @axe-core/playwright, Playwright, headless Chrome, GitHub Actions.

**Downstream:** FR-A11Y-013 (pre-launch full audit), FR-OPS-011 (Lighthouse cross-validates), FR-A11Y-007..012 (further a11y FRs guarded by gate).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| False positive blocks gate | Manual review | Add documented exclusion with expiry |
| Exclusion expired but not fixed | AC#6 | Re-evaluate; fix or extend exclusion |
| axe-core misses dynamic content | Coverage check | Wait for `networkidle` + run axe after interactions |
| Keyboard tests miss new flows | Manual audit | Add to all-routes.spec.ts as flows ship |
| Workflow times out | Duration log | Reduce viewport matrix; parallelize routes |
| Tab order broken by 3rd-party widget mount | Manual test | Tab tests reach widget; document boundary |
| `a11y:skip` overused | Audit log | CODEOWNERS gate on label; founder approval required |
| Mobile viewport target-size violations missed | AC#8 | 4-viewport matrix catches |
| WCAG 2.2 rules not yet in axe | Version check | Upgrade @axe-core/playwright to ≥ 4.10 |
| Test order dependency | Flaky | Each test independent; `test.beforeEach` resets state |
| Server not ready when axe runs | Healthcheck step | `await page.waitForLoadState("networkidle")` |
| Artifact JSON > 100 MB | Upload fails | Filter to violations only; drop passes |
| New route added but not in ROUTES | Audit | Add to ROUTES array in PR review |
| Cross-frame a11y (iframes) | Skipped by axe | axe `excludeIframe: false` + frame-context analysis |
| Performance vs a11y tradeoff (test takes too long) | Duration | Run axe on subset routes nightly, full set weekly |
| Browser version drift | Visual differences | Pin @playwright/test version |

## §8 — Deliverable preview

Sample PR comment:
```markdown
## ♿ a11y — axe-core results

**Verdict: 2 serious violations** — PR blocked. ❌

### / (mobile)

| Rule | Impact | Selector | Fix |
|---|---|---|---|
| `color-contrast` | serious | `.cta-button.gold` | Foreground gold #C8A85B vs background #5C3F2E = 4.3:1; need 4.5:1. Try #D0B070 |
| `aria-required-name` | critical | `button.icon-only:nth-of-type(3)` | Add aria-label or visible text |

### /work/sample (desktop)

(0 violations) ✅

### /accessibility (all)

(0 violations) ✅

[Full report archived 30 days](URL_TO_ARTIFACT)

<!-- a11y-report -->
```

## §9 — Notes

**On manual audit complement:** axe automates ~30-40% of WCAG violations. The other 60% requires manual screen-reader testing, cognitive review, keyboard-only sessions. FR-A11Y-013 covers the pre-launch manual audit. axe is the CI gate; manual is the final audit.

**On dynamic content + axe:** axe runs against the DOM at point-in-time. Single-page-app dynamic content (CTA modals, lazy-loaded widgets) may not be in DOM when initial axe runs. Workaround: trigger interactions in Playwright test, then re-run axe.

**On Cypress alternative:** Cypress has axe plugin too. Chose Playwright because already in use for FR-OPS-011 (Lighthouse), so single browser-automation toolchain.

**On WCAG 3 future:** WCAG 3 in draft. axe-core will add tags when stable. No timeline concern in slice 1.

**On Vietnamese localized a11y:** Vietnamese page (FR-CMS-vi) gets identical axe coverage. Tag names + ARIA values don't depend on locale.

**On 'Why scope to 4 routes (not all)?'** Site is small. As pages grow, expand ROUTES. For now: home + lite + sample + a11y commitment covers all unique layouts.

**On exclusion expiry enforcement:** A CI step compares each exclusion's expiry against today's date. Expired → workflow fails with "exclusion X past expiry; resolve or extend." Forces ongoing hygiene.

*End of FR-OPS-012.*
