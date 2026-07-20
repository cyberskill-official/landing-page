---
id: TASK-CHAR-025
title: "Retrieval grounding over company and portfolio facts for richer answers"
module: CHAR
priority: COULD
status: on_hold
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-CHAR-011]
related_tasks: [TASK-CHAR-010, TASK-CHAR-026]
source_pages:
  - "research doc §I (conversational Genie), §N (knowledge base)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Lumi SHOULD answer from grounded facts, not memory alone.

1. The proxy MUST retrieve relevant snippets from a curated company and portfolio knowledge base and pass them as context to the model.
2. Retrieved facts MUST come from a maintained source of truth (services, process, case studies), not from arbitrary web content.
3. Answers MUST stay grounded: when retrieval returns nothing relevant, Lumi MUST decline to invent specifics and MUST steer to a human or the form.
4. Grounding MUST extend the persona system prompt (TASK-CHAR-011) without exposing raw retrieval internals to the client.

## §2 Acceptance

- A question about services or a case study is answered from retrieved facts.
- An out-of-scope question yields a grounded decline, not a fabrication.
- The knowledge source is editable in one maintained place.

## §3 Evidence

Not yet implemented; acceptance pending build.
