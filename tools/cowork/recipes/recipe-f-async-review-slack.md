---
recipe_id: F
name: Async Slack Asset Review
trigger:
  schedule: friday
  manual: '@cowork slack-summary <PR-range>'
inputs:
  - PR range
  - FR-OPS-003 verdicts
  - merged asset report summaries
outputs:
  - slack:#weekly-asset-review
agent_prompt: recipe-f-async-review-slack.prompt.md
success_criteria:
  - 200 to 400 words
  - open WARN/FAIL PRs listed
  - readable in under 60 seconds
priority: COULD
hard_gate: false
---

# Recipe F - Async Slack Asset Review

## Trigger

Weekly Friday summary or manual request for a PR range.

## Inputs

PRs shipped, asset regressions caught, KTX2 deltas, new animation clips, and open WARN/FAIL rows.

## Outputs

One Slack summary to `#weekly-asset-review`.

## Agent Prompt

Use `recipe-f-async-review-slack.prompt.md`.

## Success Criteria

Short, useful, and ends with `Needs eyes:`.
