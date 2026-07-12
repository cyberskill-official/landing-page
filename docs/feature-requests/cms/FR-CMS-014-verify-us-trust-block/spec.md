---
id: FR-CMS-014
title: "\"Verify us\" block: registration, DUNS, address, repositories"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-2-item-12, audit-C/trust-table, growth/PROOF-10]
---

# FR-CMS-014: "Verify us" block: registration, DUNS, address, repositories

## 0. Why (evidence)

Audit A recommends an explicit trust/credential row even before certifications exist: the company is registered, has a
DUNS, a real address and a public engineering practice. Audit C lists third-party proof and certifications as the trust
elements buyers look for. Everything in this block is already true and simply unpublished.

## 1. Description (normative)

- 1.1 A compact block SHALL render (footer-adjacent and on /how-we-build): registered legal name, founding year, DUNS 673219568, business registration number, the Tan Dinh Ward address with a static map image linking to Google Maps (no iframe, no consent burden), and the public repository link.
- 1.2 It SHALL additionally state the verifiable engineering commitments the repo actually enforces: code review on every change, CI gates, WCAG 2.2 AA target, performance budget, PDPL-aligned data handling.
- 1.3 Every claim in the block SHALL be true today and evidenced; an unavailable field (e.g. the registration number) SHALL be omitted rather than faked.
- 1.4 The block SHALL ship EN and VN in the same commit.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the block renders every configured field, both locales - test: `content/verify-us-block`
- [ ] AC for 1.2 - an unset field is omitted with no empty row - test: `content/verify-us-block`
- [ ] AC for 1.3 - the map is a static image link, loading no third-party script - test: `headers/csp-clean-crawl`
- [ ] AC for 1.4 - each engineering claim maps to a CI gate that exists - test: `content/gates-claims-parity`
- [ ] AC for 1.4 - both locales render in the same commit; no EN-only field ships - test: `content/verify-us-block`

## 3. Edge cases

- The address must be the current Tan Dinh Ward one, matching every external listing (FR-BIZ-004).
- A claimed gate that is later removed from CI must fail the parity test.

## 4. Out of scope / non-goals

- Pursuing ISO 27001 / SOC 2 (FR-BIZ-014).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
