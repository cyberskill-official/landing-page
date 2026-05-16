---
id: FR-OPS-011
title: "Lighthouse CI on every PR — CWV regression gate + median-of-3 reporting"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P3
slice: 2
owner: Backend / DevOps + Frontend Lead
created: 2026-05-16
related_frs: [FR-OPS-010, FR-OPS-012, FR-PERF-001, FR-PERF-010, FR-WEB-001, FR-A11Y-001]
depends_on: [FR-OPS-010]
blocks: [FR-PERF-001, FR-PERF-010]
language: yaml + json + node
service: .github/workflows/ + apps/web/
new_files:
  - .github/workflows/lighthouse.yml
  - apps/web/lighthouserc.json
  - .github/lighthouse/budget.json
  - apps/web/scripts/lighthouse-summary.mjs

source_pages:
  - docs/01-master-plan-v2.md §6.1 — Core Web Vitals targets (LCP 2.5s / INP 200ms / CLS 0.1 / FPS 60)
  - docs/01-master-plan-v2.md §6.3 — perf budgets per device tier
  - Google Lighthouse documentation on lighthouserc + budgets

effort_hours: 5
risk_if_skipped: "Without a CI Lighthouse gate, perf regressions ship silently. A 200KB JS bundle creep over 4 weeks doubles LCP from 1.8s to 3.6s — no one notices until a partner reports 'your site feels slow.' At that point, the regression is buried under 50 PRs."
---

## §1 — Description (BCP-14 normative)

1. **MUST** run Lighthouse CI on every PR via `.github/workflows/lighthouse.yml` workflow.

2. **MUST** assess these URLs:
   - `/` (root — cinematic experience)
   - `/lite` (lite fallback)
   - `/work/sample` (representative sub-page — proxy for /work/* CMS-driven pages)

3. **MUST** run each URL **3 times** and report median. `lighthouserc.json` config: `numberOfRuns: 3`.

4. **MUST** assert against FR-PERF-001's CWV thresholds (also codified in `.github/lighthouse/budget.json`):

   | Metric | Target (pass) | Fail threshold | Justification |
   |---|---|---|---|
   | LCP | ≤ 2.5s | > 4.0s | Google CWV "good" / "needs improvement" boundary |
   | INP | ≤ 200ms | > 500ms | Google CWV "good" / "needs improvement" boundary |
   | CLS | ≤ 0.1 | > 0.25 | Google CWV "good" / "needs improvement" boundary |
   | FCP | ≤ 1.8s | > 3.0s | First Contentful Paint guideline |
   | TBT | ≤ 200ms | > 600ms | Total Blocking Time guideline |
   | Speed Index | ≤ 3.4s | > 5.8s | Lighthouse Speed Index guideline |
   | Performance score | ≥ 80 | < 65 | Composite score; primary gate signal |
   | Accessibility score | ≥ 95 | < 90 | High bar; FR-OPS-012 axe gate is finer-grained |
   | Best Practices score | ≥ 95 | < 85 | Console errors, HTTPS, etc. |
   | SEO score | ≥ 90 | < 80 | Meta tags, sitemap, robots |

5. **MUST** post results as a markdown PR comment via `@lhci/cli` upload-action.

6. **MUST** fail the workflow (exit non-zero) when ANY URL × ANY metric × ANY run regresses past `fail` threshold.

7. **MUST** be informational (warn-not-fail) for the `target` threshold — surfaces in PR comment but does not block merge.

8. **MUST** run mobile-emulation first, then desktop. Mobile is the primary perf gate per FR-PERF-010 (mobile is the constrained tier).

9. **MUST** run in headless Chrome (Lighthouse v11+) with throttling: simulated 4G + 4x CPU slowdown (matches Google's recommended config for repeatable measurements).

10. **MUST** include a per-PR comparison table: this PR's median vs main's last successful run median, with delta column.

11. **MUST** support a `lighthouse:skip` PR label that bypasses the gate (for emergency hotfixes, force-merge via founder approval only).

12. **MUST** retain Lighthouse JSON artifacts for 30 days for retrospective analysis (`actions/upload-artifact` step).

13. **MUST** cache the Lighthouse install across runs (Lighthouse Chrome download takes ~2 min cold; cached saves CI time).

14. **MUST** cross-validate against WebPageTest weekly (out of scope for this PR-gate FR — see FR-PERF-013 weekly perf monitoring). Lighthouse vs real-device variance can be high; cross-check catches drift.

15. **MUST NOT** measure /admin, /api, /_next/static, or any non-public route.

16. **MUST NOT** run on draft PRs or doc-only PRs (filter via `paths-ignore: ['docs/**', '*.md']`).

## §2 — Why this design

**Why median of 3 runs (not single)?** Mobile emulation has inherent variance ±15% on metrics like LCP. Single run = noise. Median of 3 reduces false positives ~70%. Master plan §6.1 calibration.

**Why fail-threshold = "needs improvement" boundary (not "poor")?** Two-tier gate:
- `target` (pass) = "good" — what we aspire to.
- `fail` = "needs improvement" boundary — what we will not regress past.
- "Poor" thresholds (LCP > 4s) are emergency rather than gate. PRs that hit "poor" are auto-failing.

**Why mobile first?** Mobile is where users are. Lighthouse desktop is easy to pass; mobile is the real bar. Master plan §6.3 budget structure: mobile-low is the tightest, mobile-high is the warning zone.

**Why median against main, not against fixed budget?** Both. Fixed budget for absolute compliance. Delta-vs-main highlights regression direction (which is often more actionable than "we're at 2.4s, target 2.5s").

**Why `lighthouse:skip` escape hatch?** Hotfix scenarios — security patch, broken-production fix — should not be blocked by perf gate. Escape hatch documented; requires founder approval per CODEOWNERS.

**Why retain JSON artifacts 30 days?** Retrospective on "when did the regression start" is impossible without historical data. 30 days × ~50 PRs = ~150 reports archived; storage cost negligible.

**Why exclude /admin, /api?** Lighthouse measures user-facing UX; admin/API have different perf models (latency-bound, not render-bound). Out of scope.

**Why exclude doc-only PRs?** Doc PRs don't change runtime behavior; running Lighthouse wastes CI minutes. paths-ignore filter saves money.

## §3 — Public surface

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - '.gitignore'
      - 'tools/**'

permissions:
  contents: read
  pull-requests: write

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      matrix:
        formFactor: [mobile, desktop]
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm start &
        env: { PORT: '3000', NODE_ENV: 'production' }
      - run: sleep 8  # let prod server warm up
      - name: Cache Lighthouse
        uses: actions/cache@v4
        with:
          path: ~/.cache/lighthouse
          key: lh-${{ runner.os }}-${{ hashFiles('apps/web/lighthouserc.json') }}
      - name: Skip-label check
        id: skip
        run: |
          if echo '${{ toJSON(github.event.pull_request.labels.*.name) }}' | grep -q lighthouse:skip; then
            echo "skip=true" >> $GITHUB_OUTPUT
          fi
      - name: Run Lighthouse CI
        if: steps.skip.outputs.skip != 'true'
        run: pnpm dlx @lhci/cli@0.13.x autorun --config=apps/web/lighthouserc.json --upload.target=temporary-public-storage
        env:
          LHCI_FORM_FACTOR: ${{ matrix.formFactor }}
      - name: Generate PR comment summary
        if: steps.skip.outputs.skip != 'true'
        run: pnpm dlx tsx apps/web/scripts/lighthouse-summary.mjs --form-factor=${{ matrix.formFactor }}
      - name: Upload Lighthouse artifacts
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports-${{ matrix.formFactor }}
          path: .lighthouseci/
          retention-days: 30
```

```json
// apps/web/lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/lite",
        "http://localhost:3000/work/sample"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1,
          "requestLatencyMs": 0,
          "downloadThroughputKbps": 0,
          "uploadThroughputKbps": 0
        },
        "screenEmulation": {
          "mobile": false,
          "width": 1350,
          "height": 940,
          "deviceScaleFactor": 1
        },
        "formFactor": "desktop",
        "emulatedUserAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ...",
        "throttlingMethod": "simulate"
      }
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance":   ["error", { "minScore": 0.65 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices":["error", { "minScore": 0.85 }],
        "categories:seo":           ["error", { "minScore": 0.80 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 4000 }],
        "interaction-to-next-paint":["error", { "maxNumericValue": 500 }],
        "cumulative-layout-shift":  ["error", { "maxNumericValue": 0.25 }],
        "first-contentful-paint":   ["error", { "maxNumericValue": 3000 }],
        "total-blocking-time":      ["error", { "maxNumericValue": 600 }],
        "speed-index":              ["error", { "maxNumericValue": 5800 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

```json
// .github/lighthouse/budget.json (optional resource-budgets layer)
[
  {
    "resourceSizes": [
      { "resourceType": "script",     "budget": 350 },
      { "resourceType": "stylesheet", "budget": 50 },
      { "resourceType": "image",      "budget": 300 },
      { "resourceType": "font",       "budget": 100 },
      { "resourceType": "total",      "budget": 1200 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ]
  }
]
```

```ts
// apps/web/scripts/lighthouse-summary.mjs (ESM Node 22+)
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Reads .lighthouseci/manifest.json, generates markdown PR comment
// Posts via GH API (or echoes to stdout for `actions/github-script` consumption)

interface RunResult {
  url: string;
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number };
  metrics: { lcp: number; inp: number; cls: number; fcp: number; tbt: number; si: number };
}

export async function generateSummary(manifestPath: string): Promise<string> {
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
  const median = computeMedianPerUrl(manifest);
  return renderMarkdown(median);
}

function renderMarkdown(results: Map<string, RunResult>): string {
  const rows = Array.from(results.entries()).map(([url, r]) => {
    return `| ${url} | ${r.scores.performance * 100}% | ${r.metrics.lcp}ms | ${r.metrics.inp}ms | ${r.metrics.cls.toFixed(2)} | ${r.metrics.tbt}ms |`;
  });
  return `## 🚀 Lighthouse — median of 3 runs (${getFormFactor()})

| URL | Perf | LCP | INP | CLS | TBT |
|---|---|---|---|---|---|
${rows.join("\n")}

[Full reports archived 30 days](URL_TO_ARTIFACT)

<!-- lighthouse-summary -->`;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Workflow file present + valid YAML | `gh workflow view lighthouse.yml` parses |
| 2 | lighthouserc.json with 3 URLs + 3 runs each | JSON inspection |
| 3 | Mobile + desktop matrix runs both | Workflow matrix triggers 2 jobs |
| 4 | PR comment fires on completion | Synthetic PR; comment present with `<!-- lighthouse-summary -->` sentinel |
| 5 | Workflow fails when CWV regresses past `fail` threshold | Synthetic PR with LCP > 4s → exit non-zero |
| 6 | Workflow passes when CWV within `target` | Synthetic PR within budget → exit zero |
| 7 | Median-of-3 reported | Manual: read manifest.json, compute median, compare to comment |
| 8 | `lighthouse:skip` label bypasses | Add label, push PR, gate doesn't fail |
| 9 | Artifacts retained 30 days | Workflow run page shows artifact link |
| 10 | Excluded for doc-only PRs | Edit only docs/, push, workflow does NOT run |
| 11 | Headless Chrome with simulated 4G + 4x CPU | lighthouserc settings inspect |
| 12 | Comment delta vs main | Compare PR vs main last-good-run; delta column present |
| 13 | Cached Lighthouse install | Second CI run is faster than first |
| 14 | Lite route also measured | URL list includes /lite |

## §5 — Verification

```bash
# Synthetic over-budget PR test
# Author a PR that increases bundle by 500KB → run workflow → expect exit code 1

# Synthetic within-budget PR test
# Author a small CSS PR → run workflow → expect exit code 0 + comment posted
```

```ts
// apps/web/scripts/__tests__/lighthouse-summary.unit.test.mjs
import { describe, it, expect } from "vitest";
import { computeMedianPerUrl } from "../lighthouse-summary.mjs";

describe("Lighthouse summary", () => {
  it("computes median of 3 runs per URL", () => {
    const manifest = {
      "0.json": { url: "/", lcp: [2000, 2100, 1950] },
      // ... etc
    };
    const median = computeMedianPerUrl(manifest);
    expect(median.get("/").metrics.lcp).toBe(2000);  // sorted [1950, 2000, 2100] median = 2000
  });

  it("formats comment as markdown table", () => {
    // ...
  });

  it("includes sentinel for upsert", () => {
    // ...
  });
});
```

## §6 — Dependencies

**Concept:** FR-PERF-001 (perf budget source of truth — thresholds align), FR-PERF-010 (mobile perf), FR-WEB-001 (canvas setup affects LCP).

**Operational:** Lighthouse CI v0.13.x, headless Chrome, Node 22, GitHub Actions, pnpm cache.

**Downstream:** FR-PERF-001 budget gate consumes the workflow status. FR-PERF-013 weekly WebPageTest cross-validation.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Variance produces false-fail (LCP spike on 1 of 3 runs) | Manual review of full report | Median smooths most; rerun if median sketchy |
| Lighthouse install times out | CI step | Cache; pre-warm in setup-node step |
| Headless Chrome OOM | CI log | Lower numberOfRuns to 2; reduce matrix |
| Server didn't start (port collision) | curl fails before LH | `sleep 8` after pnpm start; healthcheck step |
| LH config invalid JSON | First run fails | JSON lint step before run |
| PR comment exceeds 65 KB | API error | Truncate to top-5 metrics per URL |
| `lighthouse:skip` label spammed | Audit | Branch protection requires founder approval to add the label |
| Median computed wrong | AC#7 | Vitest unit test on `computeMedianPerUrl` |
| /work/sample missing data (CMS empty in CI) | LH fails on 404 | Seed CI database with sample content; or stub |
| Artifacts expire too soon | 30-day limit | Manual extension via gh CLI for long-term retrospectives |
| Lighthouse upload fails (temporary-public-storage 5xx) | Workflow step error | Retry once; degrade to artifact-only mode |
| Mobile vs desktop matrix doubles CI minutes | Cost monitor | Run mobile on every PR; desktop only on main merges |
| Doc-only filter too aggressive (legitimate code PR excluded) | False negative | Verify paths-ignore patterns; whitelist /apps/web |
| Worker version mismatch breaks LH | Update LH version in lock | Test on dev branch first |
| Lighthouse not finding metric data (Sentry-style ERR) | Step error log | LH version bump + retest |

## §8 — Deliverable preview

Sample PR comment:
```markdown
## 🚀 Lighthouse — median of 3 runs (mobile)

| URL | Perf | LCP | INP | CLS | TBT |
|---|---|---|---|---|---|
| / | 82% (target 80+) | 2.3s ✅ | 145ms ✅ | 0.08 ✅ | 180ms ✅ |
| /lite | 96% ✅ | 1.1s ✅ | 90ms ✅ | 0.02 ✅ | 80ms ✅ |
| /work/sample | 79% ⚠️ (target 80+) | 2.6s ⚠️ | 210ms ⚠️ | 0.11 ⚠️ | 280ms ⚠️ |

**Verdict: 1 WARN, 0 FAIL.** Mergeable. Address /work/sample regression before next release.

| URL | LCP delta vs main |
|---|---|
| / | +0.1s |
| /lite | -0.05s |
| /work/sample | +0.4s ⚠️ |

[Full reports archived 30 days](URL_TO_ARTIFACT)

<!-- lighthouse-summary -->
```

## §9 — Notes

**On Lighthouse score vs CWV:** LH score is composite (LCP, FCP, TBT, CLS, SI). CWV is the field-validated subset (LCP, INP, CLS). Both matter; LH score is the faster CI proxy.

**On variance from CI vs local:** CI runs on shared GitHub Actions hardware; variance is ~15%. Local runs on dev machines vary ~30%. The gate is set based on CI variance; FR-PERF-013 cross-checks against WebPageTest real-device measurements.

**On future field RUM:** Could add Real User Monitoring (RUM) via FR-OPS-NNN (Sentry / SpeedCurve / etc.). Slice 2 candidate.

**On Vietnamese performance variance:** Vietnamese visitors (90% of audience) often on slower mobile networks. The mobile-tier gate (4G simulation + 4x CPU) approximates this. FR-PERF-010 hardens it further.

**On INP measurement quirks:** INP is the newest CWV metric, replacing FID. Lighthouse v11+ supports it. Older LH versions report FID; align CI to v11+.

*End of FR-OPS-011.*
