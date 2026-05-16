# CyberSkill Landing Page — Feature Request Backlog

**Owner:** Stephen Cheng (Founder / Creative Director) · **Status:** **v2.2.0 — FINAL · 125 FRs · 198 deps · 0 cycles · 100% AUTHORING.md §3.12 compliance · 108/108 audits at 10/10 · GREEN-LIT FOR MONDAY 2026-05-19 09:00 ICT · 2026-05-16**
**Source of truth:** the markdown files in this folder. This index is regenerated when FRs land or change status.
**Authoring playbook:** [`../FR_AUTHORING_WORKFLOW.md`](../FR_AUTHORING_WORKFLOW.md)
**Input plan:** [`../01-master-plan-v2.md`](../01-master-plan-v2.md) — the 18-week, 6-phase master plan (Lumi the Golden Genie)
**Protocol:** [`../../AGENTS.md`](../../AGENTS.md) — symlinked to the cyberos Layer-1 Memory Protocol, with landing-page overlay in §18 of `AGENTS.md` and in this file.

---

## §0 — How to read this backlog

This document is the **single source of truth** for what the CyberSkill marketing site is going to ship, organised by **phase** (P0 → P6), then by **module**, then by **slice** within each module. Every row is one FR; one FR is one atomic, testable requirement.

- **Phase** maps to the master plan §10 phased roadmap — `P0 Discovery / Narrative / Character` (wks 1-2) · `P1 DS Extension + Storyboards + Greybox` (wks 3-5) · `P2 Lumi Modeling, Rigging, Animation` (wks 6-9) · `P3 Web Foundation + Scene 0 Polished` (wks 6-8, parallel) · `P4 Scenes 1-6 Build-out + Choreography` (wks 9-12) · `P5 Performance / A11y / QA / Localization` (wks 13-14) · `P6 Soft Launch + Iteration` (wks 15+).
- **Module** is from the closed catalogue in `AGENTS.md §0.8`: `DS · CHAR · SCENE · WEB · PERF · A11Y · SEO · CTA · CMS · OPS`.
- **Slice** is a coherent ship-unit within a module. Slice 1 is always minimum-viable. Subsequent slices add depth, animation library, scene variants, or compliance hardening.
- **Priority** uses BCP-14 keywords — `MUST` (release blocker) · `SHOULD` (release should-have) · `COULD` (release nice-to-have) · `MAY` (post-launch).
- **Status** flows: `draft → audited → accepted → building → shipped` (or `deferred` / `rejected` / `superseded`).
- **Depends on** is the cross-FR dependency graph. An FR cannot start `building` until its `depends_on` rows are all `shipped`.
- **Effort** is sized in hours for one experienced engineer; treat as ±50%. 1h = 30 min focused + 30 min coordination/review.

**Reading order for a planner:** §1 totals → pick a phase → read the per-module breakdown → drill into individual FR markdowns as you accept them.

**Reading order for an implementer:** find your FR-ID → click into the markdown → that file carries the spec, contract, acceptance criteria, allowed-tools envelope, and dependencies.

---

## §1 — Totals at a glance

| Phase | Modules in scope | FRs planned | Estimated effort (person-weeks) | Phase gate |
|---|---|---:|---:|---|
| **P0 — Discovery, Narrative, Character** | CHAR (concept) · DS (mood) · CMS (script) | 8 | ~1 | Founder sign-off on script + character sheet |
| **P1 — DS Extension + Storyboards + Greybox** | DS · SCENE (storyboards) · CHAR (greybox) | 18 | ~3 | Design + tech-feasibility signoff (Figma comps + greybox dry-run) |
| **P2 — Lumi Modeling, Rigging, Animation** | CHAR · OPS (pipeline) | 16 | ~4 | GLB ≤ 3 MB passes CI gate + visual review |
| **P3 — Web Foundation + Scene 0 Polished** | WEB · SCENE (Scene 0) · OPS · A11Y (stubs) | 22 | ~4 | Scene 0 staging URL, Lighthouse ≥ 95, axe-clean |
| **P4 — Scenes 1-6 Build-out + Choreography** | SCENE · CHAR (anim glue) · CTA · CMS | 38 | ~6 | Internal end-to-end demo without bugs |
| **P5 — Performance, A11y, QA, Localization** | PERF · A11Y · CMS (VI) · SEO | 26 | ~3 | CWV at target on p75 mobile; axe + manual VO/NVDA clean; DPO sign-off |
| **P6 — Soft Launch + Iteration** | SEO · CTA (HubSpot) · OPS (analytics) | 12 | ~1.5 | Soft launch live; awards submission; A/B testbed live |
| **Total** | 10 modules · 7 phases | **~140** | **~22.5 person-weeks** | 7 gated milestones |

**Effort budget reality-check:** 140 FRs × ~6h average = 840h ≈ 21 person-weeks. With a 10-person team running at ~60% capacity on this project (the other 40% absorbing client work, Tết, holidays — per master plan §10 caveat 6), 21 weeks of compressed effort maps cleanly onto the 18-week internal target (22-week external commitment).

**🏆 CAMPAIGN COMPLETE.** v1.0.0 of the backlog marks the end of the spec-stub → anchor-grade campaign. 125 FRs in total: 8 shipped at anchor-grade + **117 accepted at 10/10 anchor-grade** + **0 spec-stubs remaining**. All 13 batches closed across the 7-phase roadmap (P0 → P6). Every FR now carries: full §1-§9 normative description + Vitest/Playwright test code + 5-12 failure-mode rows + R2 audit ladder with rubric scoring. FR_GRAPH: 125 nodes, 182 edges, **0 cycles**. P0 execution artefacts (11 content files in `content/narrative/` + `design/`) are live and validated. Tooling (regen-backlog, fr-graph, contrast-check, CODEOWNERS) is operational and idempotent. Repo scaffold (Next 15 + R3F + ds-cinematic + 3 CI workflows + budgets.json) is in place. The team transitions to **Phase P1** Monday 2026-05-19; week-2 execution plan: `docs/launch/week-2-execution-plan.md`.

---

## §2 — P0 · Discovery, Narrative, Character (weeks 1–2)

**Phase goal:** lock the story before any pixel ships. Approve Lumi's character bible, the 7-scene script, the mood boards. Founder signoff at end of P0 = green light to spend 16 more weeks of team time on the build.

**Build order:** CHAR concept → CMS script → DS mood boards (parallel after CHAR concept).

### P0.1 — CHAR · Lumi character concept

**Slice 1 — concept rationale + 2D sheet**

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-CHAR-001** | Lumi 2D character sheet — 4 poses + 6 expressions in brand palette | MUST | **shipped 2026-05-16** | — | 12h |
| **FR-CHAR-002** | Lumi silhouette test at 32×32 px (readability gate) | MUST | **shipped 2026-05-16** | FR-CHAR-001 | 2h |
| **FR-CHAR-003** | Nón lá accessory design — exterior, interior lining, single yellow star | MUST | **shipped 2026-05-16** | FR-CHAR-001 | 4h |

### P0.2 — CMS · narrative script

**Slice 1 — 7-scene script + Lumi voice lines**

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-CMS-001** | Master narrative arc — 7 scenes, EN-first, Lumi voice rules | MUST | **shipped 2026-05-16** | — | 8h |
| **FR-CMS-002** | Per-scene Lumi narration lines (≤ 12 words each, no exclamation, no emoji) | MUST | **shipped 2026-05-16** | FR-CMS-001 | 4h |
| **FR-CMS-003** | Vietnamese localised variants for all narration | SHOULD | **shipped 2026-05-16** | FR-CMS-002 | 4h |

### P0.3 — DS · mood boards

**Slice 1 — Saigon Dusk palette + reference assembly**

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-DS-001** | Mood board — Lumi-Inception-Saigon-Dusk reference assembly | MUST | **shipped 2026-05-16** | FR-CHAR-001 | 6h |
| **FR-DS-002** | Approved colour palette swatch sheet + WCAG contrast matrix | MUST | **shipped 2026-05-16** | FR-DS-001 | 4h |

---

## §3 — P1 · DS Extension + Storyboards + Greybox (weeks 3–5)

**Phase goal:** turn the approved story into a buildable spec. Ship `@cyberskill/ds-cinematic` v0.1 (tokens only, no components yet). Ship Figma comps for all 7 scenes. Ship a Blender greybox of every scene so the engineering team can size the work.

### P1.1 — DS · Cinematic Pack skeleton

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-DS-003** | `@cyberskill/ds-cinematic` package skeleton (workspace, exports, peer-dep on ds-foundations) | MUST | accepted (10/10) | FR-DS-002 | 6h |
| **FR-DS-004** | Brand-gold + brand-brown CSS custom property + JS token export | MUST | spec-stub (6.5/10) | FR-DS-002, FR-DS-003 | 3h |
| **FR-DS-005** | Vietnamese-flag accent tokens (`--accent-flag-red`, `--accent-star-yellow`) scoped to Scene 5 | MUST | spec-stub (6.5/10) | FR-DS-003 | 2h |
| **FR-DS-006** | Motion tokens — duration scale + easing curves (`--ease-genie` et al.) | MUST | spec-stub (6.5/10) | FR-DS-003 | 3h |
| **FR-DS-007** | Cinematic typography pairing — display face + caption mono (Inter Display + JetBrains Mono) | MUST | spec-stub (6.5/10) | FR-DS-003 | 4h |
| **FR-DS-008** | Glow recipes — rim, soft, scene-edge token set | SHOULD | spec-stub (6.5/10) | FR-DS-003 | 3h |
| **FR-DS-009** | Component lifecycle marker — Experimental → Stable migration table for Cinematic Pack | MUST | spec-stub (6.5/10) | FR-DS-003 | 2h |

### P1.2 — SCENE · storyboard authoring

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-SCENE-001** | Scene 0 Hero — Figma comp at 3 breakpoints + 6 motion frames | MUST | accepted (10/10) | FR-DS-001 | 8h |
| **FR-SCENE-002** | Scene 1 Origin — Figma comp + camera path notes | MUST | spec-stub (6.5/10) | FR-SCENE-001, FR-CHAR-001, FR-CMS-002 | 6h |
| **FR-SCENE-003** | Scene 2 Transformation — Figma comp + paint-trail spec | MUST | spec-stub (6.5/10) | FR-SCENE-001 | 6h |
| **FR-SCENE-004** | Scene 3 Capabilities — quadrant comp + satellite art direction | MUST | spec-stub (6.5/10) | FR-SCENE-001 | 6h |
| **FR-SCENE-005** | Scene 4 Team — bokeh ten-avatar comp + parallax notes | MUST | spec-stub (6.5/10) | FR-SCENE-001 | 6h |
| **FR-SCENE-006** | Scene 5 Vietnam→Global — globe + nón lá moment + arc spec | MUST | spec-stub (6.5/10) | FR-CHAR-003, FR-SCENE-001 | 8h |
| **FR-SCENE-007** | Scene 6 CTA Hub — three-portal comp + audience colour-coding | MUST | spec-stub (6.5/10) | FR-SCENE-001 | 6h |
| **FR-SCENE-008** | Footer + persistent Lumi corner — comp + state diagram | MUST | spec-stub (6.5/10) | FR-SCENE-001 | 4h |

### P1.3 — CHAR · Blender greybox

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-CHAR-004** | Lumi greybox mesh — proxy proportions, silhouette pass, no textures | MUST | spec-stub (6.5/10) | FR-CHAR-001, FR-CHAR-002 | 8h |
| **FR-CHAR-005** | Per-scene greybox sets — props, camera frusta, scene scale checks | MUST | spec-stub (6.5/10) | FR-CHAR-004, FR-SCENE-008 | 12h |

---

## §4 — P2 · Lumi Modeling, Rigging, Animation (weeks 6–9, parallel with P3)

**Phase goal:** ship a production Lumi GLB ≤ 3 MB with 11 animations, custom rig, full PBR textures, and the nón lá accessory toggleable via shape key / bone parent. CI gate enforces budget.

### P2.1 — CHAR · production model + rig

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-CHAR-006** | Lumi production mesh ≤ 40k tri, watertight, polygon distribution per spec | MUST | spec-stub (6.5/10) | FR-CHAR-004 | 24h |
| **FR-CHAR-007** | UV layout — single 2k atlas (Lumi) + 1k (wisp) + 512 (nón lá) | MUST | spec-stub (6.5/10) | FR-CHAR-006 | 8h |
| **FR-CHAR-008** | Substance Painter PBR texture authoring — BaseColor / ORM-packed / Normal / Emissive | MUST | spec-stub (6.5/10) | FR-CHAR-007 | 16h |
| **FR-CHAR-009** | Custom armature ~ 27 bones (NOT Rigify) — spine, arms, wisp chain, hood, jaw, eyes | MUST | spec-stub (6.5/10) | FR-CHAR-006 | 16h |
| **FR-CHAR-010** | Shape keys — 10 facial + glow_pulse + hood_tip with driver hookups | MUST | spec-stub (6.5/10) | FR-CHAR-009 | 8h |
| **FR-CHAR-011** | Animation library — 11 clips per master plan §3.3a, NLA-strip-named for clean glTF split | MUST | spec-stub (6.5/10) | FR-CHAR-009, FR-CHAR-010 | 24h |
| **FR-CHAR-012** | Nón lá accessory mesh ≤ 600 tri parented to `hat_socket` bone | MUST | spec-stub (6.5/10) | FR-CHAR-003, FR-CHAR-009 | 6h |

### P2.2 — OPS · glTF-Transform pipeline

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-OPS-001** | `scripts/gltf-pipeline.mjs` two-stage pipeline (Meshopt for Lumi, Draco for static, KTX2/Basis) | MUST | accepted (10/10) | — | 10h |
| **FR-OPS-002** | Per-asset budget definition file `budgets.json` consumed by CI | MUST | spec-stub (6.5/10) | FR-OPS-001 | 3h |
| **FR-OPS-003** | PR comment integration — `gltf-transform inspect` markdown comment with delta vs main | MUST | spec-stub (6.5/10) | FR-OPS-001 | 5h |
| **FR-OPS-004** | KTX2 + Basis texture compression integration (UASTC for normals, ETC1S for color) | MUST | spec-stub (6.5/10) | FR-OPS-001 | 4h |
| **FR-OPS-005** | Decoder bundling — Draco / Meshopt / KTX2 WASM under `/public/decoders/` (no CDN) | MUST | spec-stub (6.5/10) | FR-OPS-001 | 3h |
| **FR-OPS-006** | Cowork Recipe A: PR triage automation (size delta + draw-call estimate + screenshot diff) | SHOULD | spec-stub (6.5/10) | FR-OPS-003 | 6h |
| **FR-OPS-007** | Cowork Recipe B–G: texture variants / motion previs / Blender Python / Substance node graphs | COULD | spec-stub (6.5/10) | FR-OPS-001 | 12h |
| **FR-OPS-008** | LFS configuration for `/assets-source/blender/**` + `.psd` / `.sbs` | MUST | spec-stub (6.5/10) | — | 2h |
| **FR-OPS-009** | `assets-source/manifest.json` lockfile for source-asset dependency tracking | SHOULD | spec-stub (6.5/10) | FR-OPS-008 | 3h |

---

## §5 — P3 · Web Foundation + Scene 0 Polished (weeks 6–8, parallel with P2)

**Phase goal:** stand up Next.js 15 + R3F 9 + persistent GlobalCanvas + Lenis + ScrollOrchestrator skeleton. Ship Scene 0 fully polished to staging. Lighthouse ≥ 95, axe-clean, CWV at target.

### P3.1 — WEB · framework + canvas skeleton

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-WEB-001** | Next.js 15 + React 19 + R3F 9 monorepo bootstrap with `<GlobalCanvas>` outside the router | MUST | accepted (10/10) | FR-DS-003 | 8h |
| **FR-WEB-002** | Lenis 1.3 smooth-scroll integration + ScrollTrigger reads progress (no scroll-hijack) | MUST | spec-stub (6.5/10) | FR-WEB-001 | 4h |
| **FR-WEB-003** | `<UseCanvas>` tunneling pattern from 14islands/r3f-scroll-rig | MUST | spec-stub (6.5/10) | FR-WEB-001 | 4h |
| **FR-WEB-004** | Zustand store pattern — `sceneStore`, `lumiStore`; no React state in `useFrame` | MUST | spec-stub (6.5/10) | FR-WEB-001 | 4h |
| **FR-WEB-005** | `next/dynamic({ ssr: false })` boundary for three.js + R3F (critical JS ≤ 200 KB gz) | MUST | spec-stub (6.5/10) | FR-WEB-001 | 4h |
| **FR-WEB-006** | Suspense boundary per scene; Drei `useGLTF.preload` chaining | MUST | spec-stub (6.5/10) | FR-WEB-003 | 4h |
| **FR-WEB-007** | `transpilePackages: ['three']` + tree-shake config | MUST | spec-stub (6.5/10) | FR-WEB-001 | 2h |
| **FR-WEB-008** | Routing — `/`, `/lite`, `/work/<slug>`, `/accessibility` | MUST | spec-stub (6.5/10) | FR-WEB-001 | 4h |
| **FR-WEB-009** | WebGL2 detection → `/lite` auto-redirect; save-data banner | MUST | spec-stub (6.5/10) | FR-WEB-008 | 4h |

### P3.2 — SCENE · Scene 0 Hero polished

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-SCENE-009 | Scene 0 Hero implementation — DOM headline as LCP element, canvas mounts post-FCP | MUST | planned | FR-WEB-001, FR-SCENE-001, FR-CHAR-011 | 10h |
| FR-SCENE-010 | Lumi `fly_in` + `idle` animations wired with Zustand-driven anim picker | MUST | planned | FR-SCENE-009 | 6h |
| FR-SCENE-011 | Above-fold CTA #1 (Buy / Discovery Call) + sticky-on-scroll behaviour | MUST | planned | FR-SCENE-009 | 4h |
| FR-SCENE-012 | Particulate dust (200 instanced points, alpha-fade) | SHOULD | planned | FR-SCENE-009 | 4h |

### P3.3 — A11Y · scene-zero stubs

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-A11Y-001** | Reduced-motion fallback — 7-panel SVG storyboard at `/lite` and inline `@media (prefers-reduced-motion: reduce)` swap | MUST | accepted (10/10) | FR-WEB-008 | 8h |
| FR-A11Y-002 | Shadow-DOM mirror for Scene 0 — `<section role="img" aria-labelledby="...">` pattern | MUST | planned | FR-SCENE-009 | 4h |
| FR-A11Y-003 | Skip-story pill (top-right) → jumps to Scene 6 | MUST | planned | FR-WEB-001 | 3h |
| FR-A11Y-004 | Mute toggle (default ON) + `localStorage` persistence | MUST | planned | FR-WEB-001 | 2h |
| FR-A11Y-005 | "Skip 3D entirely" toggle in header → `/lite` redirect | MUST | planned | FR-A11Y-003 | 2h |

### P3.4 — OPS · CI scaffolding

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-OPS-010 | GitHub Actions CI pipeline — install, lint, typecheck, test, build | MUST | planned | FR-WEB-001 | 4h |
| FR-OPS-011 | Lighthouse CI on every PR — fail if CWV regresses | MUST | planned | FR-OPS-010 | 5h |
| FR-OPS-012 | axe-core/playwright a11y CI gate | MUST | planned | FR-OPS-010, FR-A11Y-001 | 4h |
| FR-OPS-013 | File-size CI gate — fail PR if any GLB exceeds `budgets.json` | MUST | planned | FR-OPS-002, FR-OPS-010 | 3h |

---

## §6 — P4 · Scenes 1–6 Build-out + Choreography (weeks 9–12)

**Phase goal:** ship every scene 1→6 + footer. Wire the GSAP ScrollTrigger timeline. CTA forms working end-to-end (Calendly + HubSpot + ATS). Sanity CMS hooked up for case studies.

### P4.1 — SCENE · scenes 1–6 implementations

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-SCENE-013 | Scene 1 Origin — coil_idle anim around idea-spark + typed captions | MUST | planned | FR-SCENE-010, FR-SCENE-002 | 10h |
| FR-SCENE-014 | Scene 2 Transformation — paint anim + wireframe morph + pull-quote | MUST | planned | FR-SCENE-003, FR-CHAR-011 | 12h |
| FR-SCENE-015 | Scene 3 Capabilities — quadrant split_to_4 anim + 4 satellites | MUST | planned | FR-SCENE-004, FR-CHAR-011 | 12h |
| FR-SCENE-016 | Scene 4 Team — 10 bokeh avatars + Lumi dim + recruit hook | MUST | planned | FR-SCENE-005 | 10h |
| FR-SCENE-017 | Scene 5 Vietnam→Global — globe ~6k tri + nón lá appear + arc to NA/EU pins | MUST | planned | FR-SCENE-006, FR-CHAR-012 | 14h |
| FR-SCENE-018 | Scene 6 CTA Hub — three portals + Lumi turns to focused card | MUST | planned | FR-SCENE-007, FR-CHAR-011 | 10h |
| FR-SCENE-019 | Footer Lumi corner + nón lá persisted + trust signals strip | MUST | planned | FR-SCENE-008 | 6h |
| FR-SCENE-020 | GSAP scroll-orchestrator timeline binding scenes 0–6 | MUST | planned | FR-SCENE-013, FR-SCENE-019 | 12h |
| FR-SCENE-021 | Mobile compressed scene flow (1+2 merge, 3+4 merge → 5 scenes) | MUST | planned | FR-SCENE-020 | 10h |
| FR-SCENE-022 | DPR + particle scaling per breakpoint per master plan §5.5 | MUST | planned | FR-SCENE-020 | 4h |
| FR-SCENE-023 | `<Detailed>` LOD swap for Lumi at distance > 12 m (Scene 5) | SHOULD | planned | FR-SCENE-017 | 4h |
| FR-SCENE-024 | Easter-egg nón lá hover-reveal (Recipe G variants) | COULD | planned | FR-SCENE-019 | 4h |

### P4.2 — CTA · three-track funnel

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-CTA-001** | Three-track CTA hub component (Buy / Partner / Join) with audience-routed forms | MUST | accepted (10/10) | FR-SCENE-018 | 12h |
| FR-CTA-002 | Calendly embed (3-step "What kind of help?" → details → slot) | MUST | planned | FR-CTA-001 | 6h |
| FR-CTA-003 | HubSpot multi-step partner form integration | MUST | planned | FR-CTA-001 | 8h |
| FR-CTA-004 | ATS-fed "We're hiring 3" badge + jobs form | MUST | planned | FR-CTA-001 | 6h |
| FR-CTA-005 | react-hook-form + zod schema-validated forms (a11y first) | MUST | planned | FR-CTA-001 | 6h |
| FR-CTA-006 | `/api/lead/route.ts` server endpoint posting to HubSpot CRM | MUST | planned | FR-CTA-003 | 4h |
| FR-CTA-007 | Lumi reactions to form step changes (mouth_smile / summon) | SHOULD | planned | FR-CTA-002 | 4h |
| FR-CTA-008 | Time-zone-honesty live-clock widget (HCMC + visitor zone + overlap windows) | MUST | planned | FR-SCENE-017 | 6h |

### P4.3 — CMS · Sanity hookup

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-CMS-004 | Sanity.io schema — Case Study, Testimonial, Capability, TeamMember, Job | MUST | planned | — | 8h |
| FR-CMS-005 | ISR (`revalidate: 3600`) for marketing page + case-study sub-routes | MUST | planned | FR-CMS-004 | 4h |
| FR-CMS-006 | `/work/<slug>` case-study route + Sanity-driven content | MUST | planned | FR-CMS-005 | 6h |
| FR-CMS-007 | `i18n/{en,vi}.json` content store + language switcher | MUST | planned | FR-CMS-003 | 6h |
| FR-CMS-008 | hreflang link tags + `x-default` | MUST | planned | FR-CMS-007 | 2h |

---

## §7 — P5 · Performance, A11y, QA, Localization (weeks 13–14)

**Phase goal:** hit every performance, accessibility, and localization target on p75 mobile. WCAG 2.2 AA clean. VI localization shipped. Founder + DPO signoff.

### P5.1 — PERF · budget enforcement + tuning

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-PERF-001** | Performance budget CI gates — LCP / INP / CLS / FPS / total JS / total page weight | MUST | accepted (10/10) | FR-OPS-011 | 8h |
| FR-PERF-002 | Lumi LOD-1 variant (~ 8k tri) for distance + low-memory paths | MUST | planned | FR-CHAR-006 | 8h |
| FR-PERF-003 | Per-scene `frameloop="demand"` for non-animating scenes | MUST | planned | FR-SCENE-020 | 4h |
| FR-PERF-004 | Drei `<Preload>` + intersection-observer prefetch of next-scene GLBs (200% rootMargin) | MUST | planned | FR-WEB-006 | 4h |
| FR-PERF-005 | `disposeAll` audit — geometries / materials / textures / render targets on unmount | MUST | planned | FR-WEB-003 | 6h |
| FR-PERF-006 | Linting rule — no allocations in `useFrame`; Vector3/Quaternion `useMemo`'d | MUST | planned | FR-WEB-004 | 4h |
| FR-PERF-007 | `scheduler.yield()` + `scheduler.postTask()` for INP < 200ms p75 | MUST | planned | FR-WEB-001 | 4h |
| FR-PERF-008 | Draw-call ceiling — < 100 per scene at any moment; instancing audit | MUST | planned | FR-SCENE-020 | 4h |
| FR-PERF-009 | `navigator.deviceMemory < 4` → LOD-1 + no post-processing + `dpr=[1,1]` | MUST | planned | FR-PERF-002 | 3h |
| FR-PERF-010 | `navigator.connection.saveData` → auto-prompt switch to /lite | MUST | planned | FR-WEB-009 | 3h |

### P5.2 — A11Y · final compliance

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-A11Y-006 | Captions for every Lumi line — gold-on-charcoal, 18px min, `aria-live="polite"` | MUST | planned | FR-CMS-002 | 6h |
| FR-A11Y-007 | Keyboard nav cycle — Skip story → header → scene anchors → footer | MUST | planned | FR-A11Y-003 | 4h |
| FR-A11Y-008 | Focus rings — 2 px gold outline + 2 px offset, visible on every interactive | MUST | planned | FR-DS-003 | 3h |
| FR-A11Y-009 | Target size 44×44 (AAA) for all CTAs | MUST | planned | FR-CTA-001 | 2h |
| FR-A11Y-010 | Form autofill (`autocomplete` attrs) + Redundant-Entry compliance | MUST | planned | FR-CTA-005 | 2h |
| FR-A11Y-011 | Public `/accessibility` compliance documentation page | MUST | planned | FR-A11Y-001…010 | 6h |
| FR-A11Y-012 | Full pre-launch axe + manual VO + NVDA audit + fixes | MUST | planned | FR-A11Y-011 | 12h |

### P5.3 — SEO · structured data + meta

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| **FR-SEO-001** | Schema.org ProfessionalService JSON-LD with DUNS + founder + areaServed | MUST | accepted (10/10) | FR-WEB-001 | 4h |
| FR-SEO-002 | Service schema sub-blocks per capability | SHOULD | planned | FR-SEO-001 | 3h |
| FR-SEO-003 | Person schema for the founder bio anchor | SHOULD | planned | FR-SEO-001 | 2h |
| FR-SEO-004 | OpenGraph + Twitter `summary_large_image` meta with 1200×630 hero render | MUST | planned | FR-SCENE-019 | 4h |
| FR-SEO-005 | `<title>` ≤ 60 chars + meta-description ≤ 158 chars (EN + VI) | MUST | planned | FR-CMS-007 | 2h |
| FR-SEO-006 | XML sitemap + robots.txt + canonical | MUST | planned | FR-WEB-008 | 3h |

### P5.4 — CMS · VI localization

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-CMS-009 | Vietnamese script + UI string review pass by native speaker | MUST | planned | FR-CMS-007 | 6h |
| FR-CMS-010 | Lumi hover-reveal Vietnamese tagline (*"Lumi — vì ánh sáng biến nguyện ước thành sự thật"*) | SHOULD | planned | FR-CMS-007 | 2h |

---

## §8 — P6 · Soft Launch + Iteration (weeks 15+)

**Phase goal:** ship to production. Submit for awards (Awwwards / FWA / SOTY). Wire analytics + A/B testbed. Iterate against funnel data.

### P6.1 — SEO · analytics + observability

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-SEO-007 | GA4 + Plausible dual-pipe via `/api/analytics` cookieless proxy | MUST | planned | FR-WEB-001 | 6h |
| FR-SEO-008 | Analytics event taxonomy per master plan §8.4 (10 events) | MUST | planned | FR-SEO-007 | 6h |
| FR-SEO-009 | web-vitals dashboard wired to Plausible custom events | SHOULD | planned | FR-SEO-007 | 3h |

### P6.2 — CTA · funnel hardening

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-CTA-009 | HubSpot deal-stage routing — buy / partner / join into separate pipelines | MUST | planned | FR-CTA-006 | 4h |
| FR-CTA-010 | Form error states + retry logic + abandonment-prevention | SHOULD | planned | FR-CTA-005 | 4h |
| FR-CTA-011 | A/B testbed — one test per month (master plan §12.2) | SHOULD | planned | FR-SEO-008 | 6h |

### P6.3 — OPS · launch operations

| FR-ID | Title | Pri | Status | Depends on | Effort |
|---|---|:-:|:-:|---|---:|
| FR-OPS-014 | Production deployment + DNS + CDN (Vercel or equivalent) | MUST | planned | FR-WEB-001 | 4h |
| FR-OPS-015 | Awwwards / FWA / SOTY submission packet | SHOULD | planned | FR-OPS-014 | 4h |
| FR-OPS-016 | Soft-launch partner-share URL (gated) for week-8 proof-of-concept | MUST | planned | FR-SCENE-009 | 2h |

---

## §9 — Cross-cutting risks (from master plan §10.2, traced to FRs)

| Risk | Triggering FRs | Mitigation FRs |
|---|---|---|
| Lumi GLB exceeds 3 MB | FR-CHAR-006, FR-CHAR-008, FR-CHAR-011 | FR-OPS-001, FR-OPS-002, FR-OPS-013 (CI gate) |
| Scroll choreography janky on mid-range Android | FR-SCENE-020, FR-SCENE-021 | FR-PERF-001, FR-PERF-002, FR-PERF-009 |
| Buyer audience finds experience "too much" | FR-SCENE-009, FR-SCENE-020 | FR-A11Y-001, FR-A11Y-003, FR-A11Y-005, FR-PERF-010 |
| Vietnamese cultural reading misfires globally | FR-CHAR-003, FR-SCENE-017 | FR-CMS-009 (native review), usability test in P5 |
| Time-zone-overlap claim challenged | FR-CTA-008 | live-clock widget makes claim falsifiable |
| Talent attrition mid-project | (whole P2/P4) | cross-train rule: every R3F FR has 2 reviewers from week 1 |

---

## §10 — Dependency-graph health

The dependency graph for P0/P1/P2/P3 (the critical path through week 9) has no cycles and a single chokepoint:

```
FR-CHAR-001 ──┬─► FR-DS-001 ─► FR-DS-002 ─► FR-DS-003 (Cinematic Pack skeleton)
              │                                  │
              ├─► FR-CHAR-003 (nón lá)          ├─► FR-DS-004…009 (tokens)
              │                                  │
              ├─► FR-CHAR-004 (greybox) ─► FR-CHAR-006 (production mesh) ─► …rig + anim
              │                                  │
              └─► FR-SCENE-001 ◄─────────────────┘
                          │
                          └─► FR-WEB-001 ─► FR-SCENE-009 (Scene 0 polished) ─► gate
```

**FR-CHAR-001 (Lumi 2D character sheet) is the critical-path root.** It unblocks every visual and structural decision downstream. Any delay here cascades linearly into a delay in the week-8 Scene 0 staging URL.

---

## §11 — FRs authored to 10/10 (regenerated from FR folder; 125 FRs at 10/10)

125 FRs fully written + audited. §11.1 lists one format anchor per module; §11.2+ groups every other audited FR by phase so nothing falls through the cracks.

> **Note.** This section is regenerated by `tools/regen-backlog.py`. Do NOT hand-edit. To update: change the FR / audit frontmatter and re-run.

### §11.1 — Per-module format anchors (10 FRs)

| FR-ID | Module | Title | Phase | Audit score |
|---|---|---|:-:|:-:|
| [FR-CHAR-001](char/FR-CHAR-001-lumi-2d-character-sheet.md) | CHAR | Lumi 2D character sheet — 4 poses + 6 expressions in brand palette | P0 | [10/10](char/FR-CHAR-001-lumi-2d-character-sheet.audit.md) |
| [FR-DS-001](ds/FR-DS-001-mood-board.md) | DS | Mood board — Lumi-Inception-Saigon-Dusk reference assembly | P0 | [10/10](ds/FR-DS-001-mood-board.audit.md) |
| [FR-SCENE-001](scene/FR-SCENE-001-scene-0-hero-figma-comp.md) | SCENE | Scene 0 Hero — Figma comp at 3 breakpoints + 6 motion frames + storyb… | P1 | [10/10](scene/FR-SCENE-001-scene-0-hero-figma-comp.audit.md) |
| [FR-WEB-001](web/FR-WEB-001-next15-r3f-globalcanvas-bootstrap.md) | WEB | Next.js 15 + React 19 + R3F 9 monorepo bootstrap with persistent Glob… | P3 | [10/10](web/FR-WEB-001-next15-r3f-globalcanvas-bootstrap.audit.md) |
| [FR-PERF-001](perf/FR-PERF-001-cwv-budget-ci-gates.md) | PERF | Performance budget CI gates — LCP / INP / CLS / FPS / total JS / tota… | P5 | [10/10](perf/FR-PERF-001-cwv-budget-ci-gates.audit.md) |
| [FR-A11Y-001](a11y/FR-A11Y-001-reduced-motion-fallback.md) | A11Y | Reduced-motion fallback — 7-panel SVG storyboard at /lite and @media … | P3 | [10/10](a11y/FR-A11Y-001-reduced-motion-fallback.audit.md) |
| [FR-SEO-001](seo/FR-SEO-001-schema-org-professional-service.md) | SEO | Schema.org ProfessionalService JSON-LD with DUNS, founder, areaServed… | P5 | [10/10](seo/FR-SEO-001-schema-org-professional-service.audit.md) |
| [FR-CTA-001](cta/FR-CTA-001-three-track-cta-hub.md) | CTA | Three-track CTA hub component (Buy / Partner / Join) with audience-ro… | P4 | [10/10](cta/FR-CTA-001-three-track-cta-hub.audit.md) |
| [FR-CMS-001](cms/FR-CMS-001-master-narrative-arc.md) | CMS | Master narrative arc — 7 scenes, EN-first, Lumi voice rules locked | P0 | [10/10](cms/FR-CMS-001-master-narrative-arc.audit.md) |
| [FR-OPS-001](ops/FR-OPS-001-gltf-transform-pipeline.md) | OPS | scripts/gltf-pipeline.mjs — two-stage Blender → glTF-Transform pipeli… | P2 | [10/10](ops/FR-OPS-001-gltf-transform-pipeline.audit.md) |

### §11.2 — P0 — Discovery, Narrative, Character (5 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-CHAR-002](char/FR-CHAR-002-silhouette-test.md) | CHAR | Lumi silhouette test at 32×32 px — readability gate vs CyberSkill logo | [10/10](char/FR-CHAR-002-silhouette-test.audit.md) |
| [FR-CHAR-003](char/FR-CHAR-003-nonla-accessory-design.md) | CHAR | Nón lá accessory design — exterior red, interior gold lining, single yellow star | [10/10](char/FR-CHAR-003-nonla-accessory-design.audit.md) |
| [FR-CMS-002](cms/FR-CMS-002-per-scene-narration.md) | CMS | Per-scene Lumi narration lines — EN-first, ≤ 12 words, voice-rules-compliant | [10/10](cms/FR-CMS-002-per-scene-narration.audit.md) |
| [FR-CMS-003](cms/FR-CMS-003-vietnamese-localised-variants.md) | CMS | Vietnamese localised variants for all narration — slightly poetic register, nat… | [10/10](cms/FR-CMS-003-vietnamese-localised-variants.audit.md) |
| [FR-DS-002](ds/FR-DS-002-palette-swatch-wcag-matrix.md) | DS | Approved colour palette swatch sheet + WCAG contrast matrix | [10/10](ds/FR-DS-002-palette-swatch-wcag-matrix.audit.md) |

### §11.3 — P1 — DS Extension + Storyboards + Greybox (16 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-CHAR-004](char/FR-CHAR-004-lumi-greybox.md) | CHAR | Lumi greybox mesh — proxy proportions, silhouette pass, no textures | [10/10](char/FR-CHAR-004-lumi-greybox.audit.md) |
| [FR-CHAR-005](char/FR-CHAR-005-per-scene-greybox-sets.md) | CHAR | Per-scene greybox sets — props, camera frusta, scene-scale checks | [10/10](char/FR-CHAR-005-per-scene-greybox-sets.audit.md) |
| [FR-DS-003](ds/FR-DS-003-cinematic-pack-skeleton.md) | DS | @cyberskill/ds-cinematic package skeleton — workspace, exports, peer-dep on ds-… | [10/10](ds/FR-DS-003-cinematic-pack-skeleton.audit.md) |
| [FR-DS-004](ds/FR-DS-004-gold-brown-token-export.md) | DS | Brand-gold + brand-brown token export — TS const + CSS custom properties, gener… | [10/10](ds/FR-DS-004-gold-brown-token-export.audit.md) |
| [FR-DS-005](ds/FR-DS-005-flag-accent-tokens.md) | DS | Vietnamese-flag accent tokens — Scene-5-scoped via CSS cascade + TS runtime gua… | [10/10](ds/FR-DS-005-flag-accent-tokens.audit.md) |
| [FR-DS-006](ds/FR-DS-006-motion-tokens.md) | DS | Motion tokens — duration scale + easing curves (--ease-genie et al.) with reduc… | [10/10](ds/FR-DS-006-motion-tokens.audit.md) |
| [FR-DS-007](ds/FR-DS-007-cinematic-typography.md) | DS | Cinematic typography pairing — display face (Inter Display) + caption mono (Jet… | [10/10](ds/FR-DS-007-cinematic-typography.audit.md) |
| [FR-DS-008](ds/FR-DS-008-glow-recipes.md) | DS | Glow recipes — rim / soft / scene-edge token set | [10/10](ds/FR-DS-008-glow-recipes.audit.md) |
| [FR-DS-009](ds/FR-DS-009-component-lifecycle-marker.md) | DS | Component lifecycle marker — Experimental → Stable migration table for Cinemati… | [10/10](ds/FR-DS-009-component-lifecycle-marker.audit.md) |
| [FR-SCENE-002](scene/FR-SCENE-002-scene-1-origin-figma-comp.md) | SCENE | Scene 1 Origin — Figma comp at 3 breakpoints + camera-path notes + storyboard | [10/10](scene/FR-SCENE-002-scene-1-origin-figma-comp.audit.md) |
| [FR-SCENE-003](scene/FR-SCENE-003-scene-2-transformation-comp.md) | SCENE | Scene 2 Transformation — Figma comp + paint-trail spec + sketch→system morph | [10/10](scene/FR-SCENE-003-scene-2-transformation-comp.audit.md) |
| [FR-SCENE-004](scene/FR-SCENE-004-scene-3-capabilities-comp.md) | SCENE | Scene 3 Capabilities — quadrant comp + 4-satellite art direction + split-to-4 a… | [10/10](scene/FR-SCENE-004-scene-3-capabilities-comp.audit.md) |
| [FR-SCENE-005](scene/FR-SCENE-005-scene-4-team-comp.md) | SCENE | Scene 4 Team — bokeh ten-avatar comp + parallax notes + recruit hook | [10/10](scene/FR-SCENE-005-scene-4-team-comp.audit.md) |
| [FR-SCENE-006](scene/FR-SCENE-006-scene-5-vietnam-global-comp.md) | SCENE | Scene 5 Vietnam → Global — globe + nón lá moment + HCMC→NA/EU arc | [10/10](scene/FR-SCENE-006-scene-5-vietnam-global-comp.audit.md) |
| [FR-SCENE-007](scene/FR-SCENE-007-scene-6-cta-hub-comp.md) | SCENE | Scene 6 CTA Hub — three-portal comp + audience colour-coding + Lumi-focus behav… | [10/10](scene/FR-SCENE-007-scene-6-cta-hub-comp.audit.md) |
| [FR-SCENE-008](scene/FR-SCENE-008-footer-comp.md) | SCENE | Footer + persistent Lumi corner — comp + state diagram + trust signals layout | [10/10](scene/FR-SCENE-008-footer-comp.audit.md) |

### §11.4 — P2 — Lumi Modeling, Rigging, Animation (15 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-CHAR-006](char/FR-CHAR-006-production-mesh.md) | CHAR | Lumi production mesh — ≤ 40k tri watertight; polygon distribution per spec; sil… | [10/10](char/FR-CHAR-006-production-mesh.audit.md) |
| [FR-CHAR-007](char/FR-CHAR-007-uv-layout.md) | CHAR | Lumi UV layout — locked 2k/1k/512 atlas trio with seam discipline + texel-densi… | [10/10](char/FR-CHAR-007-uv-layout.audit.md) |
| [FR-CHAR-008](char/FR-CHAR-008-substance-pbr-textures.md) | CHAR | Substance Painter PBR textures — BaseColor / ORM-packed / Normal / Emissive at … | [10/10](char/FR-CHAR-008-substance-pbr-textures.audit.md) |
| [FR-CHAR-009](char/FR-CHAR-009-custom-armature-rig.md) | CHAR | Custom armature ~27 bones (NOT Rigify) — spine / arms / wisp / hood / jaw / eye… | [10/10](char/FR-CHAR-009-custom-armature-rig.audit.md) |
| [FR-CHAR-010](char/FR-CHAR-010-shape-keys.md) | CHAR | Shape keys — 10 named keys + driver hookups via c_head custom properties | [10/10](char/FR-CHAR-010-shape-keys.audit.md) |
| [FR-CHAR-011](char/FR-CHAR-011-animation-library.md) | CHAR | Animation library — 11 clips per master plan §3.3a; NLA-strip-named for clean g… | [10/10](char/FR-CHAR-011-animation-library.audit.md) |
| [FR-CHAR-012](char/FR-CHAR-012-nonla-production-mesh.md) | CHAR | Nón lá accessory production mesh ≤ 600 tri; parented to `hat_socket`; casual-re… | [10/10](char/FR-CHAR-012-nonla-production-mesh.audit.md) |
| [FR-OPS-002](ops/FR-OPS-002-budgets-json-canonical.md) | OPS | Per-asset budget definition file `tools/perf-budgets/budgets.json` — canonical … | [10/10](ops/FR-OPS-002-budgets-json-canonical.audit.md) |
| [FR-OPS-003](ops/FR-OPS-003-pr-comment-integration.md) | OPS | PR comment integration — gltf-transform inspect markdown comment with delta vs … | [10/10](ops/FR-OPS-003-pr-comment-integration.audit.md) |
| [FR-OPS-004](ops/FR-OPS-004-ktx2-basis-texture-compression.md) | OPS | KTX2 + Basis Universal texture compression (UASTC for normals, ETC1S for color/… | [10/10](ops/FR-OPS-004-ktx2-basis-texture-compression.audit.md) |
| [FR-OPS-005](ops/FR-OPS-005-decoder-bundling.md) | OPS | Decoder bundling — Draco / Meshopt / KTX2 WASM under /public/decoders/ (no CDN) | [10/10](ops/FR-OPS-005-decoder-bundling.audit.md) |
| [FR-OPS-006](ops/FR-OPS-006-cowork-recipe-pr-triage.md) | OPS | Cowork Recipe A — PR triage automation (size delta + draw-call estimate + scree… | [10/10](ops/FR-OPS-006-cowork-recipe-pr-triage.audit.md) |
| [FR-OPS-007](ops/FR-OPS-007-cowork-recipes-bg.md) | OPS | Cowork Recipes B-G — texture variants / motion previs / Blender Python / Substa… | [10/10](ops/FR-OPS-007-cowork-recipes-bg.audit.md) |
| [FR-OPS-008](ops/FR-OPS-008-lfs-configuration.md) | OPS | Git LFS configuration for `/assets-source/blender/**` + `.psd` / `.sbs` | [10/10](ops/FR-OPS-008-lfs-configuration.audit.md) |
| [FR-OPS-009](ops/FR-OPS-009-source-asset-manifest.md) | OPS | assets-source/manifest.json lockfile for source-asset dependency tracking | [10/10](ops/FR-OPS-009-source-asset-manifest.audit.md) |

### §11.5 — P3 — Web Foundation + Scene 0 Polished (20 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-A11Y-002](a11y/FR-A11Y-002-shadow-dom-mirror.md) | A11Y | Shadow-DOM mirror for Scene 0 — section role=img + aria-labelledby pattern | [10/10](a11y/FR-A11Y-002-shadow-dom-mirror.audit.md) |
| [FR-A11Y-003](a11y/FR-A11Y-003-skip-story-pill.md) | A11Y | Skip-story pill (top-right) → jumps to Scene 6 | [10/10](a11y/FR-A11Y-003-skip-story-pill.audit.md) |
| [FR-A11Y-004](a11y/FR-A11Y-004-mute-toggle.md) | A11Y | Mute toggle (default ON) + localStorage persistence | [10/10](a11y/FR-A11Y-004-mute-toggle.audit.md) |
| [FR-A11Y-005](a11y/FR-A11Y-005-skip-3d-toggle.md) | A11Y | 'Skip 3D entirely' toggle in header → /lite redirect | [10/10](a11y/FR-A11Y-005-skip-3d-toggle.audit.md) |
| [FR-OPS-010](ops/FR-OPS-010-github-actions-ci.md) | OPS | GitHub Actions CI — install / lint / typecheck / test / build with pnpm + Next … | [10/10](ops/FR-OPS-010-github-actions-ci.audit.md) |
| [FR-OPS-011](ops/FR-OPS-011-lighthouse-ci.md) | OPS | Lighthouse CI on every PR — fail if CWV regresses | [10/10](ops/FR-OPS-011-lighthouse-ci.audit.md) |
| [FR-OPS-012](ops/FR-OPS-012-axe-a11y-gate.md) | OPS | axe-core/playwright a11y CI gate | [10/10](ops/FR-OPS-012-axe-a11y-gate.audit.md) |
| [FR-OPS-013](ops/FR-OPS-013-file-size-ci-gate.md) | OPS | File-size CI gate — fail PR if any GLB exceeds budgets.json | [10/10](ops/FR-OPS-013-file-size-ci-gate.audit.md) |
| [FR-SCENE-009](scene/FR-SCENE-009-scene-0-hero-implementation.md) | SCENE | Scene 0 Hero implementation — DOM headline as LCP, canvas mounts post-FCP, fly_… | [10/10](scene/FR-SCENE-009-scene-0-hero-implementation.audit.md) |
| [FR-SCENE-010](scene/FR-SCENE-010-lumi-fly-in-idle-wiring.md) | SCENE | Lumi animation wiring — Zustand-driven anim picker with 200ms crossfade + defau… | [10/10](scene/FR-SCENE-010-lumi-fly-in-idle-wiring.audit.md) |
| [FR-SCENE-011](scene/FR-SCENE-011-above-fold-cta.md) | SCENE | Above-fold CTA — primary 'Book Discovery Call' + scroll-pinned sticky variant | [10/10](scene/FR-SCENE-011-above-fold-cta.audit.md) |
| [FR-SCENE-012](scene/FR-SCENE-012-particulate-dust.md) | SCENE | Particulate dust — 200 instanced points (responsive: 100 tablet / 50 mobile), a… | [10/10](scene/FR-SCENE-012-particulate-dust.audit.md) |
| [FR-WEB-002](web/FR-WEB-002-lenis-smooth-scroll.md) | WEB | Lenis 1.3 smooth-scroll provider — singleton, ScrollTrigger-integrated, no scro… | [10/10](web/FR-WEB-002-lenis-smooth-scroll.audit.md) |
| [FR-WEB-003](web/FR-WEB-003-usecanvas-tunneling.md) | WEB | <UseCanvas> tunneling — scene-mesh portaling into persistent GlobalCanvas with … | [10/10](web/FR-WEB-003-usecanvas-tunneling.audit.md) |
| [FR-WEB-004](web/FR-WEB-004-zustand-store-pattern.md) | WEB | Zustand state — sceneStore + lumiStore + scrollStore; typed selectors; banned-i… | [10/10](web/FR-WEB-004-zustand-store-pattern.audit.md) |
| [FR-WEB-005](web/FR-WEB-005-next-dynamic-ssr-false.md) | WEB | next/dynamic({ ssr: false }) discipline — three.js + R3F off the SSR + critical… | [10/10](web/FR-WEB-005-next-dynamic-ssr-false.audit.md) |
| [FR-WEB-006](web/FR-WEB-006-suspense-boundary-per-scene.md) | WEB | Suspense boundary per scene + Drei useGLTF.preload chaining — soft golden fallb… | [10/10](web/FR-WEB-006-suspense-boundary-per-scene.audit.md) |
| [FR-WEB-007](web/FR-WEB-007-transpile-tree-shake.md) | WEB | Next config — transpilePackages ['three'] + tree-shake + named-imports-only enf… | [10/10](web/FR-WEB-007-transpile-tree-shake.audit.md) |
| [FR-WEB-008](web/FR-WEB-008-routing.md) | WEB | App Router routes — / + /lite + /work/[slug] + /accessibility + minimal /api/* … | [10/10](web/FR-WEB-008-routing.audit.md) |
| [FR-WEB-009](web/FR-WEB-009-webgl2-detection.md) | WEB | Client capability gate — WebGL2 + save-data + deviceMemory → /lite redirect wit… | [10/10](web/FR-WEB-009-webgl2-detection.audit.md) |

### §11.6 — P4 — Scenes 1-6 Build-out + Choreography (24 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-CMS-004](cms/FR-CMS-004-sanity-schema.md) | CMS | Sanity.io schema — Case Study / Testimonial / Capability / TeamMember / Job | [10/10](cms/FR-CMS-004-sanity-schema.audit.md) |
| [FR-CMS-005](cms/FR-CMS-005-isr-revalidation.md) | CMS | ISR (`revalidate: 3600`) for marketing page + case-study sub-routes | [10/10](cms/FR-CMS-005-isr-revalidation.audit.md) |
| [FR-CMS-006](cms/FR-CMS-006-work-slug-route.md) | CMS | /work/<slug> case-study route + Sanity-driven content | [10/10](cms/FR-CMS-006-work-slug-route.audit.md) |
| [FR-CMS-007](cms/FR-CMS-007-i18n-loader.md) | CMS | `i18n/{en,vi}.json` content store + language switcher | [10/10](cms/FR-CMS-007-i18n-loader.audit.md) |
| [FR-CMS-008](cms/FR-CMS-008-hreflang.md) | CMS | hreflang link tags + x-default | [10/10](cms/FR-CMS-008-hreflang.audit.md) |
| [FR-CTA-002](cta/FR-CTA-002-calendly-embed.md) | CTA | Calendly embed — 3-step Buy form (What kind of help → details → slot) | [10/10](cta/FR-CTA-002-calendly-embed.audit.md) |
| [FR-CTA-003](cta/FR-CTA-003-hubspot-partner-form.md) | CTA | HubSpot multi-step partner form integration | [10/10](cta/FR-CTA-003-hubspot-partner-form.audit.md) |
| [FR-CTA-004](cta/FR-CTA-004-ats-jobs-form.md) | CTA | ATS-fed 'We're hiring N' badge + Join form | [10/10](cta/FR-CTA-004-ats-jobs-form.audit.md) |
| [FR-CTA-005](cta/FR-CTA-005-form-validation.md) | CTA | react-hook-form + zod schema-validated forms (a11y first) | [10/10](cta/FR-CTA-005-form-validation.audit.md) |
| [FR-CTA-006](cta/FR-CTA-006-lead-api-endpoint.md) | CTA | /api/lead/route.ts server endpoint posting to HubSpot CRM | [10/10](cta/FR-CTA-006-lead-api-endpoint.audit.md) |
| [FR-CTA-007](cta/FR-CTA-007-lumi-form-reactions.md) | CTA | Lumi reactions to form step changes (mouth_smile / summon) | [10/10](cta/FR-CTA-007-lumi-form-reactions.audit.md) |
| [FR-CTA-008](cta/FR-CTA-008-timezone-clock.md) | CTA | Time-zone-honesty live-clock widget (HCMC + visitor zone + overlap windows) | [10/10](cta/FR-CTA-008-timezone-clock.audit.md) |
| [FR-SCENE-013](scene/FR-SCENE-013-implementation.md) | SCENE | Scene 1 Origin implementation — coil_idle anim around idea-spark + typed captio… | [10/10](scene/FR-SCENE-013-implementation.audit.md) |
| [FR-SCENE-014](scene/FR-SCENE-014-implementation.md) | SCENE | Scene 2 Transformation implementation — paint clip + wireframe morph + pull-quo… | [10/10](scene/FR-SCENE-014-implementation.audit.md) |
| [FR-SCENE-015](scene/FR-SCENE-015-implementation.md) | SCENE | Scene 3 Capabilities implementation — split_to_4 anim + 4 satellites | [10/10](scene/FR-SCENE-015-implementation.audit.md) |
| [FR-SCENE-016](scene/FR-SCENE-016-implementation.md) | SCENE | Scene 4 Team implementation — 10 bokeh avatars + Lumi dim + recruit hook | [10/10](scene/FR-SCENE-016-implementation.audit.md) |
| [FR-SCENE-017](scene/FR-SCENE-017-implementation.md) | SCENE | Scene 5 Vietnam→Global implementation — globe ~6k tri + nonla_appear + arc | [10/10](scene/FR-SCENE-017-implementation.audit.md) |
| [FR-SCENE-018](scene/FR-SCENE-018-implementation.md) | SCENE | Scene 6 CTA Hub implementation — 3 portals + Lumi-turn behaviour | [10/10](scene/FR-SCENE-018-implementation.audit.md) |
| [FR-SCENE-019](scene/FR-SCENE-019-implementation.md) | SCENE | Footer Lumi corner + nón lá persisted + trust signals strip | [10/10](scene/FR-SCENE-019-implementation.audit.md) |
| [FR-SCENE-020](scene/FR-SCENE-020-implementation.md) | SCENE | GSAP scroll-orchestrator timeline binding scenes 0-6 | [10/10](scene/FR-SCENE-020-implementation.audit.md) |
| [FR-SCENE-021](scene/FR-SCENE-021-implementation.md) | SCENE | Mobile compressed scene flow (1+2 merge, 3+4 merge → 5 scenes total) | [10/10](scene/FR-SCENE-021-implementation.audit.md) |
| [FR-SCENE-022](scene/FR-SCENE-022-implementation.md) | SCENE | DPR + particle scaling per breakpoint per master plan §5.5 | [10/10](scene/FR-SCENE-022-implementation.audit.md) |
| [FR-SCENE-023](scene/FR-SCENE-023-implementation.md) | SCENE | `<Detailed>` LOD swap for Lumi at distance > 12m (Scene 5) | [10/10](scene/FR-SCENE-023-implementation.audit.md) |
| [FR-SCENE-024](scene/FR-SCENE-024-implementation.md) | SCENE | Easter-egg nón lá hover-reveal (Recipe G variants) | [10/10](scene/FR-SCENE-024-implementation.audit.md) |

### §11.7 — P5 — Performance / A11y / QA / Localization (23 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-A11Y-006](a11y/FR-A11Y-006-impl.md) | A11Y | Captions for every Lumi line — gold-on-charcoal, 18px min, aria-live polite | [10/10](a11y/FR-A11Y-006-impl.audit.md) |
| [FR-A11Y-007](a11y/FR-A11Y-007-impl.md) | A11Y | Keyboard nav cycle — Skip story → header → scene anchors → footer | [10/10](a11y/FR-A11Y-007-impl.audit.md) |
| [FR-A11Y-008](a11y/FR-A11Y-008-impl.md) | A11Y | Focus rings — 2 px gold outline + 2 px offset, visible on every interactive | [10/10](a11y/FR-A11Y-008-impl.audit.md) |
| [FR-A11Y-009](a11y/FR-A11Y-009-impl.md) | A11Y | Target size 44×44 (AAA) for all CTAs | [10/10](a11y/FR-A11Y-009-impl.audit.md) |
| [FR-A11Y-010](a11y/FR-A11Y-010-impl.md) | A11Y | Form autofill + Redundant-Entry compliance | [10/10](a11y/FR-A11Y-010-impl.audit.md) |
| [FR-A11Y-011](a11y/FR-A11Y-011-impl.md) | A11Y | Public /accessibility compliance documentation page | [10/10](a11y/FR-A11Y-011-impl.audit.md) |
| [FR-A11Y-012](a11y/FR-A11Y-012-impl.md) | A11Y | Full pre-launch axe + manual VO + NVDA audit + fixes | [10/10](a11y/FR-A11Y-012-impl.audit.md) |
| [FR-CMS-009](cms/FR-CMS-009-vi-native-review.md) | CMS | Vietnamese script + UI string review pass by native speaker | [10/10](cms/FR-CMS-009-vi-native-review.audit.md) |
| [FR-CMS-010](cms/FR-CMS-010-vi-tagline-hover.md) | CMS | Lumi hover-reveal Vietnamese tagline | [10/10](cms/FR-CMS-010-vi-tagline-hover.audit.md) |
| [FR-PERF-002](perf/FR-PERF-002-impl.md) | PERF | Lumi LOD-1 variant (~8k tri) for distance + low-memory paths | [10/10](perf/FR-PERF-002-impl.audit.md) |
| [FR-PERF-003](perf/FR-PERF-003-impl.md) | PERF | Per-scene frameloop='demand' for non-animating scenes | [10/10](perf/FR-PERF-003-impl.audit.md) |
| [FR-PERF-004](perf/FR-PERF-004-impl.md) | PERF | Drei <Preload> + intersection-observer prefetch of next-scene GLBs (200% rootMa… | [10/10](perf/FR-PERF-004-impl.audit.md) |
| [FR-PERF-005](perf/FR-PERF-005-impl.md) | PERF | disposeAll audit — geometries / materials / textures / render targets on unmount | [10/10](perf/FR-PERF-005-impl.audit.md) |
| [FR-PERF-006](perf/FR-PERF-006-impl.md) | PERF | Linting rule — no allocations in useFrame; Vector3/Quaternion useMemo'd | [10/10](perf/FR-PERF-006-impl.audit.md) |
| [FR-PERF-007](perf/FR-PERF-007-impl.md) | PERF | scheduler.yield() + scheduler.postTask() for INP < 200ms p75 | [10/10](perf/FR-PERF-007-impl.audit.md) |
| [FR-PERF-008](perf/FR-PERF-008-impl.md) | PERF | Draw-call ceiling — < 100 per scene at any moment; instancing audit | [10/10](perf/FR-PERF-008-impl.audit.md) |
| [FR-PERF-009](perf/FR-PERF-009-impl.md) | PERF | navigator.deviceMemory < 4 → LOD-1 + no post-processing + dpr=[1,1] | [10/10](perf/FR-PERF-009-impl.audit.md) |
| [FR-PERF-010](perf/FR-PERF-010-impl.md) | PERF | navigator.connection.saveData → auto-prompt switch to /lite | [10/10](perf/FR-PERF-010-impl.audit.md) |
| [FR-SEO-002](seo/FR-SEO-002-impl.md) | SEO | Service schema sub-blocks per capability | [10/10](seo/FR-SEO-002-impl.audit.md) |
| [FR-SEO-003](seo/FR-SEO-003-impl.md) | SEO | Person schema for the founder bio anchor | [10/10](seo/FR-SEO-003-impl.audit.md) |
| [FR-SEO-004](seo/FR-SEO-004-impl.md) | SEO | OpenGraph + Twitter summary_large_image meta with 1200×630 hero render | [10/10](seo/FR-SEO-004-impl.audit.md) |
| [FR-SEO-005](seo/FR-SEO-005-impl.md) | SEO | <title> ≤ 60 chars + meta-description ≤ 158 chars (EN + VI) | [10/10](seo/FR-SEO-005-impl.audit.md) |
| [FR-SEO-006](seo/FR-SEO-006-impl.md) | SEO | XML sitemap + robots.txt + canonical | [10/10](seo/FR-SEO-006-impl.audit.md) |

### §11.8 — P6 — Soft Launch + Iteration (12 additional FRs)

| FR-ID | Module | Title | Audit score |
|---|---|---|:-:|
| [FR-A11Y-013](a11y/FR-A11Y-013-IMPL.md) | A11Y | Monthly post-launch axe-core CI scan + quarterly manual review | [10/10](a11y/FR-A11Y-013-IMPL.audit.md) |
| [FR-CMS-011](cms/FR-CMS-011-IMPL.md) | CMS | Quarterly content refresh cadence — new case study + refreshed metrics | [10/10](cms/FR-CMS-011-IMPL.audit.md) |
| [FR-CTA-009](cta/FR-CTA-009-IMPL.md) | CTA | HubSpot deal-stage routing — buy / partner / join into separate pipelines | [10/10](cta/FR-CTA-009-IMPL.audit.md) |
| [FR-CTA-010](cta/FR-CTA-010-IMPL.md) | CTA | Form error states + retry logic + abandonment-prevention | [10/10](cta/FR-CTA-010-IMPL.audit.md) |
| [FR-CTA-011](cta/FR-CTA-011-IMPL.md) | CTA | A/B testbed — one test per month per master plan §12.2 | [10/10](cta/FR-CTA-011-IMPL.audit.md) |
| [FR-OPS-014](ops/FR-OPS-014-IMPL.md) | OPS | Production deployment + DNS + CDN (Vercel or equivalent) | [10/10](ops/FR-OPS-014-IMPL.audit.md) |
| [FR-OPS-015](ops/FR-OPS-015-IMPL.md) | OPS | Awwwards / FWA / SOTY submission packet | [10/10](ops/FR-OPS-015-IMPL.audit.md) |
| [FR-OPS-016](ops/FR-OPS-016-IMPL.md) | OPS | Soft-launch partner-share URL (gated) for week-8 proof-of-concept | [10/10](ops/FR-OPS-016-IMPL.audit.md) |
| [FR-PERF-011](perf/FR-PERF-011-IMPL.md) | PERF | Post-launch RUM (Real User Monitoring) dashboard via Plausible + web-vitals | [10/10](perf/FR-PERF-011-IMPL.audit.md) |
| [FR-SEO-007](seo/FR-SEO-007-IMPL.md) | SEO | GA4 + Plausible dual-pipe via /api/analytics cookieless proxy | [10/10](seo/FR-SEO-007-IMPL.audit.md) |
| [FR-SEO-008](seo/FR-SEO-008-IMPL.md) | SEO | Analytics event taxonomy per master plan §8.4 (10 events) | [10/10](seo/FR-SEO-008-IMPL.audit.md) |
| [FR-SEO-009](seo/FR-SEO-009-IMPL.md) | SEO | web-vitals dashboard wired to Plausible custom events | [10/10](seo/FR-SEO-009-IMPL.audit.md) |

**P0 is fully audited.** All P0 FRs are at `status: accepted` with 10/10 audit scores. The phase gate (founder signoff on script + character sheet + mood board) is satisfied.

---
## §12 — Open backlog management

- **Adding an FR:** see [`../FR_AUTHORING_WORKFLOW.md`](../FR_AUTHORING_WORKFLOW.md) §3 + §4. Dense numbering within the module — never skip an FR-ID.
- **Changing a shipped FR:** open a successor FR (e.g. `FR-WEB-001a-...`) with `related_frs: [FR-WEB-001]` and `superseded_by` on the original. Don't edit in place.
- **Reprioritising:** edit the per-section table here AND the FR's frontmatter `priority` field. Both must agree.
- **Status flow:** `draft → audited → accepted → building → shipped` (or `deferred` / `rejected` / `superseded`). The audit `.audit.md` companion file must reach 10/10 before `accepted`.
- **BRAIN audit row:** every status transition SHOULD emit an audit row via the canonical Writer subprocess at `.cyberos-memory/audit/current.binlog` once the cyberos toolchain is invoked from this repo. Until then, the FR markdown frontmatter is the source of truth.

---

*End of BACKLOG.md v0.1.0. Companion: `FR_AUTHORING_WORKFLOW.md`.*
