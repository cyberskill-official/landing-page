---
id: FR-CMS-005
title: "Long-form bilingual services content for detail pages"
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
  - "research doc §C (information architecture), §E (Vietnamese-first)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Each service MUST have long-form bilingual content that feeds its detail page
from the shared content source.

1. Every service detail page MUST draw from the FR-CMS-001 content module; no
   detail copy may be hard-coded in the component.
2. Each service entry MUST carry a summary, the problem it solves, the approach,
   and a call to action, each in English and Vietnamese.
3. A field present in one locale MUST be present in the other; a missing field
   MUST be a build-time error, not a runtime blank.
4. The content shape MUST be typed and MUST stay consistent across all services
   so pages render uniformly.

## §2 Acceptance

- Each service detail page renders summary, problem, approach, and CTA in both
  locales.
- A missing localized field fails the build rather than rendering blank.

## §3 Evidence

Not yet implemented; acceptance pending build.
