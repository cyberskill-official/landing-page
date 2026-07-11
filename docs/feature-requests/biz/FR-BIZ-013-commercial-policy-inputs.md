---
id: FR-BIZ-013
title: "Decide the commercial policy the site is allowed to publish"
status: ready_to_implement
class: improvement
priority: MUST
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-2-item-9, audit-C/content-credibility, growth/CONV-01, growth/CONV-06, growth/CONV-09]
---

# FR-BIZ-013: Decide the commercial policy the site is allowed to publish

## 0. Why (evidence)

Six FRs in this backlog are blocked on decisions only the owner can make, and each of them becomes a public commitment the
moment it ships: the CTA promise (FR-CTA-015), the engagement models and starting ranges (FR-CTA-017), the capacity line
(FR-CTA-018), the verify-us registration number (FR-CMS-014), the partnership offer (FR-CMS-019), and the hero audience line
(FR-CMS-020). This FR is the single place those decisions are recorded, so no agent ever invents one.

## 1. Description (normative)

- 1.1 The owner SHALL decide and record: the outcome promise the CTA may make; the engagement models offered, with typical starting ranges and timelines; the true capacity (projects per quarter, next open slot); the business registration number to publish; the partnership offer; and the audience the hero names.
- 1.2 Each decision SHALL be recorded in the content module with a decided-on date and a review cadence.
- 1.3 No FR that depends on this one SHALL ship a placeholder, an estimate, or an agent-invented value.
- 1.4 A decision the company cannot keep SHALL be changed or withheld, not softened in the copy.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every listed decision has a recorded value and date - test: `content/commercial-policy-record`
- [ ] AC for 1.2 - the dependent FRs read their values from that record, not from a component - test: `content/no-placeholders`
- [ ] AC for 1.3 - a stale decision (past its review date) blocks the dependent copy from rendering - test: `content/capacity-line`

## 3. Edge cases

- A published range constrains the sale - the review cadence exists so it can be corrected without a code change.
- A promise made and broken is worse than no promise (see FR-BIZ-009: the measured reply time governs).

## 4. Out of scope / non-goals

- Building the sections that display these (FR-CTA-015/017/018, FR-CMS-014/019/020).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
