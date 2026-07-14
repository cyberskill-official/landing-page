---
id: FR-CMS-006
title: "About, team, and culture content (recruiting + trust surface)"
status: ready_to_implement
class: product
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-006, FR-OPS-019]
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-2-item-8, audit-C/content-credibility, growth/PROOF-05]
---

# FR-CMS-006: About, team, and culture content (recruiting + trust surface)

## 0. Why (evidence)

Audits A and C both call the missing team the biggest authenticity gap: the site promises "senior engineers own the work
end to end" and "you always know who is building what", the nav offers a Team link, and it lands on a one-line company
statement with no named people. This FR owns the content; FR-WEB-012 owns the route, the Person JSON-LD and the nav fix;
FR-BIZ-006 owns the consent.

## 1. Description (normative)

- 1.1 The content SHALL cover the company story (founded 2020, Ho Chi Minh City, the slogan), the team and the working culture, sourced from the publishable content read model (FR-CMS-001 module today; CyberOS via FR-OPS-019 when configured, with git fallback).
- 1.2 Each team entry SHALL support a name, a role, a short bio, an optional photo, an optional profile link and an optional employee-voice quote.
- 1.3 Every string SHALL ship English and Vietnamese, with the Vietnamese reviewed by a native speaker (FR-CMS-003).
- 1.4 A person SHALL appear only with their recorded written consent, and SHALL be removable in one commit if it is withdrawn.
- 1.5 The content SHALL double as a recruiting surface, linking to open-role intent without hardcoding job copy in a component.

## 2. Acceptance criteria

- [ ] AC for 1.1 - story, team and culture render from the shared source in both locales - test: `content/about-team-shape`
- [ ] AC for 1.2 - a member renders correctly with only name + role, and with the full set - test: `content/about-team-shape`
- [ ] AC for 1.3 - a missing VN value fails the build - test: `content/vi-key-parity`
- [ ] AC for 1.4 - a member without a consent record fails the build - test: `content/team-consent`
- [ ] AC for 1.5 - the careers link resolves and carries no hardcoded job copy - test: `lint/no-hardcoded-copy`

## 3. Edge cases

- An engineer who consents to first name + role but no photo.
- A person leaving the company - removal must not break the layout or leave a dangling JSON-LD node.

## 4. Out of scope / non-goals

- The /team route (FR-WEB-012).
- Obtaining the photos and consents (FR-BIZ-006).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- No personal data is published without the named person's recorded consent (PDPL).
- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
