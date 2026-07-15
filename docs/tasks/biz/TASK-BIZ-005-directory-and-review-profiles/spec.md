---
id: TASK-BIZ-005
title: "Create the directory profiles and earn verified reviews"
status: ready_to_implement
class: improvement
priority: MUST
owner: mixed
depends_on: [TASK-SEO-018, TASK-BIZ-004]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-3, audit-A/phase-2-item-10, audit-A/section-2, growth/PROOF-07, growth/PROOF-08]
---

# TASK-BIZ-005: Create the directory profiles and earn verified reviews

## 0. Why (evidence)

This is the decisive GEO weakness in audit A: Ahrefs' study of 75,000 brands found branded web mentions were the strongest
correlate of AI-Overview visibility (Spearman r = 0.664, versus 0.218 for backlinks), and CyberSkill has almost no branded
mentions in authoritative third-party sources - one GoodFirms review, a Facebook page with zero reviews, sparse LinkedIn.
Clutch verifies reviews via a client interview, which makes it the highest-trust B2B signal and exactly what both buyer
shortlists and LLM retrieval consume.

## 1. Description (normative)

- 1.1 Profiles SHALL be created and fully populated on Clutch, GoodFirms, DesignRush, and the local employer boards (ITviec / TopDev), using the canonical entity sentence, the same logo, the identical NAP, and site links carrying the UTM standard (TASK-OPS-011).
- 1.2 The agent SHALL assemble the profile pack in the repo first: entity sentence, long and short boilerplate (EN/VN), logo paths, service list, category suggestions, tagged URLs.
- 1.3 Review requests SHALL be sent to 3-5 past clients with direct links to the Clutch and Google review forms, and followed up once.
- 1.4 At least two verified reviews SHALL be live before this task is accepted.

## 2. Acceptance criteria

- [ ] AC for 1.1 - each profile is live, populated and consistent with the register (TASK-BIZ-004) - evidence: URLs recorded
- [ ] AC for 1.2 - the profile pack exists in the repo and every profile matches it - test: `docs/profile-pack`
- [ ] AC for 1.3 - >= 2 verified third-party reviews are live - evidence: review URLs
- [ ] AC for 1.4 - every profile's site link carries its UTM tag and attribution appears in analytics - test: `analytics/utm-capture`

## 3. Edge cases

- Clutch verification involves a client interview - the client must consent to that, not only to a quote (TASK-BIZ-006).
- A directory that publishes wrong figures (employee count, rate) must be corrected, not left.

## 4. Out of scope / non-goals

- Displaying the badges on site (TASK-SEO-015, TASK-CMS-014).

## 5. Protected invariants this task must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- The company's name, address and phone have exactly one true value (Tan Dinh Ward), used identically everywhere.
- No client name, logo, quote, photo or metric is published without recorded written permission.
