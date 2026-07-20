---
id: TASK-WEB-006
title: "Draft and preview mode for unpublished content"
module: WEB
priority: COULD
status: on_hold
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [TASK-WEB-002, TASK-CMS-001]
source_pages:
  - "research doc §G (content updates, editorial), §F (Next.js App Router)"
new_files:
  - app/api/preview/route.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

An editor SHOULD be able to view unpublished content as it will appear, without exposing drafts to the public.

1. The system SHOULD provide a preview mode that renders draft content for an authorized editor while the live site keeps serving published content.
2. Entering preview MUST require a valid token, and the resulting session MUST be scoped so only the holder sees drafts.
3. There MUST be a way to exit preview and return to published content.

## §2 Acceptance

- An authorized editor with a valid token sees draft content; an anonymous visitor sees only published content.
- Exiting preview restores the published view.

## §3 Evidence

Not yet implemented; acceptance pending build.
