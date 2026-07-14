---
id: FR-CMS-009
title: "Replace placeholder case studies with cleared real outcomes"
status: ready_to_implement
class: product
priority: MUST
owner: mixed
depends_on: [FR-BIZ-006, FR-CMS-011, FR-OPS-019]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-1, audit-B/finding-8-medium, audit-C/content-credibility, growth/PROOF-02]
---

# FR-CMS-009: Replace placeholder case studies with cleared real outcomes

## 0. Why (evidence)

The #1 gap in all three audits. Case studies are anonymized ("a logistics client"), roughly three paragraphs each, with no
company name, no numbers, no screenshots, no quote. Audit A's benchmark reads "reduced time-to-deploy from six weeks to
two days for a major global retailer"; CyberSkill's reads "the operations team works from one live view". Audit C calls
named case studies with measurable results table stakes and the highest-impact conversion asset. Raised to MUST.

## 1. Description (normative)

- 1.1 Each case study SHALL carry a real client context, the problem, the work done and quantified outcomes: 2-3 numbers with units, a measurement period and a source note. Entities live in the publishable content source (git module today; CyberOS via FR-OPS-019 when configured).
- 1.2 No invented, estimated or agency-calculated metric SHALL be published as a client outcome; the number is the client's own measurement or it does not ship.
- 1.3 Logos, screenshots and quotes SHALL be used only with the client's written permission on file; uncleared assets SHALL be impossible to render.
- 1.4 A case study that remains anonymized SHALL be labelled explicitly as an anonymized pattern, and SHALL NOT be presented as a client result.
- 1.5 Each case study SHALL ship English and Vietnamese narrative fields, with the Vietnamese reviewed (FR-CMS-003) and the category tags localized.

## 2. Acceptance criteria

- [ ] AC for 1.1 - every published case study renders 2-3 metrics with units, a period and a source note - test: `content/case-study-template`
- [ ] AC for 1.2 - a metric without a source note fails the build - test: `content/case-study-template`
- [ ] AC for 1.3 - an asset without a permission reference fails the build - test: `content/testimonial-permission`
- [ ] AC for 1.4 - an anonymized case study renders the pattern label - test: `content/case-study-template`
- [ ] AC for 1.5 - no placeholder case-study text remains, and VN tags are Vietnamese - test: `content/no-placeholders`

## 3. Edge cases

- An NDA client permits industry + metrics but not the name - the template supports it (FR-CMS-011 clause 1.2).
- A screenshot containing client data must be cleared and redacted.
- A metric that later proves wrong must be correctable without republishing the whole page.

## 4. Out of scope / non-goals

- The template (FR-CMS-011).
- Obtaining the permissions and numbers (FR-BIZ-006).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
