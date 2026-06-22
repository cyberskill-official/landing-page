---
id: FR-WEB-005
title: "ISR and on-demand revalidation for content pages"
module: WEB
priority: COULD
status: planned
verify: T
phase: P3
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-002]
source_pages:
  - "research doc §F (Next.js App Router, rendering), §G (content updates)"
new_files:
  - app/api/revalidate/route.ts
---

## §1 Requirement (BCP-14 normative)

Content pages SHOULD refresh without a full redeploy, so editors can publish a
change and have it appear within a bounded window.

1. Content routes SHOULD set a `revalidate` interval so pages are regenerated in
   the background after they go stale.
2. The system SHOULD expose an on-demand revalidation route that re-renders a
   given path or tag when triggered.
3. The revalidation route MUST reject unauthenticated or unauthorized callers and
   MUST NOT revalidate arbitrary paths without a valid secret.

## §2 Acceptance

- A content edit appears after the revalidate window without a redeploy.
- Calling the revalidation route with a valid secret refreshes the target path;
  an invalid secret is rejected.

## §3 Evidence

Not yet implemented; acceptance pending build.
