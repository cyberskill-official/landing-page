---
id: FR-PERF-001
engineering_anchor: true
title: "Performance budget CI gates — LCP / INP / CLS / FPS / total JS / total page weight / per-asset GLB"
module: PERF
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
milestone: P5 · slice 1
slice: 1
owner: Backend / DevOps + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
brain_chain_hash: null
related_frs: [FR-PERF-002, FR-PERF-003, FR-PERF-004, FR-PERF-005, FR-PERF-006, FR-PERF-007, FR-PERF-008, FR-OPS-002, FR-OPS-011, FR-OPS-013]
depends_on: [FR-OPS-011, FR-WEB-001]
blocks:
  - FR-PERF-002..010   # every PERF FR runs under these gates
  - FR-SCENE-009       # cannot ship Scene 0 to staging without passing the gates

source_pages:
  - docs/01-master-plan-v2.md §6.1 (Hard CWV targets)
  - docs/01-master-plan-v2.md §6.2 (Specific code-level rules)
  - docs/01-master-plan-v2.md §4.4 (Asset-size budgets)
  - docs/01-master-plan-v2.md §10.2 (Risk register — janky scroll on Android)

source_decisions:
  - "v2 §6.1: LCP < 2.5s · INP < 200ms · CLS < 0.1 · FPS 60/30 · JS < 200 KB gz · page weight < 3 MB"
  - "v2 §4.4: Lumi GLB < 3 MB / 3.5 MB CI failure; nón lá < 200 KB / 250 KB; scene props < 1.5 MB"
  - "v2 §10.2: 'letting budgets drift has historically killed similar projects' — enforce day 1 via CI"

language: typescript 5.6 + bash
service: tools/perf-budgets/ + apps/web/lighthouse-budgets.json
new_files:
  - apps/web/lighthouse-budgets.json                              # Lighthouse CI budget config
  - apps/web/lighthouserc.json                                     # Lighthouse CI runner config
  - tools/perf-budgets/check-cwv.mjs                               # parses Lighthouse JSON, fails CI on breach
  - tools/perf-budgets/check-asset-sizes.mjs                       # reads dist/*.glb, fails on breach
  - tools/perf-budgets/check-js-bundle.mjs                         # reads .next stats, fails on breach
  - tools/perf-budgets/budgets.json                                # canonical thresholds + failure thresholds
  - tools/perf-budgets/README.md
  - .github/workflows/perf-budgets.yml                             # CI job
modified_files:
  - .github/workflows/ci.yml                                       # add perf-budgets job to required-checks
allowed_tools:
  - file_read: apps/web/.next/**
  - file_read: assets-built/**
  - file_write: tools/perf-budgets/**
  - file_write: apps/web/lighthouse*
  - bash: pnpm --filter web build
  - bash: npx lhci autorun
disallowed_tools:
  - skip the gates with `--no-verify` / GitHub admin override (use a §16.2 protocol amendment instead)
  - bump a threshold without an FR amendment (every threshold change is a code review)
  - replace Lighthouse with a custom harness "for speed"

effort_hours: 8
sub_tasks:
  - "1h: budgets.json — canonical thresholds with hard-stop and warn levels"
  - "1h: check-cwv.mjs — parse Lighthouse JSON for LCP/INP/CLS, exit 1 on breach"
  - "1h: check-asset-sizes.mjs — walk dist/*.glb, compare to per-asset budgets, exit 1 on breach"
  - "1h: check-js-bundle.mjs — read .next/build-manifest.json + chunk byte sizes (gz), exit 1 on breach"
  - "1h: lighthouse-budgets.json + lighthouserc.json (3 URLs: /, /lite, /work/sample)"
  - "1h: GitHub Actions perf-budgets.yml + integration into required checks"
  - "1h: README.md — how to update a threshold safely (the FR-amendment dance)"
  - "1h: smoke test against staging + initial threshold calibration"

risk_if_skipped: |
  Master plan §10.2: "letting budgets drift to 'we'll optimize at the end' has historically killed
  similar projects industry-wide." Without CI gates from day 1 of P3, every PR that adds 50 KB of
  bloat is invisible until launch week — at which point the team is in 2-AM-optimization mode and
  the launch slides 2-3 weeks. FR-PERF-001 makes the budget reality the team has to face on every
  PR, not at launch.
---

## §1 — Description (BCP-14 normative)

A set of CI budget gates **MUST** be wired so that every PR that breaches any of the performance thresholds in master plan §6.1 or asset-size thresholds in §4.4 fails the required check and blocks merge.

1. **MUST** ship `tools/perf-budgets/budgets.json` as the single source of truth for all thresholds. Format:

```jsonc
{
  "cwv": {
    "lcp_ms_p75":   { "target": 2500, "fail":  3000 },
    "inp_ms_p75":   { "target":  200, "fail":   300 },
    "cls":          { "target":  0.1, "fail":   0.15 },
    "fps_desktop":  { "target":   60, "fail":    50 },
    "fps_mobile":   { "target":   30, "fail":    25 }
  },
  "js_bundle": {
    "main_chunk_kb_gz": { "target": 200, "fail":  220 }
  },
  "page_weight": {
    "first_scene_mb": { "target": 3.0, "fail": 3.5 },
    "all_scenes_mb":  { "target": 14,  "fail": 16  }
  },
  "assets": {
    "lumi_glb_mb":          { "target": 3.0, "fail": 3.5 },
    "nonla_glb_kb":         { "target": 200, "fail": 250 },
    "hero_scene_props_mb":  { "target": 1.0, "fail": 1.2 },
    "each_scene_props_mb":  { "target": 1.5, "fail": 1.8 }
  },
  "draw_calls_per_scene_max": { "target": 100, "fail": 150 }
}
```

2. **MUST** ship `tools/perf-budgets/check-cwv.mjs` that consumes a Lighthouse CI JSON report and exits 1 if any CWV metric exceeds its `fail` threshold (warns on `target`).
3. **MUST** ship `tools/perf-budgets/check-asset-sizes.mjs` that walks `assets-built/optimized/` looking for `.glb` files and compares filesize against the matching `assets.*` row in `budgets.json`. Exits 1 on breach.
4. **MUST** ship `tools/perf-budgets/check-js-bundle.mjs` that reads `apps/web/.next/build-manifest.json` + `.next/static/chunks/main-*.js`, computes gzipped byte length, compares to `js_bundle.main_chunk_kb_gz`. Exits 1 on breach.
5. **MUST** include `apps/web/lighthouserc.json` configured for **three** URLs: `/`, `/lite`, `/work/sample` (case-study route). Each URL runs Lighthouse 3 times; median is reported.
6. **MUST** include `apps/web/lighthouse-budgets.json` containing the CWV thresholds in Lighthouse's native budget JSON schema (Lighthouse CI consumes this directly; it duplicates `budgets.json` but in Lighthouse's format).
7. **MUST** ship `.github/workflows/perf-budgets.yml` as a GitHub Actions job that: (a) installs deps + builds the web app + runs the gltf-transform pipeline (FR-OPS-001), (b) runs the three check scripts in sequence, (c) runs Lighthouse CI, (d) posts a markdown comment to the PR with the before/after delta table, (e) sets a required check that blocks merge on failure.
8. **MUST** integrate the perf-budgets job into `.github/workflows/ci.yml` as a required check. Bypass MUST require a §16.2 protocol amendment from the founder (i.e. you can't `--no-verify` your way past it).
9. **MUST** ship `tools/perf-budgets/README.md` documenting: how to read the gate failure message, how to propose a threshold change (the FR-amendment dance — you open a new FR titled "FR-PERF-NNN-budget-amendment-rationale" with the audit + justification before bumping `budgets.json`).
10. **MUST** treat `target` as a soft warn (PR comment annotated yellow) and `fail` as a hard stop (red, blocks merge). The two-tier signal mirrors §6.1's "target / failure threshold" pattern.
11. **MUST NOT** weaken any threshold to "pass" a failing PR. Threshold weakening requires a new FR + audit + founder signoff per §16.2 of `AGENTS.md`.
12. **SHOULD** add a `pre-push` Git hook (Husky or similar) that runs `check-js-bundle.mjs` + `check-asset-sizes.mjs` locally. Catches the most common breaches before the PR is opened.

---

## §2 — Why this design (rationale for humans)

**Why a single budgets.json?** Because the alternative is each check script encoding its own thresholds. The first time someone bumps a value in one place and not another, the gate is silently inconsistent. A single JSON is the only schema that's reviewable in one diff.

**Why two-tier (target / fail) thresholds?** A single threshold is too brittle — every PR that wiggles 1% over fails CI and the team starts treating the gate as noise. A target / fail pair gives the team a yellow signal at the design-intent threshold (lets you intervene before the budget is technically broken) and a red signal at the disaster threshold. This is how Lighthouse CI's own budget format works; we adopt it.

**Why three test URLs in Lighthouse CI?** `/` validates the cinematic experience; `/lite` validates the reduced-motion fallback (which has different — usually better — CWV); `/work/sample` validates that a CMS-backed sub-route doesn't regress because of an ISR config slip. Together they catch ~95% of perf regressions before merge.

**Why "threshold weakening = new FR"?** Master plan §10.2 risk #1: "Lumi GLB exceeds 3 MB" was tagged Likelihood: High / Impact: High. The team will try to bump the budget instead of optimizing. Forcing every bump through an FR + audit + signoff makes the bump expensive enough that optimisation is the cheaper path. (And when optimisation is genuinely impossible, the FR amendment documents *why* — providing the post-launch retrospective with real data.)

**Why pre-push hook?** Latency. A failing CI run takes ~5-8 minutes. A pre-push hook fails in ~10 seconds. Most contributors will fix-then-push rather than push-and-wait-and-fix. The hook doesn't replace the CI gate (which catches what local couldn't, e.g. Lighthouse mobile sim), but it cuts the feedback loop.

---

## §3 — Public surface contract

### §3.1 `budgets.json` — canonical schema (see §1 #1 for full)

### §3.2 `check-cwv.mjs` (Node ESM)

```js
#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const reportPath = argv[2];
if (!reportPath) { console.error('usage: check-cwv.mjs <lighthouse-report.json>'); exit(2); }

const lh = JSON.parse(readFileSync(reportPath, 'utf8'));
const budgets = JSON.parse(readFileSync(new URL('./budgets.json', import.meta.url), 'utf8'));

const lcp = lh.audits['largest-contentful-paint'].numericValue;
const cls = lh.audits['cumulative-layout-shift'].numericValue;
const inp = lh.audits['interactive']?.numericValue ?? lh.audits['max-potential-fid']?.numericValue;

const out = { breaches: [], warnings: [] };
function check(metric, value, conf) {
  if (value > conf.fail)   out.breaches.push(`${metric}: ${value} > fail ${conf.fail}`);
  else if (value > conf.target) out.warnings.push(`${metric}: ${value} > target ${conf.target}`);
}
check('lcp_ms_p75', lcp, budgets.cwv.lcp_ms_p75);
check('cls',       cls, budgets.cwv.cls);
check('inp_ms_p75', inp, budgets.cwv.inp_ms_p75);

console.log(JSON.stringify(out, null, 2));
exit(out.breaches.length > 0 ? 1 : 0);
```

### §3.3 `check-asset-sizes.mjs`

```js
#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';

const root = 'assets-built/optimized';
const budgets = JSON.parse(readFileSync(new URL('./budgets.json', import.meta.url), 'utf8'));
const map = {
  'lumi.glb':       budgets.assets.lumi_glb_mb,
  'lumi-nonla.glb': { target: budgets.assets.nonla_glb_kb.target / 1024, fail: budgets.assets.nonla_glb_kb.fail / 1024 },
};

const breaches = [];
for (const f of readdirSync(root).filter(n => n.endsWith('.glb'))) {
  const sizeMB = statSync(join(root, f)).size / (1024 * 1024);
  const conf = map[f] ?? budgets.assets.each_scene_props_mb;
  if (sizeMB > conf.fail) breaches.push(`${f}: ${sizeMB.toFixed(2)} MB > fail ${conf.fail} MB`);
}
console.log(breaches.length ? `BREACH\n${breaches.join('\n')}` : 'OK');
exit(breaches.length ? 1 : 0);
```

### §3.4 `check-js-bundle.mjs`

```js
#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { glob } from 'glob';
import { exit } from 'node:process';

const budgets = JSON.parse(readFileSync(new URL('./budgets.json', import.meta.url), 'utf8'));
const chunks = await glob('apps/web/.next/static/chunks/main-*.js');
if (!chunks.length) { console.error('no main chunk found'); exit(2); }

const gzKB = gzipSync(readFileSync(chunks[0])).byteLength / 1024;
const conf = budgets.js_bundle.main_chunk_kb_gz;
const verdict = gzKB > conf.fail ? `BREACH ${gzKB.toFixed(1)} > ${conf.fail} KB gz`
              : gzKB > conf.target ? `WARN ${gzKB.toFixed(1)} > ${conf.target} KB gz`
              : `OK ${gzKB.toFixed(1)} KB gz`;
console.log(verdict);
exit(verdict.startsWith('BREACH') ? 1 : 0);
```

### §3.5 `.github/workflows/perf-budgets.yml`

```yaml
name: perf-budgets
on:
  pull_request: { paths-ignore: ['**/*.md'] }
  push: { branches: [main] }

jobs:
  budgets:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -F web build
      - run: pnpm exec node tools/perf-budgets/check-js-bundle.mjs
      - run: pnpm exec node tools/perf-budgets/check-asset-sizes.mjs
      - run: pnpm exec npx @lhci/cli autorun --config apps/web/lighthouserc.json
      - run: pnpm exec node tools/perf-budgets/check-cwv.mjs .lighthouseci/lhr-*.json
      - if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner, repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '🚨 perf-budgets breach — see job logs. To weaken a threshold, open a `FR-PERF-NNN-budget-amendment` per `tools/perf-budgets/README.md`.'
            });
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **budgets.json present + valid JSON** — `jq . tools/perf-budgets/budgets.json` MUST succeed and MUST contain the keys: `cwv`, `js_bundle`, `page_weight`, `assets`, `draw_calls_per_scene_max`.
2. **Threshold values match master plan** — Spot-check: `lcp_ms_p75.target` == 2500; `cls.target` == 0.1; `js_bundle.main_chunk_kb_gz.target` == 200; `assets.lumi_glb_mb.fail` == 3.5; `page_weight.first_scene_mb.fail` == 3.5. Asserted by `tools/perf-budgets/test-budgets-vs-plan.test.ts`.
3. **check-cwv.mjs exits 1 on synthetic breach** — Vitest test: write a stub LH report with `largest-contentful-paint.numericValue = 4000`, run script, assert exit code = 1.
4. **check-asset-sizes.mjs exits 1 on synthetic breach** — Vitest test: stub `assets-built/optimized/lumi.glb` at 4 MB, run script, assert exit code = 1 and stdout contains `BREACH`.
5. **check-js-bundle.mjs exits 1 on synthetic breach** — Vitest test: stub `apps/web/.next/static/chunks/main-X.js` at 250 KB pre-gz that gzips > 220 KB, run script, assert exit code = 1.
6. **GitHub Actions workflow exists** — `.github/workflows/perf-budgets.yml` MUST exist and pass `gh workflow view perf-budgets` validation.
7. **Required check configured** — `.github/branch-protection.yml` (or org-level setting) MUST list `perf-budgets / budgets` as a required status check on the `main` branch.
8. **PR comment template** — On a synthetic-failing PR (CI-side test), the workflow MUST post a comment containing the string `perf-budgets breach`.
9. **README documents the amendment dance** — `tools/perf-budgets/README.md` MUST contain a section titled "How to change a threshold" referencing the FR-PERF-NNN-budget-amendment pattern + AGENTS.md §16.2.
10. **Lighthouse CI runs 3 URLs** — `apps/web/lighthouserc.json` MUST list `/`, `/lite`, `/work/sample` (or a representative case-study slug) with `numberOfRuns: 3` each.
11. **Pre-push hook installed** — `.husky/pre-push` (or `.hooks/pre-push`) MUST exist and invoke `tools/perf-budgets/check-js-bundle.mjs` + `check-asset-sizes.mjs`. Hook failure MUST block push.

---

## §5 — Verification method

**Tests (`verify: T`):**

```typescript
// tools/perf-budgets/test-budgets-vs-plan.test.ts
import { describe, expect, test } from 'vitest';
import budgets from './budgets.json' assert { type: 'json' };

describe('FR-PERF-001 — budgets vs master plan', () => {
  test('AC#2: cwv targets match v2 §6.1', () => {
    expect(budgets.cwv.lcp_ms_p75.target).toBe(2500);
    expect(budgets.cwv.inp_ms_p75.target).toBe(200);
    expect(budgets.cwv.cls.target).toBe(0.1);
  });
  test('AC#2: asset sizes match v2 §4.4', () => {
    expect(budgets.assets.lumi_glb_mb.target).toBe(3.0);
    expect(budgets.assets.lumi_glb_mb.fail).toBe(3.5);
    expect(budgets.assets.nonla_glb_kb.target).toBe(200);
    expect(budgets.page_weight.first_scene_mb.target).toBe(3.0);
  });
});
```

Plus integration tests for each check script (AC#3, #4, #5) using temp directories + stub files; and a CI-side check that the workflow renders correctly (AC#6, #7).

---

## §6 — Dependencies

- FR-OPS-011 (Lighthouse CI on every PR) — its workflow is the canonical Lighthouse runner; this FR adds the budget-checking layer.
- FR-WEB-001 (Next 15 + R3F bootstrap) — needs a build target to measure.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Threshold drift between budgets.json and Lighthouse's lighthouse-budgets.json | AC#2 spot-checks pass but Lighthouse passes a 4s LCP | Have a generator: `node tools/perf-budgets/gen-lighthouse-budget.mjs` emits `lighthouse-budgets.json` from `budgets.json` |
| Main chunk filename pattern changes in future Next | check-js-bundle.mjs glob misses | Read from `.next/build-manifest.json` instead of pattern-matching filenames |
| Lighthouse mobile sim wildly different from real-device p75 | False green on synthetic, red on real | Add WebPageTest Pro as a periodic out-of-band check (FR-PERF-NNN, scope-deferred to P6) |
| Pre-push hook ignored via `--no-verify` | No detection (this is by design — hook is a courtesy) | Don't rely on the hook for correctness; CI is the gate of record |
| Gate failure spam on every PR during P1/P2 (no build target yet) | CI breakage during development | Gate is conditioned on `apps/web/.next/` existing; if not, skip cleanly. Lighthouse runs only against deployed previews |
| GLB filename naming drift (e.g. `lumi-v2.glb`) | check-asset-sizes.mjs falls through to generic per-scene budget | Tighten the filename → budget map; add a default-stricter path |
| ISR mis-config exposes a non-cacheable `/work/<slug>` | Lighthouse run-3 timing wildly different from run-1 | Lighthouserc `numberOfRuns: 3` + median; document the variance allowance in README |
| Budget bump PR slipped without amendment FR | Review burden | CODEOWNERS rule: any change to `tools/perf-budgets/budgets.json` requires founder review |

---

## §8 — Notes

- The "FR-amendment-to-bump-threshold" dance is the single most controversial part of this FR. It WILL slow down the team in the short term. That's the point: master plan §10.2 is explicit that letting budgets drift is the failure mode this project must avoid.
- Lighthouse CI's mobile sim is Moto G4-class. Master plan §10.2 risk #2 ("janky scroll on mid-range Android") is best caught by manual testing on Pixel 6a + Galaxy A54 every Friday — Lighthouse alone is not enough.
- We don't add a draw-call CI gate yet; instancing audit + manual review during P4 catches it. A future `FR-PERF-NNN-draw-call-gate` adds programmatic detection via `gl-statistics` once we have a stable scene to baseline.

---

*End of FR-PERF-001. Audit: `FR-PERF-001-cwv-budget-ci-gates.audit.md`.*
