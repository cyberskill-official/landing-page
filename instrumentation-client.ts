import * as Sentry from "@sentry/nextjs";

// Browser error tracking (FR-OPS-006). Next.js loads this on the client. The
// default integrations capture unhandled exceptions and promise rejections.
// Gated on NEXT_PUBLIC_SENTRY_DSN; set NEXT_PUBLIC_SENTRY_RELEASE / a public env
// for release + environment tags on client events.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
