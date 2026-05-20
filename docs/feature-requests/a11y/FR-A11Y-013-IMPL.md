---
id: FR-A11Y-013
title: "Post-launch a11y monitoring — monthly axe scan + quarterly manual + auto-issue creation"
module: A11Y
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: A11Y Lead + DevOps
created: 2026-05-16
related_frs: [FR-A11Y-012, FR-OPS-012, FR-OPS-010, FR-A11Y-011]
depends_on: [FR-A11Y-012]
blocks: []
language: github actions yaml + typescript
service: .github/workflows/
new_files:
  - .github/workflows/a11y-monthly.yml
  - docs/audits/a11y-{yyyy-mm}.md
  - scripts/a11y/auto-issue-from-violations.mjs

source_pages:
  - docs/01-master-plan-v2.md §7.6 (post-launch monitoring)
  - FR-A11Y-012 launch-time audit (this extends)

effort_hours: 4
risk_if_skipped: "A11y regresses with every code change. Without monthly monitoring, drift accumulates → 6 months post-launch, site fails launch-time audit. Quarterly manual catches what axe can't."
---

## §1 — Description (BCP-14 normative)

1. **MUST** GitHub Actions workflow runs axe-core monthly:
   - Cron: `0 9 1 * *` (1st of month, 09:00 UTC).
   - Routes: /, /lite, /work/sample, /accessibility, /vi/* variants.
2. **MUST** post to Slack `#a11y-monitor` + archive at `docs/audits/a11y-{YYYY-MM}.md`.
3. **MUST** auto-create P1 GitHub issue on new serious/critical violation:
   - Title: "A11y regression — <rule_id> on <route>"
   - Assigned: A11Y Lead.
   - Tags: P1, a11y.
4. **MUST** quarterly manual VO/NVDA review documented.
5. **MUST** trend tracking — month-over-month violation count.
6. **MUST** time-to-resolution SLA (critical: 1 week; serious: 2 weeks).
7. **MUST** dedupe — same rule_id across multiple routes = single issue with affected-routes list.
8. **MUST** /vi/* included in scan.

## §2 — Why this design

**Why monthly?** Daily = noise; quarterly = drift. Monthly catches issues within ~4 weeks.

**Why quarterly manual?** Automated catches ~40%. Manual catches the other 60% (cognitive, SR awkwardness).

**Why auto-issue?** Without automation, monitoring fatigue. Auto-create forces accountability.

**Why dedup?** 5 routes × same rule = 5 issues = overwhelming. Dedup by rule_id.

**Why /vi/*?** 90% Vietnamese audience. Equal scrutiny.

**Why SLA?** Without SLA, issues lurk. SLA enforces hygiene.

## §3 — Public surface

```yaml
# .github/workflows/a11y-monthly.yml
name: A11y monthly monitor
on:
  schedule: [ { cron: '0 9 1 * *' } ]
  workflow_dispatch: {}

permissions: { contents: read, issues: write }

jobs:
  axe-scan:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install chromium
      - name: Run axe on production routes
        run: pnpm dlx tsx scripts/a11y/run-axe-prod.mjs --output=monthly-report.json
        env: { PROD_URL: https://cyberskill.world }
      - name: Auto-create issues
        run: pnpm dlx tsx scripts/a11y/auto-issue-from-violations.mjs --report=monthly-report.json
        env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} }
      - name: Post Slack
        run: |
          SUMMARY=$(cat monthly-report-summary.txt)
          curl -X POST -H "Content-Type: application/json" \
            -d "{\"text\":\"📊 A11y monthly: $SUMMARY\"}" \
            ${{ secrets.SLACK_WEBHOOK_A11Y }}
      - name: Archive report
        run: cp monthly-report.json docs/audits/a11y-$(date +%Y-%m).md
      - uses: actions/upload-artifact@v4
        with: { name: a11y-monthly-${{ github.run_id }}, path: monthly-report.json, retention-days: 365 }
```

```ts
// scripts/a11y/auto-issue-from-violations.mjs
import { Octokit } from "@octokit/rest";
import { readFile } from "node:fs/promises";

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const report = JSON.parse(await readFile(process.argv.find(a => a.startsWith("--report="))!.slice(9), "utf-8"));
const actionable = report.violations.filter((v: any) => v.impact === "serious" || v.impact === "critical");

// Dedupe by rule_id
const byRule = new Map<string, any>();
for (const v of actionable) byRule.set(v.rule_id, v);

for (const v of byRule.values()) {
  const { data: existing } = await octokit.issues.listForRepo({
    owner: "zintaen", repo: "cyberskill-landing-page",
    labels: "a11y", state: "open",
  });
  if (existing.some((i: any) => i.title.includes(v.rule_id))) continue;
  await octokit.issues.create({
    owner: "zintaen", repo: "cyberskill-landing-page",
    title: `A11y regression — ${v.rule_id} on ${v.affected_routes.join(", ")}`,
    body: `**Impact:** ${v.impact}\n**Routes:** ${v.affected_routes.join(", ")}\n**Help:** ${v.help_url}\nSLA: ${v.impact === "critical" ? "1 week" : "2 weeks"}`,
    labels: ["a11y", "P1", v.impact],
  });
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Workflow scheduled (cron 1st of month) | YAML inspect |
| 2 | Monthly results archived | docs/audits/a11y-{yyyy-mm}.md |
| 3 | Issue auto-created on new violation | Synthetic; verify |
| 4 | Quarterly manual review documented | Audit doc presence |
| 5 | /vi/* included in scan | URL list |
| 6 | Dedupe by rule_id | Issue count |
| 7 | Time-to-resolution tracked | Issue labels |
| 8 | Slack notification fires | Mock |
| 9 | Workflow timeout ≤ 15 min | Duration |
| 10 | Auto-issue includes SLA | Body grep |

## §5 — Verification

```bash
# Manual test
gh workflow run a11y-monthly.yml

# Verify archive
ls docs/audits/a11y-*.md
```

```ts
describe("auto-issue creation", () => {
  it("creates issue for serious violation", async () => {
    // mock Octokit; assert issues.create called
  });
  it("skips if existing issue open", async () => {
    // mock listForRepo returns match; assert no create
  });
  it("dedups by rule_id across routes", async () => {
    // 3 routes same rule → 1 issue
  });
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-012 (launch audit baseline), FR-OPS-012 (PR-level axe), FR-A11Y-011 (/accessibility doc).

**Operational:** GitHub Actions cron, Octokit, Slack webhook.

**Downstream:** Founder dashboard; ongoing a11y health.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| axe false positive accumulates | Monthly triage | Document exclusions per FR-OPS-012 |
| Issue spam (duplicates) | AC#6 | Dedupe by rule_id |
| SLA missed | Manual review | Escalate to founder |
| Workflow times out | AC#9 | Parallelize routes |
| Slack webhook broken | CI log | Rotate webhook |
| GitHub token permissions | API 403 | Verify scope |
| Archive bloats repo | 365-day artifact | Use Actions artifacts |
| /vi/* not in scan | AC#5 | URL list explicit |
| Quarterly manual forgotten | Calendar | Reminder + Slack ping |
| Sanity content changes mid-scan | Acceptable | Snapshot at scan-time |
| Manual review skipped | Calendar | Mandatory event |
| Vietnamese reviewer language gap | Translation | Founder reviews + translates |

## §8 — Deliverable preview

1st of each month at 09:00 UTC:
- Workflow fires.
- Production scanned (~5 min).
- Report archived.
- Slack: "📊 A11y monthly: 0 critical / 1 serious / 3 moderate."
- 1 GitHub issue auto-created.

Quarterly:
- Manual VO/NVDA pass (~2-4h).
- Audit doc updated.

Issue lifecycle:
- P1 a11y issue created.
- A11Y Lead assigned.
- Fixed within 1-2 weeks (per SLA).
- Closed; next scan verifies.

## §9 — Notes

**On Linear vs GitHub Issues:** Pick one consistently. Adapter handles either.

**On false-positive exclusions:** Per FR-OPS-012 per-route exclusions with expiry.

**On Vietnamese coverage:** /vi/* equal monthly scrutiny.

*End of FR-A11Y-013.*
