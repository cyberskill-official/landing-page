---
id: FR-SEO-019
title: "Enrich the Organization graph: sameAs, founder, LocalBusiness, and visible profile links"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-7-medium, audit-A/phase-1-item-5, growth/PROOF-12, growth/PROOF-09]
---

# FR-SEO-019: Enrich the Organization graph: sameAs, founder, LocalBusiness, and visible profile links

## 0. Why (evidence)

Audit B: the Organization structured data has no sameAs property and the site links to nothing external except the phone
number - no LinkedIn, GitHub, Clutch or Facebook - which are exactly the signals that connect a brand entity across the
web and let an answer engine identify it. Audit A adds LocalBusiness (DUNS, geo, hours) to the same ask. The footer today
has no social row at all, which reads as a red flag for a software company.

## 1. Description (normative)

- 1.1 components/seo/OrganizationJsonLd.tsx SHALL emit `sameAs` containing every live external profile URL held in config, `founder` as a Person node, and a LocalBusiness (or ProfessionalService) node carrying the postal address, geo coordinates and opening hours.
- 1.2 Only URLs present in config SHALL be emitted - no placeholder or aspirational profile link.
- 1.3 The footer SHALL render a config-driven social row (LinkedIn, GitHub, Zalo, Facebook and any others configured), icons with accessible names, `rel="me noopener"`, hidden entirely when no URL is configured.
- 1.4 The emitted graph SHALL validate in the Rich Results test and the output SHALL be recorded.

## 2. Acceptance criteria

- [ ] AC for 1.1 - sameAs, founder and LocalBusiness nodes present and valid - test: `seo/organization-jsonld`
- [ ] AC for 1.2 - an unconfigured profile emits no URL and renders no icon - test: `seo/organization-jsonld`
- [ ] AC for 1.3 - the footer row renders with accessible names, EN and VN - test: `check:a11y:routes`
- [ ] AC for 1.4 - Rich Results validation recorded - test: `docs/richresults-evidence`

## 3. Edge cases

- An empty config must not emit an empty sameAs array (omit the property).
- The map/geo coordinates must match the Tan Dinh Ward address, not the old Dakao one (FR-BIZ-004).

## 4. Out of scope / non-goals

- Creating the profiles themselves (FR-BIZ-005, FR-BIZ-007).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
