---
id: FR-BIZ-011
title: "Earn third-party mentions: listicles, local press, and an awards submission"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-005, FR-CMS-011]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-3-item-15, audit-A/phase-4-item-18, growth/SEO-08]
---

# FR-BIZ-011: Earn third-party mentions: listicles, local press, and an awards submission

## 0. Why (evidence)

Branded mentions in authoritative sources are the strongest correlate of AI-Overview inclusion (Ahrefs, r = 0.664) and
CyberSkill has effectively none: no earned media, no guest posts, no high-authority referring domains. Audit A also judges the
craft good enough to plausibly earn an Awwwards Honourable Mention or a CSSDA feature once there is showcased work behind it -
which is earned media and a trust flywheel, not vanity.

## 1. Description (normative)

- 1.1 A target list SHALL be built: the "top software companies in Vietnam" listicles that already rank, the Vietnamese tech press, and the relevant community sites - each with an author or contact and a one-line pitch angle.
- 1.2 An inclusion pitch SHALL be drafted (EN and VN) and at least five pitches sent, with results logged.
- 1.3 Once at least one named, quantified case study is live (FR-CMS-011 + FR-BIZ-006), the site SHALL be submitted to Awwwards and CSSDA.
- 1.4 Every earned mention SHALL be added to the external-listing register (FR-BIZ-004) and, where appropriate, to sameAs.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the target list and drafts exist in the repo - test: `docs/outreach-assets`
- [ ] AC for 1.2 - >= 5 pitches sent and results logged - evidence: the log
- [ ] AC for 1.3 - the awards submission is made once the proof exists - evidence: submission receipt
- [ ] AC for 1.4 - every earned mention is registered - test: `docs/nap-register`

## 3. Edge cases

- Submitting to an awards site before there is showcased work wastes the shot - the dependency is deliberate.
- Paid listicle inclusion is advertising, not earned media - it must be labelled as such if used.

## 4. Out of scope / non-goals

- Paid link buying, which is out of the question.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
