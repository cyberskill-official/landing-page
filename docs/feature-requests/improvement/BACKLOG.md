# Growth backlog - master index

State lives here. Detailed specs live in tasks/. Evidence lives in LEDGER.md. Legend: waves 1 (week one), 2 (month one), 3 (quarter); owners agent / human / mixed; effort S / M / L; statuses per README.md.

Last updated: 2026-07-06 (initial import from docs/growth/landing-audit-2026-07-06.md).

## Epic 1 - lead pipeline (tasks/01-lead-pipeline.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| LEAD-01 | Configure lead sink env vars + Resend domain | 1 | human | S | - | todo |
| LEAD-02 | Deploy CyberOS lead-intake endpoint + wire webhook | 1 | human | M | - | todo |
| LEAD-03 | Sentry alert when every lead sink fails | 1 | agent | S | - | todo |
| LEAD-04 | Weekly synthetic lead check in CI | 1 | agent | M | LEAD-03 | todo |
| LEAD-05 | Production end-to-end lead test (form + chat) | 1 | human | S | LEAD-01 | todo |

## Epic 2 - conversion mechanics (tasks/02-conversion.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| CONV-01 | Outcome-led CTA copy variant | 2 | mixed | S | input: promise wording | needs-input |
| CONV-02 | Call-booking path (Cal.com) on contact + thank-you | 1 | mixed | S | input: booking URL | needs-input |
| CONV-03 | Thank-you state with next steps + form trust line | 1 | agent | M | - | todo |
| CONV-04 | Auto-acknowledgement email to the lead (EN/VI) | 1 | agent | M | LEAD-01 | todo |
| CONV-05 | Zalo + WhatsApp one-tap contacts | 2 | mixed | S | input: numbers/OA | needs-input |
| CONV-06 | Engagement models + price signals section | 2 | mixed | M | input: price ranges | needs-input |
| CONV-07 | Company profile one-pager PDF (EN/VI) | 2 | mixed | M | input: approval | todo |
| CONV-08 | Persistent mobile CTA audit across all chapters | 2 | agent | S | - | todo |
| CONV-09 | True capacity line ("next open slot") | 3 | mixed | S | input: capacity truth | needs-input |

## Epic 3 - proof and trust (tasks/03-proof-trust.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| PROOF-01 | Client permission outreach (agent drafts, Stephen sends) | 2 | mixed | S | - | todo |
| PROOF-02 | One real case study with metrics | 2 | mixed | L | PROOF-01 | todo |
| PROOF-03 | Testimonial block beside every major CTA | 2 | mixed | M | PROOF-01 | todo |
| PROOF-04 | Client logo strip (industries interim version first) | 2 | mixed | S | PROOF-01 | todo |
| PROOF-05 | Team section with real names and faces | 2 | mixed | M | input: photos + bios | needs-input |
| PROOF-06 | Founder LinkedIn program + first four post drafts | 3 | mixed | M | - | todo |
| PROOF-07 | Directory profiles: Clutch, GoodFirms, DesignRush, Google Business, ITviec/TopDev | 1 | human | M | GEO-03 | todo |
| PROOF-08 | Review requests to past clients (Clutch/Google) | 2 | mixed | S | PROOF-07 | todo |
| PROOF-09 | Footer social links row (config-driven) | 1 | mixed | S | input: profile URLs | needs-input |
| PROOF-10 | "Verify us" trust block (registration, DUNS, map, GitHub) | 2 | mixed | S | input: tax/reg number | todo |
| PROOF-11 | Quality gates as marketing: How-we-build in nav + gates band | 2 | agent | S | - | todo |
| PROOF-12 | Organization JSON-LD enrichment (sameAs, founder, LocalBusiness) | 2 | agent | S | PROOF-07, PROOF-09 | todo |
| PROOF-13 | Measured numbers band (median reply time, releases/month) | 3 | mixed | M | MEAS-01 data | deferred |

## Epic 4 - search visibility (tasks/04-seo.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| SEO-01 | Intent title tags + localized VI metadata, sitewide | 1 | agent | M | - | todo |
| SEO-02 | Deepen the three service pages | 3 | mixed | L | CONV-06 | todo |
| SEO-03 | /notes content engine: routes, RSS, two seed posts | 3 | mixed | L | - | todo |
| SEO-04 | Real per-page lastModified dates in sitemap | 2 | agent | S | - | todo |
| SEO-05 | Breadcrumb JSON-LD on services + work detail pages | 2 | agent | S | - | todo |
| SEO-06 | OG images for services + careers routes | 2 | agent | S | - | todo |
| SEO-07 | Google Search Console + Bing setup, submit sitemap | 1 | human | S | - | todo |
| SEO-08 | Backlink base: listicle inclusion + local press outreach | 3 | mixed | M | PROOF-07 | todo |
| SEO-09 | Kinetic heading crawler-text fix (whitespace / sr-only) | 2 | agent | S | - | todo |

## Epic 5 - AI-assistant visibility (tasks/05-geo.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| GEO-01 | Expand FAQ to 15-20 Q&As, EN/VI, keep FAQPage JSON-LD | 2 | mixed | M | CONV-06 for price Qs | todo |
| GEO-02 | Publish /llms.txt and /llms-full.txt | 2 | agent | S | GEO-03 | todo |
| GEO-03 | Canonical entity sentence, single-sourced in site config | 2 | agent | S | - | todo |
| GEO-04 | Notes template enforces author, dates, TLDR block | 3 | agent | S | SEO-03 | todo |
| GEO-05 | Monthly AI citation check ritual + log template | 3 | human | S | - | todo |

## Epic 6 - nurture and updates (tasks/06-nurture.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| NURT-01 | Newsletter capture + double opt-in API (Resend Audiences) | 2 | agent | M | LEAD-01 | todo |
| NURT-02 | Welcome sequence: three emails, EN/VI drafts | 2 | mixed | M | NURT-01 | todo |
| NURT-03 | Intent-based routing map + payload tags to CyberOS | 2 | agent | S | LEAD-02 | todo |
| NURT-04 | Lead system of record + SLA ritual (interim + CyberOS) | 2 | mixed | M | LEAD-02 | todo |
| NURT-05 | Public changelog ("now" page) seeded from real history | 3 | agent | M | - | todo |
| NURT-06 | Share workflow: LinkedIn + Zalo OA + UTM link standards | 3 | mixed | S | SEO-03 | todo |
| NURT-07 | Quarterly client letter template + cadence | 3 | mixed | S | - | todo |
| NURT-08 | Teardown lead magnet funnel (gated PDF) | 3 | mixed | L | NURT-01 | todo |
| NURT-09 | Consent layer decision doc (pre-pixels) | 3 | agent | S | - | todo |
| NURT-10 | Market the live client portal (once CyberOS portal is real) | 3 | human | - | CyberOS portal | deferred |

## Epic 7 - measurement (tasks/07-measurement.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| MEAS-01 | Event taxonomy: form-path lead_submitted, cta_clicked, chapter_reached, faq_opened | 1 | agent | M | - | todo |
| MEAS-02 | Microsoft Clarity integration (cookieless mode) | 2 | mixed | S | input: project id | needs-input |
| MEAS-03 | UTM standards + capture source params into lead payload | 2 | agent | S | - | todo |
| MEAS-04 | Weekly funnel one-pager template + data sources | 2 | mixed | S | MEAS-01 | todo |
| MEAS-05 | Monthly Search Console review ritual | 3 | human | S | SEO-07 | todo |

## Epic 8 - performance and accessibility polish (tasks/08-performance.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| PERF-01 | Aurora image responsive sizes attribute | 2 | agent | S | - | todo |
| PERF-02 | Preload the kinetic display font | 2 | agent | S | - | todo |
| PERF-03 | Ensure APCA + axe route checks run in CI | 2 | agent | S | - | todo |
| PERF-04 | VI diacritics rendering audit in kinetic type | 2 | agent | S | - | todo |
| PERF-05 | Content-Security-Policy, report-only rollout | 3 | agent | M | - | todo |

## Epic 9 - copy and small fixes (tasks/09-copy-fixes.md)

| ID | Task | Wave | Owner | Effort | Depends | Status |
|---|---|---|---|---|---|---|
| COPY-01 | VI footer parity: How-we-build link | 1 | agent | S | - | todo |
| COPY-02 | Unify the Team anchor (#team vs #proof) | 1 | agent | S | - | todo |
| COPY-03 | Hero subline names the audience | 2 | mixed | S | input: audience choice | needs-input |
| COPY-04 | Careers talent-pool email capture | 2 | agent | S | NURT-01 | todo |
| COPY-05 | Partnership section for agencies abroad | 3 | mixed | M | input: offer approval | todo |

## Inputs Stephen owes

Checklist of everything agents are blocked on. Providing one unblocks the tasks in parentheses.

- [ ] Vercel env values: RESEND_API_KEY, LEAD_SLACK_WEBHOOK_URL, LEAD_CRM_WEBHOOK_URL, LEAD_CRM_TOKEN; Resend domain verification with SPF/DKIM/DMARC (LEAD-01, CONV-04, NURT-01)
- [ ] CyberOS lead-intake deployed (cyberos branch auto/lead-intake) (LEAD-02, NURT-03, NURT-04)
- [ ] Cal.com (or similar) booking URL (CONV-02)
- [ ] Approved CTA promise wording, e.g. "a scoped build plan within 3 business days" (CONV-01)
- [ ] Zalo OA link and WhatsApp number (CONV-05, PROOF-09)
- [ ] Price ranges you will publish per engagement model (CONV-06, GEO-01 price questions, SEO-02)
- [ ] Capacity truth: projects per quarter + next open slot (CONV-09)
- [ ] Client permissions: names, logos, metrics, quotes (PROOF-01 unlocks PROOF-02/03/04)
- [ ] Team photos + one-line bios, founder photo (PROOF-05)
- [ ] Social profile URLs: LinkedIn company page, GitHub org, Facebook (PROOF-09, PROOF-12)
- [ ] Tax/registration number for the verify-us block (PROOF-10)
- [ ] Accounts created: Clutch, GoodFirms, DesignRush, Google Business Profile, ITviec/TopDev (PROOF-07, SEO-08)
- [ ] Search Console + Bing Webmaster verification (SEO-07, MEAS-05)
- [ ] Microsoft Clarity project id (MEAS-02)
- [ ] Audience wording choice for the hero subline (COPY-03)

## Wave summaries

- Wave 1 (14 tasks): LEAD-01..05, CONV-02..04, PROOF-07, PROOF-09, SEO-01, SEO-07, MEAS-01, COPY-01, COPY-02. Outcome: leads provably arrive, are acknowledged, bookable, measurable; titles carry intent keywords.
- Wave 2 (24 tasks): proof block (PROOF-01..05, 08, 10..12), nurture foundations (NURT-01..04), CONV-01/05/06/07/08, SEO-04/05/06/09, GEO-01/02/03, MEAS-02/03/04, PERF-01..04, COPY-03/04. Outcome: the site shows real proof and starts keeping a list warm.
- Wave 3 (rest): content engine, changelog, lead magnet, outreach programs, rituals, CSP, partnership section. Outcome: compounding channels.
