---
id: FR-CMS-013
title: "Client logo strip, with an honest interim line until logos are cleared"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/phase-1-item-2, audit-B/finding-8-medium, audit-C/trust-table, growth/PROOF-04]
---

# FR-CMS-013: Client logo strip, with an honest interim line until logos are cleared

## 0. Why (evidence)

Every audit lists client logos as table stakes and finds none. The honest interim, available today without any permission,
is a line naming the industries served ("Teams in logistics, education and retail run on software we built").

## 1. Description (normative)

- 1.1 An industries line SHALL render near the hero stats, sourced from config, in both locales - shipping now, without waiting for logos.
- 1.2 A grayscale, static (non-animated) logo row SHALL render near the hero and the contact band once at least three cleared logos exist in config.
- 1.3 Each logo SHALL carry the company name as alt text and a permission reference; an uncleared logo SHALL be impossible to render.
- 1.4 The logo row SHALL stay inside the image budget and SHALL NOT shift layout (FR-PERF-007).

## 2. Acceptance criteria

- [ ] AC for 1.1 - the industries line renders, both locales - test: `content/logo-strip`
- [ ] AC for 1.2 - with fewer than three cleared logos, no logo row renders - test: `content/logo-strip`
- [ ] AC for 1.3 - a logo without a permission reference fails the build - test: `content/testimonial-permission`
- [ ] AC for 1.4 - the row causes no CLS and stays in budget - test: `lighthouse:mobile-cls`

## 3. Edge cases

- Logos in dark mode need a light variant or a filter - both themes must be legible.
- A client who permits the name but not the logo: the industries line covers them.

## 4. Out of scope / non-goals

- Obtaining the logo files and permissions (FR-BIZ-006).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- No client name, logo, quote, photo or metric is published without recorded written permission.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
