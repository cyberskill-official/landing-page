# CyberSkill landing page

An interactive storytelling landing page for CyberSkill, with Lumi the golden genie as the guide and a Claude-powered chat. Built fresh to the research doc (`docs/Research Foundations ... (PRD + SRS Basis).md`) under the CyberOS workflow.

Slogan: Turn Your Will Into Real. Goals, in order: lead generation, portfolio, recruiting.

## Status

| Phase | What | State |
|---|---|---|
| P0 | Design-system tokens hand-ported to `--cs-*` | done |
| P0 | `@cyberskill/design@1.0.0` first-slice install (styles + Lumi identity + live Button) | done — see below |
| P1 | HTML-first conversion core (SSR, lead form, EN/VN, SEO, a11y) | done |
| P2 | Lumi chat via keyless `/api/genie` proxy (text-first) | done (needs API key at runtime) |
| P3 | 3D scroll-storytelling scaffold + perf gate | done, with a procedural placeholder |
| P3 | Commissioned golden-genie GLB | deferred (`TASK-CHAR-021`, needs the art asset) |

The Phase-1 base is the product: it ranks and converts even if the 3D and chat never load. Everything after Phase 1 is layered enhancement.

## Design system (`@cyberskill/design@1.0.0`)

Lumi consumes the published CyberSkill design package (portfolio grant; package remains UNLICENSED).

| | |
|---|---|
| **Identity** | `data-cs-element="hoa" data-cs-variant="plasma"` on `<html>` (locked in design-system `docs/products.md`) |
| **Styles** | `app/cs-package.css` (package tokens + base, **no** `fonts.css`) then `app/globals.css` (storytelling aliases + cosmos/genie/motion/scene) |
| **Fonts** | `DeferredFonts` + `/fonts/brand-fonts.css` (`font-display: optional`); Space Grotesk display |
| **Buttons** | Every button is a package button — the `Button` component on real `<button>`s, `.cs-button--*` classes on anchors/`Link`. Lumi's pill and gold CTA come from `--cs-component-button-*` tokens, not from restyling `.cs-button` |
| **Forms / tags / cards / icons** | Package `TextField`/`Select`/`Textarea`/`Checkbox`, `Tag`, `Card` (+ surface classes), and `Icon` via `lib/design-system/*`. Analytics wrappers stay on the CTA forms. Genie cloud chrome stays local |
| **Import path** | `lib/design-system/button.tsx` (and forms/tag/card/icon) re-export from `@cyberskill/design` (bundler-native `_esm/react.mjs`, React as a peer dep) |
| **Decisions** | First slice: `docs/decisions/2026-07-24-cyberskill-design-package.md` · Phase 1 fonts/tokens: `docs/decisions/2026-07-25-lumi-ds-phase1-fonts-tokens.md` · Phase 2 buttons: `docs/decisions/2026-07-25-lumi-ds-phase2-buttons.md` · Phase 3 forms/tags/cards/icons: `docs/decisions/2026-07-25-lumi-ds-phase3-forms-polish.md` |

The dependency is pinned to a design-system **commit** rather than `1.0.0`: the published `1.0.0` tarball predates the React entry, and npm versions are immutable, so it can never be republished with one. Revisit at LAUNCH — see the Phase 2 decision note.

**Kept local (storytelling, not design-system gaps):** the R3F/3D scene, cosmos CSS, scroll/motion choreography, genie cloud chrome (message rows + prompt), Space Grotesk as display face, button motion modifiers (`cs-cta-lumi`, `cs-lumi-alt`, `cs-wish-go`, `cs-header-cta`, `cs-footer-verify-btn`), and layout-specific glass surfaces (work/service cards, header).

**Deferred:** the “100%” proof sweep (Phase 4).

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

All secrets are server-side only; never prefix a secret with `NEXT_PUBLIC_`. See `.env.example`. The chat returns a graceful "use the contact form" message when `ANTHROPIC_API_KEY` is unset, so the site is fully usable without it.

- `ANTHROPIC_API_KEY` - enables the Genie. Server env only.
- `GENIE_MODEL` (default `claude-haiku-4-5-20251001`), `GENIE_MAX_TOKENS`.
- `LEAD_SLACK_WEBHOOK_URL`, `LEAD_CRM_WEBHOOK_URL` - optional lead routing.
- `NEXT_PUBLIC_SITE_URL` - public canonical base (safe to expose).
- `NEXT_PUBLIC_CLARITY_ID` - Microsoft Clarity project id (cookieless session replay; production + consent-gated).

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
docs/                   research doc, tasks (task), NFRs, verification
.cyberos-memory/        BRAIN decision records
.awh/                   evidence-gate logs (promotion + evolution)
```

## CyberOS workflow

This repo follows `AGENTS.md` (the CyberOS overlay). Work is tracked as feature requests in `docs/tasks/` (index: `BACKLOG.md`), constrained by `docs/non-functional-requirements/`, with decisions logged in `.cyberos-memory/decisions/` and the testing-to-done evidence gate in `.awh/`. This build ran on branch `auto/landing-page-cyberos`.

## Deploy

Vercel is the recommended host (native Next.js, Edge/Fluid streaming for the chat proxy, preview deploys, Speed Insights). Set the env vars above in the Vercel project. The 3D chunk is code-split and desktop/motion-gated, so mobile gets the static poster.

## Deferred (tracked)

- `TASK-CHAR-021`: commission/buy and optimise the golden-genie GLB (Draco+KTX2, Mixamo rig, ARKit visemes); swap it in behind the existing loader/gate.
- Live Core Web Vitals + axe + VoiceOver/NVDA passes on a deployed build.
- Confirm whether a private `@cyberskill/*` token package exists (Phase 0 open question); if so, switch from hand-ported tokens to consuming it.
