---
id: FR-CHAR-028
title: "Persist chat transcripts and lead records server-side, including partial conversations"
status: ready_to_implement
class: product
priority: SHOULD
owner: agent
depends_on: [FR-OPS-005, FR-OPS-013]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-I, research-doc/section-G, audit-A/section-8]
---

# FR-CHAR-028: Persist chat transcripts and lead records server-side, including partial conversations

## 0. Why (evidence)

Research doc §I + §G. Drop-off is the most valuable thing the chat can teach, and today nothing is stored: a conversation
that ends before capture leaves no trace. Audit A adds the constraint that visitor-typed content sent to Anthropic is a
cross-border transfer under PDPL - so what is stored, for how long, and on what basis is not a free choice.

## 1. Description (normative)

- 1.1 The server SHALL persist chat transcripts and lead records to the datastore (FR-OPS-005), keyed by session so a conversation can be reconstructed.
- 1.2 Partial conversations SHALL be persisted too, not only completed leads, so drop-off can be studied.
- 1.3 Persistence SHALL happen server-side from the /api/genie proxy; the client SHALL have no direct write path to the store.
- 1.4 Stored records SHALL carry a timestamp, a locale, a retention date and the lawful basis, and SHALL NOT contain secrets; the retention period SHALL be enforced by deletion, not by policy alone.
- 1.5 A visitor SHALL be told, before the first message, that the conversation is processed by Anthropic and stored, per FR-OPS-013.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a finished conversation is retrievable by session id - test: `genie/transcript-persist`
- [ ] AC for 1.2 - a conversation abandoned after two turns is still stored - test: `genie/transcript-partial`
- [ ] AC for 1.3 - the client bundle contains no store credential and no write path - test: `ci/no-public-secrets`
- [ ] AC for 1.4 - a record past its retention date is deleted by the retention job - test: `genie/transcript-retention`
- [ ] AC for 1.5 - the disclosure renders before the first message, EN and VN - test: `genie/transfer-disclosure`

## 3. Edge cases

- A transcript containing personal data of a third party the visitor typed.
- The store being unavailable must not break the chat - persistence is best-effort, but a total failure must alert (FR-OPS-010).
- A deletion request from a visitor must remove the transcript (PDPL right to erasure).

## 4. Out of scope / non-goals

- Provisioning the datastore (FR-OPS-005).
- The formal PDPL review (FR-BIZ-012).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: the Anthropic and every other key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- Personal data is stored only with a disclosed lawful basis and a bounded retention period (PDPL).
