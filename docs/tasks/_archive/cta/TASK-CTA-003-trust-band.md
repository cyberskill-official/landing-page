---
id: TASK-CTA-003
title: "Trust band credibility strip"
module: CTA
priority: COULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-WEB-002, TASK-CMS-001]
blocks: []
source_pages:
  - "research doc §D (credibility, honest claims), §E (bilingual)"
new_files:
  - components/sections/TrustBand.tsx
modified_files:
  - app/[lang]/page.tsx
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The home page MUST signal credibility honestly, with nothing invented.

1. A credibility strip MUST render near the top of the home page and MUST NOT use invented logos or metrics.
2. The strip MUST present bilingual items drawn only from true facts: since 2020, three practices, EN and VN bilingual delivery, and a one-business-day reply.

## §2 Acceptance

- The strip appears near the top of `/[lang]` and carries only the four honest items, with no placeholder client logos or made-up numbers.
- Each item reads correctly in both `/en` and `/vi`.

## §3 Evidence

Static: `components/sections/TrustBand.tsx` renders the four honest items from the dictionary and is mounted in `app/[lang]/page.tsx`; styling in `app/globals.css`. Deferred: visual placement check on the operator machine.
