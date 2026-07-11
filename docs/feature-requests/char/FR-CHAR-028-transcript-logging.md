---
id: FR-CHAR-028
title: "Persist chat transcripts and lead records server-side, including partial conversations"
module: CHAR
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-010]
related_frs: [FR-CHAR-026, FR-CHAR-027]
source_pages:
  - "research doc §I (conversational Genie), §G (secrets + privacy)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Conversations and leads MUST be persisted for follow-up and learning.

1. The server MUST persist chat transcripts and lead records to a database, keyed
   by session so a conversation can be reconstructed.
2. Partial conversations MUST be logged too, not only completed leads, so
   drop-off can be studied.
3. Persistence MUST happen server-side from the proxy (FR-CHAR-010); the client
   MUST NOT write directly to the store.
4. Stored records MUST carry a timestamp and MUST follow the project's privacy
   stance, with no secrets written into the transcript.

## §2 Acceptance

- A finished conversation is retrievable from the store by session.
- A conversation that ends early is still recorded.
- The client has no direct write path to the store.

## §3 Evidence

Not yet implemented; acceptance pending build.
