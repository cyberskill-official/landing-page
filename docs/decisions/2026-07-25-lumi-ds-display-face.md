# Decision: Adopt DS display face (`--cs-font-family-display` / `.cs-display-face`)

**Date:** 2026-07-25  
**Status:** Adopted  
**Owner:** CyberSkill Engineering  
**Related:** Design-system PR #34 (`3edeb135…`), Phase 1 fonts note, keep-local inventory

---

## 1. Context

Phase 1 kept Space Grotesk as a **Lumi-local** display exception: ad-hoc `public/fonts/brand-fonts.css` + hashed Google woff2s + `--cs-font-display: "Space Grotesk"`, while skipping package `tokens/fonts.css` because it ships `font-display: swap` (CLS risk against DeferredFonts).

Design-system tip now ships `--cs-font-family-display` (Space Grotesk, variable 300–700, Vietnamese subset) and the opt-in utility `.cs-display-face`. Consuming docs say products like Lumi can drop the ad-hoc display exception.

---

## 2. Decision

1. **Bump** `@cyberskill/design` git pin to `3edeb1350c2e48761bee18f7c10c323e6103ff7d`.
2. **Role from package:** `--cs-font-sans` / `--cs-font-display` alias `--cs-font-family-ui` / `--cs-font-family-display`. `<html class="cs-display-face">` retargets `--cs-heading-family` for headings.
3. **Bytes stay deferred + optional:** still skip critical-path `fonts.css`. `scripts/sync-ds-fonts.mjs` (postinstall + `npm run sync:ds:fonts`) copies a Lumi-needed subset of package faces (Be Vietnam Pro 400–700 + Space Grotesk variable; no mono/italics) → `public/fonts/ds/` and rewrites them into `public/fonts/brand-fonts.css` with `font-display: optional`. DeferredFonts still discovers that sheet after idle/interaction — **no post-paint CSS-variable mutation**.
4. **Remove** ad-hoc hashed Be Vietnam Pro / Space Grotesk woff2s under `public/fonts/` (superseded by synced package faces).
5. **Keep local** storytelling (cosmos / genie / motion / 3D) unchanged. Display face is **no longer** a keep-local exception.

---

## 3. Why not import package `fonts.css` directly?

Package faces use `font-display: swap`. Loading them on the critical CSS path (or alongside optional faces) reintroduces the field CLS class of bug DeferredFonts was built to avoid. The sync rewrite is the documented consumer path: package **role** + local **optional** loading strategy.

---

## 4. Out of scope

- Design-system `VERSION` / LAUNCH / Code Connect / Status Hub
- Changing storytelling keep-locals (Genie, R3F, cosmos, motion)

---

## 5. Verification

- `npm run sync:ds:fonts` / postinstall regenerates `brand-fonts.css` without `swap`
- `npm run check:ds:tokens`, focused font/DS vitests, `typecheck`
- `npm run check:ds:live` when a base URL is available
