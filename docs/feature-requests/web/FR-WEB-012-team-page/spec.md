---
id: FR-WEB-012
title: "Real /team route with named people, replacing the on-page anchor"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-4, audit-A/phase-2-item-8, audit-C/content-credibility, growth/PROOF-05, growth/COPY-02]
---

# FR-WEB-012: Real /team route with named people, replacing the on-page anchor

## 0. Why (evidence)

All three audits land on the same contradiction: the site's pitch is "senior engineers own the work end to end" and
"you always know who is building what", the nav offers a Team link - and it jumps to a one-line company statement with no
named people, photos or credentials. Audit A calls a real Team/About page the biggest authenticity gap; audit C lists it
as a Phase 2 high-priority item. The growth backlog also flags the #team vs #proof anchor mismatch.

## 1. Description (normative)

- 1.1 A route `/[lang]/team` SHALL exist, be indexable, and render the founder plus named senior engineers, each with a role, a one-line bio and (where the person consents) a photo and a profile link.
- 1.2 The team data SHALL live in lib/content/site.ts, be typed, and render gracefully for 2 to 8 people, EN and VN.
- 1.3 The Team nav item SHALL point at the route (not an anchor), and the stale anchor mismatch (#team vs #proof) SHALL be removed.
- 1.4 A person who withholds a photo SHALL still render correctly (initials avatar), and no personal data beyond what the person approved SHALL be published.
- 1.5 The page SHALL emit Person JSON-LD linked to the Organization node, and appear in the sitemap with a real lastModified.
- 1.6 With no consented team member in config the route SHALL still render (the founder card alone, or an honest empty state) and SHALL NOT 404 or emit a dangling Person node.

## 2. Acceptance criteria

- [ ] AC for 1.1 - /en/team and /vi/team render every configured person - test: `routes/team-page`
- [ ] AC for 1.2 - the page renders with 2 and with 8 people without layout break - test: `routes/team-page`
- [ ] AC for 1.3 - the nav link resolves to the route; no dangling anchor remains - test: `nav/team-link`
- [ ] AC for 1.4 - a person without a photo renders an initials avatar - test: `routes/team-page`
- [ ] AC for 1.5 - Person JSON-LD validates and links to #organization - test: `seo/person-jsonld`
- [ ] AC for 1.6 - with an empty team array the route renders, the JSON-LD stays valid, and no placeholder person appears - test: `routes/team-page`

## 3. Edge cases

- Privacy: an engineer may allow first name plus role only - the type must permit it.
- Photos must stay inside the image budget (lazy-loaded, sized).
- The page must not 404 or render empty when the team array is empty - it falls back to the founder.

## 4. Out of scope / non-goals

- Sourcing the photos and bios (FR-BIZ-006, FR-CMS-006).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- No personal data is published without the named person's recorded consent (PDPL).
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
