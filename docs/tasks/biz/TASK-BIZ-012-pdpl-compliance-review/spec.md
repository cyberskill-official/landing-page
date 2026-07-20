---
id: TASK-BIZ-012
title: "Formal PDPL / Decree 356 review, including the Anthropic cross-border transfer"
status: ready_to_implement
class: improvement
priority: MUST
owner: human
depends_on: [TASK-OPS-013, TASK-BIZ-016]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-8, audit-A/phase-3-item-16]
---

# TASK-BIZ-012: Formal PDPL / Decree 356 review, including the Anthropic cross-border transfer

## 0. Why (evidence)

Vietnam's Personal Data Protection Law (Law 91/2025/QH15) took effect on 1 January 2026 and its guiding Decree 356/2025/ND-CP was issued 31 December 2025, replacing Decree 13/2023. It is consent-centric and requires explicit, granular, informed consent. The Lumi chat sends visitor-typed content to Anthropic, which is a cross-border transfer potentially requiring a Transfer Impact Assessment. The stakes are named plainly by audit A: fines up to 5% of prior-year annual revenue for cross-border transfer breaches, and 72-hour breach notification. Article 38 gives small enterprises and start-ups a right to choose on certain provisions (reported as a five-year grace period), which likely covers CyberSkill today - but "likely" is not a position a company scaling globally should hold without a review.

## 1. Description (normative)

- 1.1 A formal review SHALL be conducted (counsel or a qualified adviser) covering: the lawful basis and consent mechanics for the contact form, the chat, and the newsletter; the cross-border transfer to Anthropic; **CyberOS as processor/sub-processor for leads, transcripts, and any content stored there (TASK-BIZ-016)**; retention periods; and the Article 38 small-enterprise position.
- 1.2 A Transfer Impact Assessment (or the recorded, reasoned decision that Article 38 exempts it) SHALL exist for the Anthropic transfer.
- 1.3 A 72-hour breach-notification procedure SHALL be written, with a named owner and a rehearsed contact path.
- 1.4 The privacy policy SHALL be updated to match whatever the review concludes, EN and VN, and the in-product disclosures (TASK-OPS-013) SHALL match the policy.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the review exists, is dated, and names its author - evidence: the document
- [ ] AC for 1.2 - the TIA (or the recorded Article 38 position) exists - evidence: the document
- [ ] AC for 1.3 - the breach procedure exists with a named owner - test: `docs/breach-procedure`
- [ ] AC for 1.4 - the privacy policy and the product disclosures agree, both locales - test: `content/privacy-analytics-parity`

## 3. Edge cases

- An EU visitor triggers GDPR as well as PDPL - the review must cover both.
- A future retargeting pixel changes the answer - the review must state what would re-open it.

## 4. Out of scope / non-goals

- Implementing consent UI (TASK-OPS-013).

## 5. Protected invariants this task must not weaken

- Personal data is never transferred cross-border without a disclosed, recorded lawful basis.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
