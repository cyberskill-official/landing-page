# Decision: Lumi Phase 1 — fonts + package token SoT

**Date:** 2026-07-25  
**Status:** Adopted (Phase 1 of Lumi → 100% design-system migration)  
**Supersedes (in part):** deferred items in [`2026-07-24-cyberskill-design-package.md`](./2026-07-24-cyberskill-design-package.md) (fonts reconcile + token SoT prep)  
**Owner:** CyberSkill Engineering

---

## 1. Context

First-slice adoption installed `@cyberskill/design@1.0.0` and imported package `styles.css`. That entry `@import`s `tokens/fonts.css` with `font-display: swap`, while Lumi already loads Be Vietnam Pro + Space Grotesk via `DeferredFonts` + `/fonts/brand-fonts.css` with `font-display: optional`. That is a double font load and a CLS risk.

Hand-ported semantics in `app/globals.css` also overwrote package token names (`--cs-color-text-primary` ← storytelling, etc.), so the package was not the source of truth.

Phase 0 (bundler-native React export) is tracked separately; this Phase 1 does **not** wait on it and does **not** migrate remaining `.cs-btn` primitives (Phase 2).

## 2. Decision

1. **Stop importing** `@cyberskill/design/styles.css`. Load package tokens + base through [`app/cs-package.css`](../../app/cs-package.css) — the same sheets as `styles.css` **except** `tokens/fonts.css`.
2. **Keep** `DeferredFonts` + self-hosted `/fonts/brand-fonts.css` (`font-display: optional`) and **Space Grotesk** as the Lumi display face (not in DS 1.0.0 typography).
3. **Package owns** semantic `--cs-*` roles (colour / type family / spacing / elevation / motion / element packs). `globals.css` aliases storytelling names (`--cs-color-fg`, `--cs-color-bg`, …) **onto** package tokens and retains locals only for cosmos / genie / motion / scene / glass storytelling / fluid display type / CTA ink.
4. **Do not** redefine package semantics in globals (no overwrite of `--cs-color-text-primary`, `--cs-color-surface-page`, `--cs-space-*`, …). Documented local exception: dark `--cs-color-fg-muted: #dcd2c3` for APCA body muted on the dark page.
5. **Regenerate** [`lib/critical-css.ts`](../../lib/critical-css.ts) to mirror the alias direction and package dark surfaces.
6. **Identity unchanged:** `data-cs-element="hoa" data-cs-variant="plasma"` on `<html>`.

## 3. Out of scope (later phases)

- Button / CTA sweep (`.cs-btn` → package `Button` / `Link`) — waits on DS React export publish where needed.
- Forms, tags, cards, icons migration.
- Grep/CI proof of “100%” and README keep-local inventory (Phase 4).

## 4. Related

- Migration plan: Lumi full DS migration (Phase 1)
- Prior decision: `docs/decisions/2026-07-24-cyberskill-design-package.md`
- Design-system: `docs/consuming.md`, `docs/products.md`
