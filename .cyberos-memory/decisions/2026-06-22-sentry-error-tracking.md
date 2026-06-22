# DEC: Error tracking via Sentry (FR-OPS-006)

- Date: 2026-06-22
- Status: accepted
- Modules: OPS
- Deciders: Stephen Cheng (operator: "switch back to use Sentry")

## Context

Error tracking was offered as part of the production safety net. The operator
first considered PostHog, then chose Sentry.

## Decision

Wired `@sentry/nextjs` (10.59) through the Next.js instrumentation hooks:
`instrumentation-client.ts` for the browser and `instrumentation.ts` for
server/edge (`register()` + `onRequestError = captureRequestError`). Both inits
are gated on `NEXT_PUBLIC_SENTRY_DSN` (no-op until set) and tag events with
`environment` and `release` (VERCEL_GIT_COMMIT_SHA server-side).

Deliberately used the runtime SDK + instrumentation hooks ONLY, without
`withSentryConfig`. The webpack plugin's build-time sourcemap upload + auth-token
step is the kind of dependency that previously destabilized the build (Speed
Insights ERESOLVE), and skipping it keeps the production build safe while still
reporting errors. A sourcemap step can be layered on later if unminified traces
are wanted.

## Consequences

- BACKLOG totals: 45 shipped / 1 hold / 47 planned. OPS shipped 4.
- `@sentry/nextjs` added to dependencies; package.json + package-lock.json synced
  together (lockfile-consistency discipline) so Vercel `npm ci` stays valid.
- Verified: tsc clean, vitest 37/37, next lint clean, next build rc=0 (26/26;
  build time rose to ~6s as Sentry instruments the bundle - acceptable).
- Activation: add `NEXT_PUBLIC_SENTRY_DSN` in Vercel. PostHog is not wired (the
  operator chose Sentry); the bespoke first-party analytics remains in place.

## Related

[[FR-OPS-006-error-tracking]] [[FR-OPS-002-first-party-analytics]] [[FR-OPS-008-uptime-monitoring]]
