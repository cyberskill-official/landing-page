# CyberSkill (cyberskill.world) — Deep Website Audit, Dual Benchmark & Multi-Phase Remediation Roadmap

## TL;DR
- **CyberSkill's website is already a top-decile build for a Vietnamese software SME** — a fast, accessible, bilingual Next.js/Vercel site with a genuinely original brand ("Lumi," the golden genie), clean metadata, an FAQ, service pages and a "How we build" methodology page. Its single biggest weakness is **thin, anonymized proof**: three unnamed case studies with zero metrics, no client logos, no testimonials, no named team, and almost no third-party review presence — which caps both conversion and AI-answer visibility.
- **Against direct SEA competitors** (Designveloper, Saigon Technology, TMA, Savvycom, FPT), CyberSkill wins decisively on design craft, performance and English quality, but loses badly on **volume of trust signals, case-study depth, Clutch/GoodFirms reviews, blog/SEO content footprint and named clients.** Against **world-class agencies** (Thoughtworks, Netguru, STRV, WillowTree), the gap is **outcome-quantified case studies, named client logos, thought-leadership content, awards/certifications and a scaled content engine.**
- **The fastest ROI path:** (1) add quantified, named case studies and client logos; (2) claim and populate Google Business Profile + Clutch/GoodFirms with real reviews; (3) publish schema.org JSON-LD, an llms.txt file and a real blog for SEO/GEO. These are low-effort, high-impact moves that would let a genuinely excellent website finally *convert* and *get cited* by AI engines.

## Key Findings

1. **The site is technically excellent but commercially under-leveraged.** The engineering (Next.js on Vercel, cookieless first-party analytics, WCAG 2.2 AA target, bilingual with hreflang, a "lite" text-first accessibility view) is better than most competitors. But the business case — proof, differentiation, discoverability — is underbuilt.
2. **Proof is the critical gap.** Case studies are anonymized ("a logistics client," "a retail client") with no company names, no numbers, no testimonials. World-class and even strong local competitors lead with named clients and hard metrics.
3. **Discoverability is minimal.** The domain has near-zero content footprint (no blog, ~13 pages), a thin/absent third-party review presence, and inconsistent NAP across directories. This suppresses both classic SEO and AI-engine citation.
4. **Entity ambiguity hurts GEO.** "CyberSkill" collides with an unrelated Australian cybersecurity-training company and CyberSkill's own Claude-exam and CyberOS sub-projects, muddying how LLMs represent the brand.
5. **Contact/NAP inconsistencies exist across the web** that should be cleaned up for local SEO and AI accuracy.

## Details

### 1. SEO Audit

**On-page (strong).** Every core page fetched carries a unique, well-written `title`, `meta description`, canonical URL, `og:` and `twitter:` tags, `theme-color` (`#FDF4E1`), `hreflang` alternates (en_US / vi_VN), and `robots: index, follow` plus a rich `googlebot` directive (`max-image-preview:large`, `max-snippet:-1`). The homepage OG image is a proper 1200×630 PNG with alt text ("CyberSkill – Turn Your Will Into Real"). Heading hierarchy is clean and semantic (single H1 per page, logical H2/H3). This is better metadata hygiene than most SEA competitors.

**Keyword targeting (weak/underdeveloped).** The copy is brand-poetic ("Turn Your Will Into Real," "the arc of a wish") rather than search-intent-oriented. There are no pages targeting high-intent commercial queries like "software development company Vietnam," "offshore development Ho Chi Minh City," "React Next.js development agency," or "hire dedicated development team Vietnam." Competitors (Designveloper, Saigon Technology) rank on dozens of such pages plus large blogs.

**Technical SEO (mostly good, some unverifiable).** URLs are clean and logical (`/en/services/web-apps`, `/en/work/operations-platform`). Canonicalization is present. The site is a server-rendered Next.js app, so content is in the first-wave HTML crawl — important because AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute JavaScript and see only raw HTML. **Could not externally verify robots.txt, sitemap.xml, or JSON-LD structured data** — the research toolset blocked direct fetch of these files and strips `<script>` blocks; these must be confirmed via view-source/curl. Given the Next.js stack, a generated robots.txt and sitemap likely exist, but this is an inference.

**Structured data (likely missing or minimal).** Could not confirm any Organization, LocalBusiness, Service, BreadcrumbList or FAQPage JSON-LD. The site has ideal raw material for all five (legal name, address, DUNS 673219568, phone, a 5-item FAQ block titled "Questions, answered," and three service pages), so this is a high-value, low-effort win if absent.

**Image SEO.** Uses Next.js `<Image>` with automatic WebP/AVIF and responsive `srcset` (e.g., `/_next/image?url=...&w=3840&q=75`), which is best-practice. Decorative Lumi/aurora images appear to lack descriptive alt text/filenames (they are declared decorative, which is correct for accessibility but forfeits image-search value).

**Off-page / backlinks (very weak).** Discoverable references are limited to aggregator profiles (GoodFirms with 1 review, ZoomInfo, appsruntheworld, a Facebook page with 0 reviews, sparse LinkedIn pages). No earned media, no guest posts, no high-authority referring domains. Domain authority is effectively negligible versus TMA (est. 1997), FPT, or Designveloper (2013).

**Local SEO / NAP.** The website's NAP is internally consistent and current: *1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward, Ho Chi Minh City* / *+84 906 878 091* / *info@cyberskill.world*. But external citations diverge: the Google Play developer listing shows the **old** ward ("Dakao ward, district 1") and a different email (thai-anh.trinh@cyberskill.world); appsruntheworld lists address as "x, Ho Chi Minh, 700000"; GoodFirms lists "$25–$49/hr, 10–49 employees, 2020." **No confirmed Google Business Profile.** These inconsistencies (especially the Dakao→Tan Dinh ward change, a real administrative renaming) should be reconciled everywhere.

### 2. GEO / Generative Engine Optimization

**Strengths.** The site is unusually LLM-friendly for its size: server-rendered HTML, a clear FAQ block with clean Q&A pairs, definitional "What does CyberSkill do?" content, an explicit "How we build" methodology page, and consistent factual anchors (founded 2020, DUNS 673219568, HCMC). The `ccaf.cyberskill.world` Claude-exam sub-site and `cyberos-wiki.cyberskill.world` even repeat a crisp entity definition LLMs can lift verbatim ("CyberSkill... is a software consultancy founded in 2020 in Ho Chi Minh City, Vietnam").

**Weaknesses.**
- **Entity ambiguity.** "CyberSkill" is contaminated in AI retrieval by (a) an unrelated Australian cybersecurity-awareness company also called "Cyberskill" (surfaced by ZoomInfo), and (b) CyberSkill's own side-projects. An LLM asked "what is CyberSkill" may conflate these.
- **No llms.txt.** Could not confirm one exists; likely absent. This is a cheap GEO win.
- **Thin third-party corroboration.** This is the decisive GEO weakness. Ahrefs' study of 75,000 brands found branded web mentions were the single strongest correlate of AI Overview visibility, at **r = 0.664 (Spearman) — versus just 0.218 for backlinks**. CyberSkill has almost no branded mentions in authoritative third-party sources, so it is unlikely to be named when a user asks an AI engine "best software development companies in Ho Chi Minh City," where Designveloper, Saigon Technology, TMA, FPT and Savvycom dominate the retrievable corpus.
- **No quantified, citable claims.** LLMs preferentially cite specific facts ("reduced checkout time by X%"). CyberSkill's outcomes are narrative, not numeric.

### 3. Performance Audit (estimates, flagged as such)

The site is Next.js on Vercel's edge CDN with HTTP/2+ (likely HTTP/3), Brotli compression, automatic image optimization and font optimization. **Estimated Lighthouse (not directly measured):** Performance ~90–99 desktop / ~75–90 mobile; Accessibility ~95–100; Best Practices ~95–100; SEO ~90–100. The main performance risk is the **animated "golden genie" 3D/WebGL scene**, which the site itself says "runs on capable desktops only" — this can hurt mobile LCP/INP and battery if not gated properly. CyberSkill claims to keep "Core Web Vitals in the green" as a discipline. Because Google ranks on *field* data (75th-percentile real users over a 28-day window), low traffic means CrUX data may be sparse; Vercel Speed Insights should be used for real-user monitoring. Net: performance is a genuine competitive advantage versus typical WordPress-based SEA competitor sites.

### 4. UI/UX Audit

**Strengths.** Distinctive, modern, confident visual identity built around the Lumi genie and a warm gold/cream palette. Strong narrative IA ("the arc of a wish": wish → craft → proof → team). Clear primary CTA ("Start my project") repeated consistently, plus a conversational "Talk to Lumi" secondary CTA. Value proposition is communicated above the fold. Honest, human tone ("we name trade-offs out loud"). The four stat badges (6 years, 3 practices, EN+VN, 1 business day reply) are effective micro-proof.

**Weaknesses.**
- **Trust signals are almost entirely absent:** no client logos, no testimonials/quotes with names and titles, no team bios/photos, no certifications (ISO 27001/9001, CMMI), no awards, no partner badges (AWS/Google/Microsoft). Best practice places social proof *next to CTAs*; CyberSkill has none to place.
- **The "Team" nav link jumps to an on-page section, not a real team page** — and no individuals are named despite the whole pitch being "you always know who is building what." A missed credibility opportunity.
- **Portfolio is shallow:** three anonymized cards, each ~3 short paragraphs (challenge / what we did / outcome) with no metrics, no screenshots, no client name, no tech detail.
- Novelty risk: the genie metaphor, while charming, may read as *less* serious to a conservative enterprise buyer than a straightforward capabilities-and-proof layout.

### 5. Responsiveness & Cross-Device

`viewport` meta is correct on every page. Next.js responsive images and a mobile hamburger pattern are present. The accessibility page confirms a **reduced/"lite" text-first view** (`/en/lite`) and states the 3D scene is desktop-only — good responsive discipline. Flagged concern (from their own accessibility statement, last reviewed 22 June 2026): "some motion currently plays regardless of the operating-system reduced-motion setting" — an accessibility/responsiveness defect they have self-identified but not yet fixed. Touch-target sizing and 320px behavior could not be pixel-tested, but the framework choices make major breakage unlikely.

### 6. Content Audit

**English quality is excellent — genuinely native-level, confident and distinctive.** This is a real differentiator: many SEA competitors have stilted or marketing-cliché English ("relentless pursuit of excellence," "crafting digital masterpieces"). CyberSkill's copy is clean and specific.

**Bilingual support is strong and properly implemented** (full VI translation at `/vi` with correct diacritics — "Hiện thực hoá ý chí" — and hreflang). One inconsistency: the VI stat-badge labels differ slightly from EN and are reordered, and the case-study category tags ("Logistics operations," "Education," "Retail") remain in English on the VI pages — minor polish items.

**Missing content types (the big gap):** no blog/insights, no whitepapers, no industry pages, no service-specific landing pages beyond the three practices, no explicit pricing/engagement-model page, no detailed process/methodology beyond the single "How we build" page, no dedicated about/company-story page, no named team. World-class agencies (Netguru, Thoughtworks) publish original technical thought-leadership continuously; even local competitors (Designveloper, TMA) run active blogs and news feeds that drive SEO and GEO.

### 7. Visual Richness & Brand

Brand identity is a standout strength — original mascot, custom illustration/animation, coherent color and type system, generous whitespace, strong visual hierarchy, and light/dark color-scheme support (`color-scheme: dark light`). This is *more* original than most competitors, who rely on stock imagery and generic templates. The gap versus Awwwards-tier studios (Dogstudio, Instrument, Work & Co) is depth of custom interaction and a body of showcased work — not raw craft. CyberSkill could plausibly earn an Awwwards Honorable Mention or CSSDA feature with modest additional polish and, crucially, more showcased project work.

### 8. Technical & Security

**Confirmed:** HTTPS throughout; hosted on Vercel; built with Next.js; cookieless, first-party-only anonymous analytics (page views, button clicks); theme/language prefs stored client-side only; Lumi chat routed to Anthropic. A privacy policy and an accessibility statement both exist and are dated (last updated/reviewed 22 June 2026). Favicon present.

**Could not verify:** security headers (HSTS, CSP, X-Frame-Options), web manifest/PWA capability, SPF/DKIM/DMARC. These need direct header inspection.

**Compliance — Vietnam PDPL.** Vietnam's Personal Data Protection Law (Law No. 91/2025/QH15) was passed 26 June 2025 and took effect **1 January 2026**; its guiding Decree 356/2025/ND-CP was issued 31 December 2025 (effective the same date), replacing Decree 13/2023/ND-CP. It is consent-centric (GDPR-like) and requires explicit, granular, informed consent. CyberSkill's contact form does include a consent checkbox ("I agree to be contacted") and the privacy policy is reasonable, but: the Lumi chat sends data to Anthropic (a **cross-border transfer** potentially triggering a Transfer Impact Assessment), and there is no cookie/consent banner (defensible, since the site is genuinely cookieless). Two facts raise the stakes: **PDPL sets fines of up to 5% of a violator's prior-year annual revenue for cross-border data-transfer breaches, and requires breach notification within 72 hours of detection.** However, PDPL Article 38 gives small enterprises and start-ups the right to choose whether to implement certain provisions (e.g., Article 21 data-processing impact assessments) — reported as a five-year grace period — which likely covers CyberSkill for now. Overall PDPL posture is *better than most local peers* but should be formally reviewed.

**Terms of Service is absent** (only Privacy + Accessibility appear in the footer).

### 9. Conversion & Business-Effectiveness

**Conversion mechanics are well-designed:** a low-friction contact form (name, work email, optional company, enquiry type, optional message, consent) — 3 required fields, which matches best-practice. HubSpot's analysis of 40,000+ landing pages found forms with **3 fields had the highest conversion rate (~25%), with a sharp drop after a fourth field is added.** Dual conversion paths (form + AI chat). A clear "1 business day" response promise reduces friction. A honeypot spam field is present.

**But conversion is throttled by missing proof.** Testimonials and reviews can lift landing-page conversions by up to ~34% (SalesHive), and placing social proof in the hero rather than the footer is a hallmark of high-converting B2B pages (in Popupsmart's 2026 review of 30 top B2B pages, social proof sat in the hero and 26 of 30 used dual CTAs). CyberSkill has none of these proof elements to place. A technically sophisticated buyer evaluating an offshore partner will ask "who have you done this for, and what happened?" — and the site cannot answer.

**Positioning/differentiation is strong in voice but weak in evidence.** "Senior, small, honest about trade-offs, outcome-first" is a clear and appealing wedge against faceless body-shops — but it is asserted, not demonstrated. No pricing/engagement-model transparency. Social presence is minimal (a Facebook page with 0 reviews; LinkedIn company pages exist but are sparse).

### 10. Dual Benchmark

**vs. Direct SEA competitors:**

| Dimension | CyberSkill | Designveloper | Saigon Technology | TMA Solutions | FPT Software |
|---|---|---|---|---|---|
| Design craft / originality | **Best-in-class** | Good | Average | Dated | Corporate |
| Performance (est.) | **Excellent** | Good | Average | Average | Average |
| English quality | **Excellent** | Good | Good | Good | Good |
| Named case studies + metrics | **None** | Many (Lumin, Chloe Ting) | Many (named) | Many (named) | Many (Fortune 500) |
| Client logos / testimonials | **None** | Many | Many | Many | 1,100+ clients |
| Third-party reviews | 1 (GoodFirms) | 4.9★, 48 Google reviews | Many, ISO-certified | CMMI L5, ISO | CMMI L5, ISO 27001 |
| Blog / content footprint | **None** | Large | Large | Large + news | Large |
| Certifications | None shown | Some | ISO | CMMI 5, TL9000, ISO 27001 | CMMI 5, ISO 9001/27001/45001 |
| Scale signals | 10–49, since 2020 | 50+, since 2013 | 400+, since 2012 | 4,000, since 1997 | 30,000+ |

CyberSkill is a **design/performance leader but a proof/scale laggard.** It looks the most modern and reads the best, but a buyer comparing shortlists sees far less evidence.

**vs. World-class global agencies (Thoughtworks, Netguru, STRV, WillowTree, Toptal):**
- **Outcome-framed case studies:** Best-in-class use "reduced time-to-deploy from six weeks to two days for a major global retailer." CyberSkill uses "the operations team works from one live view." Adopt the outcome+number format.
- **Named clients / video testimony:** Netguru (IKEA, Volkswagen, Vinted), STRV (Tinder, Porsche, Barnes & Noble), WillowTree (GE, J&J, American Express). Publicis Sapient uses named client video. CyberSkill shows nobody.
- **Third-party recognition given visual weight:** Awwwards, Clutch 4.8★+, B Corp, Deloitte Fast 50, analyst awards surfaced on the homepage. CyberSkill shows none.
- **Thought leadership:** one original technical piece per month compounds into authority no design spend can buy. CyberSkill publishes nothing.
- **Named frameworks:** Publicis Sapient's "SPEED," structured capability navigation. CyberSkill's "arc of a wish" is a brand story, not a buyer-usable capability framework.

**Where CyberSkill already matches or beats best-in-class:** original brand system; genuine bilingual delivery; cookieless privacy-by-design; accessibility-first (WCAG 2.2 AA target + lite view); native-quality English; server-rendered performance. These are real assets to build on, not fix.

## Recommendations

Prioritized by impact ÷ effort. Benchmarks that would change the plan are noted.

### Phase 1 — Critical proof & quick wins (Weeks 1–4; low effort, highest impact)
1. **Publish 3–5 named, quantified case studies.** Get client permission; add company name (or at least industry+size+region if under NDA), the problem, the solution, the tech stack, and **hard numbers** (e.g., "cut monthly reporting from 6 hours to 1 glance," "checkout LCP 4.1s → 1.8s," "crash-free sessions 99.4%"). *Addresses the #1 gap; matches SEA + global best practice.*
2. **Add client logos + 2–3 named testimonials** (quote + name + title + company) placed next to CTAs. *Testimonials can lift conversions up to ~34%.*
3. **Claim & fully populate Google Business Profile** with the correct Tan Dinh Ward NAP; solicit 5–10 client reviews. *Fixes local SEO + AI accuracy.*
4. **Reconcile NAP everywhere** (Google Play developer info still says "Dakao ward, district 1" and an individual's email; fix appsruntheworld, GoodFirms, LinkedIn, Facebook). *Entity consistency for SEO + GEO.*
5. **Add/confirm schema.org JSON-LD:** Organization, LocalBusiness (with DUNS, geo, hours), Service (×3), BreadcrumbList, and FAQPage. *Rich-result eligibility; cheap if missing.*
6. **Ship an llms.txt** at the root summarizing the entity and linking key pages. *Zero-cost GEO signal; disambiguates from the Australian "Cyberskill."*
7. **Fix the self-identified reduced-motion bug** so motion respects OS settings. *Accessibility compliance they already promised.*

### Phase 2 — Foundational credibility (Weeks 4–10; medium effort)
8. **Build a real Team/About page** with named senior engineers, photos and short bios — the whole pitch is "you know who is building what." *Closes the biggest authenticity gap.*
9. **Add an engagement-model / pricing-approach page** (fixed-bid vs. dedicated team vs. staff aug; typical timelines). *Buyers shortlist on this; competitors show it.*
10. **Create Clutch and GoodFirms profiles with verified reviews** (Clutch verifies via client interview — the highest-trust B2B signal). *Directly feeds both buyer shortlists and LLM retrieval.*
11. **Verify and harden security headers** (HSTS, CSP, X-Frame-Options) and publish a Terms of Service. *Enterprise procurement checklist items.*
12. **Add an explicit trust/credential row** — even pre-certification, list "code review on every change, CI, WCAG 2.2 AA, PDPL-aligned." Pursue ISO 27001 as a medium-term goal to match TMA/FPT/Saigon Technology.

### Phase 3 — Content & SEO/GEO build-out (Months 3–6; medium effort, compounding)
13. **Launch a blog / insights hub** with commercial-intent + thought-leadership pieces: "React vs. React Native for X," "offshore development from Vietnam: time-zone realities," "how we keep Core Web Vitals green." Target the keywords competitors own. *Builds the missing content footprint for SEO + GEO.*
14. **Build service-specific and industry landing pages** (e-commerce, logistics, education — mirroring the case studies) for long-tail capture.
15. **Earn third-party mentions** — guest posts, Vietnam tech-press features, podcasts. *Branded mentions in authoritative sources are the strongest correlate of AI-Overview inclusion (Ahrefs: r = 0.664).*
16. **Formal PDPL/Decree 356 compliance review**, especially the Anthropic cross-border chat transfer (Transfer Impact Assessment), documenting the Article 38 start-up position and the 72-hour breach-notification duty.

### Phase 4 — Advanced optimization & differentiation (Months 6–12)
17. **Instrument real-user Core Web Vitals** (Vercel Speed Insights) and publish a performance commitment. Add outcome dashboards to case studies.
18. **Submit the site to Awwwards / CSSDA** once more showcased work exists — realistic given the craft. *Earned-media + trust flywheel.*
19. **Package a named methodology** (turn "the arc of a wish" into a buyer-usable framework with stages/artifacts, like Publicis Sapient's SPEED).
20. **Add video testimonials** from named clients. *Highest-trust content format for enterprise buyers.*

### Phase 5 — Continuous (ongoing)
21. Monthly: one original technical article; refresh case-study metrics; monitor CWV field data; track AI-engine share-of-voice (does ChatGPT/Perplexity name CyberSkill for "software company Ho Chi Minh City" yet?).
22. Quarterly: full SEO/GEO audit; review conversion analytics (form starts vs. completions); refresh testimonials/logos.

**Threshold triggers:** If organic traffic and inbound form volume remain flat after Phase 3, invest in paid search + targeted outbound rather than more content. If Clutch reviews reach 10+ at 4.8★, prioritize enterprise-grade certifications (ISO 27001) to move upmarket against TMA/FPT.

## Caveats
- **Performance and Lighthouse figures are informed estimates**, not measured runs — based on the confirmed Next.js/Vercel stack and observable optimization signals. Real field data requires PageSpeed Insights/CrUX and Vercel Speed Insights.
- **robots.txt, sitemap.xml, llms.txt, JSON-LD structured data, and HTTP security headers could not be externally confirmed** — the research toolset blocked direct file fetches and strips inline `<script>`/header data. A view-source/curl inspection is required to confirm presence/absence before acting on items that assume they are missing.
- **Third-party data points** (e.g., appsruntheworld's "$2.0M 2024 revenue," GoodFirms' "10–49 employees, $25–49/hr") are unverified aggregator estimates, not company-confirmed figures.
- The "42% conversion-lift" upper bound sometimes cited for CTA-adjacent trust signals could not be corroborated to a named source; the documented, attributable figure is ~34% (SalesHive). The "76% of high-converting B2B pages use above-the-fold logos" figure likewise lacked a verifiable source and was replaced with the attributed Popupsmart observation.
- Competitor comparisons reflect their public websites and directory profiles as observed; specific rankings shift over time.
- The unrelated Australian "Cyberskill" cybersecurity-training entity is a real source of AI/entity confusion and was factored into the GEO analysis.