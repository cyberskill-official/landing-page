---
id: TASK-BIZ-004
title: "Claim the Google Business Profile and reconcile the NAP everywhere"
status: ready_to_implement
class: improvement
priority: MUST
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-3, audit-A/phase-1-item-4, audit-A/section-1]
---

# TASK-BIZ-004: Claim the Google Business Profile and reconcile the NAP everywhere

## 0. Why (evidence)

Audit A found no confirmed Google Business Profile, and the external citations diverge from the site's own (correct) NAP: the Google Play developer listing still shows the OLD ward ("Dakao ward, district 1") and an individual's email address (thai-anh.trinh@cyberskill.world); appsruntheworld lists the address as "x, Ho Chi Minh, 700000"; GoodFirms carries its own figures. The Dakao -> Tan Dinh renaming is a real administrative change, and inconsistent citations suppress local SEO and teach AI engines the wrong facts about the entity.

## 1. Description (normative)

- 1.1 A Google Business Profile SHALL be claimed and fully populated for the Tan Dinh Ward address, category "Software company", with the canonical entity sentence (TASK-SEO-018), hours, photos and the site link.
- 1.2 The NAP SHALL be corrected on every discoverable external listing: Google Play developer info (address AND the company email, not an individual's), appsruntheworld, GoodFirms, LinkedIn, Facebook, and any other profile found.
- 1.3 A single register of external listings SHALL be kept in the repo (URL, what it says, corrected on which date) so drift is detectable.
- 1.4 5-10 client reviews SHALL be solicited for the profile (TASK-BIZ-005 covers the request mechanics).

## 2. Acceptance criteria

- [ ] AC for 1.1 - the GBP is live, verified, and shows the Tan Dinh Ward NAP - evidence: profile URL recorded
- [ ] AC for 1.2 - every listing in the register shows the identical name, address and phone - evidence: register with dates
- [ ] AC for 1.3 - the Google Play developer listing no longer shows Dakao or an individual's email - evidence: screenshot
- [ ] AC for 1.4 - the register is committed and reviewed quarterly - test: `docs/nap-register`

## 3. Edge cases

- A listing that cannot be edited (a scraper aggregator) must be recorded as known-stale, with a correction request sent.
- The phone number is the founder's - decide deliberately whether it stays the public NAP number.

## 4. Out of scope / non-goals

- Schema markup for the address (TASK-SEO-019).

## 5. Protected invariants this task must not weaken

- The company's name, address and phone have exactly one true value (Tan Dinh Ward), used identically everywhere.
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
