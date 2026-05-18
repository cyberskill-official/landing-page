---
recipe_id: A
name: PR Asset Triage
trigger:
  labels: [assets, lumi, scenes]
  paths:
    - assets-built/optimized/**.glb
    - apps/web/public/**.ktx2
  manual: '@cowork triage'
priority: SHOULD
session_type: pr-review
agent_prompt: pr-asset-triage.prompt.md
tools: pr-asset-triage.tools.json
slack_channel: '#assets-prs'
max_session_seconds: 90
output_targets:
  - github_threaded_reply
  - slack_post
hard_gate: false
---

# PR Asset Triage

## Trigger

Run when a PR is labelled `assets`, `lumi`, or `scenes`; when more than one optimized asset changes; when FR-OPS-003 reports WARN or FAIL; or when a reviewer comments `@cowork triage`.

## Inputs

- FR-OPS-003 asset delta table and `.report.json` files.
- Screenshot-diff summary artifacts when visual comparisons are present.
- Modified optimized `.glb` / `.ktx2` paths.
- Source-asset diff from `assets-source/**`, truncated to 4 KB.
- Recent `git log --since="7 days ago" assets-source/`.
- Relevant FR context: FR-OPS-001, FR-OPS-003, FR-CHAR-006, FR-CHAR-008.

## Outputs

- A threaded GitHub reply under the FR-OPS-003 sentinel comment.
- A Slack summary to `#assets-prs`.
- A confidence-labelled semantic explanation of what likely changed and why, including screenshot-diff evidence when available.

## Agent Prompt

Use `pr-asset-triage.prompt.md`.

## Success Criteria

- Never changes required-check status; FR-OPS-003 remains authoritative.
- Includes confidence in every non-green response.
- Redacts `*.private.glb` and `assets-source/internal/**`.
- Declines gracefully when Cowork is unavailable or evidence is insufficient.
