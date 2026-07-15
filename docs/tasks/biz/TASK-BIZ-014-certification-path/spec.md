---
id: TASK-BIZ-014
title: "Decide and start the certification path (ISO 27001 / SOC 2)"
status: ready_to_implement
class: improvement
priority: COULD
owner: human
depends_on: [TASK-BIZ-005]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-2-item-12, audit-A/threshold-triggers, audit-C/phase-3, audit-C/trust-table]
---

# TASK-BIZ-014: Decide and start the certification path (ISO 27001 / SOC 2)

## 0. Why (evidence)

Audit A's benchmark is blunt: TMA and FPT carry CMMI L5 and ISO 27001/9001; Saigon Technology carries ISO; CyberSkill shows
none. Audit C lists certifications as the trust element that unlocks enterprise and regulated deals, especially international
ones. Audit A also gives the trigger: if Clutch reviews reach 10+ at 4.8 stars, prioritise ISO 27001 to move upmarket.

## 1. Description (normative)

- 1.1 The owner SHALL decide whether to pursue ISO 27001, SOC 2 Type II, both, or neither, and SHALL record the reasoning and the trigger that would change the answer.
- 1.2 If pursued, a scoped plan SHALL exist: the standard, the scope boundary, the gap assessment, the timeline and the budget.
- 1.3 Until certified, the site SHALL claim only the verifiable engineering commitments it already keeps (TASK-CMS-014) - never an in-progress certification as if it were held.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the decision and its trigger are recorded - test: `docs/certification-decision`
- [ ] AC for 1.2 - if pursued, the scoped plan exists - evidence: the plan
- [ ] AC for 1.3 - no uncertified claim appears on the site - test: `content/gates-claims-parity`

## 3. Edge cases

- ISO 27001 is a real cost and a real operating burden - deciding not to pursue it is a legitimate, recordable outcome.
- 'ISO 27001 in progress' on a website is a claim buyers check.

## 4. Out of scope / non-goals

- The audit itself.

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
