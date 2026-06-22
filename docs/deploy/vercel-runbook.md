# Deploy runbook - Vercel

The site is a standard Next.js 15 App Router app, so Vercel deploys it
zero-config; `vercel.json` only pins the framework and commands. The chat proxy
streams, so it runs as a Node function with `maxDuration = 60` (set in
`app/api/genie/route.ts`).

## First deploy

1. Push the branch and import the repo at vercel.com/new (or run `vercel` from
   the repo with the Vercel CLI). Framework preset: Next.js.
2. Set environment variables (below) for Production and Preview.
3. Deploy. Vercel runs `npm install` then `npm run build`.
4. Point the domain (`cyberskill.world`) at the project and set
   `NEXT_PUBLIC_SITE_URL` to the final origin so canonical, hreflang, sitemap,
   and robots URLs are correct.

## Environment variables

Set these in Project Settings -> Environment Variables. Secrets are server-side
only; never add `NEXT_PUBLIC_` to a secret.

| Variable | Scope | Required | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Production, Preview | for chat | Enables Lumi. Without it `/api/genie` returns 503 and the widget shows the contact-form fallback. |
| `GENIE_MODEL` | Production, Preview | no | Pinned model id. Default `claude-haiku-4-5-20251001`. Confirm the current id in the Anthropic console at deploy time. |
| `GENIE_MAX_TOKENS` | Production, Preview | no | Default 600. |
| `RESEND_API_KEY` | Production, Preview | for lead email | Enables the email notification in `/api/lead` (sends to `info@cyberskill.world`). Runtime value: a fresh deploy is needed after adding/changing it. |
| `LEAD_EMAIL_FROM` | Production | no | Override the lead-email From address. Defaults to `CyberSkill Leads <leads@<your-domain>>` (derived from `company.email`), which works once that domain is verified in Resend (cyberskill.world is). Set this only to use a different sender. |
| `LEAD_SLACK_WEBHOOK_URL` | Production | no | Slack Incoming Webhook for new-lead pings. |
| `LEAD_CRM_WEBHOOK_URL` | Production | no | CRM/Zapier/n8n webhook for lead records. |
| `NEXT_PUBLIC_SENTRY_DSN` | Production, Preview | for error tracking | Sentry project DSN. Inlined into the client bundle at build, so a redeploy is required after adding it. Without it Sentry is a no-op. |
| `NEXT_PUBLIC_SENTRY_RELEASE` | Production, Preview | no | Optional release tag for client events; server events already use `VERCEL_GIT_COMMIT_SHA`. |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | yes | Public canonical origin (e.g. https://cyberskill.world). Safe to expose. |

Use a separate, lower-limit `ANTHROPIC_API_KEY` for Preview so preview
deployments cannot burn the production quota.

Note on `NEXT_PUBLIC_*`: these are inlined at build time, so adding or changing
one only takes effect on the next deployment - redeploy after editing them.
Runtime secrets (`ANTHROPIC_API_KEY`, `RESEND_API_KEY`) are read per request but
still need a redeploy to propagate a newly-added value to existing functions.

## Streaming note

`/api/genie` streams server-sent text. On Vercel this runs on the Node runtime
(Fluid Compute, default up to 300s; we cap at 60s). If you ever move it to the
Edge runtime, remember Edge must begin streaming within ~25s. The current
setup needs no change.

## Verify after deploy

- `/` redirects to `/en`; `/vi` renders in Vietnamese; `<html lang>` matches.
- `/robots.txt` and `/sitemap.xml` resolve; sitemap lists en + vi with alternates.
- Lead form submits (check server logs / Slack) and an email arrives at
  `info@cyberskill.world` (with `RESEND_API_KEY` set + a verified from domain).
- Lumi replies and streams (with the key set and account credit); falls back
  gracefully without it.
- Sentry receives events (with `NEXT_PUBLIC_SENTRY_DSN` set after a redeploy):
  trigger a test client error and confirm it lands in the Sentry dashboard with
  release + environment tags.
- Run Vercel Speed Insights / Lighthouse on mobile against `lighthouse/budget.json`.

## Rollback

Vercel keeps every deployment. Promote a previous deployment from the project's
Deployments tab to roll back instantly; no rebuild needed.

## Suggested add-ons

- Vercel Web Analytics + Speed Insights for Core Web Vitals.
- A product analytics tool (GA4 / PostHog) for funnel and lead attribution.
- Wire chatbot and form events into the CRM so pipeline is attributable.
