# CyberSkill landing page

An interactive storytelling landing page for CyberSkill, with Lumi the golden
genie as the guide and a Claude-powered chat. Built fresh to the research doc
(`docs/Research Foundations ... (PRD + SRS Basis).md`) under the CyberOS
workflow.

Slogan: Turn Your Will Into Real. Goals, in order: lead generation, portfolio,
recruiting.

## Status

| Phase | What | State |
|---|---|---|
| P0 | Design-system tokens hand-ported to `--cs-*` | done |
| P1 | HTML-first conversion core (SSR, lead form, EN/VN, SEO, a11y) | done |
| P2 | Lumi chat via keyless `/api/genie` proxy (text-first) | done (needs API key at runtime) |
| P3 | 3D scroll-storytelling scaffold + perf gate | done, with a procedural placeholder |
| P3 | Commissioned golden-genie GLB | deferred (`FR-CHAR-021`, needs the art asset) |

The Phase-1 base is the product: it ranks and converts even if the 3D and chat
never load. Everything after Phase 1 is layered enhancement.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY to enable Lumi chat
npm run dev                  # http://localhost:3000  (redirects to /en)
```

Build and checks:

```bash
npm run verify      # static import + JSON gate (no deps needed)
npm run typecheck   # tsc --noEmit
npm run build       # next build
```

## Environment

All secrets are server-side only; never prefix a secret with `NEXT_PUBLIC_`.
See `.env.example`. The chat returns a graceful "use the contact form" message
when `ANTHROPIC_API_KEY` is unset, so the site is fully usable without it.

- `ANTHROPIC_API_KEY` - enables the Genie. Server env only.
- `GENIE_MODEL` (default `claude-haiku-4-5-20251001`), `GENIE_MAX_TOKENS`.
- `LEAD_SLACK_WEBHOOK_URL`, `LEAD_CRM_WEBHOOK_URL` - optional lead routing.
- `NEXT_PUBLIC_SITE_URL` - public canonical base (safe to expose).

## Structure

```
app/
  layout.tsx            root: owns <html lang>, set per-locale via middleware
  [lang]/               en + vi routes (layout, home, work, careers, lite)
  api/lead, api/genie   server route handlers (lead capture, keyless Claude proxy)
  globals.css           CyberSkill tokens (--cs-*) + component styles
  sitemap.ts, robots.ts
components/
  sections/             SSR home sections (hero -> contact)
  cta/                  lead form + persistent CTA
  genie/                chat widget + state machine + open trigger
  canvas/               R3F scene, Lumi placeholder, capability gate, poster
  scroll/, motion/, seo/, header/, footer/, a11y/
lib/
  content/site.ts       bilingual content + company facts (single source)
  i18n/                 locale config + EN/VN dictionaries
  genie/                persona + Zustand store
  lead/, scroll/
docs/                   research doc, feature-requests (FR), NFRs, verification
.cyberos-memory/        BRAIN decision records
.awh/                   evidence-gate logs (promotion + evolution)
```

## CyberOS workflow

This repo follows `AGENTS.md` (the CyberOS overlay). Work is tracked as feature
requests in `docs/feature-requests/` (index: `BACKLOG.md`), constrained by
`docs/non-functional-requirements/`, with decisions logged in
`.cyberos-memory/decisions/` and the testing-to-done evidence gate in `.awh/`.
This build ran on branch `auto/landing-page-cyberos`.

## Deploy

Vercel is the recommended host (native Next.js, Edge/Fluid streaming for the
chat proxy, preview deploys, Speed Insights). Set the env vars above in the
Vercel project. The 3D chunk is code-split and desktop/motion-gated, so mobile
gets the static poster.

## Deferred (tracked)

- `FR-CHAR-021`: commission/buy and optimise the golden-genie GLB (Draco+KTX2,
  Mixamo rig, ARKit visemes); swap it in behind the existing loader/gate.
- Live Core Web Vitals + axe + VoiceOver/NVDA passes on a deployed build.
- Confirm whether a private `@cyberskill/*` token package exists (Phase 0 open
  question); if so, switch from hand-ported tokens to consuming it.
