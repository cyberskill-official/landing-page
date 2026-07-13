# CyberSkill landing page - FR backlog

Source of truth for FR state = each FR's frontmatter `status`. This file indexes them.
ONE backlog for ALL work: net-new features (`class: product`) and hardening / audit-remediation
(`class: improvement`) live here together. Improvement is not a separate track and never gets a
second backlog file - the `docs/feature-requests/improvement/` folder was migrated into FRs and
deleted on 2026-07-11 (see `MIGRATION-MAP.md`).

Authoring protocol: `../../AGENTS.md` (project overlay) over `.cyberos/cuo/`. Lifecycle and the
10-value status enum: `.cyberos/cuo/STATUS-REFERENCE.md`. The `ship-feature-requests` workflow
reads this file, picks the first eligible FR (`ready_to_implement` with every `depends_on` done),
and drives it to `done`. HITL is required: the agent halts at review acceptance and at final
acceptance for a recorded human verdict, and never sets `done` itself.

Last rebuilt: 2026-07-11, from the three audits in `docs/audits/2026-07-11/` plus the migrated
growth program. Live in production at https://cyberskill.world.

> **Implementing agent: read `README.md` in this folder first.** It is the five-minute
> brief on how the queue, the contract and the gates work here.

## §0 How to read this backlog

One row is one FR; one FR is one atomic, testable requirement. Rows are grouped by status, then
by module. `(improvement)` marks a hardening / audit-remediation FR; untagged rows are product.
`[human]` / `[mixed]` marks an FR an agent cannot finish alone - it needs an account, a credential,
a permission, or a commercial decision. Those live in the `BIZ` module and in `depends_on` of the
FRs they block.

Priority uses BCP-14: MUST (release blocker), SHOULD (release should-have), COULD (nice-to-have).

Modules: `DS` design system - `WEB` foundation + routing - `SCENE` 3D + scroll - `CHAR` Lumi -
`CTA` conversion + forms - `CMS` content + copy + i18n - `SEO` discoverability + GEO - `A11Y`
accessibility - `PERF` performance - `OPS` build/CI/deploy/observability - `BIZ` off-site work the
repo cannot do (accounts, permissions, credentials, rituals, commercial policy).

## §1 Totals

| Status | Count |
|---|---:|
| ready_to_implement | 86 |
| done | 66 |
| on_hold | 14 |
| closed | 2 |
| **total** | **168** |

| Module | FRs | ready_to_implement | done | on_hold | closed |
|---|---:|---:|---:|---:|---:|
| DS | 14 | 0 | 12 | 2 | 0 |
| WEB | 12 | 2 | 7 | 2 | 1 |
| SCENE | 10 | 1 | 7 | 2 | 0 |
| CHAR | 17 | 4 | 8 | 5 | 0 |
| CTA | 20 | 13 | 5 | 2 | 0 |
| CMS | 20 | 17 | 3 | 0 | 0 |
| SEO | 20 | 12 | 8 | 0 | 0 |
| A11Y | 14 | 7 | 6 | 0 | 1 |
| PERF | 13 | 8 | 5 | 0 | 0 |
| OPS | 13 | 7 | 5 | 1 | 0 |
| BIZ | 15 | 15 | 0 | 0 | 0 |

## §2 The queue

`ship-feature-requests` picks the first `ready_to_implement` FR with `owner: agent` whose
every `depends_on` is `done`. Run `npm run check:frs` to print this queue and to gate the
contract (ADR-001). Counts: **40 agent-eligible now**, 13 agent-blocked on a
dependency, 33 waiting on a human.

### §2.1 Agent-eligible now (no unmet dependency)


#### WEB

- [done] FR-WEB-011 - Serve the negotiated locale at the root without a visible redirect hop (improvement)
- [done] FR-WEB-012 - Real /team route with named people, replacing the on-page anchor (improvement)

#### SCENE

- [done] FR-SCENE-009 - Draw-call budget, GPU disposal, and LOD for the scene (improvement)

#### CHAR

- [done] FR-CHAR-026 - Conversational lead-capture sequence, value-first, with ICP qualification and a LEAD_CAPTURED state

#### CTA

- [done] FR-CTA-010 - Thank-you state with next steps, and a trust line under the form (improvement)
- [ready_to_implement] FR-CTA-011 - Auto-acknowledgement email to the lead, localized (improvement)
- [ready_to_implement] FR-CTA-012 - Zalo and WhatsApp one-tap contact chips, config-driven (improvement)
- [ready_to_review] FR-CTA-013 - Mark required fields in the markup, validate, and verify the honeypot (improvement)

#### CMS

- [ready_to_review] FR-CMS-007 - Bilingual insights/notes content collection
- [ready_to_review] FR-CMS-011 - Work-detail template that can carry proof: metrics band, client quote, screenshots (improvement)
- [ready_to_review] FR-CMS-012 - Testimonial component placed beside every major CTA (improvement)
- [ready_to_review] FR-CMS-013 - Client logo strip, with an honest interim line until logos are cleared (improvement)
- [ready_to_review] FR-CMS-015 - Promote How-we-build into the nav and surface the quality gates as proof (improvement)
- [ready_to_review] FR-CMS-017 - Deepen the work index and careers pages (improvement)
- [ready_to_review] FR-CMS-018 - Public changelog (/now) seeded from real shipped history (improvement)

#### SEO

- [ready_to_review] FR-SEO-010 - Restore word spacing in the machine-readable text of kinetic headings (improvement)
- [ready_to_review] FR-SEO-011 - Intent-carrying, locale-correct titles and descriptions on every indexable route (improvement)
- [ready_to_review] FR-SEO-012 - Complete the sitemap and stamp real lastModified dates (improvement)
- [ready_to_review] FR-SEO-013 - Replace non-descriptive link text ("Learn more") sitewide (improvement)
- [ready_to_review] FR-SEO-014 - Complete the OpenGraph and Twitter card fields (improvement)
- [ready_to_implement] FR-SEO-015 - Service schema per service page, and Review/AggregateRating once testimonials are verifiable (improvement)
- [ready_to_implement] FR-SEO-016 - Deepen the three service pages into ranking, converting pages (improvement)
- [ready_to_review] FR-SEO-018 - One canonical entity sentence, single-sourced and reused everywhere (improvement)
- [ready_to_implement] FR-SEO-019 - Enrich the Organization graph: sameAs, founder, LocalBusiness, and visible profile links (improvement)
- [ready_to_implement] FR-SEO-020 - Expand the FAQ to 15-20 answerable, citable Q&As (improvement)

#### A11Y

- [ready_to_review] FR-A11Y-010 - Honour prefers-reduced-motion in JavaScript: gate the WebGL scene and particle system (improvement)
- [ready_to_review] FR-A11Y-011 - Meet 44px tap targets and align the wordmark's accessible name with its visible text (improvement)
- [ready_to_review] FR-A11Y-012 - Contain the persistent CTA bar in a landmark and keep it clear of content on mobile (improvement)
- [ready_to_review] FR-A11Y-013 - Give the logo and every content image meaningful alt text (improvement)

#### PERF

- [ready_to_implement] FR-PERF-005 - Font subset, display, and preload strategy including Vietnamese glyphs (improvement)
- [done] FR-PERF-007 - Eliminate the mobile hero layout shift (CLS 0.431 -> below 0.1) (improvement)
- [done] FR-PERF-008 - Cut and defer first-load JavaScript (TBT 1,370 ms -> under 300 ms) (improvement)
- [ready_to_implement] FR-PERF-010 - Serve brand image assets with long immutable caching (improvement)
- [ready_to_implement] FR-PERF-012 - Pause off-screen and idle animation to protect INP and battery (improvement)
- [ready_to_review] FR-PERF-013 - Measure and gate real Core Web Vitals: mobile Lighthouse assertions plus field data (improvement)

#### OPS

- [ready_to_review] FR-OPS-004 - Env and secret management across production and preview, with separate keys (improvement)
- [ready_to_implement] FR-OPS-009 - Add a Content-Security-Policy, report-only first (improvement)
- [done] FR-OPS-010 - Alert when every lead sink fails, and prove the pipeline weekly with a synthetic lead (improvement) - depends: FR-OPS-006
- [ready_to_implement] FR-OPS-011 - One event taxonomy across both lead paths, with UTM source capture (improvement)
- [ready_to_implement] FR-OPS-013 - Decide and implement the consent stance before any non-cookieless tag ships (improvement)

### §2.2 Agent-blocked (waiting on another FR)


#### CHAR

- [ready_to_implement] FR-CHAR-027 - On LEAD_CAPTURED, write the lead to CRM and fire a Slack/email notification with the transcript - depends: FR-CHAR-026, FR-OPS-010
- [ready_to_implement] FR-CHAR-028 - Persist chat transcripts and lead records server-side, including partial conversations - depends: FR-OPS-005, FR-OPS-013

#### CTA

- [ready_to_implement] FR-CTA-006 - Map form leads to the CRM via a server-side webhook - depends: FR-OPS-010
- [ready_to_implement] FR-CTA-014 - Newsletter capture with double opt-in (improvement) - depends: FR-OPS-013
- [ready_to_implement] FR-CTA-020 - Careers talent-pool email capture (improvement) - depends: FR-CTA-014

#### CMS

- [ready_to_implement] FR-CMS-005 - Long-form bilingual services content for the detail pages - depends: FR-SEO-016
- [ready_to_implement] FR-CMS-010 - Insights post template enforces author, dates and a TLDR (improvement) - depends: FR-CMS-007

#### SEO

- [ready_to_implement] FR-SEO-006 - RSS/Atom feed for the insights collection - depends: FR-CMS-007
- [ready_to_implement] FR-SEO-017 - Publish llms.txt / llms-full.txt and take an explicit AI-crawler position (improvement) - depends: FR-SEO-018

#### A11Y

- [ready_to_implement] FR-A11Y-004 - Full keyboard operability, visible focus, and focus order - depends: FR-A11Y-011

#### PERF

- [ready_to_implement] FR-PERF-009 - Defer and consent-gate the analytics tags so they cost nothing on first paint (improvement) - depends: FR-OPS-013
- [ready_to_implement] FR-PERF-011 - Preload the LCP element and give background images correct responsive sizes (improvement) - depends: FR-PERF-005

#### OPS

- [ready_to_implement] FR-OPS-005 - Lead and transcript datastore behind /api/lead and /api/genie - depends: FR-OPS-004

### §2.3 Needs a human (owner human / mixed)

These never enter the agent queue. They hold accounts, credentials, permissions and
commercial decisions - most of them are in the `depends_on` of the FRs above.


#### CHAR

- [ready_to_implement] FR-CHAR-029 - Harden per-IP rate limiting, input validation, and prompt-injection defence on the proxy (improvement) [mixed] - depends: FR-OPS-004

#### CTA

- [ready_to_implement] FR-CTA-005 - Call-booking path for high-intent leads (link, not embed) [mixed] - depends: FR-BIZ-013, FR-CTA-010
- [ready_to_implement] FR-CTA-015 - Outcome-led CTA promise instead of an action label (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CTA-016 - Company profile one-pager PDF, EN and VN (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CTA-017 - Engagement models and price signals section (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CTA-018 - True capacity line near the contact heading (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CTA-019 - Teardown lead magnet funnel (improvement) [mixed] - depends: FR-CTA-014

#### CMS

- [ready_to_implement] FR-CMS-003 - Complete Vietnamese localization with native-speaker review [mixed]
- [ready_to_implement] FR-CMS-004 - Replace placeholder testimonials with cleared client quotes [mixed] - depends: FR-BIZ-006, FR-CMS-012
- [ready_to_implement] FR-CMS-006 - About, team, and culture content (recruiting + trust surface) [mixed] - depends: FR-BIZ-006
- [ready_to_implement] FR-CMS-009 - Replace placeholder case studies with cleared real outcomes [mixed] - depends: FR-BIZ-006, FR-CMS-011
- [ready_to_implement] FR-CMS-014 - Verify us" block: registration, DUNS, address, repositories (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CMS-016 - Publish a Terms of Service page (improvement) [mixed]
- [ready_to_implement] FR-CMS-019 - Partnership offer for agencies and studios abroad (improvement) [mixed] - depends: FR-BIZ-013
- [ready_to_implement] FR-CMS-020 - Hero subline that names the audience (improvement) [mixed] - depends: FR-BIZ-013

#### A11Y

- [ready_to_implement] FR-A11Y-008 - Manual VoiceOver and NVDA screen-reader pass [mixed] - depends: FR-A11Y-004
- [ready_to_implement] FR-A11Y-014 - On-device responsiveness and contrast verification pass (improvement) [mixed] - depends: FR-A11Y-011, FR-A11Y-012

#### OPS

- [ready_to_implement] FR-OPS-012 - Cookieless session replay (Microsoft Clarity), env-gated (improvement) [mixed] - depends: FR-OPS-013

#### BIZ

- [ready_to_implement] FR-BIZ-001 - Configure the lead sinks: Resend domain, API key, Slack webhook (improvement) [human]
- [ready_to_implement] FR-BIZ-002 - Deploy the CyberOS lead-intake endpoint and wire the webhook (improvement) [human] - depends: FR-BIZ-001
- [ready_to_implement] FR-BIZ-003 - Prove the lead pipeline end to end in production (improvement) [human] - depends: FR-BIZ-001
- [ready_to_implement] FR-BIZ-004 - Claim the Google Business Profile and reconcile the NAP everywhere (improvement) [human]
- [ready_to_implement] FR-BIZ-005 - Create the directory profiles and earn verified reviews (improvement) [mixed] - depends: FR-SEO-018, FR-BIZ-004
- [ready_to_implement] FR-BIZ-006 - Obtain the client permissions and proof assets: names, logos, metrics, quotes, photos (improvement) [mixed]
- [ready_to_implement] FR-BIZ-007 - Establish the social and messaging profiles the site can link to (improvement) [human]
- [ready_to_implement] FR-BIZ-008 - Verify Search Console and Bing, submit the sitemap, and run the monthly review (improvement) [human]
- [ready_to_implement] FR-BIZ-009 - Lead system of record, SLA ritual, and the weekly funnel review (improvement) [mixed] - depends: FR-BIZ-002, FR-OPS-011
- [ready_to_implement] FR-BIZ-010 - Standing programs: welcome sequence, founder LinkedIn, share workflow, quarterly client letter (improvement) [mixed] - depends: FR-CTA-014, FR-BIZ-007
- [ready_to_implement] FR-BIZ-011 - Earn third-party mentions: listicles, local press, and an awards submission (improvement) [mixed] - depends: FR-BIZ-005, FR-CMS-011
- [ready_to_implement] FR-BIZ-012 - Formal PDPL / Decree 356 review, including the Anthropic cross-border transfer (improvement) [human] - depends: FR-OPS-013
- [ready_to_implement] FR-BIZ-013 - Decide the commercial policy the site is allowed to publish (improvement) [human]
- [ready_to_implement] FR-BIZ-014 - Decide and start the certification path (ISO 27001 / SOC 2) (improvement) [human] - depends: FR-BIZ-005
- [ready_to_implement] FR-BIZ-015 - Monthly AI answer-engine citation check (improvement) [human] - depends: FR-BIZ-005

## §3 in flight

- (implementing / reviewing / testing FRs appear here)

## §4 on_hold

Deliberately parked. Not skipped forever - resurrected by an operator flip to `ready_to_implement`.

- [on_hold] FR-DS-005 - Confirm whether @cyberskill design-system packages are installable [mixed] - depends: FR-DS-001
- [on_hold] FR-DS-007 - Style-pack switching layered on the theme - depends: FR-DS-001, FR-DS-002
- [on_hold] FR-WEB-005 - ISR and on-demand revalidation for content pages - depends: FR-WEB-002
- [on_hold] FR-WEB-006 - Draft and preview mode for unpublished content - depends: FR-WEB-002, FR-CMS-001
- [on_hold] FR-SCENE-005 - Authored camera keyframe sequence indexed by section progress - depends: FR-SCENE-007
- [on_hold] FR-SCENE-008 - WebGPURenderer with automatic WebGL fallback - depends: FR-SCENE-001
- [on_hold] FR-CHAR-021 - Commission optimised golden-genie GLB (Draco+KTX2, Mixamo rig, ARKit visemes) [human] - depends: FR-CHAR-020
- [on_hold] FR-CHAR-022 - Integrate the commissioned GLB via gltfjsx, replacing LumiPlaceholder behind the CanvasMount gate - depends: FR-CHAR-021, FR-SCENE-001
- [on_hold] FR-CHAR-023 - Named animation-clip state machine cross-faded via AnimationMixer, bound to the genie store - depends: FR-CHAR-022, FR-CHAR-012
- [on_hold] FR-CHAR-024 - Viseme/blendshape lip-sync applied after the mixer each frame - depends: FR-CHAR-022
- [on_hold] FR-CHAR-025 - Retrieval grounding over company and portfolio facts for richer answers - depends: FR-CHAR-011
- [on_hold] FR-CTA-004 - Progressive profiling across visits and steps - depends: FR-CTA-001
- [on_hold] FR-CTA-008 - A/B testbed for first-person CTA copy
- [on_hold] FR-OPS-008 - Uptime and deploy-health monitoring with alerts - depends: FR-WEB-010

## §5 closed

- [closed] FR-WEB-008 - Per-service detail pages with static params and hreflang - depends: FR-WEB-002, FR-CMS-005 - superseded by FR-SEO-016 (service-page depth); the /services/[slug] routes already ship
- [closed] FR-A11Y-009 - Reconcile always-on motion with a user-facing motion control - superseded by FR-A11Y-010 (reduced-motion JS gate, which also binds the manual toggle)

## §6 done (archived)

Shipped, verified and live. The specs live in `_archive/<module>/` for the audit trail.


### DS

- [done] FR-DS-001 - Hand-port design-system doctrine tokens (Umber/Ochre, Liquid Glass, scales) to --cs-* custom properties
- [done] FR-DS-002 - Light/dark theme toggle with no-flash and persisted preference
- [done] FR-DS-003 - In-repo themed UI primitives (Button, Field, Select, Dialog, Card)
- [done] FR-DS-004 - Full Liquid Glass material set with safe fallbacks
- [done] FR-DS-006 - APCA contrast tooling for rendered translucent surfaces
- [done] FR-DS-008 - Type scale and a typeface with full Vietnamese diacritic coverage
- [done] FR-DS-009 - Motion tokens (easing and duration) consumed by all transitions
- [done] FR-DS-010 - Consistent in-repo SVG icon set with sizing tokens
- [done] FR-DS-011 - Premium motion-polish layer (aurora, kinetic hero, cursor, intro veil, marquee)
- [done] FR-DS-012 - Futuristic art-direction pass: dark default, gold HUD language, native VN copy
- [done] FR-DS-013 - Section signature motion: every home section gets its own beat
- [done] FR-DS-014 - Kinetic section type: per-word masked headings + ink-wipe leads, sitewide

### WEB

- [done] FR-WEB-001 - Next.js App Router shell with EN/VN [lang] routing and per-locale <html lang>
- [done] FR-WEB-002 - Server-rendered home sections (hero through contact), story-driven and crawlable
- [done] FR-WEB-003 - Indexable case-study detail pages with clickable cards
- [done] FR-WEB-004 - Accept-Language negotiation for the bare / entry
- [done] FR-WEB-007 - Per-route loading and error boundaries for graceful states
- [done] FR-WEB-009 - Responsive next/image pipeline that protects LCP
- [done] FR-WEB-010 - /api/health route for uptime checks

### SCENE

- [done] FR-SCENE-001 - Fixed full-viewport R3F canvas, lazy ssr:false, capability gate + static poster
- [done] FR-SCENE-002 - Canonical Lenis + GSAP ScrollTrigger RAF loop, reduced-motion safe
- [done] FR-SCENE-003 - Always-on motion and scroll-tied Lumi choreography
- [done] FR-SCENE-004 - Pinned sections whose content animates against scroll progress (ScrollTrigger pin + scrub)
- [done] FR-SCENE-006 - Custom GLSL shader for Lumi's golden glow, dissolve, and particle magic
- [done] FR-SCENE-007 - Map each section's normalized 0..1 progress to camera, model state, and lighting
- [done] FR-SCENE-010 - GLB preloader and Suspense boundary so the scene never blocks first paint

### CHAR

- [done] FR-CHAR-010 - Keyless serverless Claude proxy (/api/genie) with streaming and rate limiting
- [done] FR-CHAR-011 - Lumi persona system prompt grounded in CyberSkill facts
- [done] FR-CHAR-012 - Streaming chat widget + Zustand state machine + consent
- [done] FR-CHAR-020 - Procedural Lumi placeholder (gaze + chat-state animation) pending GLB
- [done] FR-CHAR-030 - Lumi as a living mascot: full-page flight, magic bursts, clickable chat entry
- [done] FR-CHAR-031 - Wish flow: deterministic in-chat lead capture, Lumi-first contact
- [done] FR-CHAR-032 - Black-hole digest: press-and-hold devours the page, release restores it
- [done] FR-CHAR-033 - Chat cloud: the genie panel becomes a thought bubble tethered to Lumi

### CTA

- [done] FR-CTA-001 - Lead-capture form (<=5 fields) with honeypot, consent, and server validation
- [done] FR-CTA-002 - Persistent, scene-independent conversion CTA
- [done] FR-CTA-003 - Trust band credibility strip
- [done] FR-CTA-007 - Real-time lead notification to Slack and email
- [done] FR-CTA-009 - Track form-start and abandonment events

### CMS

- [done] FR-CMS-001 - Bilingual content source-of-truth (EN + VN)
- [done] FR-CMS-002 - On-page Process and FAQ sections (FAQ mirrors the JSON-LD)
- [done] FR-CMS-008 - Privacy and legal page covering PDPL/GDPR and consent

### SEO

- [done] FR-SEO-001 - SEO/GEO: sitemap, robots, hreflang, Organization + FAQ JSON-LD, OpenGraph
- [done] FR-SEO-002 - Sitemap includes case-study URLs
- [done] FR-SEO-003 - BreadcrumbList JSON-LD on sub-pages
- [done] FR-SEO-004 - CreativeWork/Article JSON-LD on case studies and insights
- [done] FR-SEO-005 - hreflang and canonical completeness across all routes
- [done] FR-SEO-007 - GEO: structure content so AI answer engines can cite it
- [done] FR-SEO-008 - Per-page dynamic OpenGraph images
- [done] FR-SEO-009 - Structured per-page metadata templates from content

### A11Y

- [done] FR-A11Y-001 - Reduced-motion path, /lite storyboard DOM mirror, motion toggle, skip link
- [done] FR-A11Y-002 - Accessibility statement page documenting conformance and motion stance
- [done] FR-A11Y-003 - Automated axe-core accessibility checks in CI
- [done] FR-A11Y-005 - DOM-text mirror and noscript for canvas content
- [done] FR-A11Y-006 - ARIA live regions for streaming chat updates
- [done] FR-A11Y-007 - forced-colors and Windows high-contrast support

### PERF

- [done] FR-PERF-001 - Performance budget enforced in CI (LCP <= 2500 ms, byte ceilings)
- [done] FR-PERF-002 - Lighthouse CI on mobile emulation per PR, asserting CWV thresholds
- [done] FR-PERF-003 - Asset-size guard failing the build on GLB, texture, or JS regression
- [done] FR-PERF-004 - Bundle analysis and code-split audit to keep the 3D chunk off the critical path
- [done] FR-PERF-006 - Field Core Web Vitals monitoring via Vercel Speed Insights

### OPS

- [done] FR-OPS-001 - CI: static import check + typecheck + build + performance-budget gate
- [done] FR-OPS-002 - First-party cookieless analytics for funnel events
- [done] FR-OPS-003 - Vercel deploy config, runbook, and live production at cyberskill.world
- [done] FR-OPS-006 - Error and exception tracking for client and server
- [done] FR-OPS-007 - Wire Vercel Speed Insights with the legacy-peer-deps install note

## §7 The gate

`npm run check:frs` (scripts/check-frs.mjs, wired into CI) enforces the FR contract in
`.cyberos/cuo/templates/FR-TEMPLATE.md`: frontmatter enums, `depends_on` resolution, no
dependency on a closed FR, BACKLOG parity, and - for every `ready_to_implement` FR - the
five required sections plus clause -> AC -> named-test traceability (TRACE-001/002).
It does NOT run the CyberOS plugin's `audit_rubric@2.0`: that rubric audits a different FR
contract and fails ~12 rules on every FR here, including shipped ones. See ADR-001.

## §8 Where the work came from

- `docs/audits/2026-07-11/A-deep-audit-dual-benchmark.md` - deep audit, SEA + world-class benchmark, 5-phase roadmap.
- `docs/audits/2026-07-11/B-lighthouse-benchmark.html` - live mobile Lighthouse benchmark against Nimble, Saigon Technology, Designveloper (10 Jul 2026). Score 76/100; mobile perf 47 vs desktop 97; CLS 0.431.
- `docs/audits/2026-07-11/C-audit-and-remediation-plan.pdf` - live crawl + remediation plan (11 Jul 2026). Score 78/100.
- `docs/growth/landing-audit-2026-07-06.md` - the lead-generation audit the migrated growth program came from.
- Finding-to-FR traceability: `MIGRATION-MAP.md`. Every new FR carries a `traces_to:` frontmatter field.

## §9 The critical path

The three audits agree on the order, and it is not the order of the module list:

1. **Prove the lead pipeline exists** (FR-BIZ-001, FR-BIZ-003, FR-OPS-010). Every conversion FR below
   is worthless while a submitted lead lands in a Vercel log line.
2. **Fix the mobile score** (FR-PERF-007 CLS, FR-PERF-008 JS, FR-WEB-011 redirect). Audit B: the CLS fix
   alone is worth 20-25 performance points and puts the site at the front of its peer set.
3. **Get proof on the page** (FR-BIZ-006 permissions -> FR-CMS-011/012/013, FR-WEB-012). The #1 gap in
   all three audits; nothing else moves conversion as much.
4. **Close the cheap search and answer-engine gaps** (FR-SEO-010 heading spacing, FR-SEO-011 VN titles,
   FR-SEO-012 sitemap, FR-SEO-017 llms.txt, FR-SEO-019 sameAs, FR-BIZ-004/005 profiles and reviews).
5. **Then compound** (FR-CMS-007 insights, FR-SEO-016 service depth, FR-BIZ-010/011 programs).

