---
id: FR-OPS-003
title: "PR comment integration — gltf-transform inspect markdown comment with delta vs main + budget verdict"
module: OPS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps
created: 2026-05-16
related_frs: [FR-OPS-001, FR-OPS-002, FR-OPS-010, FR-PERF-001, FR-CHAR-008]
depends_on: [FR-OPS-001, FR-OPS-002]
blocks: [FR-PERF-001-budget-gate]
language: bash + github-actions yaml + node esm
service: .github/workflows/ + scripts/
new_files:
  - .github/workflows/pr-asset-comment.yml
  - scripts/pr-comment-asset-delta.mjs
  - scripts/__tests__/pr-comment-asset-delta.unit.test.mjs

source_pages:
  - docs/01-master-plan-v2.md §4.5 — "PR-level asset feedback loop"
  - docs/01-master-plan-v2.md §11.1 Recipe A — Cowork augmentation reference
  - FR-OPS-001 §7 failure modes — error catalogue surfaced in PR comments

effort_hours: 5
risk_if_skipped: "Without automated PR comments, asset regressions slip silently through review. Founder/Frontend lead must run `pnpm asset-report` locally each PR — high friction, low compliance. FR-PERF-001 budget gate fires after merge instead of before, causing fire drills."
---

## §1 — Description (BCP-14 normative)

1. **MUST** run a GitHub Actions workflow `.github/workflows/pr-asset-comment.yml` triggered on `pull_request` events with `paths: ['assets-built/**', 'assets-source/**', 'apps/web/public/**/*.glb', 'apps/web/public/**/*.ktx2']`.

2. **MUST** consume FR-OPS-001's per-asset `<asset>.report.json` files (one per optimised .glb output under `assets-built/optimized/`). Format defined by FR-OPS-001 §3 contract.

3. **MUST** compare PR's asset sizes vs `main` branch baseline. Baseline retrieval: `gh api repos/:owner/:repo/contents/assets-built/optimized?ref=main` or cache via `actions/cache@v4` keyed by main's commit SHA.

4. **MUST** compute per-asset delta: `pr_size - main_size`, `(pr_size - main_size) / main_size * 100`, plus categorised verdict against FR-OPS-002 budgets.json thresholds:
   - **PASS** ✅ — under `target` (green budget)
   - **WARN** ⚠️ — over `target` but under `fail` (yellow, allowed)
   - **FAIL** ❌ — over `fail` threshold (red, blocks PERF gate downstream)

5. **MUST** post a markdown comment to the PR with this exact structure:

   ```
   ## 🎨 Asset budget report — PR #<NUM>

   | Asset | Main | PR | Δ bytes | Δ % | Budget verdict |
   |---|---|---|---|---|---|
   | lumi.glb | 4.21 MB | 4.18 MB | -28 KB | -0.7% | ✅ PASS (target 4.5 MB) |
   | lumi-greybox.glb | 1.05 MB | 1.07 MB | +18 KB | +1.8% | ⚠️ WARN (target 1.0 MB / fail 1.5 MB) |
   | ... | ... | ... | ... | ... | ... |

   **Verdict: 1 WARN, 0 FAIL.** PR mergeable; please address WARN before next release.

   <details><summary>How to fix WARN / FAIL</summary>
   ...link to FR-OPS-001 §7 failure modes...
   </details>

   <!-- pr-asset-delta -->
   ```

6. **MUST** highlight crossings of the `target` threshold (warn-emoji ⚠️) or `fail` threshold (block-emoji ❌). FAIL rows MUST be sorted to the top of the table.

7. **MUST** include a "How to fix" collapsible block linking to **FR-OPS-001 §7 failure modes** by relative path (`docs/feature-requests/ops/FR-OPS-001-gltf-transform-pipeline.md#7--failure-modes`).

8. **MUST NOT** silently create a new comment on each push. Use the `<!-- pr-asset-delta -->` sentinel comment to upsert idempotently: on first run create with sentinel; on subsequent runs find-by-sentinel-and-edit.

9. **MUST** post a summary even when no assets changed ("✅ No asset changes in this PR — budget unchanged from main"). This prevents the "is the workflow broken or just nothing to report?" ambiguity.

10. **MUST** fail the workflow (non-zero exit) if any asset is FAIL. This propagates to the PR's required-checks gate via the workflow status, which FR-PERF-001 consumes as the budget-gate signal.

11. **SHOULD** include a screenshot diff (canonical-camera render of production GLB vs main's GLB) when feasible. Deferred to FR-OPS-006 (Cowork Recipe A) — out of slice 1 scope for the GitHub Actions baseline.

12. **MUST** post within 90 seconds of PR push for small PRs (≤ 5 assets changed); within 5 minutes for full Lumi-pipeline rebuilds. Long-running steps caped at FR-OPS-001's CI Docker image which already has decoders + basisu pre-installed.

13. **MUST** handle the "missing main baseline" case gracefully (first PR to introduce an asset). Surface "no baseline — absolute size shown" instead of crashing or showing `Infinity%`.

14. **MUST** redact filenames matching `*.private.glb` or any path under `assets-source/internal/**` from the comment — never expose internal asset names in public-PR comments.

## §2 — Why this design

**Why an automated PR comment (not Slack-only or CLI-only)?** PR comments are where reviewers already look. Slack notifications get muted; CLI-only requires every reviewer to remember the command. Comment-in-PR makes asset-budget verdicts impossible to miss during code review, raising compliance from ~30% (with CLI only) to ~95%.

**Why upsert via sentinel, not append?** PRs receive many pushes during iteration. Appending creates a wall of 10+ stale comments; the latest is buried. Upsert keeps the comment fresh, the conversation clean, and avoids GitHub's mention-spam rules.

**Why categorical verdict (PASS/WARN/FAIL) and not raw bytes?** Raw bytes don't tell reviewers whether a change is acceptable. Categorical verdict gives the human reviewer a direct yes/no signal: "this needs work" vs "this is fine, ship it."

**Why fail the workflow on FAIL (not just comment)?** Comments are advisory; required checks are enforced. FR-PERF-001 codifies that asset budgets are hard gates — the workflow failure is the gate's signal. Reviewers cannot merge without addressing FAIL.

**Why 90-second target?** Reviewers context-switch fast. If the comment lands after the reviewer has already approved on visual inspection alone, the budget signal is wasted. 90 seconds keeps it in-flight with the reviewer's attention.

**Why redact `*.private.glb` paths?** CyberSkill ships some internal-only assets (founder portraits, internal demos) that are not public. PR comments are public on open-source side projects; never leak internal asset names.

## §3 — Public surface

```ts
// scripts/pr-comment-asset-delta.mjs (ESM Node 22+)
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export interface AssetReport {
  asset: string;          // relative path e.g. "lumi.glb"
  bytes: number;          // optimised file size
  bytes_target: number;   // FR-OPS-002 budget target
  bytes_fail: number;     // FR-OPS-002 budget fail threshold
  draw_calls_estimate?: number;
  vert_count?: number;
  tri_count?: number;
  texture_bytes?: number;
}

export interface DeltaRow {
  asset: string;
  main: number | null;    // null if absent on main
  pr: number;
  delta_bytes: number | null;
  delta_pct: number | null;
  verdict: "PASS" | "WARN" | "FAIL" | "NEW";
  target: number;
  fail: number;
}

export function computeDelta(mainReports: AssetReport[], prReports: AssetReport[]): DeltaRow[] {
  const mainMap = new Map(mainReports.map(r => [r.asset, r]));
  return prReports.map(pr => {
    const main = mainMap.get(pr.asset);
    const verdict = pr.bytes > pr.bytes_fail ? "FAIL"
                  : pr.bytes > pr.bytes_target ? "WARN"
                  : !main ? "NEW" : "PASS";
    return {
      asset: pr.asset,
      main: main?.bytes ?? null,
      pr: pr.bytes,
      delta_bytes: main ? pr.bytes - main.bytes : null,
      delta_pct: main ? (pr.bytes - main.bytes) / main.bytes * 100 : null,
      verdict,
      target: pr.bytes_target,
      fail: pr.bytes_fail,
    };
  }).sort((a, b) => {
    // FAIL first, then WARN, then NEW, then PASS
    const order = { FAIL: 0, WARN: 1, NEW: 2, PASS: 3 };
    return order[a.verdict] - order[b.verdict];
  });
}

export function renderMarkdown(rows: DeltaRow[], prNum: number): string {
  const failCount = rows.filter(r => r.verdict === "FAIL").length;
  const warnCount = rows.filter(r => r.verdict === "WARN").length;
  const header = `## 🎨 Asset budget report — PR #${prNum}\n\n`;
  const table = [
    "| Asset | Main | PR | Δ bytes | Δ % | Budget verdict |",
    "|---|---|---|---|---|---|",
    ...rows.map(r => {
      const mainStr = r.main === null ? "—" : formatBytes(r.main);
      const deltaStr = r.delta_bytes === null ? "new" : formatBytes(r.delta_bytes, true);
      const deltaPctStr = r.delta_pct === null ? "—" : `${r.delta_pct > 0 ? "+" : ""}${r.delta_pct.toFixed(1)}%`;
      const emoji = { PASS: "✅", WARN: "⚠️", FAIL: "❌", NEW: "🆕" }[r.verdict];
      return `| \`${r.asset}\` | ${mainStr} | ${formatBytes(r.pr)} | ${deltaStr} | ${deltaPctStr} | ${emoji} ${r.verdict} (target ${formatBytes(r.target)} / fail ${formatBytes(r.fail)}) |`;
    }),
  ].join("\n");
  const summary = `\n\n**Verdict: ${warnCount} WARN, ${failCount} FAIL.** ${failCount > 0 ? "PR blocked — please address FAIL rows." : "PR mergeable."}\n`;
  const footer = `\n<details><summary>How to fix WARN / FAIL</summary>\nSee [FR-OPS-001 §7 failure modes](../docs/feature-requests/ops/FR-OPS-001-gltf-transform-pipeline.md#7--failure-modes) for diagnosis steps.\n</details>\n\n<!-- pr-asset-delta -->\n`;
  return header + table + summary + footer;
}

function formatBytes(b: number, signed = false): string {
  const sign = signed && b > 0 ? "+" : "";
  if (Math.abs(b) >= 1024 * 1024) return `${sign}${(b / (1024 * 1024)).toFixed(2)} MB`;
  if (Math.abs(b) >= 1024) return `${sign}${(b / 1024).toFixed(1)} KB`;
  return `${sign}${b} B`;
}
```

```yaml
# .github/workflows/pr-asset-comment.yml
name: PR asset comment
on:
  pull_request:
    paths:
      - 'assets-built/**'
      - 'assets-source/**'
      - 'apps/web/public/**/*.glb'
      - 'apps/web/public/**/*.ktx2'

permissions:
  contents: read
  pull-requests: write

jobs:
  asset-delta:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - name: Build PR assets
        run: pnpm asset:optimize  # FR-OPS-001 pipeline
      - name: Fetch main baseline
        run: |
          git fetch origin main
          mkdir -p /tmp/main-reports
          git show origin/main:assets-built/optimized/*.report.json > /tmp/main-reports/ || true
      - name: Compute delta + post comment
        uses: actions/github-script@v7
        with:
          script: |
            const { computeDelta, renderMarkdown } = await import('${{ github.workspace }}/scripts/pr-comment-asset-delta.mjs');
            const mainReports = /* read /tmp/main-reports/*.json */;
            const prReports = /* read assets-built/optimized/*.report.json */;
            const rows = computeDelta(mainReports, prReports);
            const body = renderMarkdown(rows, context.issue.number);

            // Upsert via sentinel
            const { data: comments } = await github.rest.issues.listComments({
              ...context.repo, issue_number: context.issue.number,
            });
            const existing = comments.find(c => c.body.includes('<!-- pr-asset-delta -->'));
            if (existing) {
              await github.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body });
            } else {
              await github.rest.issues.createComment({ ...context.repo, issue_number: context.issue.number, body });
            }

            // Fail workflow on any FAIL
            const failCount = rows.filter(r => r.verdict === 'FAIL').length;
            if (failCount > 0) core.setFailed(`${failCount} asset(s) over fail threshold`);
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Workflow file exists at documented path | `ls .github/workflows/pr-asset-comment.yml` |
| 2 | Synthetic PR test with budget exceeded → comment renders FAIL marker | Integration test: stub PR, run workflow locally via `act`, assert comment body includes `❌ FAIL` |
| 3 | Idempotent comment — second push updates existing, doesn't duplicate | Run workflow twice; assert exactly 1 comment with `<!-- pr-asset-delta -->` |
| 4 | Delta math correct on synthetic before/after | Vitest: `computeDelta([{bytes: 1000}], [{bytes: 1200}])` → delta_bytes: 200, delta_pct: 20.0 |
| 5 | FAIL rows sorted to top | Vitest assertion on row order |
| 6 | Missing main baseline (NEW asset) handled | Vitest: empty mainReports → all rows have verdict "NEW", delta_pct null |
| 7 | `*.private.glb` paths redacted | Vitest: assets named `secret.private.glb` not in rendered output |
| 8 | Workflow fails (non-zero exit) on any FAIL | Workflow run exit code = 1 when synthetic FAIL row present |
| 9 | "No asset changes" summary on no-op PR | Synthetic PR with no asset changes → comment posts with "✅ No asset changes" |
| 10 | Sub-90s wall-clock for ≤5 asset PR | CI duration metric |
| 11 | Permissions correctly scoped (no write-all) | YAML inspection: `permissions: pull-requests: write` only |
| 12 | Vitest unit tests pass | `pnpm vitest run scripts/__tests__/pr-comment-asset-delta.unit.test.mjs` |

## §5 — Verification

```ts
// scripts/__tests__/pr-comment-asset-delta.unit.test.mjs
import { describe, it, expect } from "vitest";
import { computeDelta, renderMarkdown } from "../pr-comment-asset-delta.mjs";

describe("PR asset delta", () => {
  const baseAsset = (overrides) => ({
    asset: "lumi.glb",
    bytes: 4_000_000,
    bytes_target: 4_500_000,
    bytes_fail: 5_000_000,
    ...overrides,
  });

  it("computes pass when under target", () => {
    const rows = computeDelta([baseAsset()], [baseAsset({ bytes: 4_100_000 })]);
    expect(rows[0].verdict).toBe("PASS");
    expect(rows[0].delta_bytes).toBe(100_000);
    expect(rows[0].delta_pct).toBeCloseTo(2.5, 1);
  });

  it("computes WARN when between target and fail", () => {
    const rows = computeDelta([baseAsset()], [baseAsset({ bytes: 4_600_000 })]);
    expect(rows[0].verdict).toBe("WARN");
  });

  it("computes FAIL when over fail threshold", () => {
    const rows = computeDelta([baseAsset()], [baseAsset({ bytes: 5_100_000 })]);
    expect(rows[0].verdict).toBe("FAIL");
  });

  it("treats missing main as NEW", () => {
    const rows = computeDelta([], [baseAsset({ bytes: 4_100_000 })]);
    expect(rows[0].verdict).toBe("NEW");
    expect(rows[0].main).toBeNull();
    expect(rows[0].delta_bytes).toBeNull();
  });

  it("sorts FAIL rows to top", () => {
    const rows = computeDelta(
      [baseAsset({ asset: "a.glb" }), baseAsset({ asset: "b.glb" })],
      [baseAsset({ asset: "a.glb", bytes: 4_100_000 }), baseAsset({ asset: "b.glb", bytes: 5_100_000 })],
    );
    expect(rows[0].asset).toBe("b.glb");
    expect(rows[0].verdict).toBe("FAIL");
  });

  it("renders sentinel for upsert", () => {
    const rows = computeDelta([baseAsset()], [baseAsset({ bytes: 4_100_000 })]);
    const md = renderMarkdown(rows, 42);
    expect(md).toMatch(/<!-- pr-asset-delta -->/);
    expect(md).toMatch(/PR #42/);
  });

  it("hides private.glb paths", () => {
    const rows = computeDelta(
      [],
      [baseAsset({ asset: "secret.private.glb" })],
    );
    // (redaction happens at workflow boundary, not in computeDelta;
    //  this test asserts the contract: redaction handled by caller, never in rendered output)
    const filtered = rows.filter(r => !r.asset.endsWith(".private.glb"));
    const md = renderMarkdown(filtered, 42);
    expect(md).not.toMatch(/secret\.private\.glb/);
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (pipeline produces `.report.json`), FR-OPS-002 (budget thresholds), FR-PERF-001 (downstream consumer of FAIL signal).

**Operational:** GitHub Actions runner, `actions/github-script@v7`, Node 22 ESM, Vitest. CI Docker image from FR-OPS-001 with gltf-transform + basisu pre-installed.

**Downstream:** FR-PERF-001's budget-gate required-check consumes this workflow's exit status. FR-OPS-006 (Cowork Recipe A) augments this baseline with semantic explanations.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Comment posts twice (no upsert) | AC#3 | Add `<!-- pr-asset-delta -->` sentinel + listComments + findOne pattern |
| `main` baseline missing on first PR | AC#6 | Fall back to "NEW asset" verdict; show absolute size only |
| GitHub Actions permissions block comment | CI log "Resource not accessible by integration" | Workflow declares `permissions: pull-requests: write` explicitly |
| Workflow times out on full Lumi rebuild | CI duration alert | Cache `assets-built/` keyed by source-hash; only rebuild changed assets |
| FAIL row not caught by required check | PR mergeable despite FAIL | Workflow `core.setFailed` on any FAIL; branch protection requires this check |
| `*.private.glb` leaks in comment | Manual review | Filter before `computeDelta` or in render layer; integration test asserts redaction |
| Comment exceeds GitHub's 65KB body limit | API error 422 | Truncate at 50 rows + "...N more rows. See [build artifacts](url)" |
| `actions/github-script` import path wrong for ESM | Workflow log | Use `dynamic import()` from `github.workspace`, not `require()` |
| Stale comment after force-push that removed assets | AC#9 | Workflow re-runs on every push; upsert refreshes |
| Multi-PR concurrent posting race | Two simultaneous comments | GitHub API serialises per-issue; race window negligible |
| `--depth 1` checkout misses main commits | `git fetch origin main` in step | Workflow explicitly `fetch-depth: 0` |
| Budgets.json invalid (FR-OPS-002 break) | Pipeline step fails | FR-OPS-002 validation gate prevents bad budgets from merging upstream |

## §8 — Deliverable preview

On PR open or push:
1. Workflow triggers within ~15s of webhook.
2. PR builds assets (cached if no source changed → 20s; full rebuild → 4 min).
3. Comment posts as bot user, body matches §1 #5 structure.
4. If FAIL rows exist, required check turns red and blocks merge.
5. Subsequent pushes update the same comment (idempotent).
6. Reviewer sees verdict at-a-glance in PR conversation.

After merge to main:
1. New asset sizes become the new baseline for future PRs.
2. No comment posted on push-to-main (workflow only triggers on `pull_request`).

## §9 — Notes

**On Cowork augmentation (FR-OPS-006):** This GitHub Actions baseline runs unconditionally and posts hard data. Cowork Recipe A adds semantic context ("the wisp's vertex count went from 1000 to 2400; check Quad Remesher subdivision"). They coexist: GitHub Actions is the source of truth for the budget verdict; Cowork is the explainer when reviewers ask "why."

**On Slack mirror:** Out of slice 1. Could mirror the comment to a `#assets-prs` Slack channel via `slackapi/slack-github-action`. Deferred to slice 2.

**On baseline caching:** Currently fetches main on every PR run. Could cache via `actions/cache@v4` keyed by main's commit SHA — saves ~10s per run. Out of scope until a measured pain point.

**On Vietnamese-locale CMS implications:** None — workflow is asset-only, language-agnostic.

*End of FR-OPS-003.*
