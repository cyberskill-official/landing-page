# CyberSkill Landing Page - Feature Request Backlog

Owner: Stephen Cheng (Founder / Creative Director). Source of truth: the
markdown files in this folder. Authoring protocol: `../../AGENTS.md` (CyberOS
overlay) over the CyberOS Layer-1 Memory Protocol. Input spec: `../Research
Foundations for the CyberSkill Interactive Storytelling Landing Page (PRD + SRS
Basis).md`.

This is the full plan: every planned FR is enumerated here, not only the ones
already built. Build session: `auto/landing-page-cyberos`, opened 2026-06-22.
Status: LIVE in production at https://cyberskill.world.

## §0 How to read this backlog

One row is one FR; one FR is one atomic, testable requirement, organised by
module, with a phase tag. Priority uses BCP-14 keywords: MUST (release blocker),
SHOULD (release should-have), COULD (nice-to-have), MAY (post-launch).

Status values used here:
- `shipped` - implemented, verified, and live.
- `hold` - blocked on an external input (asset, key, or decision).
- `planned` - specified (the FR file exists) but not yet built.

Phases (from the research-doc staged plan): `P0` design-system + discovery ·
`P1` HTML-first conversion core · `P2` Lumi chat · `P3` 3D foundation + scene 0 ·
`P4` scene build-out + content + enhancement · `P5` performance + a11y + QA +
localization · `P6` launch + lead-ops + iteration.

Modules: `DS · WEB · SCENE · CHAR · CTA · CMS · SEO · A11Y · PERF · OPS`.

## §1 Totals

| Status | Count |
|---|---:|
| shipped | 60 |
| hold | 1 |
| planned | 34 |
| **total** | **95** |

| Module | FRs | shipped |
|---|---:|---:|
| DS (design system) | 12 | 10 |
| WEB (foundation) | 10 | 7 |
| SCENE (3D + scroll) | 10 | 7 |
| CHAR (Lumi) | 13 | 4 |
| CTA (conversion) | 9 | 5 |
| CMS (content + i18n) | 9 | 3 |
| SEO (discoverability) | 9 | 8 |
| A11Y (accessibility) | 9 | 6 |
| PERF (performance) | 6 | 5 |
| OPS (build/deploy/ops) | 8 | 5 |

The 60 shipped + 1 hold are the slices delivered so far; the 34 `planned` rows
are the deeper scope from the research doc, now specified so the backlog is
complete and build-ready. (Totals table re-baselined 2026-07-02 against the FR
files' status fields; earlier runs had updated this prose but not the table.)

## §2 Feature requests

### DS - design system
- [FR-DS-001](ds/FR-DS-001-token-port.md) - Hand-port doctrine tokens (Umber/Ochre, Liquid Glass, scales) to `--cs-*`. P0. MUST. shipped.
- [FR-DS-002](ds/FR-DS-002-theme-toggle.md) - Light/dark theme toggle, no-flash, persisted. P4. SHOULD. shipped.
- [FR-DS-003](ds/FR-DS-003-component-primitives.md) - In-repo component primitives (Button, Field, Select, Dialog, Card) themed to the doctrine. P1. MUST. shipped.
- [FR-DS-004](ds/FR-DS-004-liquid-glass-materials.md) - Full Liquid Glass material set (whisper/light/standard/heavy/solid) with all fallbacks. P1. SHOULD. shipped.
- [FR-DS-005](ds/FR-DS-005-confirm-token-package.md) - Resolve whether `@cyberskill/tokens|react` is privately consumable; consume or keep hand-port. P0. SHOULD. planned.
- [FR-DS-006](ds/FR-DS-006-apca-contrast-tooling.md) - APCA Lc verification tooling (>=75 body, >=90 interactive) on rendered glass. P5. SHOULD. shipped.
- [FR-DS-007](ds/FR-DS-007-style-packs.md) - Style-pack switching via `data-cs-style`. P5. COULD. planned.
- [FR-DS-008](ds/FR-DS-008-typography-vietnamese.md) - Typography scale + a Vietnamese-complete typeface (Space Grotesk via next/font, build-verified vietnamese subset). P1. SHOULD. shipped.
- [FR-DS-009](ds/FR-DS-009-motion-tokens.md) - Motion/easing/duration tokens consumed by all animation. P1. COULD. shipped.
- [FR-DS-010](ds/FR-DS-010-icon-set.md) - Consistent in-repo icon set (SVG). P4. COULD. shipped.
- [FR-DS-011](ds/FR-DS-011-motion-polish.md) - Premium motion-polish layer: aurora, kinetic masked hero + shimmer, custom cursor/magnetic/tilt, once-per-session intro veil, keyword marquee, scroll progress, masked reveals, link/button micro-interactions. P4. COULD. shipped.
- [FR-DS-012](ds/FR-DS-012-futuristic-art-direction.md) - Futuristic art direction: dark default, gold HUD language (blueprint grid, mono meta, ghost indices, orbit borders, gilded final slogan word), native-quality VN copy pass. P4. COULD. shipped.

### WEB - foundation
- [FR-WEB-001](web/FR-WEB-001-app-shell-i18n.md) - App Router shell, EN/VN `[lang]` routing, per-locale `<html lang>`. P1. MUST. shipped.
- [FR-WEB-002](web/FR-WEB-002-ssr-sections.md) - SSR home sections (hero -> contact), story-driven, crawlable. P1. MUST. shipped.
- [FR-WEB-003](web/FR-WEB-003-case-study-pages.md) - Indexable `/[lang]/work/[slug]` case studies + clickable cards. P4. SHOULD. shipped.
- [FR-WEB-004](web/FR-WEB-004-locale-negotiation.md) - Accept-Language negotiation for the bare `/` entry. P1. SHOULD. shipped.
- [FR-WEB-005](web/FR-WEB-005-isr-revalidation.md) - ISR / on-demand revalidation for content pages. P3. COULD. planned.
- [FR-WEB-006](web/FR-WEB-006-draft-preview.md) - Draft/preview mode for unpublished content. P5. COULD. planned.
- [FR-WEB-007](web/FR-WEB-007-route-states.md) - Per-route loading and error states (Suspense + error boundaries). P3. SHOULD. shipped.
- [FR-WEB-008](web/FR-WEB-008-services-detail-pages.md) - Per-service detail pages (`/[lang]/services/[slug]`). P4. SHOULD. planned.
- [FR-WEB-009](web/FR-WEB-009-image-pipeline.md) - next/image pipeline with responsive sizes + priority hints. P5. SHOULD. shipped.
- [FR-WEB-010](web/FR-WEB-010-health-route.md) - Health/status route for uptime checks. P5. COULD. shipped.

### SCENE - 3D + scroll storytelling
- [FR-SCENE-001](scene/FR-SCENE-001-canvas-scaffold.md) - Fixed R3F canvas, lazy ssr:false, capability gate. P3. MUST. shipped.
- [FR-SCENE-002](scene/FR-SCENE-002-scroll-loop.md) - Lenis + GSAP ticker RAF loop + ScrollTrigger. P3. SHOULD. shipped.
- [FR-SCENE-003](scene/FR-SCENE-003-always-motion-scrollytelling.md) - Always-on motion + scroll-tied Lumi choreography. P4. SHOULD. shipped.
- [FR-SCENE-004](scene/FR-SCENE-004-pinned-sections.md) - Pinned/sticky section choreography (scrub against progress). P4. SHOULD. shipped.
- [FR-SCENE-005](scene/FR-SCENE-005-camera-sequence.md) - Authored camera keyframe sequence (Theatre.js or clip), one shot per scene. P4. COULD. planned.
- [FR-SCENE-006](scene/FR-SCENE-006-glow-shader.md) - Custom GLSL golden-glow / dissolve shader for Lumi. P4. COULD. shipped.
- [FR-SCENE-007](scene/FR-SCENE-007-scene-progress-map.md) - Per-scene normalized progress mapped to camera/model/lighting. P4. SHOULD. shipped.
- [FR-SCENE-008](scene/FR-SCENE-008-webgpu-fallback.md) - WebGPURenderer with WebGL fallback. P5. COULD. planned.
- [FR-SCENE-009](scene/FR-SCENE-009-lod-drawcall-budget.md) - LOD + <100 draw-call/frame budget + GPU disposal. P5. SHOULD. planned.
- [FR-SCENE-010](scene/FR-SCENE-010-scene-preloader.md) - GLB preloader + Suspense boundary so the scene never blocks first paint. P3. SHOULD. shipped 2026-06-24.

### CHAR - Lumi (3D character + chat)
- [FR-CHAR-010](char/FR-CHAR-010-genie-proxy.md) - Keyless serverless proxy `/api/genie`, streaming SSE, rate limit. P2. MUST. shipped.
- [FR-CHAR-011](char/FR-CHAR-011-persona.md) - Lumi persona system prompt (voice, grounding, guardrails), cached. P2. MUST. shipped.
- [FR-CHAR-012](char/FR-CHAR-012-chat-widget.md) - Streaming chat widget + Zustand state machine + consent. P2. MUST. shipped.
- [FR-CHAR-020](char/FR-CHAR-020-lumi-placeholder.md) - Procedural Lumi placeholder (gaze + chat-state animation). P3. SHOULD. shipped.
- [FR-CHAR-021](char/FR-CHAR-021-commission-glb.md) - Commission optimised golden-genie GLB (Draco+KTX2, rig, visemes). P2. MUST. **hold** (needs artist).
- [FR-CHAR-022](char/FR-CHAR-022-gltf-integration.md) - Integrate the commissioned GLB (gltfjsx) replacing the placeholder. P2. MUST. planned.
- [FR-CHAR-023](char/FR-CHAR-023-animation-clips.md) - Named clip state machine (idle/greeting/thinking/speaking/point) with cross-fade. P4. SHOULD. planned.
- [FR-CHAR-024](char/FR-CHAR-024-lipsync-visemes.md) - Viseme/blendshape lip-sync driven from TTS/amplitude. P4. COULD. planned.
- [FR-CHAR-025](char/FR-CHAR-025-knowledge-grounding.md) - Retrieval grounding (RAG) over company + portfolio facts. P5. COULD. planned.
- [FR-CHAR-026](char/FR-CHAR-026-conversational-lead-capture.md) - Conversational lead-capture sequence + ICP qualification. P2. SHOULD. planned.
- [FR-CHAR-027](char/FR-CHAR-027-crm-slack-handoff.md) - On LEAD_CAPTURED, write CRM + fire Slack/email handoff. P6. SHOULD. planned.
- [FR-CHAR-028](char/FR-CHAR-028-transcript-logging.md) - Persist transcripts + lead records (server-side DB). P6. SHOULD. planned.
- [FR-CHAR-029](char/FR-CHAR-029-abuse-hardening.md) - Harden rate limiting, input validation, and prompt-injection defence. P6. SHOULD. planned.

### CTA - conversion
- [FR-CTA-001](cta/FR-CTA-001-lead-form.md) - <=5-field lead form + honeypot + consent + `/api/lead` fanout. P1. MUST. shipped.
- [FR-CTA-002](cta/FR-CTA-002-persistent-cta.md) - Persistent low-friction CTA, scene-independent. P1. SHOULD. shipped.
- [FR-CTA-003](cta/FR-CTA-003-trust-band.md) - Trust band credibility strip. P4. COULD. shipped.
- [FR-CTA-004](cta/FR-CTA-004-progressive-profiling.md) - Progressive profiling beyond the minimum fields. P6. COULD. planned.
- [FR-CTA-005](cta/FR-CTA-005-booking-embed.md) - Calendar booking embed for high-intent leads. P6. SHOULD. planned.
- [FR-CTA-006](cta/FR-CTA-006-crm-webhook.md) - CRM webhook mapping (HubSpot/Pipedrive) for form leads. P6. SHOULD. planned.
- [FR-CTA-007](cta/FR-CTA-007-lead-notification.md) - Real-time Slack/email new-lead notification. P6. SHOULD. shipped.
- [FR-CTA-008](cta/FR-CTA-008-cta-ab-test.md) - First-person CTA copy A/B testbed. P6. COULD. planned.
- [FR-CTA-009](cta/FR-CTA-009-form-abandonment.md) - Form-start/abandonment analytics. P6. COULD. shipped.

### CMS - content + i18n
- [FR-CMS-001](cms/FR-CMS-001-bilingual-content.md) - Bilingual content source of truth. P1. MUST. shipped.
- [FR-CMS-002](cms/FR-CMS-002-process-faq-sections.md) - On-page Process + FAQ sections (FAQ mirrors JSON-LD). P4. SHOULD. shipped.
- [FR-CMS-003](cms/FR-CMS-003-vietnamese-pass.md) - Complete Vietnamese localization + native review. P5. MUST. planned.
- [FR-CMS-004](cms/FR-CMS-004-real-testimonials.md) - Replace placeholder testimonials with cleared, named quotes. P6. SHOULD. planned.
- [FR-CMS-005](cms/FR-CMS-005-services-content.md) - Long-form services content for the detail pages. P4. SHOULD. planned.
- [FR-CMS-006](cms/FR-CMS-006-about-team.md) - About / team / culture content (recruiting + trust). P4. SHOULD. planned.
- [FR-CMS-007](cms/FR-CMS-007-insights-collection.md) - Insights/blog content collection (MDX). P6. COULD. planned.
- [FR-CMS-008](cms/FR-CMS-008-privacy-legal.md) - Privacy/legal page (PDPL/GDPR). P5. MUST. shipped.
- [FR-CMS-009](cms/FR-CMS-009-real-case-studies.md) - Replace placeholder case studies with cleared, real outcomes. P6. SHOULD. planned.

### SEO - discoverability
- [FR-SEO-001](seo/FR-SEO-001-discoverability.md) - sitemap, robots, hreflang, Organization + FAQ JSON-LD, OG. P1. MUST. shipped.
- [FR-SEO-002](seo/FR-SEO-002-sitemap-case-studies.md) - Sitemap includes case-study URLs. P4. SHOULD. shipped.
- [FR-SEO-003](seo/FR-SEO-003-breadcrumb-schema.md) - BreadcrumbList JSON-LD on sub-pages. P5. SHOULD. shipped.
- [FR-SEO-004](seo/FR-SEO-004-article-schema.md) - CreativeWork/Article schema on case studies + insights. P5. SHOULD. shipped.
- [FR-SEO-005](seo/FR-SEO-005-hreflang-completeness.md) - hreflang + canonical completeness across every route. P5. SHOULD. shipped.
- [FR-SEO-006](seo/FR-SEO-006-rss-feed.md) - RSS/Atom feed for insights. P6. COULD. planned.
- [FR-SEO-007](seo/FR-SEO-007-geo-ai-answers.md) - GEO: structure content for AI answer engines. P5. COULD. shipped.
- [FR-SEO-008](seo/FR-SEO-008-og-images.md) - Per-page dynamic OG images (incl. case studies). P5. SHOULD. shipped.
- [FR-SEO-009](seo/FR-SEO-009-meta-templates.md) - Structured per-page metadata templates. P5. COULD. shipped.

### A11Y - accessibility (WCAG 2.2 AA floor)
- [FR-A11Y-001](a11y/FR-A11Y-001-reduced-motion-lite.md) - Reduced-motion path + `/lite` storyboard + skip link. P3. MUST. shipped (motion behaviour later overridden; see FR-SCENE-003 + FR-A11Y-009).
- [FR-A11Y-002](a11y/FR-A11Y-002-accessibility-statement.md) - `/accessibility` statement + conformance page. P5. SHOULD. shipped.
- [FR-A11Y-003](a11y/FR-A11Y-003-axe-ci.md) - Automated axe checks in CI. P5. SHOULD. shipped 2026-06-24 (component-level jsdom test + required served-route axe gate across the real routes).
- [FR-A11Y-004](a11y/FR-A11Y-004-keyboard-focus.md) - Full keyboard operability + visible focus + focus order. P5. MUST. planned.
- [FR-A11Y-005](a11y/FR-A11Y-005-canvas-dom-mirror.md) - DOM-text mirror of anything the canvas communicates. P5. SHOULD. shipped.
- [FR-A11Y-006](a11y/FR-A11Y-006-chat-live-regions.md) - Screen-reader live regions for streaming chat. P5. SHOULD. shipped.
- [FR-A11Y-007](a11y/FR-A11Y-007-forced-colors.md) - forced-colors + high-contrast support. P5. SHOULD. shipped.
- [FR-A11Y-008](a11y/FR-A11Y-008-manual-sr-pass.md) - Manual VoiceOver/NVDA pass + checklist. P5. SHOULD. planned.
- [FR-A11Y-009](a11y/FR-A11Y-009-motion-controls-review.md) - Reconcile always-on motion with a user motion control. P5. SHOULD. planned.

### PERF - performance + Core Web Vitals
- [FR-PERF-001](perf/FR-PERF-001-perf-budget.md) - Performance-budget JSON (LCP<=2500) enforced in CI. P3. MUST. shipped.
- [FR-PERF-002](perf/FR-PERF-002-lighthouse-ci.md) - Lighthouse CI on mobile emulation per PR. P5. SHOULD. shipped.
- [FR-PERF-003](perf/FR-PERF-003-asset-size-ci.md) - Asset-size guard (textures, GLB, bundle) failing the build on regression. P5. SHOULD. shipped.
- [FR-PERF-004](perf/FR-PERF-004-bundle-analysis.md) - Bundle analysis + code-split audit. P5. COULD. shipped 2026-06-24.
- [FR-PERF-005](perf/FR-PERF-005-font-strategy.md) - Font loading strategy (subset, display, preload) incl. Vietnamese. P5. SHOULD. planned.
- [FR-PERF-006](perf/FR-PERF-006-cwv-monitoring.md) - Field Core Web Vitals monitoring (Speed Insights). P6. SHOULD. shipped.

### OPS - build / deploy / operations
- [FR-OPS-001](ops/FR-OPS-001-ci-perf-gate.md) - CI: static import check + typecheck + lint + test + build + budget. P3. MUST. shipped.
- [FR-OPS-002](ops/FR-OPS-002-first-party-analytics.md) - First-party cookieless analytics (`/api/analytics` + beacon). P4. COULD. shipped.
- [FR-OPS-003](ops/FR-OPS-003-vercel-deploy.md) - Vercel deploy config + runbook + live production at cyberskill.world. P6. MUST. shipped.
- [FR-OPS-004](ops/FR-OPS-004-env-secrets.md) - Env/secret management across prod + preview environments. P6. SHOULD. planned.
- [FR-OPS-005](ops/FR-OPS-005-lead-db.md) - Lead + transcript datastore (Vercel Postgres/Supabase). P6. SHOULD. planned.
- [FR-OPS-006](ops/FR-OPS-006-error-tracking.md) - Error/exception tracking (Sentry or equivalent). P6. COULD. shipped.
- [FR-OPS-007](ops/FR-OPS-007-speed-insights.md) - Vercel Speed Insights wiring (peer conflict no longer reproduces; no .npmrc needed). P6. COULD. shipped.
- [FR-OPS-008](ops/FR-OPS-008-uptime-monitoring.md) - Uptime + deploy-health monitoring + alerts. P6. COULD. planned.

## §3 Open questions (carried from the research doc)

1. Private npm / GitHub Packages feed for `@cyberskill/tokens` / `@cyberskill/react`? (FR-DS-005)
2. Confirm the current Anthropic model id + pricing at build time (env `GENIE_MODEL`).
3. Lip-sync fidelity for the GLB: amplitude (cheap) vs viseme/NeuroSync (rich). (FR-CHAR-024)
4. Booking + CRM tooling choice (Calendly? HubSpot?) before FR-CTA-005/006.

## §4 Notes

- `shipped` rows are verified and live; `planned` rows have an FR file with the
  spec and acceptance criteria but no implementation yet. Pick any `planned` FR,
  read its file, build, then flip its status here and add an `.awh` PROMOTE row.
- Phase tags are guidance, not a hard gate; dependencies in each FR file govern
  ordering.
