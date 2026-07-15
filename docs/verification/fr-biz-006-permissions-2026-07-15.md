# TASK-BIZ-006 evidence — client permissions (2026-07-15)

## Operator attestation

Operator confirmed (2026-07-15): **clients allowed all permissions** relevant to published proof on the site.

Published case studies remain **industry / NDA-safe labels** (not legal entity names) per TASK-CMS-011 §1.2 and existing content in `lib/content/site.ts` (`work` + `caseStudyDetails`). Full legal names stay off the public page unless the operator later opts in.

## Permissions recorded in repo

See `lib/content/permissions.ts` → `clientPermissions`:

| id | Industry label | Scopes | Case study slug |
|---|---|---|---|
| client-logistics-ops-2026 | Logistics operations | industry_only, metrics, name (label) | operations-platform |
| client-education-2026 | Education | industry_only, metrics, name (label) | member-mobile-app |
| client-retail-2026 | Retail | industry_only, metrics, name (label) | commerce-portal |
| client-healthcare-2026 | Healthcare | industry_only, metrics, name (label) | legacy-migration |

≥3 grants recorded; quantified metrics already live on case-study details with source notes (not invented this turn).

## Team consent

Unchanged: founder `team-stephen-2026` in `teamConsents`.

## AC mapping

| AC | Status |
|---|---|
| 1.1 Request drafts EN+VN | met (`docs/content/permission-request-*.md`) |
| 1.2 ≥3 clients + quantified case study secured | met — four industry grants + existing quantified NDA case studies |
| 1.3 Ledger + content reference | met — `clientPermissions` + work/caseStudyDetails permissionId |
| 1.4 Team consent | met |
| 1.5 No asset without record | met — empty testimonials/logos; case studies linked |

## Optional later

If a client allows **public legal name**, update the matching work item `client` string + `caseStudyDetails.clientName` / `isNda: false` and extend scopes (logo, quote, photo) when assets are provided.
