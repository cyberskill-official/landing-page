---
id: TASK-DS-005
title: "Confirm whether @cyberskill design-system packages are installable"
module: DS
priority: SHOULD
status: on_hold
class: product
verify: T
phase: P0
owner: mixed
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-DS-001]
source_pages:
  - "research doc Phase 0 (resolve dependency, open question), §A (design-system analysis)"
new_files:
  - docs/decisions/2026-06-22-token-package-source.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The team MUST settle, in writing, whether the published design-system packages
can be consumed, because the rest of the DS work forks on that answer.

1. The investigation MUST determine whether `@cyberskill/tokens`,
   `@cyberskill/react`, and `@cyberskill/style-packs` are installable from a
   reachable private registry under the project's credentials.
2. If they install, the project SHOULD consume them and apply the CyberSkill
   theme on top; if they do not, the project MUST keep the hand-ported tokens
   (TASK-DS-001) as the source of truth.
3. The outcome MUST be recorded as a dated decision note resolving the Phase 0
   open question either way.

## §2 Acceptance

- A reproducible install attempt is documented with its result (success or the
  exact failure).
- A decision note states the chosen path and updates the dependency on TASK-DS-001.

## §3 Evidence

Not yet implemented; acceptance pending build.
