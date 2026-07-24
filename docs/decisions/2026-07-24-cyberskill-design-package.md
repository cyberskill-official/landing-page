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

## 4. Why not the package main JS export yet

`exports["."]` → `_esm/cs.mjs` injects React 18 from unpkg and side-loads `_ds_bundle.js`. That is the documented static/browser path (see design-system `examples/npm-hello/`), not an SSR-safe Next 16 / React 19 module. Until the package ships a bundler-friendly React entry, this app aliases the tarball’s `Button.jsx` through Next `transpilePackages` + resolve alias `@cyberskill/design/button`.

## 5. Deferred (follow-up)

- ~~Replace hand-ported storytelling tokens in `globals.css` with package tokens as the single source (keep scene/glass/motion locals).~~ → **Done in Phase 1** — see `2026-07-25-lumi-ds-phase1-fonts-tokens.md`.
- Migrate remaining in-repo UI primitives (`.cs-btn`, Field, Dialog, …) to package components where APIs match. (Phase 2+)
- ~~Reconcile package `fonts.css` (`font-display: swap`) with this app’s DeferredFonts / `font-display: optional` LCP/CLS strategy (may move to tokens-only CSS import).~~ → **Done in Phase 1** (`app/cs-package.css` omits `fonts.css`).
- Prefer a future package export for React/Next over the Button.jsx alias. (Design-system Phase 0)
- Do **not** invent product → element mappings; Status Hub and others stay on their locked rows.

## 6. Related

- Design-system: `docs/consuming.md`, `docs/products.md`, `docs/consumer-grant.md`
- Task: `docs/tasks/ds/TASK-DS-005-confirm-token-package/`
