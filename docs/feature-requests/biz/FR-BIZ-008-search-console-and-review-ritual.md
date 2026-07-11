---
id: FR-BIZ-008
title: "Verify Search Console and Bing, submit the sitemap, and run the monthly review"
status: ready_to_implement
class: improvement
priority: MUST
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/SEO-07, growth/MEAS-05, audit-A/phase-5]
---

# FR-BIZ-008: Verify Search Console and Bing, submit the sitemap, and run the monthly review

## 0. Why (evidence)

Nothing in the SEO half of this backlog is measurable without Search Console: no query data, no coverage errors, no proof
that the intent-title change (FR-SEO-011) moved impressions. Audit A also prescribes a quarterly SEO/GEO review as a standing
ritual.

## 1. Description (normative)

- 1.1 cyberskill.world SHALL be verified in Google Search Console (DNS TXT) and Bing Webmaster Tools, and the sitemap SHALL be submitted.
- 1.2 The first indexing report SHALL be reviewed for /en and /vi, and the /lite route SHALL be confirmed noindex by design.
- 1.3 A monthly 15-minute review SHALL be run (top queries and pages per locale, coverage errors, impression movement after each SEO change) and logged one line per month in the repo.
- 1.4 A quarterly full SEO/GEO re-audit SHALL be scheduled, re-running the benchmark so the score movement is measurable.

## 2. Acceptance criteria

- [ ] AC for 1.1 - both consoles verified and the sitemap accepted - evidence: screenshots
- [ ] AC for 1.2 - the first indexing report is reviewed and logged - test: `docs/seo-log`
- [ ] AC for 1.3 - the monthly log has at least one entry and a template for the rest - test: `docs/seo-log`
- [ ] AC for 1.4 - the quarterly re-audit is scheduled with a named owner and a date, and the benchmark method is recorded so the score is comparable - test: `docs/seo-log`

## 3. Edge cases

- Vietnamese queries need the VN property view, not only the aggregate.
- A coverage error introduced by a deploy must be caught within a month, not a quarter.

## 4. Out of scope / non-goals

- Fixing what the console reveals - those become new FRs.

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
