---
id: FR-OPS-006
title: "Error and exception tracking for client and server"
module: OPS
priority: COULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-OPS-003]
blocks: []
source_pages:
  - "research doc §L (observability), §F (server routes)"
new_files:
  - lib/observability/error-reporter.ts
modified_files:
  - app/layout.tsx
---

## §1 Requirement (BCP-14 normative)

Unhandled errors MUST be reported somewhere a human will see them.

1. An error-tracking service (Sentry or an equivalent) MUST capture unhandled
   exceptions and promise rejections from the client.
2. The same service MUST capture server-side exceptions from the API routes and
   server components, with enough context to locate the fault.
3. Reported events MUST carry release and environment tags so a regression can
   be tied to the deploy that introduced it.

## §2 Acceptance

- A thrown client error appears in the tracking dashboard.
- A thrown server error appears with a stack trace.
- Events are tagged with release and environment.

## §3 Evidence

Not yet implemented; acceptance pending build.
