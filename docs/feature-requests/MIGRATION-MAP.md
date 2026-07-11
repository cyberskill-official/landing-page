# Migration map - 2026-07-11 FR reset

On 2026-07-11 the landing-page docs were collapsed onto the single CyberOS FR
workflow (`.cyberos/cuo/ship-feature-requests.md`). Three things happened:

1. The 66 `shipped` FRs were retagged `done` and moved to `_archive/<module>/`.
   They stay in the repo for the audit trail and stay listed in BACKLOG.md.
2. The parallel growth program (`docs/feature-requests/improvement/` - BACKLOG,
   LEDGER, tasks/01..09, 66 tasks with their own `LEAD-01` style ids and their
   own status vocabulary) was migrated into FRs with `class: improvement` and the
   folder was deleted. There is now one backlog, one id scheme, one lifecycle.
3. The three audits delivered on 2026-07-10/11 (now in `docs/audits/2026-07-11/`)
   were turned into FRs. Where an audit finding and a growth task were the same
   work, they became one FR carrying both traces.

The source audit that the growth program came from
(`docs/growth/landing-audit-2026-07-06.md`) is kept - it is evidence, not a plan.

## Status vocabulary migration

| Old (landing-page) | New (CyberOS `STATUS-REFERENCE.md`) |
|---|---|
| `shipped` | `done` (file moved to `_archive/`) |
| `planned` | `ready_to_implement` |
| `hold` / `deferred` | `on_hold` |
| growth `todo` | `ready_to_implement` |
| growth `needs-input` | `ready_to_implement` with a `depends_on` on the FR-BIZ FR that holds the input |
| growth `deferred` | `on_hold` |

## Growth task -> FR

| Growth task | Now |
|---|---|
| LEAD-01 | FR-BIZ-001 |
| LEAD-02 | FR-BIZ-002 |
| LEAD-03, LEAD-04 | FR-OPS-010 |
| LEAD-05 | FR-BIZ-003 |
| CONV-01 | FR-CTA-015 |
| CONV-02 | FR-CTA-005 (existing FR, retagged `ready_to_implement`) |
| CONV-03 | FR-CTA-010 |
| CONV-04 | FR-CTA-011 |
| CONV-05 | FR-CTA-012 (+ FR-BIZ-007 for the accounts) |
| CONV-06 | FR-CTA-017 (+ FR-BIZ-013 for the ranges) |
| CONV-07 | FR-CTA-016 |
| CONV-08 | FR-A11Y-012 |
| CONV-09 | FR-CTA-018 (+ FR-BIZ-013) |
| PROOF-01 | FR-BIZ-006 |
| PROOF-02 | FR-CMS-011 (template) + FR-CMS-009 (content) + FR-BIZ-006 (permission) |
| PROOF-03 | FR-CMS-012 |
| PROOF-04 | FR-CMS-013 |
| PROOF-05 | FR-WEB-012 + FR-BIZ-006 |
| PROOF-06 | FR-BIZ-010 |
| PROOF-07 | FR-BIZ-005 (+ FR-BIZ-004 for Google Business) |
| PROOF-08 | FR-BIZ-005 |
| PROOF-09 | FR-BIZ-007 + FR-SEO-019 |
| PROOF-10 | FR-CMS-014 |
| PROOF-11 | FR-CMS-015 |
| PROOF-12 | FR-SEO-019 |
| PROOF-13 | FR-BIZ-009 (the measured number governs what may be published) |
| SEO-01 | FR-SEO-011 |
| SEO-02 | FR-SEO-016 |
| SEO-03 | FR-CMS-007 (existing) + FR-SEO-006 (existing, RSS) |
| SEO-04 | FR-SEO-012 |
| SEO-05 | FR-SEO-015 |
| SEO-06 | FR-SEO-014 |
| SEO-07 | FR-BIZ-008 |
| SEO-08 | FR-BIZ-011 |
| SEO-09 | FR-SEO-010 |
| GEO-01 | FR-SEO-020 |
| GEO-02 | FR-SEO-017 |
| GEO-03 | FR-SEO-018 |
| GEO-04 | FR-CMS-010 |
| GEO-05 | FR-BIZ-015 |
| NURT-01 | FR-CTA-014 |
| NURT-02 | FR-BIZ-010 |
| NURT-03 | FR-BIZ-009 (+ FR-OPS-011 for the payload) |
| NURT-04 | FR-BIZ-009 |
| NURT-05 | FR-CMS-018 |
| NURT-06 | FR-BIZ-010 |
| NURT-07 | FR-BIZ-010 |
| NURT-08 | FR-CTA-019 |
| NURT-09 | FR-OPS-013 |
| NURT-10 | dropped - do not market a portal that is not real; revisit as a new FR when it is |
| MEAS-01 | FR-OPS-011 |
| MEAS-02 | FR-OPS-012 |
| MEAS-03 | FR-OPS-011 |
| MEAS-04 | FR-BIZ-009 |
| MEAS-05 | FR-BIZ-008 |
| PERF-01 | FR-PERF-011 |
| PERF-02 | FR-PERF-011 (+ FR-PERF-005, existing) |
| PERF-03 | already enforced - `check:apca` and `check:a11y:routes` are wired; re-asserted by FR-PERF-013 |
| PERF-04 | FR-CMS-003 (existing Vietnamese pass) |
| PERF-05 | FR-OPS-009 |
| COPY-01 | FR-CMS-015 |
| COPY-02 | FR-CMS-015 (+ FR-WEB-012) |
| COPY-03 | FR-CMS-020 |
| COPY-04 | FR-CTA-020 |
| COPY-05 | FR-CMS-019 |

## Audit finding -> FR

`A` = `docs/audits/2026-07-11/A-deep-audit-dual-benchmark.md` (deep audit + dual benchmark)
`B` = `docs/audits/2026-07-11/B-lighthouse-benchmark.html` (live Lighthouse benchmark, 10 Jul)
`C` = `docs/audits/2026-07-11/C-audit-and-remediation-plan.pdf` (audit + remediation plan, 11 Jul)

| Finding | FR |
|---|---|
| B: mobile CLS 0.431 (critical) | FR-PERF-007 |
| B: ~900 KB JS, TBT 1,370 ms; C: 0.74 MB decoded JS, 197 ms long task | FR-PERF-008 |
| B: root 307 redirect costs 0.84 s | FR-WEB-011 |
| B: mobile hero mascot overlaps the headline | FR-PERF-007 (reserved boxes) + FR-A11Y-012 (bar) |
| B: persistent CTA bar overlaps content, outside a landmark | FR-A11Y-012 |
| B: sitemap lists only the two homepages | FR-SEO-012 |
| B: no sameAs, no social or authority links | FR-SEO-019 + FR-BIZ-007 |
| B/A/C: no logos, testimonials, ratings, or outcome numbers | FR-CMS-011/012/013 + FR-BIZ-006 |
| B/A: no Content-Security-Policy | FR-OPS-009 |
| B: "Learn more" link text | FR-SEO-013 |
| B: images and favicon not cached long term | FR-PERF-010 |
| B: analytics loads unconditionally on first paint | FR-PERF-009 + FR-OPS-013 |
| B/A/C: no llms.txt; C: no AI-crawler stance | FR-SEO-017 |
| B: 18 sub-44px tap targets; wordmark label mismatch | FR-A11Y-011 |
| B: incomplete OpenGraph fields | FR-SEO-014 |
| B: work and careers pages thin (~200 words) | FR-CMS-017 |
| C: kinetic headings serialize without spaces | FR-SEO-010 |
| C: Vietnamese pages keep the English title | FR-SEO-011 |
| C/A: reduced motion not honoured in JS/WebGL | FR-A11Y-010 |
| C: contact form has no required attributes; honeypot unverified | FR-CTA-013 |
| C: images lack alt text | FR-A11Y-013 |
| C/A: performance unverified, no field CWV | FR-PERF-013 |
| C: always-on animation risks INP | FR-PERF-012 |
| C: viewport clamped, no on-device pass | FR-A11Y-014 |
| C/A: no team page, no named people | FR-WEB-012 (+ FR-CMS-006, FR-BIZ-006) |
| C/A: no engagement model or price signal | FR-CTA-017 (+ FR-BIZ-013) |
| C/A: no blog or insights, no authority content | FR-CMS-007 (existing) + FR-CMS-010 + FR-SEO-006 |
| C: Service / BreadcrumbList / Review schema | FR-SEO-015 |
| C/A: FAQ too thin for GEO | FR-SEO-020 |
| A: no Google Business Profile; NAP diverges (Dakao vs Tan Dinh) | FR-BIZ-004 |
| A: no Clutch/GoodFirms presence; branded mentions are the #1 GEO correlate | FR-BIZ-005 + FR-BIZ-011 |
| A: entity ambiguity with the Australian "Cyberskill" | FR-SEO-017 + FR-SEO-018 + FR-BIZ-015 |
| A: no Terms of Service | FR-CMS-016 |
| A: PDPL / Decree 356; Anthropic cross-border transfer | FR-BIZ-012 (+ FR-OPS-013) |
| A: no certifications | FR-BIZ-014 |
| A: Awwwards / CSSDA submission once work is showcased | FR-BIZ-011 |
| A: monthly AI share-of-voice check | FR-BIZ-015 |
| A: quarterly SEO/GEO re-audit; conversion review | FR-BIZ-008 + FR-BIZ-009 |

## Findings deliberately not turned into FRs

- **B: "sitemap lists only the two homepages."** `app/sitemap.ts` in this repo already
  emits services, work, careers and how-we-build, so the crawl saw a stale deploy or a
  cached file. FR-SEO-012 still ships, because /privacy and /accessibility *are* missing
  and every `lastModified` is build-time - and because a post-deploy verification of the
  live sitemap is the only way to know which of the two it was.
- **A: "structured data likely missing."** Audit A could not fetch JSON-LD; audits B and C
  both confirm it is present and richer than the competitors'. No FR - the extension work
  is FR-SEO-015 and FR-SEO-019.
- **A: "robots.txt / sitemap could not be verified."** Both exist (`app/robots.ts`,
  `app/sitemap.ts`). The real defects (the non-standard `Host` directive, no AI-crawler
  stance) are in FR-SEO-017.
- **NURT-10 (market the client portal).** Dropped: the portal is not real for a client yet.
