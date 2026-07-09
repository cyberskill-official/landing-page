# cyberskill.world strengthening audit (2026-07-06)

Reviewed: the live production site (EN and VI home pages, a case-study page, robots.txt, sitemap.xml), the landing-page repo (lead API, metadata, headers, Lighthouse budgets, analytics events), and current outside research on B2B agency conversion, directories, AI-search visibility, and email nurture. Goal: more client enquiries, and a working loop that keeps leads and clients engaged after the first visit.

## What already works

- Bilingual EN/VI with hreflang, x-default, canonicals, and per-page sitemap alternates.
- JSON-LD on every route (Organization, FAQ, work, careers) and per-page OG images for home and case studies.
- Technical hygiene: security headers, a noindex /lite fallback, Lighthouse budgets enforced in CI (script 320 KB, total 1.2 MB, CLS 0.1), and 3D that loads only on capable desktops.
- Lead capture exists twice (classic form and Lumi chat), validated server-side with a honeypot, with a four-sink fan-out design (file, email, Slack, CyberOS webhook).
- Analytics groundwork: Vercel Analytics + Speed Insights, Sentry, and custom events (wish_flow_started, lead_submitted).
- A distinct brand, honest copy, a one-business-day reply promise, and full company identity (DUNS, address, phone) in the footer.

The remaining gaps are mostly on the business side: proof, discoverability, follow-up, and funnel measurement.

## Fix first: prove a lead actually arrives

The /api/lead route fans out to four sinks, and every one of them can silently do nothing in production. The JSONL file write always fails on Vercel's read-only filesystem, and the email (RESEND_API_KEY), Slack (LEAD_SLACK_WEBHOOK_URL), and CyberOS (LEAD_CRM_WEBHOOK_URL) sinks no-op until their env vars are set. If none is configured, a submitted lead exists only as a console line in function logs.

1. Set RESEND_API_KEY in Vercel and verify the cyberskill.world sending domain in Resend (SPF/DKIM/DMARC records).
2. Deploy the CyberOS lead-intake endpoint (branch auto/lead-intake in the cyberos repo; built and green but not yet pushed as of the last session) and set LEAD_CRM_WEBHOOK_URL and LEAD_CRM_TOKEN.
3. Optionally set the Slack webhook for instant pings.
4. Submit one real test lead through the form and one through Lumi chat in production, and confirm both arrive.
5. Make total failure loud: when every sink rejects, report it to Sentry as an error, and add a weekly synthetic lead submit (flagged as test) so a broken pipeline can never stay broken for a month.

## A. Conversion mechanics

1. Give the primary CTA a concrete promise. "Start my project" states an action; "Get a scoped build plan within 3 business days" states a result. Test outcome-led copy on the hero and the contact band.
2. Add a call-booking path (Cal.com or similar) next to the form. Many buyers would rather pick a 30-minute slot than compose a message. Track bookings as their own event.
3. Build a real thank-you state after submit: what happens next, who replies, from which address, plus the booking link. The one-business-day promise lives before the form today; repeat it after.
4. Send an automatic acknowledgement email to the lead (Resend is already wired for outbound). It confirms the enquiry landed, warms deliverability, and opens the door to nurture.
5. Add one-tap chat contacts: Zalo for Vietnamese buyers, WhatsApp for international ones. On mobile these convert people who will never type into a form.
6. Publish engagement models with price signals: fixed-scope project, monthly product team, support retainer, each with a typical starting range and timeline. Price signals filter out bad-fit leads and answer the question every visitor has and never asks.
7. Offer a downloadable one-page company profile (PDF, EN and VI) so a champion can forward you internally to a director or procurement.
8. Keep a persistent CTA reachable through the long cinematic scroll on mobile (a bottom bar exists; verify it at every chapter on real devices).
9. State true capacity ("we start at most N new projects per quarter; next open slot: ...") - honest scarcity that fits the brand voice.
10. For context once measurement is in: an average B2B site converts 2-4% of visitors into leads; use that to sanity-check volume.

## B. Proof and trust (the biggest gap)

The three case studies are anonymous archetypes ("The kinds of wishes we are built to grant"), and the site shows no client names, no metrics, no screenshots, no testimonials, no team faces, and no social profiles. For a company whose pitch is accountability, proof is the highest-return work available.

1. Turn at least one archetype into a real, named case study: client (or industry plus size where an NDA applies), the before, what shipped, and 2-3 hard numbers (hours saved per week, crash-free rate, checkout time). One real story outperforms three archetypes.
2. Collect 3-5 short client quotes with name, title, and photo, and place one within view of every major CTA. Industry roundups report the strongest lifts when a trust signal sits next to the ask, and client logos appear above the fold on roughly three quarters of high-converting B2B pages.
3. Add a client-logo strip (with permission) near the hero and the contact band; where NDAs block logos, name industries and counts instead.
4. Ship a real team section. The nav already promises "Team", and the copy repeats "you always know who is building what"; back it with founder and senior-engineer names, photos, and one line each. Also unify the anchor: the home nav points to #team, subpage navs to #proof.
5. Put the founder forward. Buyers check the founder's LinkedIn before agreeing to a call; a complete profile plus 1-2 posts per week beats most ad budgets at this stage.
6. Create and cultivate directory profiles: Clutch, GoodFirms, DesignRush, plus a Google Business Profile for the HCMC address. Ask 3-5 past clients for verified Clutch reviews; buyers evaluating Vietnamese vendors cross-check these platforms routinely, and they are also the pages AI assistants cite.
7. Add footer social links (LinkedIn company page, GitHub org, Zalo OA, Facebook). Their absence reads as a red flag for a software company.
8. Add a "verify us" block or page: registered name, DUNS (already shown), tax/registration number, address with map, founding year, GitHub. Cheap to build, disproportionately reassuring for cross-border clients.
9. Market your quality gates: the CI that fails on regressions, the Lighthouse budgets, the accessibility statement. "How we build" already exists; link it from the main nav in both languages instead of just the EN footer.
10. Publish measured numbers instead of adjectives where possible: median reply time, releases shipped per month, uptime of client systems you operate.
11. Add partner badges where real (cloud providers, stores), and employer pages on ITviec/TopDev; hiring presence doubles as client-side proof of a real team.
12. Once reviews exist, extend the Organization JSON-LD with sameAs (all profiles), founder, foundingDate, and a LocalBusiness/ProfessionalService address block so the entity is unambiguous to search and AI engines.

## C. Search visibility

1. The home title tag is brand-only ("CyberSkill - Turn Your Will Into Real") in both languages, and the VI title is not localized. Nobody searches the slogan. Use intent titles, for example EN "CyberSkill | Software development company in Ho Chi Minh City - web, mobile, internal systems" and VI "CyberSkill | Công ty phát triển phần mềm tại TP.HCM - web, di động, hệ thống nội bộ", with unique titles and descriptions per service, work, and careers page.
2. Deepen the three service pages: scope, typical stack, process, timeline, price signals, FAQs, and links to related work. Thin service pages rank for nothing.
3. Start a small content engine at /notes or /insights: two posts a month, EN first with VI where relevant. Best-fit formats: build notes (you already work in public), teardown posts (the website-consulting report you produced for a theater client is exactly this, productized), and answer posts for queries like "custom software cost in Vietnam 2026".
4. Give sitemap entries real per-page lastModified dates instead of build time; fake freshness on every deploy teaches crawlers to ignore the signal.
5. Add breadcrumb JSON-LD on service and work detail pages.
6. Add per-page OG images for services and careers (home and work slugs already have them).
7. Register Google Search Console and Bing Webmaster Tools, submit the sitemap, and review queries monthly; without this the search side stays invisible.
8. Build a base of quality backlinks: the directory profiles above, TopDev/ITviec company pages, local press (Vietcetera, e27, Tech in Asia) when there is a story, and inclusion pitches to authors of "top software companies in Vietnam" listicles that already rank.
9. Local SEO: the Google Business Profile plus a consistent name-address-phone everywhere unlocks map results for "software company Ho Chi Minh City".
10. The kinetic headings extract as concatenated strings ("TurnYourWillIntoReal", "Thearcofawish"). Screen readers are covered by aria-label on the wrapper, but add real whitespace between word spans or an sr-only text node so crawlers that ignore ARIA read clean copy; confirm with Search Console URL inspection.

## D. AI-assistant visibility (GEO)

1. A widely cited G2 2026 figure: about half of software buyers now start vendor research in an AI chatbot rather than a search engine. The pages AI engines quote are directories, listicles, and clearly structured self-descriptions, so the proof work in section B does double duty here.
2. Grow the FAQ (5 questions today) to 15-20: pricing, timelines, IP ownership, contracts, stack, English proficiency, time zones, maintenance. Keep the FAQPage JSON-LD; structured Q&A pairs are the highest-yield GEO asset.
3. Add /llms.txt (and llms-full.txt) with a plain-language company description, services, proof, and contact. It is a cheap emerging convention, and you control the wording AI tools ingest.
4. Keep one canonical entity sentence everywhere ("CyberSkill is a software development company in Ho Chi Minh City, founded in 2020, building web apps, mobile apps, and internal systems"): site, LinkedIn, Clutch, GitHub, Crunchbase.
5. Publish answer-shaped content with visible author and dates (see C3); AI engines prefer pages that make one claim per section with evidence.
6. Once a month, ask ChatGPT, Perplexity, and Gemini for "best software development companies in Ho Chi Minh City", log whether CyberSkill appears, note which sources they cite, and chase those sources.

## E. Keep leads and clients updated

Nothing on the site captures an email for later, and there is no newsletter, blog, changelog, or social link. Once the lead pipeline is verified, this is the second-highest-return area, and it is the half of your goal about staying in touch.

1. Auto-acknowledge every lead immediately (A4), from a named human sender.
2. Add a newsletter ("Build notes") with signup in the footer, after the FAQ, and on the thank-you state. Monthly is enough: what shipped, one lesson, one teardown. Resend Broadcasts/Audiences keeps the stack you already have; use double opt-in.
3. Write a 3-email welcome sequence spread over about two weeks: a useful insight, then a real example (the case study), then the call invitation. Reported benchmarks: first welcome emails open at 52-68%, and welcome series convert to qualified leads at the highest rate of any sequence type. Value-first ordering matters; a list trained on pitches tunes out.
4. Segment by the existing intent field: "a project" enters sales nurture, "a partnership" gets a partner track, "a role" feeds the talent pool.
5. Land every lead in one system of record with a status (new, contacted, proposal, won, lost) and a next-action date. The CyberOS webhook is the destination you already built; until it is live, a shared sheet with a weekly review works. Measure the one-business-day promise and publish the median.
6. Publish a public changelog or "now" page fed by what the team shipped. Returning visitors need a reason to return, and the same items feed the newsletter.
7. Add RSS for /notes and auto-share each post to the LinkedIn company page and the founder profile; add a Zalo OA broadcast for VN followers.
8. Send a quarterly client letter to past and current clients: releases, availability, one referral ask. Referrals remain the strongest agency channel and cost one email.
9. Productize a lead magnet: "a 15-point teardown of your website or internal tool, free, delivered in 3 business days". You already produce these one-off; gate the PDF behind an email and the nurture list fills itself with qualified people.
10. Retargeting later, consent first. Vercel Analytics is cookieless, so today the site needs no banner. Adding LinkedIn or Meta pixels requires a consent layer (Vietnam's PDPD rules plus GDPR for EU visitors); do it only when there is content worth retargeting to.
11. Coordinate channels: a buyer who reads a note, sees a founder post, and then receives the monthly email experiences one coherent thread. Current nurture guidance is unanimous on multi-channel reinforcement at a weekly-to-monthly cadence.
12. Later, market "clients watch progress live" as a differentiator: the CyberOS client portal and chat are on your roadmap; the site should sell the update experience once it is real.

## F. Measurement

1. Define a small event taxonomy and instrument both lead paths. The chat panel tracks lead_submitted with source "lumi-chat"; make sure the classic form emits the same event with source "form". Add cta_clicked (per location), booking_clicked, newsletter_subscribed, faq_opened, chapter_reached.
2. Watch scroll depth per chapter on mobile; the cinematic format lives or dies on where people stop.
3. Add Microsoft Clarity (free, cookieless mode) for heatmaps and session replays; ten replays teach more than a month of aggregates.
4. Keep UTM discipline on every external profile link (Clutch, LinkedIn, Zalo, email footers) so the lead source field means something.
5. Review one funnel page weekly: visitors, leads by source, reply-time median, booked calls. Fifteen minutes.
6. Check Search Console monthly against the title and description changes in C1.
7. The weekly synthetic lead test from the fix-first section doubles as uptime monitoring for the funnel.

## G. Performance, mobile, accessibility polish

1. The budgets are healthy; hold them as sections get added (script 320 KB error line, LCP 2.5 s warn line).
2. The aurora background image is requested at width 3840; confirm the responsive sizes attribute so phones pull a small variant.
3. Preload the display font behind the kinetic headings to protect CLS on slow connections.
4. Re-run the APCA contrast and axe route scripts whenever the gold-on-dark palette changes; gold tones sit close to contrast limits.
5. Verify Vietnamese diacritics render cleanly in kinetic type at every breakpoint; clipped accents on capitals are a classic failure.
6. Consider a Content-Security-Policy (report-only first) to complete the header set; the current baseline (nosniff, frame deny, referrer policy, permissions policy) is good, and HSTS comes from the platform.

## H. Copy and small fixes

1. Localize the VI title tag and metadata (C1); VI pages carry the English slogan as their title today.
2. Add "How we build" to the VI footer (EN-only today).
3. Unify the Team anchor (#team on home, #proof on subpages).
4. Name the audience in the hero subline in one clause: operations-heavy SMEs, funded startups, agencies needing a build partner.
5. On the careers page, capture emails when no roles are open ("leave your email; we hire slowly") instead of ending in a dead end.
6. Give the "partnership" intent a home: a short section for agencies and consultancies abroad that need a Vietnam build partner. That channel fits your cost position, and the local market backdrop helps (Vietnam's IT services market is around USD 2.6B in 2026, growing near 11% a year).
7. Add one line under the form about what happens after send (who reads it, which address replies); it lifts completion and reduces no-reply anxiety.

## Suggested order

Week 1: the fix-first block; acknowledgement email; booking link; social profiles and footer links; Google Business Profile; title and description changes; Search Console and Bing; instrument the form path.

Month 1: one real case study with numbers; testimonials beside CTAs; team section with faces; FAQ expansion and llms.txt; newsletter plus welcome sequence; Clutch and GoodFirms profiles with first review requests; Clarity; VI parity fixes.

Quarter: content engine at two posts per month; teardown lead magnet; partner section; quarterly client letter cadence; CyberOS lead CRM live with an SLA view; GEO citation tracking; consent layer and retargeting only if content supports it.

## What only you can provide

- Client permissions: names, logos, metrics, quotes (start with the two or three friendliest past clients).
- Photos of you and the team, and the social profile URLs (LinkedIn company page, GitHub org, Zalo OA).
- Vercel env values: RESEND_API_KEY, LEAD_SLACK_WEBHOOK_URL, LEAD_CRM_WEBHOOK_URL and token, plus Resend domain verification (SPF/DKIM/DMARC).
- A decision on price signals (ranges you are comfortable publishing).
- Review requests to past clients for Clutch and Google.

## Method and evidence

Live fetches on 2026-07-06: cyberskill.world (redirects to /en), /vi, /robots.txt, /sitemap.xml, /en/work/operations-platform. Repo inspection on the local checkout (branch auto/digest-band-fix, on top of merged PR #17): app/api/lead/route.ts, app/[lang]/layout.tsx, next.config.ts, lighthouserc.json, app/sitemap.ts, and component greps for analytics events, newsletter mentions, and ARIA handling. External research via web search in July 2026; the key sources are listed below, and single-study percentages should be read as directional.

## Sources

- B2B conversion benchmarks: https://martal.ca/conversion-rate-statistics-lb/
- Trust signals near CTAs, logo placement: https://www.saashero.net/design/landing-page-design-trust-signals/
- B2B website and lead-gen practice 2026: https://www.intuitia.tech/blog/b2b-website-design , https://www.gravitatedesign.com/blog/b2b-saas-lead-generation-guide/ , https://www.grafit.agency/blog/best-practices-for-building-a-high-performing-b2b-website-in-2026
- 2026 B2B design trends including GEO: https://www.lowcode.agency/blog/b2b-website-design-trends
- GEO guides (including the G2 2026 buyer-behavior figure): https://www.mersel.ai/generative-engine-optimization , https://www.enrichlabs.ai/blog/generative-engine-optimization-geo-complete-guide-2026 , https://llmrefs.com/generative-engine-optimization
- Vietnam directories and market context: https://clutch.co/vn/developers , https://groovetechnology.com/blog/software-development/outsourcing-companies-in-vietnam/ , https://adamosoft.com/blog/software-outsourcing-services/it-outsourcing-companies-in-vietnam/
- Email nurture benchmarks and cadence: https://www.growthspreeofficial.com/blogs/b2b-saas-b2b-email-nurture-benchmarks-2026-open-ctr-reply-conversion-by-sequence , https://noseberry.com/blogs/digital-marketing/email-marketing-best-practices-in-2026-the-complete-b2b-playbook-that-actually-converts , https://www.mailreach.co/blog/email-frequency-best-practices , https://4thoughtmarketing.com/articles/welcome-emails-best-practices
