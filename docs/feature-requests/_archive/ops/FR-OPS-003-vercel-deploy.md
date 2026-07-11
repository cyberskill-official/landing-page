---
id: FR-OPS-003
title: "Vercel deploy config, runbook, and live production at cyberskill.world"
module: OPS
priority: MUST
status: done
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-OPS-001]
blocks: []
source_pages:
  - "research doc §F (Next.js on Vercel), §L (deploy + CI)"
source_decisions:
  - .cyberos-memory/decisions/2026-06-22-production-launch.md
new_files:
  - vercel.json
  - docs/deploy/vercel-runbook.md
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Production MUST be reproducible from version control, not from memory.

1. `vercel.json` MUST pin the build, output, and routing configuration so a
   deploy is deterministic from the committed file.
2. `docs/deploy/vercel-runbook.md` MUST document the deploy steps, the
   environment the build expects, and the rollback path.
3. The production site MUST be live at https://cyberskill.world and MUST serve
   the App Router build behind that domain.

## §2 Acceptance

- `vercel.json` is present and drives the production build.
- The runbook covers deploy plus rollback.
- https://cyberskill.world resolves to the current build.

## §3 Evidence

Shipped, verified, live.
