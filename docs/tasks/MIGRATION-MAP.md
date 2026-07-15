# Migration map - 2026-07-11 task reset

On 2026-07-11 the landing-page docs were collapsed onto the single CyberOS task
workflow (`.cyberos/cuo/ship-tasks.md`). Three things happened:

1. The 66 `shipped` tasks were retagged `done` and moved to `_archive/<module>/`.
   They stay in the repo for the audit trail and stay listed in BACKLOG.md.
2. The parallel growth program (`docs/tasks/improvement/` - BACKLOG,
   LEDGER, tasks/01..09, 66 tasks with their own `LEAD-01` style ids and their
   own status vocabulary) was migrated into tasks with `class: improvement` and the
   folder was deleted. There is now one backlog, one id scheme, one lifecycle.
3. The three audits delivered on 2026-07-10/11 (now in `docs/audits/2026-07-11/`)
   were turned into tasks. Where an audit finding and a growth task were the same
   work, they became one task carrying both traces.

The source audit that the growth program came from
(`docs/growth/landing-audit-2026-07-06.md`) is kept - it is evidence, not a plan.

## Status vocabulary migration

| Old (landing-page) | New (CyberOS `STATUS-REFERENCE.md`) |
|---|---|
| `shipped` | `done` (file moved to `_archive/`) |
| `planned` | `ready_to_implement` |
| `hold` / `deferred` | `on_hold` |
| growth `todo` | `ready_to_implement` |
| growth `needs-input` | `ready_to_implement` with a `depends_on` on the TASK-BIZ task that holds the input |
| growth `deferred` | `on_hold` |

## Growth task -> task

| Growth task | Now |
|---|---|
| LEAD-01 | TASK-BIZ-001 |
| LEAD-02 | TASK-BIZ-002 |
| LEAD-03, LEAD-04 | TASK-OPS-010 |
| LEAD-05 | TASK-BIZ-003 |
| CONV-01 | TASK-CTA-015 |
| CONV-02 | TASK-CTA-005 (existing task, retagged `ready_to_implement`) |
| CONV-03 | TASK-CTA-010 |
| CONV-04 | TASK-CTA-011 |
| CONV-05 | TASK-CTA-012 (+ TASK-BIZ-007 for the accounts) |
| CONV-06 | TASK-CTA-017 (+ TASK-BIZ-013 for the ranges) |
| CONV-07 | TASK-CTA-016 |
| CONV-08 | TASK-A11Y-012 |
| CONV-09 | TASK-CTA-018 (+ TASK-BIZ-013) |
| PROOF-01 | TASK-BIZ-006 |
| PROOF-02 | TASK-CMS-011 (template) + TASK-CMS-009 (content) + TASK-BIZ-006 (permission) |
| PROOF-03 | TASK-CMS-012 |
| PROOF-04 | TASK-CMS-013 |
| PROOF-05 | TASK-WEB-012 + TASK-BIZ-006 |
| PROOF-06 | TASK-BIZ-010 |
| PROOF-07 | TASK-BIZ-005 (+ TASK-BIZ-004 for Google Business) |
| PROOF-08 | TASK-BIZ-005 |
| PROOF-09 | TASK-BIZ-007 + TASK-SEO-019 |
| PROOF-10 | TASK-CMS-014 |
| PROOF-11 | TASK-CMS-015 |
| PROOF-12 | TASK-SEO-019 |
| PROOF-13 | TASK-BIZ-009 (the measured number governs what may be published) |
| SEO-01 | TASK-SEO-011 |
| SEO-02 | TASK-SEO-016 |
| SEO-03 | TASK-CMS-007 (existing) + TASK-SEO-006 (existing, RSS) |
| SEO-04 | TASK-SEO-012 |
| SEO-05 | TASK-SEO-015 |
| SEO-06 | TASK-SEO-014 |
| SEO-07 | TASK-BIZ-008 |
| SEO-08 | TASK-BIZ-011 |
| SEO-09 | TASK-SEO-010 |
| GEO-01 | TASK-SEO-020 |
| GEO-02 | TASK-SEO-017 |
| GEO-03 | TASK-SEO-018 |
| GEO-04 | TASK-CMS-010 |
| GEO-05 | TASK-BIZ-015 |
| NURT-01 | TASK-CTA-014 |
| NURT-02 | TASK-BIZ-010 |
| NURT-03 | TASK-BIZ-009 (+ TASK-OPS-011 for the payload) |
| NURT-04 | TASK-BIZ-009 |
| NURT-05 | TASK-CMS-018 |
| NURT-06 | TASK-BIZ-010 |
| NURT-07 | TASK-BIZ-010 |
| NURT-08 | TASK-CTA-019 |
| NURT-09 | TASK-OPS-013 |
| NURT-10 | dropped - do not market a portal that is not real; revisit as a new task when it is |
| MEAS-01 | TASK-OPS-011 |
| MEAS-02 | TASK-OPS-012 |
| MEAS-03 | TASK-OPS-011 |
| MEAS-04 | TASK-BIZ-009 |
| MEAS-05 | TASK-BIZ-008 |
| PERF-01 | TASK-PERF-011 |
| PERF-02 | TASK-PERF-011 (+ TASK-PERF-005, existing) |
| PERF-03 | already enforced - `check:apca` and `check:a11y:routes` are wired; re-asserted by TASK-PERF-013 |
| PERF-04 | TASK-CMS-003 (existing Vietnamese pass) |
| PERF-05 | TASK-OPS-009 |
| COPY-01 | TASK-CMS-015 |
| COPY-02 | TASK-CMS-015 (+ TASK-WEB-012) |
| COPY-03 | TASK-CMS-020 |
| COPY-04 | TASK-CTA-020 |
| COPY-05 | TASK-CMS-019 |

## Audit finding -> task

`A` = `docs/audits/2026-07-11/A-deep-audit-dual-benchmark.md` (deep audit + dual benchmark)
`B` = `docs/audits/2026-07-11/B-lighthouse-benchmark.html` (live Lighthouse benchmark, 10 Jul)
`C` = `docs/audits/2026-07-11/C-audit-and-remediation-plan.pdf` (audit + remediation plan, 11 Jul)

| Finding | task |
|---|---|
| B: mobile CLS 0.431 (critical) | TASK-PERF-007 |
| B: ~900 KB JS, TBT 1,370 ms; C: 0.74 MB decoded JS, 197 ms long task | TASK-PERF-008 |
| B: root 307 redirect costs 0.84 s | TASK-WEB-011 |
| B: mobile hero mascot overlaps the headline | TASK-PERF-007 (reserved boxes) + TASK-A11Y-012 (bar) |
| B: persistent CTA bar overlaps content, outside a landmark | TASK-A11Y-012 |
| B: sitemap lists only the two homepages | TASK-SEO-012 |
| B: no sameAs, no social or authority links | TASK-SEO-019 + TASK-BIZ-007 |
| B/A/C: no logos, testimonials, ratings, or outcome numbers | TASK-CMS-011/012/013 + TASK-BIZ-006 |
| B/A: no Content-Security-Policy | TASK-OPS-009 |
| B: "Learn more" link text | TASK-SEO-013 |
| B: images and favicon not cached long term | TASK-PERF-010 |
| B: analytics loads unconditionally on first paint | TASK-PERF-009 + TASK-OPS-013 |
| B/A/C: no llms.txt; C: no AI-crawler stance | TASK-SEO-017 |
| B: 18 sub-44px tap targets; wordmark label mismatch | TASK-A11Y-011 |
| B: incomplete OpenGraph fields | TASK-SEO-014 |
| B: work and careers pages thin (~200 words) | TASK-CMS-017 |
| C: kinetic headings serialize without spaces | TASK-SEO-010 |
| C: Vietnamese pages keep the English title | TASK-SEO-011 |
| C/A: reduced motion not honoured in JS/WebGL | TASK-A11Y-010 |
| C: contact form has no required attributes; honeypot unverified | TASK-CTA-013 |
| C: images lack alt text | TASK-A11Y-013 |
| C/A: performance unverified, no field CWV | TASK-PERF-013 |
| C: always-on animation risks INP | TASK-PERF-012 |
| C: viewport clamped, no on-device pass | TASK-A11Y-014 |
| C/A: no team page, no named people | TASK-WEB-012 (+ TASK-CMS-006, TASK-BIZ-006) |
| C/A: no engagement model or price signal | TASK-CTA-017 (+ TASK-BIZ-013) |
| C/A: no blog or insights, no authority content | TASK-CMS-007 (existing) + TASK-CMS-010 + TASK-SEO-006 |
| C: Service / BreadcrumbList / Review schema | TASK-SEO-015 |
| C/A: FAQ too thin for GEO | TASK-SEO-020 |
| A: no Google Business Profile; NAP diverges (Dakao vs Tan Dinh) | TASK-BIZ-004 |
| A: no Clutch/GoodFirms presence; branded mentions are the #1 GEO correlate | TASK-BIZ-005 + TASK-BIZ-011 |
| A: entity ambiguity with the Australian "Cyberskill" | TASK-SEO-017 + TASK-SEO-018 + TASK-BIZ-015 |
| A: no Terms of Service | TASK-CMS-016 |
| A: PDPL / Decree 356; Anthropic cross-border transfer | TASK-BIZ-012 (+ TASK-OPS-013) |
| A: no certifications | TASK-BIZ-014 |
| A: Awwwards / CSSDA submission once work is showcased | TASK-BIZ-011 |
| A: monthly AI share-of-voice check | TASK-BIZ-015 |
| A: quarterly SEO/GEO re-audit; conversion review | TASK-BIZ-008 + TASK-BIZ-009 |

## Findings deliberately not turned into tasks

- **B: "sitemap lists only the two homepages."** `app/sitemap.ts` in this repo already
  emits services, work, careers and how-we-build, so the crawl saw a stale deploy or a
  cached file. TASK-SEO-012 still ships, because /privacy and /accessibility *are* missing
  and every `lastModified` is build-time - and because a post-deploy verification of the
  live sitemap is the only way to know which of the two it was.
- **A: "structured data likely missing."** Audit A could not fetch JSON-LD; audits B and C
  both confirm it is present and richer than the competitors'. No task - the extension work
  is TASK-SEO-015 and TASK-SEO-019.
- **A: "robots.txt / sitemap could not be verified."** Both exist (`app/robots.ts`,
  `app/sitemap.ts`). The real defects (the non-standard `Host` directive, no AI-crawler
  stance) are in TASK-SEO-017.
- **NURT-10 (market the client portal).** Dropped: the portal is not real for a client yet.
