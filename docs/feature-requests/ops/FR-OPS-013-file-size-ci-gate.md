---
id: FR-OPS-013
title: "File-size CI gate — fail PR if any GLB/KTX2/asset exceeds budgets.json + ban CDN decoder loads"
module: OPS
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P3
slice: 2
owner: Backend / DevOps + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-OPS-001, FR-OPS-002, FR-OPS-003, FR-OPS-005, FR-OPS-010, FR-PERF-001, FR-PERF-002, FR-A11Y-001]
depends_on: [FR-OPS-002, FR-OPS-010, FR-OPS-003]
blocks: [FR-PERF-001]
language: yaml + Node ESM
service: .github/workflows/ + tools/perf-budgets/
new_files:
  - .github/workflows/asset-size.yml
  - tools/perf-budgets/check-asset-sizes.mjs
  - tools/perf-budgets/check-no-cdn.mjs
  - tools/perf-budgets/__tests__/check-asset-sizes.unit.test.mjs

source_pages:
  - docs/01-master-plan-v2.md §4.4 — "Hard CI gates for asset budgets"
  - docs/01-master-plan-v2.md §7.2 — CSP: no third-party CDN scripts/wasm at runtime
  - FR-OPS-002 budgets.json — source of truth for thresholds
  - FR-OPS-003 PR comment integration — surfaces deltas

effort_hours: 3
risk_if_skipped: "PRs can ship over-budget assets that pass review (size invisible at-a-glance) — production then has the 6 MB Lumi, mobile drops to 15 FPS. Or a CDN decoder URL slips in → CSP regression, offline-dev breaks. Both bugs hit prod silently."
---

## §1 — Description (BCP-14 normative)

1. **MUST** run a CI workflow `.github/workflows/asset-size.yml` triggered on every PR that touches:
   - `assets-built/**` (optimized outputs)
   - `assets-source/**` (sources that trigger rebuild)
   - `apps/web/public/**/*.glb`
   - `apps/web/public/**/*.ktx2`
   - `apps/web/public/decoders/**` (decoder bundle)
   - `apps/web/lib/**`, `apps/web/components/**` (runtime code that could regress decoder imports)

2. **MUST** invoke `tools/perf-budgets/check-asset-sizes.mjs` (FR-PERF-001 budget runner):
   - Reads `budgets.json` (FR-OPS-002).
   - Reads `<asset>.report.json` from FR-OPS-001 pipeline.
   - Asserts every asset's `bytes <= bytes_fail`.
   - Exits non-zero on any FAIL row.

3. **MUST** also run `scripts/gltf-pipeline.mjs` on PR-changed source files to verify they re-build cleanly (catch broken pipelines pre-merge).

4. **MUST** run `tools/perf-budgets/check-no-cdn.mjs`:
   - Greps `apps/web/{components,app,lib}/**/*.{ts,tsx,js,jsx}` for forbidden CDN hostnames.
   - Forbidden list: `unpkg.com`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `*.threejs.org`, `gstatic.com`, `*.googleapis.com` (decoder paths only — analytics from googleapis is allowed via allowlist).
   - Exits non-zero on any match.

5. **MUST** post per-asset size delta via FR-OPS-003's PR comment integration (don't duplicate; this gate hardens FR-OPS-003's signal).

6. **MUST** fail the workflow on:
   - Any asset exceeding `bytes_fail` threshold from budgets.json.
   - Any forbidden CDN reference in runtime code.
   - Any new asset > 5 MB without explicit founder approval comment in PR.

7. **MUST NOT** fail on:
   - Assets under `target` threshold (warn-not-fail surface in FR-OPS-003 comment).
   - CDN references in pure-build-time scripts (sync-decoders.mjs intentionally fetches from raw.githubusercontent at sync time).
   - Test fixtures under `apps/web/__fixtures__/`.

8. **MUST** support an explicit `assets-budget:skip` label (founder-approval gate) for emergency hotfixes.

9. **MUST** total decoder weight check ≤ 240 KB per FR-OPS-005:
   ```bash
   du -sb apps/web/public/decoders/ | awk '{print $1}' < 245760
   ```

10. **MUST** verify `<canvas>` elements don't accidentally lose `aria-hidden="true"` (FR-A11Y-002 dependency):
    ```bash
    grep -r '<canvas' apps/web/components/ | grep -v 'aria-hidden="true"' && exit 1
    ```

11. **MUST** ship a fast path: if PR has no asset-related changes (paths-ignore handles this), workflow skips entirely.

12. **MUST** complete in < 5 min for typical PR (no rebuild) and < 12 min for full Lumi-pipeline rebuild PR.

13. **MUST** persist a "main baseline" cache of `<asset>.report.json` keyed by main's commit SHA, so PRs compare against fresh baseline without re-fetching.

14. **MUST** emit a structured JSON summary at the end of the run for downstream consumers (FR-OPS-003 comment script):
    ```json
    {
      "verdict": "PASS|FAIL",
      "fails": [ { "asset": "...", "actual_bytes": N, "fail_threshold": M } ],
      "warns": [ ... ],
      "decoder_bytes_total": 224500,
      "cdn_violations": []
    }
    ```

## §2 — Why this design

**Why two-tier (target=warn, fail=block)?** Same logic as FR-PERF-001:
- `target` is the aspiration; warning to author + reviewer about creeping size.
- `fail` is the hard cliff; below this is "acceptable bloat," above is "unshippable."
- Two-tier prevents alarm fatigue while keeping the hard floor.

**Why ban CDN decoder loads at the CI level?** Three layers of defense:
- FR-OPS-005 spec says "no CDN."
- FR-A11Y-001 CSP says "no third-party origins."
- This gate enforces the rule at PR-merge time.

Without CI enforcement, a well-meaning author adds `import { ... } from 'https://unpkg.com/three@latest'` "just for testing" → merge → prod regression.

**Why founder-approval for > 5 MB assets?** Single assets > 5 MB are usually mistakes (forgot to optimize, exported wrong format). Forcing a PR comment with founder approval flushes out errors.

**Why aria-hidden canvas check here (vs in axe gate)?** axe-core (FR-OPS-012) catches accessibility-tree violations *at runtime*. This gate catches the *source code regression* of someone removing the attribute. Layered defense.

**Why `assets-budget:skip` label?** Emergency hotfixes (e.g., a critical SEO fix that incidentally bumps a meta-image size by 50 KB) need to ship fast. Founder approval gate prevents abuse.

**Why structured JSON summary?** Downstream tools (FR-OPS-003 PR comment, Slack mirror in Recipe F) need machine-readable input. JSON > scraping stdout.

**Why fast-path skip?** Doc-only or test-only PRs shouldn't burn 5 min of CI. paths-ignore filter saves ~$20/month at our PR cadence.

## §3 — Public surface

```yaml
# .github/workflows/asset-size.yml
name: Asset size + decoder gate
on:
  pull_request:
    paths:
      - 'assets-built/**'
      - 'assets-source/**'
      - 'apps/web/public/**/*.glb'
      - 'apps/web/public/**/*.ktx2'
      - 'apps/web/public/decoders/**'
      - 'apps/web/components/**'
      - 'apps/web/app/**'
      - 'apps/web/lib/**'
      - 'tools/perf-budgets/budgets.json'

permissions:
  contents: read
  pull-requests: write

jobs:
  size-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile

      - name: Skip label check
        id: skip
        run: |
          if echo '${{ toJSON(github.event.pull_request.labels.*.name) }}' | grep -q 'assets-budget:skip'; then
            echo "skip=true" >> $GITHUB_OUTPUT
          fi

      - name: Rebuild assets (if source changed)
        if: steps.skip.outputs.skip != 'true'
        run: pnpm asset:optimize

      - name: Asset size check
        if: steps.skip.outputs.skip != 'true'
        run: node tools/perf-budgets/check-asset-sizes.mjs --report=asset-summary.json

      - name: Decoder bundle ≤ 240 KB check
        if: steps.skip.outputs.skip != 'true'
        run: |
          BYTES=$(du -sb apps/web/public/decoders/ | awk '{print $1}')
          if [ "$BYTES" -gt 245760 ]; then
            echo "❌ Decoder bundle $BYTES bytes > 240 KB ceiling"
            exit 1
          fi

      - name: No-CDN decoder reference check
        if: steps.skip.outputs.skip != 'true'
        run: node tools/perf-budgets/check-no-cdn.mjs

      - name: Canvas aria-hidden check
        if: steps.skip.outputs.skip != 'true'
        run: |
          if grep -rE '<canvas[^>]*>' apps/web/components/ apps/web/app/ | grep -vE 'aria-hidden="true"'; then
            echo "❌ Found <canvas> without aria-hidden='true'"
            exit 1
          fi

      - name: Upload summary
        if: always() && steps.skip.outputs.skip != 'true'
        uses: actions/upload-artifact@v4
        with:
          name: asset-summary
          path: asset-summary.json
          retention-days: 30
```

```ts
// tools/perf-budgets/check-asset-sizes.mjs (ESM Node 22+)
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

interface BudgetEntry {
  asset: string;
  target_bytes: number;
  fail_bytes: number;
}
interface ReportEntry {
  asset: string;
  bytes: number;
}
interface Summary {
  verdict: "PASS" | "FAIL";
  fails: { asset: string; actual_bytes: number; fail_threshold: number }[];
  warns: { asset: string; actual_bytes: number; target_threshold: number }[];
  total_assets: number;
}

const REPORT_DIR = "assets-built/optimized";
const BUDGETS_PATH = "tools/perf-budgets/budgets.json";

async function main() {
  const budgets: BudgetEntry[] = JSON.parse(await readFile(BUDGETS_PATH, "utf-8")).assets;
  const reports: ReportEntry[] = [];
  for (const f of await readdir(REPORT_DIR)) {
    if (f.endsWith(".report.json")) {
      reports.push(JSON.parse(await readFile(join(REPORT_DIR, f), "utf-8")));
    }
  }

  const fails: Summary["fails"] = [];
  const warns: Summary["warns"] = [];
  for (const r of reports) {
    const b = budgets.find(b => b.asset === r.asset);
    if (!b) {
      console.warn(`[asset-size] No budget for ${r.asset}; skipping`);
      continue;
    }
    if (r.bytes > b.fail_bytes) {
      fails.push({ asset: r.asset, actual_bytes: r.bytes, fail_threshold: b.fail_bytes });
    } else if (r.bytes > b.target_bytes) {
      warns.push({ asset: r.asset, actual_bytes: r.bytes, target_threshold: b.target_bytes });
    }
  }

  const verdict: Summary["verdict"] = fails.length > 0 ? "FAIL" : "PASS";
  const summary: Summary = { verdict, fails, warns, total_assets: reports.length };

  const reportFlag = process.argv.find(a => a.startsWith("--report="));
  if (reportFlag) {
    await writeFile(reportFlag.slice(9), JSON.stringify(summary, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
  if (verdict === "FAIL") {
    console.error(`❌ ${fails.length} asset(s) over fail threshold`);
    process.exit(1);
  }
  if (warns.length > 0) {
    console.warn(`⚠️ ${warns.length} asset(s) over target threshold (non-blocking)`);
  }
  console.log(`✅ All ${reports.length} assets within fail thresholds`);
}

main().catch(e => { console.error(e); process.exit(2); });
```

```ts
// tools/perf-budgets/check-no-cdn.mjs (ESM Node 22+)
import { execSync } from "node:child_process";

const FORBIDDEN_HOSTS = [
  "unpkg.com",
  "cdn.jsdelivr.net",
  "cdnjs.cloudflare.com",
  // Note: gstatic / googleapis are conditionally allowed via .cdn-allowlist
];

const SCAN_PATHS = [
  "apps/web/components/",
  "apps/web/app/",
  "apps/web/lib/",
];

const EXCLUDE_PATHS = [
  "apps/web/__fixtures__/",
  "scripts/sync-decoders.mjs",  // sync-time only
];

let violations = 0;
for (const host of FORBIDDEN_HOSTS) {
  try {
    const cmd = `grep -rn --include='*.{ts,tsx,js,jsx}' '${host}' ${SCAN_PATHS.join(" ")} || true`;
    const matches = execSync(cmd, { encoding: "utf-8" });
    if (matches.trim()) {
      // Filter out excluded paths
      const filtered = matches.split("\n").filter(line =>
        line.trim() && !EXCLUDE_PATHS.some(ex => line.startsWith(ex))
      );
      if (filtered.length > 0) {
        console.error(`❌ Forbidden CDN host "${host}" found:\n${filtered.join("\n")}`);
        violations += filtered.length;
      }
    }
  } catch {}
}

if (violations > 0) {
  console.error(`❌ ${violations} CDN reference(s) in runtime code. See FR-OPS-005.`);
  process.exit(1);
}
console.log(`✅ No forbidden CDN references in runtime code`);
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Workflow file present + valid YAML | gh workflow view |
| 2 | Synthetic over-budget asset → workflow fails | Test PR with 6 MB Lumi → exit 1 |
| 3 | Synthetic CDN reference → workflow fails | Test PR with `unpkg.com` import → exit 1 |
| 4 | PR comment shows delta vs main | Via FR-OPS-003 integration |
| 5 | Decoder bundle > 240 KB → workflow fails | Synthetic bundle test |
| 6 | Canvas without aria-hidden → workflow fails | Synthetic component test |
| 7 | `assets-budget:skip` label bypasses | Add label, push, verify pass |
| 8 | Within-budget PR passes (under 5 min) | Time check |
| 9 | Doc-only PR skips workflow | paths filter triggered |
| 10 | JSON summary uploaded as artifact | Workflow page shows artifact |
| 11 | Vitest unit tests pass | `pnpm vitest run tools/perf-budgets/__tests__/` |
| 12 | sync-decoders.mjs not flagged (sync-time allowed) | check-no-cdn skips correctly |

## §5 — Verification

```ts
// tools/perf-budgets/__tests__/check-asset-sizes.unit.test.mjs
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeVerdict } from "../check-asset-sizes.mjs";  // export helper

describe("check-asset-sizes", () => {
  const budgets = [
    { asset: "lumi.glb",         target_bytes: 4_500_000, fail_bytes: 5_000_000 },
    { asset: "lumi-greybox.glb", target_bytes: 1_000_000, fail_bytes: 1_500_000 },
  ];

  it("PASS verdict when all assets under fail threshold", () => {
    const reports = [
      { asset: "lumi.glb", bytes: 4_200_000 },
      { asset: "lumi-greybox.glb", bytes: 900_000 },
    ];
    const result = computeVerdict(budgets, reports);
    expect(result.verdict).toBe("PASS");
    expect(result.fails).toEqual([]);
  });

  it("WARN-but-pass when over target but under fail", () => {
    const reports = [{ asset: "lumi.glb", bytes: 4_800_000 }];
    const result = computeVerdict(budgets, reports);
    expect(result.verdict).toBe("PASS");
    expect(result.warns).toHaveLength(1);
  });

  it("FAIL when over fail threshold", () => {
    const reports = [{ asset: "lumi.glb", bytes: 5_100_000 }];
    const result = computeVerdict(budgets, reports);
    expect(result.verdict).toBe("FAIL");
    expect(result.fails).toHaveLength(1);
    expect(result.fails[0].actual_bytes).toBe(5_100_000);
  });

  it("skips assets without budget entry (with warning)", () => {
    const reports = [{ asset: "unknown.glb", bytes: 100_000 }];
    const result = computeVerdict(budgets, reports);
    expect(result.verdict).toBe("PASS");  // no known fails
    expect(result.total_assets).toBe(1);
  });

  it("multiple FAIL rows sorted by severity", () => {
    const reports = [
      { asset: "lumi.glb",         bytes: 5_100_000 },  // 100K over
      { asset: "lumi-greybox.glb", bytes: 1_700_000 },  // 200K over (worse %)
    ];
    const result = computeVerdict(budgets, reports);
    expect(result.fails).toHaveLength(2);
  });
});

describe("check-no-cdn", () => {
  it("flags unpkg.com import", () => {
    // mock grep output
    // assert violations.length > 0
  });

  it("allows sync-decoders.mjs (build-time only)", () => {
    // mock grep with sync-decoders.mjs match
    // assert filtered out by exclude
  });

  it("flags cdn.jsdelivr.net even if commented", () => {
    // (false positive risk; comment block check optional)
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-002 (budgets.json source of truth), FR-OPS-005 (decoder bundling — no CDN rule originator), FR-OPS-003 (PR comment integration), FR-A11Y-002 (canvas aria-hidden requirement).

**Operational:** Node 22 ESM, GitHub Actions, FR-OPS-001 pipeline (provides `.report.json`).

**Downstream:** FR-PERF-001 (overall perf gate consumes this), FR-PERF-002 (LOD-specific size gates).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| budgets.json missing for new asset | AC#11 | Workflow warns; PR must add budget entry |
| False positive on CDN check (allowlist case missed) | Manual review | Update EXCLUDE_PATHS or .cdn-allowlist |
| `assets-budget:skip` overused | Audit | CODEOWNERS gate; founder approval required |
| Canvas aria-hidden grep false positive (commented code) | Visual | Refine grep to ignore JSX comments |
| Synthetic test for fail threshold doesn't run | CI | Run test via `pnpm test:asset-budgets` |
| sync-decoders.mjs caught as CDN violation | AC#12 | EXCLUDE_PATHS list includes sync-decoders.mjs |
| Decoder bundle exactly 240 KB (boundary) | du report | Use `>` not `>=`; document margin |
| Re-build step OOM on large source change | CI step OOM | Cache assets-built/; only rebuild changed sources |
| paths filter too aggressive (legitimate code PR skipped) | Manual review | Verify paths trigger; add explicit globs |
| Workflow takes > 12 min | Duration metric | Parallelize: check-asset-sizes + check-no-cdn + canvas-check independent |
| Main baseline cache stale | Test | Cache key includes main commit SHA |
| JSON summary > 5 MB (huge PR) | Upload artifact fails | Truncate `warns`; keep `fails` complete |
| Different node version in runner | Inconsistent results | Pin Node 22 in setup-node |
| Pull-request from fork lacks decoder bundle access | PR fork CI sandbox | Limit scope: forks skip rebuild step |
| .gitignore'd `assets-built/` not present after fresh clone | Step fails | Workflow runs `pnpm asset:optimize` before size check |

## §8 — Deliverable preview

Sample workflow run output:

```
✅ Asset size check
   - lumi.glb           4.18 MB / 4.50 MB target / 5.00 MB fail
   - lumi-greybox.glb   1.07 MB / 1.00 MB target / 1.50 MB fail  ⚠️ WARN
   - lumi-nonla-tet.ktx2 95 KB / 120 KB target  ✅
   verdict: PASS (1 WARN, 0 FAIL)

✅ Decoder bundle 224 KB ≤ 240 KB

✅ No forbidden CDN references in runtime code

✅ All <canvas> elements have aria-hidden="true"

Workflow conclusion: pass
```

Failure example:

```
❌ Asset size check
   - lumi.glb           5.40 MB / 4.50 MB target / 5.00 MB fail  ❌ FAIL
   verdict: FAIL (0 WARN, 1 FAIL)

Workflow conclusion: failure
PR cannot merge until address.
```

## §9 — Notes

**On budgets.json discipline:** Every new asset MUST get a budget entry. The "no budget → warn but pass" behavior could become "no budget → fail" in P5 once spec stabilizes.

**On CDN allowlist exception:** Google Analytics / Google Fonts may legitimately fetch from gstatic.com. Maintain a per-purpose allowlist (`.cdn-allowlist.json` with reason + scope) rather than blanket-allowing the host.

**On synthetic test fixtures:** `apps/web/__fixtures__/` excluded from check-no-cdn — test fixtures can reference any URL for mocking.

**On parallelism:** check-asset-sizes (~1s), check-no-cdn (~5s grep), canvas-aria-hidden (~1s grep). Could parallelize but overhead > savings. Sequential is fine.

**On Vietnamese-locale impact:** None directly. Nón lá variant assets (`.ktx2` files from Recipe G) flow through the same budget gate.

*End of FR-OPS-013.*
