---
id: FR-CMS-006
title: "About, team, and culture content (recruiting + trust surface)"
module: CMS
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §C (information architecture), §F (trust)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The about, team, and culture content MUST present the company as a credible
employer and partner, in both locales.

1. The content MUST cover the company story (established 2020, Ho Chi Minh City
   base, the slogan "Turn your will into real"), the team, and the working
   culture, all from the FR-CMS-001 source.
2. Team entries MUST allow a name, role, and short bio; an employee-voice quote
   MUST be supported as an optional field.
3. Every string MUST ship English and Vietnamese values, with the Vietnamese
   reviewed by a native speaker.
4. The section MUST double as a recruiting surface and MUST link to or surface
   open-role intent without hard-coding job copy in the component.

## §2 Acceptance

- About, team, and culture all render in both locales from the shared source.
- A team member can be shown with name, role, bio, and an optional quote.

## §3 Evidence

Not yet implemented; acceptance pending build.

## Addendum - 2026-07-11 audits

Audits A and C both call the missing team the biggest authenticity gap: the site
promises "senior engineers own the work end to end" and "you always know who is
building what", the nav offers a Team link, and it lands on a one-line company
statement with no named people.

- This FR owns the **content** (names, roles, bios, photos, credentials).
- **FR-WEB-012** owns the **route** (`/[lang]/team`), the Person JSON-LD and the nav fix.
- **FR-BIZ-006** owns the **consent**: no name, photo or profile link is published
  without the named person's recorded written consent (PDPL).

Traces: audit-A/phase-2-item-8, audit-C/content-credibility, growth/PROOF-05.
