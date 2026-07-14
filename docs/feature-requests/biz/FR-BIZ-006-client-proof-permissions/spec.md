---
id: FR-BIZ-006
title: "Obtain the client permissions and proof assets: names, logos, metrics, quotes, photos"
status: ready_to_implement
class: improvement
priority: MUST
owner: mixed
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-1, audit-A/phase-1-item-2, audit-C/content-credibility, audit-C/phase-2, growth/PROOF-01, growth/PROOF-05]
---

# FR-BIZ-006: Obtain the client permissions and proof assets: names, logos, metrics, quotes, photos

## 0. Why (evidence)

The single biggest gap in all three audits, and the one the agent cannot solve alone: every proof FR in this backlog
(FR-CMS-011 case-study template, FR-CMS-012 testimonials, FR-CMS-013 logos, FR-WEB-012 team page) is blocked on assets only
the owner can obtain. Audit A: "a technically sophisticated buyer evaluating an offshore partner will ask 'who have you done
this for, and what happened?' - and the site cannot answer."

## 1. Description (normative)

- 1.1 A written permission request SHALL be drafted (EN and VN) asking each chosen past client for: use of the company name and logo, 2-3 quantified outcomes with their source, a short quote with name/title/photo, and screenshot approval - with an easy opt-down to "industry only".
- 1.2 Permission SHALL be sought from at least three past clients, and at least one full, named, quantified case study SHALL be secured.
- 1.3 Every granted permission SHALL be recorded (who, what was permitted, when, by which named person) and referenced from the publishable content source - today the content module (FR-CMS-012 clause 1.4); once FR-OPS-019 ships, also as metadata on the CyberOS content entity so permissions travel with the asset.
- 1.4 Team members SHALL likewise consent, in writing, to their name, role, photo and profile link appearing on the site (FR-WEB-012).
- 1.5 No asset SHALL enter the repository before its permission record exists.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the request drafts exist in both languages - test: `docs/permission-request-drafts`
- [ ] AC for 1.2 - >= 3 requests sent; >= 1 full named case study granted - evidence: permission records
- [ ] AC for 1.3 - every proof asset in the repo has a matching permission record - test: `content/testimonial-permission`
- [ ] AC for 1.4 - every named team member has a recorded consent - test: `content/team-consent`
- [ ] AC for 1.5 - no proof asset (logo, photo, quote, screenshot, metric) exists in the repo without a matching permission record - test: `content/testimonial-permission`

## 3. Edge cases

- An NDA client may permit industry + metrics but not the name - the template supports that (FR-CMS-011 clause 1.2).
- A permission later withdrawn must be removable in one commit, and the record updated.
- Metrics must be the client's own measurement, not an estimate the agency invented.

## 4. Out of scope / non-goals

- Building the templates that display the proof (FR-CMS-011/012/013, FR-WEB-012).

## 5. Protected invariants this FR must not weaken

- No client name, logo, quote, photo or metric is published without recorded written permission.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- Personal data (names, photos) is published only with explicit, recorded consent (PDPL).
