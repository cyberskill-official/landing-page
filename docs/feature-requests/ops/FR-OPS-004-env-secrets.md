---
id: FR-OPS-004
title: "Env and secret management across production and preview with separate keys"
module: OPS
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-OPS-003]
blocks: []
source_pages:
  - "research doc §L (secrets), §G (Genie proxy key)"
new_files:
  - .env.example
  - docs/deploy/env-vars.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Secrets MUST be scoped per environment and MUST never live in the repo.

1. Production and preview MUST use separate API keys so a leaked preview key
   cannot reach production traffic or quota.
2. `.env.example` MUST enumerate every required variable by name with no real
   values, so a fresh checkout knows what to set.
3. `docs/deploy/env-vars.md` MUST document each variable, where it is set, and
   which environments consume it.

## §2 Acceptance

- Production and preview read distinct keys.
- `.env.example` lists every variable with placeholders only.
- The env doc maps each variable to its environment.

## §3 Evidence

Not yet implemented; acceptance pending build.
