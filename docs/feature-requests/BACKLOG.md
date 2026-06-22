# CyberSkill Landing Page - Feature Request Backlog

Owner: Stephen Cheng (Founder / Creative Director). Source of truth: the
markdown files in this folder. This index is regenerated when FRs land or change
status. Authoring protocol: `../../AGENTS.md` (CyberOS overlay) over the CyberOS
Layer-1 Memory Protocol. Input spec: `../Research Foundations for the CyberSkill
Interactive Storytelling Landing Page (PRD + SRS Basis).md`.

Build session: `auto/landing-page-cyberos`, opened 2026-06-22. This is a fresh
implementation (the prior tree was reset on 2026-06-19; see
`.cyberos-memory/decisions/2026-06-22-fresh-rebuild.md`).

## §0 How to read this backlog

One row is one FR; one FR is one atomic, testable requirement, organised by
phase (P0 -> P3), then module. Priority uses BCP-14 keywords: MUST (release
blocker), SHOULD (release should-have), COULD (nice-to-have), MAY (post-launch).
Status flows `draft -> audited -> accepted -> building -> shipped`. An FR cannot
enter `building` until its `depends_on` rows are `shipped`.

Modules: `DS · WEB · SCENE · CHAR · CTA · CMS · SEO · A11Y · PERF · OPS`.

## §1 Totals at a glance

| Phase | Theme | FRs (this session) | Gate |
|---|---|---:|---|
| P0 | Design-system dependency resolution | 1 | Tokens hand-ported; package question logged |
| P1 | HTML-first conversion core | 7 | SSR sections + lead form + EN/VN + SEO + a11y; LCP <2.5s |
| P2 | Claude chat Genie (text-first) | 3 | Keyless proxy streams; persona grounded; consent + rate limit |
| P3 | 3D Genie + scroll storytelling | 4 | Scene gated behind perf budget; static fallback in same change |
| - | OPS / cross-cutting | 1 | CI: verify + typecheck + build + budget gate |
| Total | | 16 authored | Evidence gate in `.awh/` |

The research doc plans ~22 person-weeks of depth beyond this. The FRs below are
the anchor slices implemented in this session; deeper slices (commissioned GLB,
Theatre.js camera authoring, RAG persona, A/B testbed, CRM mapping) are tracked
as `deferred` and expanded when picked up.

## §2 Feature requests (this session)

### P0 - Design system
- [FR-DS-001](ds/FR-DS-001-token-port.md) - Hand-port doctrine tokens (Umber/Ochre, Liquid Glass, scales) to `--cs-*`. MUST. shipped.

### P1 - HTML-first conversion core
- [FR-WEB-001](web/FR-WEB-001-app-shell-i18n.md) - App Router shell, EN/VN `[lang]` routing, per-locale `<html lang>`. MUST. shipped.
- [FR-WEB-002](web/FR-WEB-002-ssr-sections.md) - SSR home sections (hero -> contact), story-driven, crawlable. MUST. shipped.
- [FR-CTA-001](cta/FR-CTA-001-lead-form.md) - <=5-field lead form + honeypot + consent + `/api/lead` fanout. MUST. shipped.
- [FR-CTA-002](cta/FR-CTA-002-persistent-cta.md) - Persistent low-friction CTA, scene-independent. SHOULD. shipped.
- [FR-SEO-001](seo/FR-SEO-001-discoverability.md) - sitemap, robots, hreflang, Organization + FAQ JSON-LD, OG. MUST. shipped.
- [FR-A11Y-001](a11y/FR-A11Y-001-reduced-motion-lite.md) - reduced-motion path + `/lite` storyboard mirror + motion toggle + skip link. MUST. shipped.
- [FR-CMS-001](cms/FR-CMS-001-bilingual-content.md) - Bilingual content SoT (company facts, services, work, scenes). MUST. shipped.

### P2 - Claude chat Genie
- [FR-CHAR-010](char/FR-CHAR-010-genie-proxy.md) - Keyless serverless proxy `/api/genie`, streaming SSE, rate limit. MUST. shipped.
- [FR-CHAR-011](char/FR-CHAR-011-persona.md) - Lumi persona system prompt (voice, grounding facts, guardrails), cached. MUST. shipped.
- [FR-CHAR-012](char/FR-CHAR-012-chat-widget.md) - Streaming chat widget + Zustand state machine + consent. MUST. shipped.

### P3 - 3D Genie + scroll storytelling
- [FR-SCENE-001](scene/FR-SCENE-001-canvas-scaffold.md) - Fixed R3F canvas, lazy ssr:false, capability gate. MUST. shipped.
- [FR-SCENE-002](scene/FR-SCENE-002-scroll-loop.md) - Lenis + GSAP ticker RAF loop + ScrollTrigger, reduced-motion safe. SHOULD. shipped.
- [FR-CHAR-020](char/FR-CHAR-020-lumi-placeholder.md) - Procedural Lumi placeholder (gaze + chat-state animation) pending GLB. SHOULD. shipped.
- [FR-CHAR-021](char/FR-CHAR-021-commission-glb.md) - Commission optimised golden-genie GLB (Draco+KTX2, rig, visemes). MUST. **deferred** (needs asset + budget).

### OPS
- [FR-OPS-001](ops/FR-OPS-001-ci-perf-gate.md) - CI: static import check + typecheck + build + perf-budget gate. MUST. shipped.

## §3 Open questions (carried from the research doc)

1. Private npm / GitHub Packages feed for `@cyberskill/tokens` / `@cyberskill/react`?
   If it exists, FR-DS-001 becomes "consume + theme" instead of "hand-port".
2. Confirm current Anthropic model id + price at build time (kept in env: `GENIE_MODEL`).
3. Lip-sync fidelity for the future GLB: amplitude (cheap) vs viseme/NeuroSync (rich).
