---
id: TASK-BIZ-007
title: "Establish the social and messaging profiles the site can link to"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-7-medium, growth/PROOF-09, growth/CONV-05]
---

# TASK-BIZ-007: Establish the social and messaging profiles the site can link to

## 0. Why (evidence)

Audit B: the site links to nothing external except the phone number - no LinkedIn, GitHub, Clutch or Facebook - and the Organization schema carries no sameAs. For a software company, no social presence at all reads as a red flag, and sameAs is how an answer engine binds the entity across the web. The code side (TASK-SEO-019, TASK-CTA-012) is blocked on the URLs.

## 1. Description (normative)

- 1.1 The following SHALL exist, be populated with the canonical entity sentence and the same logo, and their URLs SHALL be supplied to the site config: LinkedIn company page, GitHub organisation, Facebook page, Zalo OA (or the business Zalo contact), and the WhatsApp business number.
- 1.2 Any X/Twitter handle SHALL either exist (and be supplied for twitter:site) or be deliberately declined and recorded - the field is then omitted, not faked.
- 1.3 Each profile SHALL link back to cyberskill.world with its UTM tag.

## 2. Acceptance criteria

- [ ] AC for 1.1 - each profile is live and consistent with the NAP register - evidence: URLs recorded
- [ ] AC for 1.2 - the URLs are in site config and render in the footer and sameAs - test: `seo/organization-jsonld`
- [ ] AC for 1.3 - each profile links back with its UTM tag - test: `analytics/utm-capture`

## 3. Edge cases

- An abandoned profile is worse than none - each one needs an owner and a minimum cadence (TASK-BIZ-010).
- The GitHub org is public - it must not expose anything the company would not publish.

## 4. Out of scope / non-goals

- Posting to the profiles (TASK-BIZ-010).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- The company's name, address and phone have exactly one true value (Tan Dinh Ward), used identically everywhere.
