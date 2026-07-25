# Decision: Lumi Phase 3 — forms, tags, cards, icons from the design system

> **Migration summary (Phases 0–4):** see [`2026-07-25-lumi-ds-migration-complete.md`](./2026-07-25-lumi-ds-migration-complete.md). This note remains the Phase 3 record.

**Date:** 2026-07-25
**Status:** Adopted (Phase 3 of Lumi → 100% design-system migration)
**Supersedes (in part):** deferred Field/Select/Card/Dialog notes in [`2026-07-25-lumi-ds-phase2-buttons.md`](./2026-07-25-lumi-ds-phase2-buttons.md)
**Owner:** CyberSkill Engineering

---

## 1. Context

After Phase 2, every button was a package button. Forms, keyword chips, generic panels, and the nine line icons still used hand markup (`.cs-field`, `.cs-tag`, local `components/ui/{Field,Select,Card,Dialog,Icon}`, `lib/icons`). Package styles for those contracts already ship via `app/cs-package.css` (`forms.css`, `feedback.css`, `data.css`, `glass.css`).

## 2. Decision

1. **Forms use package field controls.** `LeadForm`, `NewsletterForm`, and `TalentPoolForm` render `TextField` / `Textarea` / `Select` / `Checkbox` from `@cyberskill/design` (via `lib/design-system/forms.tsx`). Analytics wrappers stay: `react-hook-form` + zod on the lead form, honeypots, Clarity masks, and `emit(...)`.
2. **Do not force the package `Form` controller.** Its `onSubmit(values)` / rules API would replace the existing lead pipeline. Native `<form className="cs-form">` plus package fields is the mapping that preserves behaviour.
3. **Tags use package `Tag`.** Work and services keyword/tech chips import `Tag` from `lib/design-system/tag.tsx`. Layout stays on `.cs-tag-row`; tech chips may add the local `cs-tag-tech` modifier. Package owns `.cs-tag`.
4. **Cards where they map.** Generic content panels (lead success, talent success, contact aside, careers talent CTA shell) use package `Card` composed with `.cs-surface-*` for glass. Storytelling surfaces — work cards, service cards, header chrome, metric tiles, prose cards, lite panels — stay class-only on package/local glass materials. No new package card variants.
5. **Icons are the package set.** All nine Lumi names match the package `Icon` set 1:1. `lib/design-system/icon.tsx` re-exports; `components/ui/Icon.tsx` is a thin path-compat wrapper. Local `lib/icons` is deleted.
6. **Delete unused locals.** `components/ui/{Field,Select,Dialog,Card}.tsx` had no production call sites (tests only) and are removed.

## 3. Kept local (not DS gaps)

| Surface | Why |
|---|---|
| Genie message rows (`.cs-genie-msg*`) | Package `ChatMessage` adds avatar/name columns that fight the painted cloud chrome and scene-orbit Lumi. |
| Genie free-text input (`.cs-genie-form`) | Package `PromptInput` is a multi-line ask box with disclosure hint + bar; the cloud needs a compact single-line field with `inputMode` / wish-step wiring. |
| Wish field, messaging chips, BrandIcon | Storytelling / product chrome, not interactive DS primitives. |
| `.cs-surface-*` on layout cards | Liquid Glass materials for cosmos storytelling; package glass classes stay available, applied without forcing `.cs-card`. |
| Dark `.cs-field__control` fill `#1a120c` | Lumi contrast on dark raised controls; package tokens stay the role SoT. |
| Space Grotesk, 3D/cosmos/motion | Unchanged from Phase 1–2. |

## 4. Verification

- `tests/ds-phase3-forms-polish.test.ts` — whole-tree gates: dead ui primitives gone; forms import package fields; tag pages use `Tag`; Icon re-export; globals do not redefine `.cs-field` / `.cs-tag`; genie stays local; decision + README pointers.
- `tests/ui-primitives.test.ts` — package Card / TextField / Select / Tag / Icon + axe.
- `scripts/probe-ds-phase3.mjs` — computed-style presence of `.cs-tag` / `.cs-card` on work / careers / home (EN·VI × dark·light × 390/1440). Home `.cs-field` is asserted only when `PROBE_EXPECT_NEWSLETTER=1` after an SSG build with `RESEND_API_KEY` (newsletter is env-gated).
- `npm test`, `tsc --noEmit`, `next build`, `npm run check:ds:buttons` stay green.

## 5. Out of scope (later)

- ~~Full “100%” grep/CI proof sweep and keep-local inventory polish~~ → **Done in Phase 4** — [`2026-07-25-lumi-ds-migration-complete.md`](./2026-07-25-lumi-ds-migration-complete.md), [`docs/ds-keep-local-inventory.md`](../ds-keep-local-inventory.md)
- Inventing DS variants for genie chrome or brand icons (still a non-goal)

## 6. Related

- Migration plan: Lumi full DS migration (Phase 3)
- Prior: [`2026-07-25-lumi-ds-phase2-buttons.md`](./2026-07-25-lumi-ds-phase2-buttons.md), [`2026-07-25-lumi-ds-phase1-fonts-tokens.md`](./2026-07-25-lumi-ds-phase1-fonts-tokens.md)
