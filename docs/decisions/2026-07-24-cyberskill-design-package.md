# Decision: adopt `@cyberskill/design@1.0.0` (first slice)

**task:** TASK-DS-005  
**Date:** 2026-07-24  
**Status:** Adopted (first slice)  
**Owner:** CyberSkill Engineering

---

## 1. Context

Phase 0 left open whether published CyberSkill design packages were installable. Historical names (`@cyberskill/tokens`, `@cyberskill/react`, `@cyberskill/style-packs`) are not the install path. The published monolith is **`@cyberskill/design@1.0.0`** (UNLICENSED; portfolio use covered by the design-system `docs/consumer-grant.md`). Lumi is locked to Hỏa · plasma in design-system `docs/products.md`.

## 2. Decision

1. **Install** `@cyberskill/design@1.0.0` (exact pin) as a production dependency.
2. **Import** `@cyberskill/design/styles.css` in `app/layout.tsx`, then `app/globals.css` so storytelling overrides win on equal specificity.
3. **Scope** Lumi identity on `<html>`: `data-cs-element="hoa" data-cs-variant="plasma"` (theme/`lang` unchanged).
4. **Live component:** consent banner Accept/Decline use the package `Button` via a Next-safe alias to published `components/button/Button.jsx` (see below). In-repo `.cs-btn` primitives remain for the rest of the storytelling UI.
5. **Bridge** package token names (`--cs-color-text-primary`, `--cs-color-surface-page`, …) to storytelling names (`--cs-color-fg`, `--cs-color-bg`, …) in `globals.css`.

## 3. Install evidence

```bash
npm install @cyberskill/design@1.0.0 --save-exact
npm view @cyberskill/design@1.0.0 name version license
# → @cyberskill/design / 1.0.0 / UNLICENSED
```

Registry install succeeded from the public npm registry under this project’s credentials. No private registry is required for the monolith package.

## 4. Package main JS export (Phase 2 resolution)

> **Resolved in Phase 2** — see `2026-07-25-lumi-ds-phase2-buttons.md`.

The design system ships a bundler-native React entry (`_esm/react.mjs`) behind `exports["."]` / `exports["./react"]`, with React as a peer dependency. This app imports `Button` from `@cyberskill/design` directly (via `lib/design-system/button.tsx`). There is no Next/tsconfig alias and no deep import into a raw `Button.jsx`.

**Historical (pre-Phase 2):** `exports["."]` pointed at `_esm/cs.mjs`, which injected React 18 from unpkg and side-loaded `_ds_bundle.js` (the static/browser path in design-system `examples/npm-hello/`). That entry was not SSR-safe for Next 16 / React 19, so the first slice temporarily aliased the tarball’s `Button.jsx` through `transpilePackages` + `@cyberskill/design/button`. That alias is gone.

**Dependency pin:** `@cyberskill/design` is a git commit pin (`github:cyberskill-official/design-system#…`) until LAUNCH republishes a semver that includes the React entry. npm `1.0.0` remains the pre-Phase-0 tarball.

## 5. Deferred (follow-up)

- ~~Replace hand-ported storytelling tokens in `globals.css` with package tokens as the single source (keep scene/glass/motion locals).~~ → **Done in Phase 1** — see `2026-07-25-lumi-ds-phase1-fonts-tokens.md`.
- ~~Migrate the in-repo `.cs-btn` primitives to package components.~~ → **Done in Phase 2** — see `2026-07-25-lumi-ds-phase2-buttons.md`. Field / Select / Dialog / Card remain (Phase 3).
- ~~Reconcile package `fonts.css` (`font-display: swap`) with this app’s DeferredFonts / `font-display: optional` LCP/CLS strategy (may move to tokens-only CSS import).~~ → **Done in Phase 1** (`app/cs-package.css` omits `fonts.css`).
- ~~Prefer a future package export for React/Next over the Button.jsx alias.~~ → **Done in Phase 2** (design-system #33 shipped `_esm/react.mjs`).
- Do **not** invent product → element mappings; Status Hub and others stay on their locked rows.

## 6. Related

- Design-system: `docs/consuming.md`, `docs/products.md`, `docs/consumer-grant.md`
- Task: `docs/tasks/ds/TASK-DS-005-confirm-token-package/`
