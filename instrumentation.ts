import * as Sentry from "@sentry/nextjs";

// Server + edge error tracking (FR-OPS-006). Initialised in the Next.js
// instrumentation hook. Gated on NEXT_PUBLIC_SENTRY_DSN so it is a clean no-op
// until configured. Release + environment tags come from the Vercel build env so
// a regression can be tied to the deploy that introduced it.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      enabled: Boolean(dsn),
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: 0.1,
    });
  }
}

// Captures errors thrown in server components, route handlers, and middleware.
export const onRequestError = Sentry.captureRequestError;
