---
id: TASK-DS-005
title: "Confirm whether @cyberskill design-system packages are installable"
module: DS
priority: SHOULD
status: done
class: product
verify: T
phase: P0
owner: mixed
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-07-24
depends_on: [TASK-DS-001]
source_pages:
  - "research doc Phase 0 (resolve dependency, open question), §A (design-system analysis)"
new_files:
  - docs/decisions/2026-07-24-cyberskill-design-package.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The team MUST settle, in writing, whether the published design-system packages can be consumed, because the rest of the DS work forks on that answer.

1. The investigation MUST determine whether a published CyberSkill design package is installable from a reachable registry under the project's credentials. (Historical names `@cyberskill/tokens` / `@cyberskill/react` / `@cyberskill/style-packs` were superseded by the monolith `@cyberskill/design`.)
2. If it installs, the project SHOULD consume it and apply the CyberSkill theme on top; if it does not, the project MUST keep the hand-ported tokens (TASK-DS-001) as the source of truth.
3. The outcome MUST be recorded as a dated decision note resolving the Phase 0 open question either way.

## §2 Acceptance

- A reproducible install attempt is documented with its result (success or the exact failure).
- A decision note states the chosen path and updates the dependency on TASK-DS-001.

## §3 Evidence

**Resolved 2026-07-24.** `@cyberskill/design@1.0.0` installs from the public npm registry. First-slice adoption: package `styles.css`, Lumi identity attrs on `<html>`, live package `Button` on the consent banner, token bridge in `globals.css`. Decision: `docs/decisions/2026-07-24-cyberskill-design-package.md`. Hand-ported storytelling tokens remain until a follow-up migration.