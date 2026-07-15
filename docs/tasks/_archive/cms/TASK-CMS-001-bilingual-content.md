---
id: TASK-CMS-001
title: "Bilingual content source-of-truth (EN + VN)"
module: CMS
priority: MUST
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: []
blocks: [TASK-WEB-002, TASK-CHAR-011]
source_pages:
  - "research doc §E (Vietnamese-first), §C (information architecture)"
new_files:
  - lib/content/site.ts
  - lib/i18n/dictionaries.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Content MUST be defined once and serve both the page and the Genie, so the two
can never disagree on a fact.

1. Every user-facing string MUST ship an English and a Vietnamese value; a key
   present in one locale MUST be present in the other.
2. Company facts (services, Ho Chi Minh City base, established 2020, contact
   details, slogan) MUST live in one content module and MUST feed both the
   rendered sections and the Genie persona grounding (TASK-CHAR-011).
3. The content shape MUST be typed so a missing field is a build-time error, not
   a runtime blank.

## §2 Acceptance

- Both `en` and `vi` resolve a value for every content key.
- The contact facts shown on the page are the same objects the persona reads.

## §3 Evidence

Static: `lib/content/site.ts` and `lib/i18n/dictionaries.ts` carry both locales;
the persona imports the shared facts. Deferred: end-to-end copy review and
native-Vietnamese proofread (operator / Stephen).
