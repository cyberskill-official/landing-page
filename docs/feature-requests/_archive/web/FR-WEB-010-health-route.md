---
id: FR-WEB-010
title: "/api/health route for uptime checks"
module: WEB
priority: COULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-001]
source_pages:
  - "research doc §F (Next.js App Router, operations), §D (monitoring)"
new_files:
  - app/api/health/route.ts
routed_back_count: 0
awh: N/A
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

Shipped 2026-06-22. `app/api/health/route.ts` answers `GET /api/health` with 200
and `{ status: "ok", service, version, ts }`, where `version` is the Vercel
commit SHA (`VERCEL_GIT_COMMIT_SHA`, "dev" locally) as the build identifier
(clause 1). It is `runtime = "nodejs"`, `dynamic = "force-dynamic"`, and sends
`cache-control: no-store`, so it is cheap to poll and never stale (clause 3). No
auth and no secret or private config in the body (clause 2). The middleware
matcher already excludes `/api`, so the probe is not redirected.
`tests/health.test.ts` asserts the 200, the no-store header, the `ok` status, a
non-empty `version`, and a parseable timestamp. Verified by `next build` (the
`/api/health` route is registered) plus tsc + lint + vitest green.
