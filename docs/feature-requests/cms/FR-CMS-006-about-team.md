---
id: FR-CMS-006
title: "About, team, and culture content (recruiting + trust surface)"
module: CMS
priority: SHOULD
status: planned
verify: T
phase: P4
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CMS-001]
blocks: []
source_pages:
  - "research doc §C (information architecture), §F (trust)"
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
