---
id: FR-BIZ-010
title: "Standing programs: welcome sequence, founder LinkedIn, share workflow, quarterly client letter"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-CTA-014, FR-BIZ-007]
routed_back_count: 0
awh: N/A
traces_to: [growth/NURT-02, growth/NURT-06, growth/NURT-07, growth/PROOF-06, audit-A/phase-5]
---

# FR-BIZ-010: Standing programs: welcome sequence, founder LinkedIn, share workflow, quarterly client letter

## 0. Why (evidence)

Audit A's Phase 5 is explicit that the compounding work is a cadence, not a project: one original technical article a month,
refreshed case-study metrics, tracked AI share-of-voice. Audit C: thoughtbot's content-led credibility is replicable without an
enterprise budget. None of this is code - it is a set of standing commitments with owners.

## 1. Description (normative)

- 1.1 A three-email welcome sequence SHALL be drafted (EN, and VN where the lead's locale calls for it), plain-text in tone, with no pitch before the third email, and an owner and a sending procedure SHALL be written down.
- 1.2 A founder LinkedIn program SHALL be started: a profile checklist plus the first four posts drafted from existing material, then a sustained cadence of 1-2 posts a week.
- 1.3 A share workflow SHALL be documented: every published note goes to the LinkedIn company page and the founder profile, VN notes go to the Zalo OA, and every link carries its UTM tag.
- 1.4 A quarterly client letter template SHALL exist and the first letter SHALL be sent.
- 1.5 Each program SHALL name its owner and its cadence; a program with no owner SHALL NOT be started.

## 2. Acceptance criteria

- [ ] AC for 1.1 - three approved welcome emails exist per locale with a written sending procedure - test: `docs/nurture-assets`
- [ ] AC for 1.2 - the LinkedIn checklist and four drafts exist; the first post is live - evidence: post URL
- [ ] AC for 1.3 - the share checklist exists and one note has been through the full loop - test: `docs/nurture-assets`
- [ ] AC for 1.4 - the client-letter template exists and the first letter is sent - evidence: the send
- [ ] AC for 1.5 - every started program names an owner and a cadence; a program with neither is not started - test: `docs/nurture-assets`

## 3. Edge cases

- A cadence that is started and abandoned damages credibility more than never starting - the owner and cadence must be realistic.
- Marketing email goes only to confirmed opt-ins (FR-CTA-014).

## 4. Out of scope / non-goals

- Writing the insights posts themselves (FR-CMS-007).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- Marketing email is sent only to a contact with a recorded, confirmed opt-in.
