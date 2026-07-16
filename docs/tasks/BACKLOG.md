# CyberSkill landing page - task backlog

Source of truth for task state = each task's frontmatter `status`. This file indexes them.
ONE backlog for ALL work: net-new features (`class: product`) and hardening / audit-remediation
(`class: improvement`) live here together. Improvement is not a separate track and never gets a
second backlog file - the `docs/tasks/improvement/` folder was migrated into tasks and
deleted on 2026-07-11 (see `MIGRATION-MAP.md`).

Authoring protocol: `../../AGENTS.md` (project overlay) over `.cyberos/cuo/`. Lifecycle and the
10-value status enum: `.cyberos/cuo/STATUS-REFERENCE.md`. The `ship-tasks` workflow
reads this file, picks the first eligible task (`ready_to_implement` with every `depends_on` done),
and drives it to `done`. HITL is required: the agent halts at review acceptance and at final
acceptance for a recorded human verdict, and never sets `done` itself.

Last rebuilt: 2026-07-11, from the three audits in `docs/audits/2026-07-11/` plus the migrated
growth program. Live in production at https://cyberskill.world.

> **Implementing agent: read `README.md` in this folder first.** It is the five-minute
> brief on how the queue, the contract and the gates work here.

## §0.5 draft (not yet ready_to_implement)

CyberOS central-data wave (see `docs/architecture/cyberos-central-data-source.md`). Promote after audit.

- [draft] TASK-BIZ-016 - CyberOS central data platform for landing leads and content (improvement) [human]
- [draft] TASK-OPS-019 - Landing content read model from CyberOS (with git fallback) - depends: TASK-BIZ-016
- [draft] TASK-OPS-020 - Lead dual-write to CyberOS and historical migration (improvement) [mixed] - depends: TASK-BIZ-002, TASK-OPS-005
- [draft] TASK-CMS-021 - Notes/blog authoring via CyberOS (deprecates notes.ts write SSOT) [mixed] - depends: TASK-OPS-019, TASK-CMS-010

## §0 How to read this backlog

One row is one task; one task is one atomic, testable requirement. Rows are grouped by status, then
by module. `(improvement)` marks a hardening / audit-remediation task; untagged rows are product.
`[human]` / `[mixed]` marks an task an agent cannot finish alone - it needs an account, a credential,
a permission, or a commercial decision. Those live in the `BIZ` module and in `depends_on` of the
tasks they block.

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

| Module | tasks | ready_to_implement | done | on_hold | closed |
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

`ship-tasks` picks the first `ready_to_implement` task with `owner: agent` whose
every `depends_on` is `done`. Run `npm run check:tasks` to print this queue and to gate the
contract (ADR-001). Counts: **40 agent-eligible now**, 13 agent-blocked on a
dependency, 33 waiting on a human.

### §2.1 Agent-eligible now (no unmet dependency)


#### WEB

- [done] TASK-WEB-011 - Serve the negotiated locale at the root without a visible redirect hop (improvement)
- [done] TASK-WEB-012 - Real /team route with named people, replacing the on-page anchor (improvement)

#### SCENE

- [done] TASK-SCENE-009 - Draw-call budget, GPU disposal, and LOD for the scene (improvement)

#### CHAR

- [done] TASK-CHAR-026 - Conversational lead-capture sequence, value-first, with ICP qualification and a LEAD_CAPTURED state

#### CTA

- [done] TASK-CTA-010 - Thank-you state with next steps, and a trust line under the form (improvement)
- [done] TASK-CTA-011 - Auto-acknowledgement email to the lead, localized (improvement)
- [done] TASK-CTA-012 - Zalo and WhatsApp one-tap contact chips, config-driven (improvement)
- [done] TASK-CTA-013 - Mark required fields in the markup, validate, and verify the honeypot (improvement)

#### CMS

- [done] TASK-CMS-007 - Bilingual insights/notes content collection
- [done] TASK-CMS-011 - Work-detail template that can carry proof: metrics band, client quote, screenshots (improvement)
- [done] TASK-CMS-012 - Testimonial component placed beside every major CTA (improvement)
- [done] TASK-CMS-013 - Client logo strip, with an honest interim line until logos are cleared (improvement)
- [done] TASK-CMS-015 - Promote How-we-build into the nav and surface the quality gates as proof (improvement)
- [done] TASK-CMS-017 - Deepen the work index and careers pages (improvement)
- [done] TASK-CMS-018 - Public changelog (/now) seeded from real shipped history (improvement)

#### SEO

- [done] TASK-SEO-010 - Restore word spacing in the machine-readable text of kinetic headings (improvement)
- [done] TASK-SEO-011 - Intent-carrying, locale-correct titles and descriptions on every indexable route (improvement)
- [done] TASK-SEO-012 - Complete the sitemap and stamp real lastModified dates (improvement)
- [done] TASK-SEO-013 - Replace non-descriptive link text ("Learn more") sitewide (improvement)
- [done] TASK-SEO-014 - Complete the OpenGraph and Twitter card fields (improvement)
- [done] TASK-SEO-015 - Service schema per service page, and Review/AggregateRating once testimonials are verifiable (improvement)
- [done] TASK-SEO-016 - Deepen the three service pages into ranking, converting pages (improvement)
- [done] TASK-SEO-018 - One canonical entity sentence, single-sourced and reused everywhere (improvement)
- [done] TASK-SEO-019 - Enrich the Organization graph: sameAs, founder, LocalBusiness, and visible profile links (improvement)
- [done] TASK-SEO-020 - Expand the FAQ to 15-20 answerable, citable Q&As (improvement)

#### A11Y

- [done] TASK-A11Y-010 - Honour prefers-reduced-motion in JavaScript: gate the WebGL scene and particle system (improvement)
- [done] TASK-A11Y-011 - Meet 44px tap targets and align the wordmark's accessible name with its visible text (improvement)
- [done] TASK-A11Y-012 - Contain the persistent CTA bar in a landmark and keep it clear of content on mobile (improvement)
- [done] TASK-A11Y-013 - Give the logo and every content image meaningful alt text (improvement)

#### PERF

- [done] TASK-PERF-005 - Font subset, display, and preload strategy including Vietnamese glyphs (improvement)
- [done] TASK-PERF-007 - Eliminate the mobile hero layout shift (CLS 0.431 -> below 0.1) (improvement)
- [done] TASK-PERF-008 - Cut and defer first-load JavaScript (TBT 1,370 ms -> under 300 ms) (improvement)
- [done] TASK-PERF-010 - Serve brand image assets with long immutable caching (improvement)
- [done] TASK-PERF-012 - Pause off-screen and idle animation to protect INP and battery (improvement)
- [done] TASK-PERF-013 - Measure and gate real Core Web Vitals: mobile Lighthouse assertions plus field data (improvement)

#### OPS

- [done] TASK-OPS-004 - Env and secret management across production and preview, with separate keys (improvement)
- [done] TASK-OPS-009 - Add a Content-Security-Policy, report-only first (improvement)
- [done] TASK-OPS-010 - Alert when every lead sink fails, and prove the pipeline weekly with a synthetic lead (improvement) - depends: TASK-OPS-006
- [done] TASK-OPS-011 - One event taxonomy across both lead paths, with UTM source capture (improvement)
- [done] TASK-OPS-013 - Decide and implement the consent stance before any non-cookieless tag ships (improvement)

### §2.2 Agent-blocked (waiting on another task)


#### CHAR

- [done] TASK-CHAR-027 - On LEAD_CAPTURED, write the lead to CRM and fire a Slack/email notification with the transcript - depends: TASK-CHAR-026, TASK-OPS-010
- [done] TASK-CHAR-028 - Persist chat transcripts and lead records server-side, including partial conversations - depends: TASK-OPS-005, TASK-OPS-013

#### CTA

- [done] TASK-CTA-006 - Map form leads to the CRM via a server-side webhook - depends: TASK-OPS-010
- [done] TASK-CTA-014 - Newsletter capture with double opt-in (improvement) - depends: TASK-OPS-013
- [done] TASK-CTA-020 - Careers talent-pool email capture (improvement) - depends: TASK-CTA-014

#### CMS

- [done] TASK-CMS-005 - Long-form bilingual services content for the detail pages - depends: TASK-SEO-016
- [done] TASK-CMS-010 - Insights post template enforces author, dates and a TLDR (improvement) - depends: TASK-CMS-007

#### SEO

- [done] TASK-SEO-006 - RSS/Atom feed for the insights collection - depends: TASK-CMS-007
- [done] TASK-SEO-017 - Publish llms.txt / llms-full.txt and take an explicit AI-crawler position (improvement) - depends: TASK-SEO-018

#### A11Y

- [done] TASK-A11Y-004 - Full keyboard operability, visible focus, and focus order - depends: TASK-A11Y-011

#### PERF

- [done] TASK-PERF-009 - Defer and consent-gate the analytics tags so they cost nothing on first paint (improvement) - depends: TASK-OPS-013
- [done] TASK-PERF-011 - Preload the LCP element and give background images correct responsive sizes (improvement) - depends: TASK-PERF-005

#### OPS

- [done] TASK-OPS-005 - Lead and transcript datastore behind /api/lead and /api/genie - depends: TASK-OPS-004

### §2.3 Needs a human (owner human / mixed)

These never enter the agent queue. They hold accounts, credentials, permissions and
commercial decisions - most of them are in the `depends_on` of the tasks above.


#### CHAR

#### CTA


#### CMS

- [ready_to_implement] TASK-CMS-004 - Replace placeholder testimonials with cleared client quotes [mixed] - depends: TASK-BIZ-006, TASK-CMS-012, TASK-OPS-019
- [ready_to_implement] TASK-CMS-009 - Replace placeholder case studies with cleared real outcomes [mixed] - depends: TASK-BIZ-006, TASK-CMS-011, TASK-OPS-019

#### A11Y

- [ready_to_implement] TASK-A11Y-008 - Manual VoiceOver and NVDA screen-reader pass [mixed] - depends: TASK-A11Y-004
- [ready_to_implement] TASK-A11Y-014 - On-device responsiveness and contrast verification pass (improvement) [mixed] - depends: TASK-A11Y-011, TASK-A11Y-012

#### OPS

#### BIZ

- [ready_to_implement] TASK-BIZ-002 - Deploy the CyberOS lead-intake endpoint and wire the webhook (improvement) [human] - depends: TASK-BIZ-001, TASK-BIZ-016
- [ready_to_implement] TASK-BIZ-003 - Prove the lead pipeline end to end in production (improvement) [human] - depends: TASK-BIZ-001
- [ready_to_implement] TASK-BIZ-004 - Claim the Google Business Profile and reconcile the NAP everywhere (improvement) [human]
- [ready_to_implement] TASK-BIZ-005 - Create the directory profiles and earn verified reviews (improvement) [mixed] - depends: TASK-SEO-018, TASK-BIZ-004
- [ready_to_implement] TASK-BIZ-007 - Establish the social and messaging profiles the site can link to (improvement) [human]
- [ready_to_implement] TASK-BIZ-008 - Verify Search Console and Bing, submit the sitemap, and run the monthly review (improvement) [human]
- [ready_to_implement] TASK-BIZ-009 - Lead system of record, SLA ritual, and the weekly funnel review (improvement) [mixed] - depends: TASK-BIZ-002, TASK-OPS-011, TASK-OPS-020
- [ready_to_implement] TASK-BIZ-010 - Standing programs: welcome sequence, founder LinkedIn, share workflow, quarterly client letter (improvement) [mixed] - depends: TASK-CTA-014, TASK-BIZ-007
- [ready_to_implement] TASK-BIZ-011 - Earn third-party mentions: listicles, local press, and an awards submission (improvement) [mixed] - depends: TASK-BIZ-005, TASK-CMS-011
- [ready_to_implement] TASK-BIZ-012 - Formal PDPL / Decree 356 review, including the Anthropic cross-border transfer (improvement) [human] - depends: TASK-OPS-013, TASK-BIZ-016

- [ready_to_implement] TASK-BIZ-014 - Decide and start the certification path (ISO 27001 / SOC 2) (improvement) [human] - depends: TASK-BIZ-005
- [ready_to_implement] TASK-BIZ-015 - Monthly AI answer-engine citation check (improvement) [human] - depends: TASK-BIZ-005

## §3 in flight

- (implementing / reviewing / testing tasks appear here)


## §4.5 recently done (this wave)

- [done] TASK-BIZ-001 - Configure the lead sinks: Resend domain, API key, Slack webhook (improvement)
- [done] TASK-BIZ-006 - Obtain the client permissions and proof assets: names, logos, metrics, quotes, photos (improvement)
- [done] TASK-CMS-006 - About, team, and culture content (recruiting + trust surface)
- [done] TASK-CTA-016 - Company profile one-pager PDF, EN and VN (improvement)
- [done] TASK-CTA-005 - Call-booking path for high-intent leads (link, not embed)
- [done] TASK-CTA-015 - Outcome-led CTA promise instead of an action label (improvement)
- [done] TASK-CTA-017 - Engagement models and price signals section (improvement)
- [done] TASK-CTA-018 - True capacity line near the contact heading (improvement)
- [done] TASK-CMS-014 - Verify us block: registration, DUNS, address, repositories (improvement)
- [done] TASK-CMS-019 - Partnership offer for agencies and studios abroad (improvement)
- [done] TASK-CMS-020 - Hero subline that names the audience (improvement)
- [done] TASK-BIZ-013 - Decide the commercial policy the site is allowed to publish (improvement)

## §4 on_hold

Deliberately parked. Not skipped forever - resurrected by an operator flip to `ready_to_implement`.

- [on_hold] TASK-DS-005 - Confirm whether @cyberskill design-system packages are installable [mixed] - depends: TASK-DS-001
- [on_hold] TASK-DS-007 - Style-pack switching layered on the theme - depends: TASK-DS-001, TASK-DS-002
- [on_hold] TASK-WEB-005 - ISR and on-demand revalidation for content pages - depends: TASK-WEB-002
- [on_hold] TASK-WEB-006 - Draft and preview mode for unpublished content - depends: TASK-WEB-002, TASK-CMS-001
- [on_hold] TASK-SCENE-005 - Authored camera keyframe sequence indexed by section progress - depends: TASK-SCENE-007
- [on_hold] TASK-SCENE-008 - WebGPURenderer with automatic WebGL fallback - depends: TASK-SCENE-001
- [on_hold] TASK-CHAR-021 - Commission optimised golden-genie GLB (Draco+KTX2, Mixamo rig, ARKit visemes) [human] - depends: TASK-CHAR-020
- [on_hold] TASK-CHAR-022 - Integrate the commissioned GLB via gltfjsx, replacing LumiPlaceholder behind the CanvasMount gate - depends: TASK-CHAR-021, TASK-SCENE-001
- [on_hold] TASK-CHAR-023 - Named animation-clip state machine cross-faded via AnimationMixer, bound to the genie store - depends: TASK-CHAR-022, TASK-CHAR-012
- [on_hold] TASK-CHAR-024 - Viseme/blendshape lip-sync applied after the mixer each frame - depends: TASK-CHAR-022
- [on_hold] TASK-CHAR-025 - Retrieval grounding over company and portfolio facts for richer answers - depends: TASK-CHAR-011
- [on_hold] TASK-CTA-004 - Progressive profiling across visits and steps - depends: TASK-CTA-001
- [on_hold] TASK-CTA-008 - A/B testbed for first-person CTA copy
- [on_hold] TASK-OPS-008 - Uptime and deploy-health monitoring with alerts - depends: TASK-WEB-010

## §5 closed

- [closed] TASK-WEB-008 - Per-service detail pages with static params and hreflang - depends: TASK-WEB-002, TASK-CMS-005 - superseded by TASK-SEO-016 (service-page depth); the /services/[slug] routes already ship
- [closed] TASK-A11Y-009 - Reconcile always-on motion with a user-facing motion control - superseded by TASK-A11Y-010 (reduced-motion JS gate, which also binds the manual toggle)

## §6 done (archived)

Shipped, verified and live. The specs live in `_archive/<module>/` for the audit trail.


### DS

- [done] TASK-DS-001 - Hand-port design-system doctrine tokens (Umber/Ochre, Liquid Glass, scales) to --cs-* custom properties
- [done] TASK-DS-002 - Light/dark theme toggle with no-flash and persisted preference
- [done] TASK-DS-003 - In-repo themed UI primitives (Button, Field, Select, Dialog, Card)
- [done] TASK-DS-004 - Full Liquid Glass material set with safe fallbacks
- [done] TASK-DS-006 - APCA contrast tooling for rendered translucent surfaces
- [done] TASK-DS-008 - Type scale and a typeface with full Vietnamese diacritic coverage
- [done] TASK-DS-009 - Motion tokens (easing and duration) consumed by all transitions
- [done] TASK-DS-010 - Consistent in-repo SVG icon set with sizing tokens
- [done] TASK-DS-011 - Premium motion-polish layer (aurora, kinetic hero, cursor, intro veil, marquee)
- [done] TASK-DS-012 - Futuristic art-direction pass: dark default, gold HUD language, native VN copy
- [done] TASK-DS-013 - Section signature motion: every home section gets its own beat
- [done] TASK-DS-014 - Kinetic section type: per-word masked headings + ink-wipe leads, sitewide

### WEB

- [done] TASK-WEB-001 - Next.js App Router shell with EN/VN [lang] routing and per-locale <html lang>
- [done] TASK-WEB-002 - Server-rendered home sections (hero through contact), story-driven and crawlable
- [done] TASK-WEB-003 - Indexable case-study detail pages with clickable cards
- [done] TASK-WEB-004 - Accept-Language negotiation for the bare / entry
- [done] TASK-WEB-007 - Per-route loading and error boundaries for graceful states
- [done] TASK-WEB-009 - Responsive next/image pipeline that protects LCP
- [done] TASK-WEB-010 - /api/health route for uptime checks

### SCENE

- [done] TASK-SCENE-001 - Fixed full-viewport R3F canvas, lazy ssr:false, capability gate + static poster
- [done] TASK-SCENE-002 - Canonical Lenis + GSAP ScrollTrigger RAF loop, reduced-motion safe
- [done] TASK-SCENE-003 - Always-on motion and scroll-tied Lumi choreography
- [done] TASK-SCENE-004 - Pinned sections whose content animates against scroll progress (ScrollTrigger pin + scrub)
- [done] TASK-SCENE-006 - Custom GLSL shader for Lumi's golden glow, dissolve, and particle magic
- [done] TASK-SCENE-007 - Map each section's normalized 0..1 progress to camera, model state, and lighting
- [done] TASK-SCENE-010 - GLB preloader and Suspense boundary so the scene never blocks first paint

### CHAR

- [done] TASK-CHAR-010 - Keyless serverless Claude proxy (/api/genie) with streaming and rate limiting
- [done] TASK-CHAR-011 - Lumi persona system prompt grounded in CyberSkill facts
- [done] TASK-CHAR-012 - Streaming chat widget + Zustand state machine + consent
- [done] TASK-CHAR-020 - Procedural Lumi placeholder (gaze + chat-state animation) pending GLB
- [done] TASK-CHAR-030 - Lumi as a living mascot: full-page flight, magic bursts, clickable chat entry
- [done] TASK-CHAR-031 - Wish flow: deterministic in-chat lead capture, Lumi-first contact
- [done] TASK-CHAR-032 - Black-hole digest: press-and-hold devours the page, release restores it
- [done] TASK-CHAR-033 - Chat cloud: the genie panel becomes a thought bubble tethered to Lumi
- [done] TASK-CHAR-029 - Harden per-IP rate limiting, input validation, and prompt-injection defence on the proxy (improvement) [mixed]

### CTA

- [done] TASK-CTA-001 - Lead-capture form (<=5 fields) with honeypot, consent, and server validation
- [done] TASK-CTA-002 - Persistent, scene-independent conversion CTA
- [done] TASK-CTA-003 - Trust band credibility strip
- [done] TASK-CTA-007 - Real-time lead notification to Slack and email
- [done] TASK-CTA-009 - Track form-start and abandonment events
- [done] TASK-CTA-019 - Teardown lead magnet funnel (improvement) [mixed] - depends: TASK-CTA-014

### CMS

- [done] TASK-CMS-001 - Bilingual content source-of-truth (EN + VN)
- [done] TASK-CMS-002 - On-page Process and FAQ sections (FAQ mirrors the JSON-LD)
- [done] TASK-CMS-008 - Privacy and legal page covering PDPL/GDPR and consent
- [done] TASK-CMS-003 - Complete Vietnamese localization with native-speaker review [mixed]
- [done] TASK-CMS-016 - Publish a Terms of Service page (improvement)

### SEO

- [done] TASK-SEO-001 - SEO/GEO: sitemap, robots, hreflang, Organization + FAQ JSON-LD, OpenGraph
- [done] TASK-SEO-002 - Sitemap includes case-study URLs
- [done] TASK-SEO-003 - BreadcrumbList JSON-LD on sub-pages
- [done] TASK-SEO-004 - CreativeWork/Article JSON-LD on case studies and insights
- [done] TASK-SEO-005 - hreflang and canonical completeness across all routes
- [done] TASK-SEO-007 - GEO: structure content so AI answer engines can cite it
- [done] TASK-SEO-008 - Per-page dynamic OpenGraph images
- [done] TASK-SEO-009 - Structured per-page metadata templates from content

### A11Y

- [done] TASK-A11Y-001 - Reduced-motion path, /lite storyboard DOM mirror, motion toggle, skip link
- [done] TASK-A11Y-002 - Accessibility statement page documenting conformance and motion stance
- [done] TASK-A11Y-003 - Automated axe-core accessibility checks in CI
- [done] TASK-A11Y-005 - DOM-text mirror and noscript for canvas content
- [done] TASK-A11Y-006 - ARIA live regions for streaming chat updates
- [done] TASK-A11Y-007 - forced-colors and Windows high-contrast support

### PERF

- [done] TASK-PERF-001 - Performance budget enforced in CI (LCP <= 2500 ms, byte ceilings)
- [done] TASK-PERF-002 - Lighthouse CI on mobile emulation per PR, asserting CWV thresholds
- [done] TASK-PERF-003 - Asset-size guard failing the build on GLB, texture, or JS regression
- [done] TASK-PERF-004 - Bundle analysis and code-split audit to keep the 3D chunk off the critical path
- [done] TASK-PERF-006 - Field Core Web Vitals monitoring via Vercel Speed Insights

### OPS

- [done] TASK-OPS-001 - CI: static import check + typecheck + build + performance-budget gate
- [done] TASK-OPS-002 - First-party cookieless analytics for funnel events
- [done] TASK-OPS-003 - Vercel deploy config, runbook, and live production at cyberskill.world
- [done] TASK-OPS-006 - Error and exception tracking for client and server
- [done] TASK-OPS-007 - Wire Vercel Speed Insights with the legacy-peer-deps install note
- [done] TASK-OPS-014 - Integrate Prisma PostgreSQL client with connection pooling and secure credentials (improvement)
- [done] TASK-OPS-015 - Implement strict Content-Security-Policy headers in production and report-only in preview (improvement)
- [done] TASK-OPS-016 - Optimize SVG vector assets in build/CI and enforce file-size budgets (improvement)
- [done] TASK-OPS-017 - Expose static CDN Cache-Control headers on sitemaps, feeds, and LLM text routes (improvement)
- [done] TASK-OPS-018 - Secure prune cron API route against spoofing via edge routing and signature validation (improvement)
- [done] TASK-OPS-012 - Cookieless session replay (Microsoft Clarity), env-gated (improvement) [mixed]

## §7 The gate

`npm run check:tasks` (scripts/check-tasks.mjs, wired into CI) enforces the task contract in
`.cyberos/cuo/templates/TASK-TEMPLATE.md`: frontmatter enums, `depends_on` resolution, no
dependency on a closed task, BACKLOG parity, and - for every `ready_to_implement` task - the
five required sections plus clause -> AC -> named-test traceability (TRACE-001/002).
It does NOT run the CyberOS plugin's `audit_rubric@2.0`: that rubric audits a different task
contract and fails ~12 rules on every task here, including shipped ones. See ADR-001.

## §8 Where the work came from

- `docs/audits/2026-07-11/A-deep-audit-dual-benchmark.md` - deep audit, SEA + world-class benchmark, 5-phase roadmap.
- `docs/audits/2026-07-11/B-lighthouse-benchmark.html` - live mobile Lighthouse benchmark against Nimble, Saigon Technology, Designveloper (10 Jul 2026). Score 76/100; mobile perf 47 vs desktop 97; CLS 0.431.
- `docs/audits/2026-07-11/C-audit-and-remediation-plan.pdf` - live crawl + remediation plan (11 Jul 2026). Score 78/100.
- `docs/growth/landing-audit-2026-07-06.md` - the lead-generation audit the migrated growth program came from.
- Finding-to-TASK traceability: `MIGRATION-MAP.md`. Every new task carries a `traces_to:` frontmatter field.

## §9 The critical path

The three audits agree on the order, and it is not the order of the module list:

1. **Prove the lead pipeline exists** (TASK-BIZ-001, TASK-BIZ-003, TASK-OPS-010). Every conversion task below
   is worthless while a submitted lead lands in a Vercel log line.
2. **Fix the mobile score** (TASK-PERF-007 CLS, TASK-PERF-008 JS, TASK-WEB-011 redirect). Audit B: the CLS fix
   alone is worth 20-25 performance points and puts the site at the front of its peer set.
3. **Get proof on the page** (TASK-BIZ-006 permissions -> TASK-CMS-011/012/013, TASK-WEB-012). The #1 gap in
   all three audits; nothing else moves conversion as much.
4. **Close the cheap search and answer-engine gaps** (TASK-SEO-010 heading spacing, TASK-SEO-011 VN titles,
   TASK-SEO-012 sitemap, TASK-SEO-017 llms.txt, TASK-SEO-019 sameAs, TASK-BIZ-004/005 profiles and reviews).
5. **Then compound** (TASK-CMS-007 insights, TASK-SEO-016 service depth, TASK-BIZ-010/011 programs).

