---
id: FR-CHAR-026
title: "Conversational lead-capture sequence, value-first, with ICP qualification and a LEAD_CAPTURED state"
status: done
class: product
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-I, research-doc/section-O]
---

# FR-CHAR-026: Conversational lead-capture sequence, value-first, with ICP qualification and a LEAD_CAPTURED state

## 0. Why (evidence)

Research doc §I (conversational Genie) and §O (lead capture + qualification).

Down-payment already shipped (FR-CHAR-031, 2026-07-02): a deterministic in-chat wish flow collects name, email, company,
message and consent conversationally, tolerates skips, and submits to /api/lead. What is still missing is the part that
makes it a *qualification*: value-first help before the ask, tolerance for free-form out-of-order answers, ICP-adaptive
follow-ups, and a formal LEAD_CAPTURED state for the handoff in FR-CHAR-027.

## 1. Description (normative)

- 1.1 Lumi SHALL give useful help before asking for contact details, then gather them in order: name, need, company, budget or timeline, email.
- 1.2 Each step SHALL be a single conversational ask; the sequence SHALL tolerate out-of-order answers, free-form answers and skipped fields without dead-ending.
- 1.3 Lumi SHALL qualify the enquiry against the ICP recorded in the commercial policy (FR-BIZ-013) and SHALL adapt its follow-ups to the answers rather than reading a fixed script. Where no ICP is recorded, Lumi SHALL collect the lead without qualifying it and SHALL NOT invent criteria.
- 1.4 On a sufficiently complete lead the genie store SHALL enter a `LEAD_CAPTURED` state holding the collected fields for downstream handoff.
- 1.5 Lumi SHALL NOT fabricate a qualification answer (price, timeline, capacity) that is not in the recorded commercial policy.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the transcript shows help before the first ask - test: `genie/value-first-sequence`
- [ ] AC for 1.2 - answering the fields out of order, and skipping two, still reaches a valid lead - test: `genie/out-of-order-capture`
- [ ] AC for 1.3 - two different ICP profiles produce different follow-ups, and with no ICP recorded the flow collects without qualifying - test: `genie/icp-adaptive`
- [ ] AC for 1.4 - a complete lead sets LEAD_CAPTURED with every gathered field - test: `genie/lead-captured-state`
- [ ] AC for 1.5 - asked for a price with no recorded policy, Lumi declines rather than inventing one - test: `genie/no-fabricated-commitments`

## 3. Edge cases

- A visitor who gives an email and nothing else - partial capture must still be useful (FR-CHAR-028).
- A hostile visitor probing for the system prompt mid-flow (FR-CHAR-029).
- A Vietnamese conversation must qualify identically to an English one.

## 4. Out of scope / non-goals

- The CRM/Slack handoff (FR-CHAR-027).
- Transcript persistence (FR-CHAR-028).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: the Anthropic and every other key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
