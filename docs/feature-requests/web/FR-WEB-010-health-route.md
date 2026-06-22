---
id: FR-WEB-010
title: "/api/health route for uptime checks"
module: WEB
priority: COULD
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-001]
source_pages:
  - "research doc §F (Next.js App Router, operations), §D (monitoring)"
new_files:
  - app/api/health/route.ts
---

## §1 Requirement (BCP-14 normative)

The deployment SHOULD answer a cheap health probe so an external monitor can tell
whether the app is up.

1. The route `/api/health` MUST return a fast JSON response reporting an OK status
   and a build identifier (commit or build time).
2. The response MUST NOT require authentication and MUST NOT expose secrets or
   internal configuration.
3. The route MUST be lightweight enough to poll frequently without meaningful
   load.

## §2 Acceptance

- `GET /api/health` returns 200 with a status field and a build identifier.
- The response contains no secret or private configuration value.

## §3 Evidence

Not yet implemented; acceptance pending build.
