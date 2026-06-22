---
id: FR-OPS-006
title: "Error and exception tracking for client and server"
module: OPS
priority: COULD
status: shipped
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-OPS-003]
blocks: []
source_pages:
  - "research doc §L (observability), §F (server routes)"
new_files:
  - instrumentation.ts
  - instrumentation-client.ts
modified_files:
  - package.json
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

Shipped 2026-06-22 with Sentry (`@sentry/nextjs` 10.x), the operator's chosen
service. `instrumentation-client.ts` initializes the browser SDK, whose default
integrations capture unhandled exceptions and promise rejections (clause 1).
`instrumentation.ts` initializes the server/edge SDK in `register()` and exports
`onRequestError = Sentry.captureRequestError`, so exceptions from route handlers,
server components, and middleware are captured with context (clause 2). Both
inits set `environment` (VERCEL_ENV / NODE_ENV) and `release`
(VERCEL_GIT_COMMIT_SHA server-side; NEXT_PUBLIC_SENTRY_RELEASE client-side), so
events are tied to the deploy (clause 3). Everything is gated on
`NEXT_PUBLIC_SENTRY_DSN` (`enabled: Boolean(dsn)`), a clean no-op until set.

Implementation note: wired via the runtime SDK + Next instrumentation hooks only,
deliberately without `withSentryConfig`, to avoid the build-time webpack plugin
and sourcemap-upload step destabilizing the production build (the earlier Speed
Insights dependency conflict is the cautionary precedent). Events still report;
stack traces are unminified-readable once you add a sourcemap step later if
wanted. Verified by tsc + lint + 37 vitest tests + `next build` (rc=0, 26/26
pages, instrumentation compiles). Activation: set `NEXT_PUBLIC_SENTRY_DSN` in
Vercel; live capture confirmed once the DSN is present.
