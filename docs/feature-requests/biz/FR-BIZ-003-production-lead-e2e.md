---
id: FR-BIZ-003
title: "Prove the lead pipeline end to end in production"
status: ready_to_implement
class: improvement
priority: MUST
owner: human
depends_on: [FR-BIZ-001]
routed_back_count: 0
awh: N/A
traces_to: [growth/LEAD-05]
---

# FR-BIZ-003: Prove the lead pipeline end to end in production

## 0. Why (evidence)

Only a real submission through the real site proves the whole chain. Everything else is an assumption.

## 1. Description (normative)

- 1.1 A real submission SHALL be made through the classic form on /en, through the Lumi chat lead flow, and once on /vi.
- 1.2 Each SHALL be confirmed to arrive on every configured sink: the email at info@, the Slack ping, the CyberOS record.
- 1.3 Replying to the acknowledgement SHALL be confirmed to reach the sender (Reply-To correctness).
- 1.4 The evidence (timestamps, message links, screenshots) SHALL be recorded in docs/verification/.

## 2. Acceptance criteria

- [ ] AC for 1.1 - three submissions confirmed on every configured sink - evidence: verification record
- [ ] AC for 1.2 - the Reply-To round trip works - evidence: verification record
- [ ] AC for 1.3 - the record is dated and committed - test: `docs/post-deploy-verification`
- [ ] AC for 1.4 - the evidence file exists under docs/verification/ with timestamps and links - test: `docs/post-deploy-verification`

## 3. Edge cases

- Test leads must be identifiable and removable from the CRM afterwards.

## 4. Out of scope / non-goals

- The weekly synthetic check (FR-OPS-010) - this is the first, manual proof.

## 5. Protected invariants this FR must not weaken

- A submitted lead is never silently lost.
