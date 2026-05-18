---
id: FR-OPS-010
title: "GitHub Actions CI — install / lint / typecheck / test / build with pnpm + Next cache"
module: OPS
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 2
owner: Backend / DevOps
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-WEB-001, FR-OPS-002, FR-OPS-011, FR-OPS-012, FR-OPS-013]
depends_on: [FR-WEB-001]
blocks: [FR-OPS-011, FR-OPS-012, FR-OPS-013]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §11.3 — "Async PR review; CI runtime ≤ 10 min"
  - docs/01-master-plan-v2.md §11.2 — "Required check on main; pnpm + Next cache"
  - docs/01-master-plan-v2.md §6.1 — "Lighthouse + axe + bundle gates extend baseline CI"

language: github-actions yaml
service: .github/workflows/
new_files:
  - .github/workflows/ci.yml
  - .github/workflows/__tests__/ci-shape.test.ts
effort_hours: 4
risk_if_skipped: "Without a baseline CI workflow, every downstream gate (FR-OPS-011 Lighthouse, FR-OPS-012 axe, FR-OPS-013 bundle) needs its own install + build setup — 3× redundant CI minutes. Required-check on main is the only enforcement preventing direct-merge of broken main."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `.github/workflows/ci.yml` triggered on `pull_request` + `push: { branches: [main] }`.
2. **MUST** run steps in this order: **checkout → setup pnpm → install (frozen lockfile) → lint → typecheck → test (Vitest) → build (`pnpm -F web build`)**.
3. **MUST** cache `~/.pnpm-store` keyed by `pnpm-lock.yaml` hash + `.next/cache` keyed by source-files hash. Cache hit rate target: ≥ 70% on repeat runs (AC#4).
4. **MUST** complete in **≤ 10 minutes** wall-clock on a standard `ubuntu-latest` runner (master plan §11.3). If a step pushes past this budget, parallelize via job matrix.
5. **MUST** be configured as a **required status check** on the `main` branch (GitHub branch protection rule). PRs cannot merge without it green.
6. **MUST** use the **pinned pnpm version** from `packageManager` field in root `package.json` (master plan §5.1 reproducibility rule). Banned: `pnpm/action-setup@v2` without explicit version.
7. **MUST** use `actions/setup-node@v4` with Node 20.x (LTS) per FR-WEB-001 §1 #2 Node-version pin.
8. **MUST NOT** rerun `pnpm install` separately per job — install once, cache pnpm-store, downstream jobs `pnpm install --offline` from cache.
9. **MUST** emit a job summary using `GITHUB_STEP_SUMMARY` reporting: test counts, build sizes, cache hit/miss. Visible at PR-checks UI level.
10. **MUST** set `permissions: { contents: read, pull-requests: write }` at workflow level — minimal permissions principle; FR-OPS-011/012/013 extend with task-specific permissions only.
11. **MUST** fail-fast on `lint` or `typecheck` errors — no point building if types are wrong. `continue-on-error: false` (the default).
12. **MUST** ship Vitest test on the YAML shape itself (`__tests__/ci-shape.test.ts`) verifying: required steps present in order, runtime budget step exists, required-check label present.

## §2 — Why this design

**Why pnpm not npm/yarn?** Workspace monorepo (apps/web + packages/ds-cinematic) is pnpm's native sweet-spot. `pnpm -F` filter syntax targets sub-package builds cleanly. npm 10's workspaces are functional but slower; yarn berry's PnP introduces resolution edge-cases in R3F-style nested dependency graphs.

**Why required-check on main?** Without it, a contributor can `--no-verify` past local hooks and merge a red main. Required check moves the gate to the branch-protection level — GitHub enforces it server-side regardless of client posture.

**Why job-summary `GITHUB_STEP_SUMMARY`?** Job logs are buried in raw text. The job summary renders inline at the PR-checks UI. A 30-second test failure is invisible at scale; a 2-line summary "Build: 198 KB / 200 KB target | Tests: 247 passing" is glanceable.

**Why minimal `permissions`?** Default Actions tokens have `contents: write` (can push to main). Restricting at workflow level prevents a malicious dependency from exfiltrating via git push. FR-OPS-011 adds `actions: read` only when it needs Lighthouse to read artifacts; FR-OPS-012 adds `pull-requests: write` for axe-comment posting.

## §3 — Workflow shape

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with: { version: 9.x.x }   # pin to packageManager value
      - uses: actions/setup-node@v4
        with: { node-version: 20.x, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm -F web build
        env:
          NEXT_TELEMETRY_DISABLED: 1
      - name: Job summary
        if: always()
        run: |
          echo "### CI Results" >> $GITHUB_STEP_SUMMARY
          echo "- Build size: $(du -sh apps/web/.next/static | cut -f1)" >> $GITHUB_STEP_SUMMARY
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Workflow file present + valid YAML | `yamllint .github/workflows/ci.yml` |
| 2 | All 7 steps in order (install/lint/typecheck/test/build) | grep + position check |
| 3 | Runtime < 10 min observed | GitHub Actions history |
| 4 | Cache hit rate > 70% on repeat runs | Workflow run logs |
| 5 | Required check configured on main branch | `gh api repos/.../branches/main/protection` |
| 6 | Pinned pnpm version | grep `version:` in workflow vs package.json `packageManager` |
| 7 | Node 20.x | grep `node-version: 20` |
| 8 | Single `pnpm install` per workflow | grep count == 1 |
| 9 | Job summary populated | Inspect a real run's summary tab |
| 10 | Minimal permissions block present | grep `permissions:` at workflow level |
| 11 | Fail-fast: lint failure blocks build | Synthetic PR with lint error fails before build step |
| 12 | YAML-shape Vitest test passes | `pnpm test` |

## §5 — Verification

```ts
// __tests__/ci-shape.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { parse } from "yaml";

const ci = parse(readFileSync(".github/workflows/ci.yml", "utf-8"));

describe("ci.yml", () => {
  it("has required jobs/steps", () => {
    const steps = ci.jobs.ci.steps.map((s: any) => s.run || s.uses);
    expect(steps).toContain("pnpm lint");
    expect(steps).toContain("pnpm typecheck");
    expect(steps).toContain("pnpm test");
    expect(steps).toContain("pnpm -F web build");
  });

  it("pnpm install --frozen-lockfile", () => {
    const runs = ci.jobs.ci.steps.map((s: any) => s.run).filter(Boolean);
    expect(runs.some((r: string) => r.includes("--frozen-lockfile"))).toBe(true);
  });

  it("timeout-minutes 10", () => {
    expect(ci.jobs.ci["timeout-minutes"]).toBe(10);
  });

  it("minimal permissions", () => {
    expect(ci.permissions.contents).toBe("read");
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-001 (Next 15 + R3F bootstrap — the thing CI builds).

**Operational:** GitHub Actions, pnpm 9.x, Node 20, Vitest.

**Downstream blocks:** FR-OPS-011 (Lighthouse extends), FR-OPS-012 (axe extends), FR-OPS-013 (bundle gate extends).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| CI slow (> 10 min) | AC#3 | Investigate cache misses; parallelize if needed; profile slowest step |
| Cache misses (<70%) | AC#4 | Verify cache key + paths match pnpm-store + .next/cache; clear stale cache |
| Direct merge to main bypassed CI | AC#5 + branch protection | Enforce required check; deny admin override (GitHub setting) |
| pnpm version drift | AC#6 | Pin in `packageManager`; `corepack` resolves consistently |
| Node version drift (16 vs 20) | AC#7 | Hardcode `node-version: 20.x` in workflow |
| `pnpm install` runs twice (slow) | AC#8 | Consolidate to one install at workflow start |
| Job summary empty | AC#9 | Verify `$GITHUB_STEP_SUMMARY` writes |
| `contents: write` left at workflow level (security) | AC#10 | Restrict to `read`; per-job grant of write |
| Lint failure builds anyway | AC#11 | Confirm `continue-on-error: false`; needs-based step dependency |
| YAML invalid | AC#1 + yamllint | Fix syntax; CI workflow itself runs in dry-mode validation |
| Build artifacts persist (no cleanup) | Manual disk check | Add cleanup-on-success step or rely on runner ephemerality |
| Required check label different from check name | GitHub UI | Branch protection name MUST match workflow `name:` exactly |

## §8 — Notes

**On cancel-in-progress:** Workflow MAY set `concurrency: group: ${{ github.ref }}, cancel-in-progress: true` to cancel superseded PR-branch runs. Slice 1 ships without; future amendment if CI minutes get tight.

**On Vercel deployment trigger:** This FR is just the CI workflow. Deployment trigger (Vercel preview-deploy) is FR-OPS-014 — separate concern.

*End of FR-OPS-010.*
