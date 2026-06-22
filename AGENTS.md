# AGENTS.md - CyberSkill landing page (CyberOS overlay)

This repository is built under the CyberOS workflow. This file is the project
overlay; the normative base is the CyberOS Layer-1 Memory Protocol in
`cyberos/AGENTS.md` (the BRAIN/memory spec). Where this overlay is silent, the
base protocol governs.

## §0 Precedence

An explicit user instruction in the active session wins. Then this overlay.
Then assistant defaults. Genuine protocol changes come from the user.

## §1 What this project is

A Next.js (App Router) interactive storytelling landing page for CyberSkill,
specified by `docs/Research Foundations for the CyberSkill Interactive
Storytelling Landing Page (PRD + SRS Basis).md`. Mascot: Lumi, the golden genie.
Three goals at once: lead generation (primary), portfolio, recruiting.

## §2 Module catalogue (closed set)

`DS` design system / tokens · `WEB` web foundation + routing · `SCENE` 3D scene
+ scroll choreography · `CHAR` Lumi (3D model + chat persona) · `CTA`
conversion + forms · `CMS` content + copy + i18n · `SEO` discoverability ·
`A11Y` accessibility · `PERF` performance budgets · `OPS` build, CI, deploy.

An FR id is `FR-<MODULE>-<NNN>`.

## §3 Phase model (from the research doc staged plan)

- `P0` Resolve the design-system dependency (Phase 0 blocker).
- `P1` HTML-first conversion core (must hit lead-gen KPIs alone, no 3D).
- `P2` Claude chat Genie, text-first (keyless serverless proxy).
- `P3` 3D Genie + scroll storytelling (gated behind the perf budget; ships with
  the static fallback in the same change, never after).

Status flow: `draft -> audited -> accepted -> building -> shipped`
(or `deferred` / `superseded`). An FR cannot enter `building` until every
`depends_on` FR is `shipped`.

## §4 Non-negotiables (enforced, not aspirational)

1. HTML-first. Every meaningful state (H1, value prop, services, CTA, contact)
   is server-rendered DOM before WebGL boots. The canvas never owns LCP.
2. The Anthropic API key lives only in server env. The browser calls
   `/api/genie`; it never sees the key. No `NEXT_PUBLIC_` secret, ever.
3. Progressive enhancement. The 3D scene is code-split, desktop-and-motion-gated,
   and ships with its static poster fallback in the same change.
4. Accessibility floor: WCAG 2.2 AA. `prefers-reduced-motion` honoured plus a
   manual toggle. A DOM-text mirror (`/[lang]/lite`) exists for the story.
5. Vietnamese-first: every UI string ships EN and VN; each locale is a crawlable
   URL with hreflang.
6. Token discipline: colours derive from the doctrine anchors (Umber, Ochre) via
   `--cs-*` custom properties. No magic hex in components.
7. Performance budget in CI (`lighthouse/budget.json`): the build fails if the
   LCP budget regresses past 2500ms.

## §5 Evidence gate (awh)

Work is "done" only when the evidence gate passes. The gate ledger lives in
`.awh/promotion-log.jsonl` (PROMOTE/HOLD per FR/slice) and
`.awh/evolution-log.jsonl`. Decision records live in `.cyberos-memory/decisions/`.
In a sandbox that cannot run `next build`, the gate records what was statically
verified and what is deferred to the operator's machine - it never claims a
green build it did not run.

## §6 Build conventions

Next 15 App Router, React 19, TypeScript strict. Single app at repo root.
R3F v9 + drei + three for the scene; GSAP + Lenis for scroll; Zustand for the
Genie state machine; Zod + react-hook-form for forms. No Tailwind: tokens and
component classes are authored in `app/globals.css`.
