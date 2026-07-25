# Lumi keep-local inventory (DS vs storytelling)

**Date:** 2026-07-25  
**Status:** Normative for Phase 4 “100% DS adoption for what maps”  
**Related:** [`docs/decisions/2026-07-25-lumi-ds-migration-complete.md`](./decisions/2026-07-25-lumi-ds-migration-complete.md), [`docs/ds-coverage-report.md`](./ds-coverage-report.md)

This inventory is the locked boundary. Surfaces listed under **Keep local** are intentional product/storytelling layers — not design-system gaps and not candidates for inventing DS variants.

---

## DS-owned (must use `@cyberskill/design`)

| Surface | How Lumi consumes it | Cite |
|---|---|---|
| Semantic colour / type / spacing / elevation / motion / element packs | Package token sheets via `app/cs-package.css` (no `fonts.css`) | `app/cs-package.css`, Phase 1 decision |
| Component base CSS (buttons, fields, tags, cards, glass, a11y, …) | Same `cs-package.css` imports of `base/*.css` | `app/cs-package.css` |
| Identity | `data-cs-element="hoa" data-cs-variant="plasma"` on `<html>` | `app/layout.tsx`, design-system `docs/products.md` |
| Button | Package `Button` + `.cs-button--*` on anchors/`Link` | `lib/design-system/button.tsx`, CTA wrappers, Phase 2 |
| Form controls | `TextField` / `Textarea` / `Select` / `Checkbox` | `lib/design-system/forms.tsx`, `components/cta/{Lead,Newsletter,TalentPool}Form.tsx` |
| Tag | Package `Tag` | `lib/design-system/tag.tsx`, work/services pages |
| Card (mappable panels) | Package `Card` + `.cs-surface-*` | `lib/design-system/card.tsx`, lead/talent success, contact aside, careers shell |
| Line icons (9 names) | Package `Icon` | `lib/design-system/icon.tsx`, `components/ui/Icon.tsx` |
| Display / UI / mono families | Package `--cs-font-family-*` tokens; `.cs-display-face` on `<html>`; bytes via DeferredFonts + synced optional `brand-fonts.css` | `app/layout.tsx`, `scripts/sync-ds-fonts.mjs`, [`2026-07-25-lumi-ds-display-face.md`](./decisions/2026-07-25-lumi-ds-display-face.md) |

**Import rule:** only the official package export (`exports["."]` → `_esm/react.mjs`). No Next/tsconfig alias to a raw `Button.jsx`. Thin re-exports live under `lib/design-system/*`.

**Dependency pin:** `github:cyberskill-official/design-system#<40-char-sha>` until LAUNCH (npm `1.0.0` tarball predates the React entry; versions are immutable). See coverage report §LAUNCH.

---

## Documented bridge (globals may touch these — and only these — package names)

Enforced by `scripts/check-ds-token-sot.mjs` / `npm run check:ds:tokens`:

| Override | Why |
|---|---|
| `--cs-component-button-radius` | Lumi pill silhouette via package component token |
| `--cs-component-button-primary-bg` / `-fg` | Pinned gold CTA (Lighthouse contrast contract); not a new variant |
| `--cs-color-brand-umber` under `@supports (display-p3 …)` | Richer umber on P3 displays; sRGB hex stays package SoT |

Everything else in `app/globals.css` is either a **storytelling alias** onto package roles (`--cs-color-fg` → `var(--cs-color-text-primary)`, …), a **local extension** the package never declares (`--cs-space-32`, glass tint ramps, fluid `--cs-text-*`, `--cs-dur-*`), or scene/genie/motion CSS.

Documented local exception (alias, not a package name): dark `--cs-color-fg-muted: #dcd2c3` for APCA body muted.

`lib/critical-css.ts` mirrors package semantics + the dark muted override for first-paint inlining — a perf bridge, not a second SoT.

---

## Keep local (storytelling — not DS failures)

| Surface | Why local | Cite |
|---|---|---|
| R3F / 3D canvas, GLB Lumi, poster | Product scene; not a DS primitive | `components/canvas/*` |
| Cosmos / scene / chapter CSS | Scroll-story atmosphere | `app/globals.css` (cosmos/scene sections), `components/scroll/*` |
| Motion choreography (GSAP, kinetic type, aurora, black hole, …) | Storytelling motion; selectors target `.cs-button` where needed | `components/motion/*` |
| Genie cloud chrome | Painted cloud + orbit Lumi; package `ChatMessage` / `PromptInput` fight the layout (avatar/name columns + multi-line ask box). **Do not migrate** — [`docs/decisions/2026-07-25-lumi-genie-chat-keep-local.md`](./decisions/2026-07-25-lumi-genie-chat-keep-local.md) | `components/genie/GenieChatPanel.tsx` (`.cs-genie-msg*`, `.cs-genie-form`) |
| Wish field / hero wish | Scene-wired single-line wish UX | `components/genie/{WishForm,HeroWish,HeroWishStatic}.tsx` |
| Messaging chips (WhatsApp / Zalo) + `BrandIcon` | Product/channel chrome, not DS icons | `components/cta/MessagingChips.tsx`, `components/ui/BrandIcon.tsx` |
| DeferredFonts / optional face loading | CLS perf strategy (rewrites package `fonts.css` swap → optional); not a second display SoT | `components/DeferredFonts.tsx`, `scripts/sync-ds-fonts.mjs`, `public/fonts/brand-fonts.css` |
| Button motion / layout modifiers on DS roots | Allowlisted only: `cs-cta-lumi`, `cs-lumi-alt`, `cs-wish-go`, `cs-header-cta`, `cs-footer-verify-btn` | `app/globals.css`, `tests/ds-phase2-buttons.test.ts` |
| Layout glass without forcing `.cs-card` | Work/service cards, header, metric tiles, lite panels | `components/sections/*`, `components/header/SiteHeader.tsx`, work/services pages |
| Dark `.cs-field__control` fill `#1a120c` | Contrast on dark raised controls; package owns field layout | `app/globals.css` |
| Analytics / honeypot / Clarity wrappers | App behaviour around DS fields | `LeadForm`, `CtaLink`, consent |
| Critical CSS inlining | Perf layer regenerated from package + aliases | `lib/critical-css.ts` |
| Lead / talent pool route chrome | Live CTAs are Genie-primary (`GenieOpenButton`); `LeadForm` / `TalentPoolForm` remain DS-migrated components for tests and future mounts. Newsletter footer mounts only when `RESEND_API_KEY` is set at SSG build time | `components/cta/{Lead,TalentPool,Newsletter}Form.tsx`, `app/[lang]/layout.tsx` |

---

## Explicit non-goals (still)

- Inventing DS `lumi` / `brand` button variants
- Porting 3D / cosmos / genie art into the design system
- Bumping design-system `VERSION` / CHANGELOG / open license
- Migrating CyberOS Status Hub or other products
