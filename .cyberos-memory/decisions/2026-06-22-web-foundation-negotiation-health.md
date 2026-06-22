# DEC: WEB foundation - locale negotiation + health route

- Date: 2026-06-22
- Status: accepted
- Modules: WEB
- Deciders: Stephen Cheng (operator), agent

## Context

Continuing the autonomous FR run, the next clean, no-fabrication, fully testable
foundation pair was Accept-Language negotiation for the bare `/` entry and a
health route for uptime checks.

## Decision

- FR-WEB-004 (shipped): `lib/i18n/negotiate.ts` `negotiateLocale()` parses the
  weighted `Accept-Language` header and returns a supported locale (`en`/`vi`),
  defaulting safely. The `/` redirect in `middleware.ts` prefers an explicit
  `cs-locale` cookie over negotiation; `LanguageSwitcher` writes that cookie on
  selection, so a returning reader's choice wins over the header.
- FR-WEB-010 (shipped): `app/api/health/route.ts` returns
  `{ status, service, version, ts }` with `version` from `VERCEL_GIT_COMMIT_SHA`
  ("dev" locally), `cache-control: no-store`, no auth, no secrets.

## Consequences

- BACKLOG totals: 37 shipped / 1 hold / 55 planned. WEB shipped count is 6.
- Verified in a clean Linux build: tsc clean, vitest 30/30 (7 new: 6 negotiation
  + 1 health), next lint clean, next build rc=0 (26/26 pages, `/api/health`
  registered). Pushed to GitHub; Vercel redeploys from main.
- Behaviour change worth noting: the bare `/` no longer always lands on `/en`. A
  Vietnamese-preferring browser now lands on `/vi`, and a returning visitor's
  switcher choice (cookie) takes precedence. Locale-specific URLs (`/en/...`,
  `/vi/...`) are unchanged.

## Related

[[FR-WEB-004-locale-negotiation]] [[FR-WEB-010-health-route]] [[FR-WEB-001-app-shell-i18n]]
