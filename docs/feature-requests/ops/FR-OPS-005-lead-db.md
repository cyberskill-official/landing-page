---
id: FR-OPS-005
title: "Lead and transcript datastore behind /api/lead and /api/genie"
module: OPS
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CTA-001, FR-CHAR-028]
blocks: []
source_pages:
  - "research doc §G (lead capture), §H (chat persistence)"
new_files:
  - lib/db/schema.ts
  - lib/db/client.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Captured leads and chat transcripts MUST be persisted, not dropped after the
request.

1. A managed datastore (Vercel Postgres or Supabase) MUST persist lead
   submissions received by `/api/lead`.
2. The same datastore MUST persist Genie chat transcripts received by
   `/api/genie`, linked to a lead where one exists.
3. The schema MUST be version-controlled in `lib/db/schema.ts` so the data
   model changes only through a reviewed diff.

## §2 Acceptance

- A submission to `/api/lead` is stored and retrievable.
- A Genie conversation is stored and linkable to its lead.
- The schema lives in `lib/db/schema.ts`.

## §3 Evidence

Not yet implemented; acceptance pending build.
