---
id: FR-OPS-006
title: "Cowork Recipe A — PR triage automation (size delta + draw-call estimate + screenshot diff + semantic explanation)"
module: OPS
priority: SHOULD
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P2
slice: 1
owner: Backend / DevOps + AI Workflow Lead
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-OPS-001, FR-OPS-003, FR-OPS-007, FR-PERF-001]
depends_on: [FR-OPS-001, FR-OPS-003]
blocks: []
language: cowork agent prompt + bash + node
service: tools/cowork/recipes/
new_files:
  - tools/cowork/recipes/pr-asset-triage.md
  - tools/cowork/recipes/pr-asset-triage.prompt.md
  - tools/cowork/recipes/pr-asset-triage.tools.json
  - tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs

source_pages:
  - docs/01-master-plan-v2.md §4.5 — "Cowork augments PR review with semantic context"
  - docs/01-master-plan-v2.md §11.1 Recipe A — full Cowork recipe spec
  - FR-OPS-003 — automated comment baseline that this augments

effort_hours: 6
risk_if_skipped: "Hard data alone (sizes, deltas) doesn't tell reviewers *why* a regression happened. Without Recipe A, reviewers either approve blindly or block waiting for the author to investigate. Cowork agent explains the cause in-PR, cutting review-cycle time by ~50%."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship a Cowork recipe at `tools/cowork/recipes/pr-asset-triage.md` describing the soft-augmentation flow that runs alongside FR-OPS-003's hard baseline. Recipe markdown structure follows the Cowork recipe-doc convention from master plan §11.1.

2. **MUST** trigger on the following conditions (declared in recipe frontmatter):
   - Any PR labelled `assets` or `lumi` or `scenes`.
   - Any PR that modifies > 1 asset file (`assets-built/optimized/**.glb` or `**/*.ktx2`).
   - Any PR where FR-OPS-003 surfaced a WARN or FAIL row.
   - Manual `@cowork triage` mention in PR comment.

3. **MUST** ship the agent system-prompt at `tools/cowork/recipes/pr-asset-triage.prompt.md` describing the agent's role:
   - You are an asset-pipeline reviewer.
   - You receive: FR-OPS-003's delta data, the modified `.glb` files, and `git diff` of source assets (`.blend`, `.psd`).
   - You output: a semantic explanation of *why* sizes/draws changed, hypothesis on root cause, suggested fixes.
   - You do NOT decide PASS/FAIL. You produce explanatory text only.

4. **MUST** ship the tool manifest at `tools/cowork/recipes/pr-asset-triage.tools.json` listing what Cowork tools the agent may use:
   - `bash` (run `gltf-transform inspect`, `git diff`, `git log`)
   - `read_file` (read `.report.json`, source `.blend` filenames)
   - `slack_post` (post summary to `#assets-prs` channel)
   - `github_comment` (append agent's explanation as a *threaded reply* under FR-OPS-003's main comment, preserving the sentinel for upsert)

5. **MUST** integrate with FR-OPS-003's automated comment as a thread reply (not a top-level comment). This keeps the GitHub Actions verdict at the top; the Cowork explanation lives in the thread.

6. **MUST NOT** be a hard CI gate. Cowork latency is high (10-60s per analysis) and agentic outputs are non-deterministic. The hard gate is FR-PERF-001's required-check via FR-OPS-003 workflow status. Recipe A is augmentation only.

7. **MUST** include an "explain this regression" mode triggered by FAIL verdicts. Sample expected output structure:

   ```markdown
   🤖 **Cowork triage** (Recipe A)

   **What changed:** `lumi.glb` grew by 480 KB (4.21 MB → 4.69 MB, +11.4%, FAIL).

   **Root cause hypothesis:** Looking at `git diff assets-source/blender/lumi.v01.blend`,
   the Quad Remesher subdivision was bumped from 2 to 3 in the wisp_lower bone region. This
   added ~7,200 vertices to a single mesh, contributing ~400 KB to the GLB. The remaining
   ~80 KB comes from a new emissive texture variant.

   **Suggested fix:**
   1. Revert Quad Remesher subdivision to 2 (cosmetic difference is negligible at LOD-0 zoom).
   2. Verify the new emissive texture is actually needed; if it's an experiment, drop it.
   3. Re-run pipeline; expected: ~4.25 MB total (within target).

   **Confidence:** Medium — based on heuristic diff; recommend visual A/B comparison.
   ```

8. **MUST** include a "no regression, all green" mode that posts a 1-line summary instead of full analysis:

   ```markdown
   🤖 **Cowork triage** (Recipe A) — All assets within budget. No regression analysis needed. ✅
   ```

9. **MUST** post a parallel Slack summary to `#assets-prs` channel (or whatever channel is configured in recipe frontmatter):
   - PR link + title
   - Verdict (PASS / WARN / FAIL counts)
   - 1-line Cowork hypothesis (truncated to 200 chars)
   - "👀" reaction to ping team to review

10. **MUST NOT** make recommendations the agent isn't confident about. Confidence-low outputs MUST say "I cannot determine a root cause from the available diff — defer to human reviewer."

11. **MUST** respect FR-OPS-003's redaction rules. Never expose `*.private.glb` or `assets-source/internal/**` paths in the explanation.

12. **MUST** be invocable in CI via Cowork's CLI (when GA), or via a webhook handler that calls the Cowork session API. Currently slated as a manual escape valve (`@cowork triage` PR mention) until Cowork CLI lands.

13. **MUST** include a "decline gracefully" mode if Cowork is unreachable / over capacity:
    ```markdown
    🤖 **Cowork triage** (Recipe A) — Service temporarily unavailable. FR-OPS-003 verdict still authoritative.
    ```

## §2 — Why this design

**Why Cowork (an agent) and not a heuristic Node script?** Heuristics handle "size grew by X" but can't explain *why*. The agent reads the actual `.blend` `git diff`, the asset metadata, the texture references, and the recent commit history, and forms a narrative. Reviewers want narrative, not numbers.

**Why soft-augment, not hard-gate?** Two reasons:
1. Agentic outputs are non-deterministic — Cowork could be down, slow, or wrong. Hard gates must be deterministic (= FR-OPS-003).
2. Cowork explanations are advisory; the reviewer decides whether to act. Locking merge on agent opinion violates "human in the loop."

**Why threaded reply (not top-level comment)?** Two comments compete for visual hierarchy. FR-OPS-003's authoritative verdict belongs at the top — that's the merge-or-not signal. Cowork's explanation supports it; threading is the right place for support material.

**Why confidence labelling?** Agents fabricate. Explicit confidence (`High / Medium / Low / "I cannot determine"`) gives reviewers calibration. Low confidence → "investigate yourself" rather than acting on hallucinated hypothesis.

**Why parallel Slack summary?** Engineers don't watch every PR in GitHub; they watch Slack. Slack `#assets-prs` channel is the team's daily attention surface for asset health.

**Why explicit decline mode (vs failing silently)?** Silent failures confuse reviewers ("why didn't Cowork triage?"). Explicit "service unavailable" message keeps the trust contract clear.

## §3 — Public surface

```yaml
# tools/cowork/recipes/pr-asset-triage.md (recipe frontmatter)
---
recipe_id: A
name: PR Asset Triage
trigger:
  labels: [assets, lumi, scenes]
  paths: ['assets-built/optimized/**.glb', 'apps/web/public/**.ktx2']
  manual: '@cowork triage'
priority: SHOULD  # not a hard gate
session_type: pr-review
agent_prompt: pr-asset-triage.prompt.md
tools: pr-asset-triage.tools.json
slack_channel: '#assets-prs'
max_session_seconds: 90
output_targets:
  - github_threaded_reply
  - slack_post
---
```

```markdown
# tools/cowork/recipes/pr-asset-triage.prompt.md
# Role
You are an asset-pipeline reviewer for the CyberSkill landing-page project. You augment FR-OPS-003's automated PR comment with semantic explanation of regressions.

# Inputs
You will receive:
1. PR metadata (number, title, author, modified files)
2. FR-OPS-003 delta table (asset · main size · PR size · verdict)
3. Per-asset `<asset>.report.json` from FR-OPS-001 (vertex / tri / texture stats)
4. `git diff assets-source/**` summarising source changes (truncated to 4 KB)
5. `git log --since="7 days ago" assets-source/` for recent context
6. The relevant FR documents (FR-CHAR-001, FR-CHAR-006, FR-CHAR-008, FR-OPS-001) for spec context

# Task
Produce a "Cowork triage" markdown comment with these sections:
1. **What changed** — 1-2 sentence factual summary
2. **Root cause hypothesis** — your best read of *why*
3. **Suggested fix** — actionable steps
4. **Confidence** — High / Medium / Low / "I cannot determine"

# Rules
- Never decide PASS/FAIL (that's FR-OPS-003's job).
- Never reference `*.private.glb` or `assets-source/internal/**` paths.
- If confidence is Low or "cannot determine," say so explicitly.
- Output ≤ 1000 chars total. Reviewers skim.
- Post in markdown; use code blocks for filenames; use emoji sparingly (one per section heading max).

# Mode A: all green
If FR-OPS-003 shows 0 FAIL and 0 WARN, post the 1-line summary form:
> 🤖 Cowork triage (Recipe A) — All assets within budget. No regression analysis needed. ✅

# Mode B: regression detected
Follow the 4-section structure above.

# Mode C: agent fails / no diff to analyze
> 🤖 Cowork triage (Recipe A) — Could not determine a root cause from the available diff. Defer to human reviewer.
```

```json
// tools/cowork/recipes/pr-asset-triage.tools.json
{
  "tools": [
    { "id": "bash",          "scope": "read-only", "allowed_commands": ["gltf-transform inspect", "git diff", "git log", "ls", "cat"] },
    { "id": "read_file",     "scope": "assets-built/, assets-source/, docs/feature-requests/ops/" },
    { "id": "github_comment", "scope": "reply_to_existing_thread", "sentinel": "<!-- pr-asset-delta -->" },
    { "id": "slack_post",    "scope": "channel:#assets-prs" }
  ],
  "context_window_kb": 32,
  "max_tool_calls": 8
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Recipe markdown + prompt + tools manifest present | `ls tools/cowork/recipes/pr-asset-triage.*` |
| 2 | Recipe declares 4-section frontmatter (trigger / inputs / outputs / prompt / success) | YAML lint + schema validate against master plan §11.1 |
| 3 | Triggers on assets-labelled PR | Synthetic PR with `assets` label → Cowork session fires |
| 4 | Triggers on manual `@cowork triage` mention | Posted mention → session fires |
| 5 | Threaded reply under FR-OPS-003 main comment (not top-level) | GitHub API check: agent reply has `in_reply_to_id` = main comment id |
| 6 | "Decline mode" message when Cowork unreachable | Mocked Cowork-down scenario → posted decline message |
| 7 | Confidence label always present | Output content includes "Confidence:" line |
| 8 | `*.private.glb` paths redacted from output | Synthetic PR with private asset → output does not mention path |
| 9 | NOT a hard gate — workflow status unchanged | PR mergeable after Recipe A even if hypothesis suggests fix |
| 10 | Slack summary posted to `#assets-prs` | Channel logs show 1 message per Cowork invocation |
| 11 | Session timeout ≤ 90s | Cowork session metric |
| 12 | Smoke test passes | `pnpm vitest run tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs` |

## §5 — Verification

```ts
// tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs
import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";

describe("PR asset triage recipe", () => {
  it("recipe frontmatter has required fields", async () => {
    const content = await readFile("tools/cowork/recipes/pr-asset-triage.md", "utf-8");
    expect(content).toMatch(/recipe_id: A/);
    expect(content).toMatch(/trigger:/);
    expect(content).toMatch(/agent_prompt: pr-asset-triage\.prompt\.md/);
    expect(content).toMatch(/tools: pr-asset-triage\.tools\.json/);
    expect(content).toMatch(/slack_channel: '#assets-prs'/);
  });

  it("prompt forbids hard-gate decisions", async () => {
    const prompt = await readFile("tools/cowork/recipes/pr-asset-triage.prompt.md", "utf-8");
    expect(prompt).toMatch(/Never decide PASS\/FAIL/);
    expect(prompt).toMatch(/Confidence/);
  });

  it("tools manifest restricts to safe operations", async () => {
    const tools = JSON.parse(await readFile("tools/cowork/recipes/pr-asset-triage.tools.json", "utf-8"));
    const bash = tools.tools.find(t => t.id === "bash");
    expect(bash.scope).toBe("read-only");
    expect(bash.allowed_commands).toContain("gltf-transform inspect");
    expect(bash.allowed_commands).not.toContain("rm");
    expect(bash.allowed_commands).not.toContain("git push");
  });

  it("tools manifest prohibits private path reads", async () => {
    const tools = JSON.parse(await readFile("tools/cowork/recipes/pr-asset-triage.tools.json", "utf-8"));
    const reader = tools.tools.find(t => t.id === "read_file");
    expect(reader.scope).not.toMatch(/internal/);
  });

  it("output_targets include threaded github reply (not top-level)", async () => {
    const content = await readFile("tools/cowork/recipes/pr-asset-triage.md", "utf-8");
    expect(content).toMatch(/github_threaded_reply/);
    expect(content).not.toMatch(/^- github_comment$/m); // not top-level
  });
});
```

## §6 — Dependencies

**Concept:** FR-OPS-001 (parent pipeline produces `.report.json` Cowork reads), FR-OPS-003 (Cowork augments this baseline; threads reply under its sentinel).

**Operational:** Cowork agent platform (GA pending; currently manual mention escape valve). Slack webhook for `#assets-prs`. GitHub bot account for threaded reply auth.

**Downstream:** None — Recipe A is a leaf augmentation, not a blocker for any other FR.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Cowork unreachable / over capacity | Health-check on session create | Post "decline mode" message; FR-OPS-003 verdict unchanged |
| Agent hallucinates root cause | Reviewer disputes | Confidence label flags low confidence; reviewer relies on hard data |
| Slack channel webhook broken | Slack API 4xx | Log + continue; don't fail Cowork session |
| Threaded reply API limitation (can't reply to bot comments) | GitHub API error | Fall back to top-level reply with prefix `[in reply to #N]` |
| `*.private.glb` leaked in output | Manual audit | Redaction filter on agent output (regex strip); CI gate |
| Recipe triggered on non-asset PR | False positive (e.g. docs PR mentions assets label) | Path filter in trigger frontmatter |
| Agent loops indefinitely (cost overrun) | max_tool_calls + max_session_seconds caps | Session terminated at limit; "decline mode" posted |
| Hard-gate accidentally introduced (FAIL output blocks merge) | AC#9 | Workflow status unchanged by Recipe A; only FR-OPS-003 status counts |
| Slack message spam (multiple invocations) | Channel monitoring | Dedupe on PR number; only post once per session |
| Cowork tool manifest grants too-broad permissions | Manual review | AC#3 bash scope read-only; explicit allowlist |
| Recipe runs on draft PRs (noise) | Slack channel | Trigger filter: `pull_request.draft == false` |
| Agent context overflow (PR diff too large) | Session log | Truncate diff at 4 KB; agent says "diff truncated; reviewer verify" |
| `@cowork triage` mention doesn't fire | Webhook handler logs | Verify Cowork's GitHub App receives `issue_comment.created` events |

## §8 — Deliverable preview

**Mode B example output (FAIL detected):**
```markdown
🤖 **Cowork triage** (Recipe A)

**What changed:** `lumi.glb` grew by 480 KB (4.21 MB → 4.69 MB, +11.4%, FAIL).

**Root cause hypothesis:** `assets-source/blender/lumi.v01.blend` diff shows Quad Remesher
subdivision bumped from 2→3 in wisp_lower region (+7,200 verts ≈ +400 KB).

**Suggested fix:**
1. Revert subdivision to 2 (visual difference negligible at LOD-0 zoom)
2. Re-run pipeline; target ~4.25 MB

**Confidence:** Medium — heuristic diff; recommend visual A/B comparison.
```

**Mode A example output (all green):**
```markdown
🤖 **Cowork triage** (Recipe A) — All assets within budget. No regression analysis needed. ✅
```

**Slack mirror:**
```
@channel PR #142: Update Lumi greybox
Verdict: 0 PASS / 1 WARN / 0 FAIL
🤖 Cowork: Wisp subdivision bumped 2→3 added ~400KB. Suggest revert.
👀
```

## §9 — Notes

**On Cowork GA timeline:** As of 2026-05-16, Cowork CLI is in preview. Recipe A ships with `@cowork triage` manual mention as the trigger; full automatic webhook firing depends on Cowork GA + GitHub App approval.

**On future Recipes B-G:** This FR is Recipe A only. Recipes B-G (texture variants, motion previs, Blender Python, Substance variants, async review, nón lá variants) are FR-OPS-007's scope. Each follows the same recipe-doc convention codified here.

**On agent prompt versioning:** Bump `prompt-version: x.y.z` in frontmatter when prompt changes; Cowork session log records the version used. Allows debugging "the agent gave different answers between Tuesday and Wednesday."

**On cost guardrails:** Each Cowork session caps at 8 tool calls + 90s wall-clock. ~$0.05-0.20 per session at current pricing. Budget ~$10/month for ~50 PRs/month.

**On Vietnamese cultural-sensitive PR review:** When a PR touches `assets-source/textures/*nonla*` or Scene 5 assets, Recipe A's prompt SHOULD include a soft reminder to flag cultural concerns ("if the texture variant evokes a festival not part of Vietnamese tradition, mention it in the hypothesis"). Founder cultural-signoff (FR-CHAR-003) remains the human gate.

## §10 — Strict audit evidence (2026-05-18)

Strict audit refreshed Recipe A because the previous `shipped 2026-05-17` status did not include strict-audit evidence under the zero-touch state engine.

Implementation updates:

- Tightened `tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs` from 3 to 4 tests, covering trigger labels/paths/manual mention, prompt redaction, screenshot-diff evidence, cost guardrails, threaded GitHub reply, Slack output, and soft-gate status.
- Updated `tools/cowork/recipes/pr-asset-triage.md`, `.prompt.md`, and `.tools.json` so screenshot-diff summaries are explicit inputs and explainable evidence.

Debug pass:

```bash
./node_modules/.bin/vitest run tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs
FAIL tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs > declares soft GitHub and Slack outputs only
AssertionError: expected recipe not to match /required-check|status_check|hard gate/i
```

Failure vector: test logic. The recipe correctly says it never changes "required-check status"; the assertion was too broad. Action: narrow the check to forbidden manifest keys (`status_check:`, `required_check:`, `hard_gate: true`).

Verification:

```bash
./node_modules/.bin/vitest run tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs
✓ tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs (4 tests)
Test Files  1 passed (1)
Tests  4 passed (4)

./node_modules/.bin/vitest run tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs
✓ tools/cowork/recipes/__tests__/recipes-bg.smoke.test.mjs (14 tests)
✓ tools/cowork/recipes/__tests__/pr-asset-triage.smoke.test.mjs (4 tests)
Test Files  2 passed (2)
Tests  18 passed (18)
```

*End of FR-OPS-006.*
