---
id: FR-CMS-015
title: "Promote How-we-build into the nav and surface the quality gates as proof"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/PROOF-11, growth/COPY-01, growth/COPY-02, audit-A/section-4]
---

# FR-CMS-015: Promote How-we-build into the nav and surface the quality gates as proof

## 0. Why (evidence)

The repository enforces budgets, accessibility checks and CI regression gates that almost no competitor can show - real,
verifiable proof that is currently invisible: /how-we-build is footer-only in EN and absent from the VN footer, and the
Team nav item points at an anchor that does not match the section id (#team vs #proof).

## 1. Description (normative)

- 1.1 How-we-build SHALL appear in the main navigation in both locales, and the VN footer SHALL reach parity with the EN footer.
- 1.2 A gates band SHALL render on that page naming the checks that actually run in CI, each linked to its evidence (workflow file or budget).
- 1.3 The Team nav item SHALL point at the real route (FR-WEB-012), and the stale anchor SHALL be removed sitewide.
- 1.4 No gate SHALL be named that CI does not actually run.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the nav and both footers contain the link - test: `nav/footer-parity`
- [ ] AC for 1.2 - each named gate maps to a real CI job - test: `content/gates-claims-parity`
- [ ] AC for 1.3 - no dangling anchor remains in either locale - test: `nav/team-link`

## 3. Edge cases

- Adding a nav item must not overflow the mobile header (FR-A11Y-011).

## 4. Out of scope / non-goals

- Rewriting the how-we-build copy.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
