# Decision: Lumi Phase 2 — buttons come from the design system

**Date:** 2026-07-25
**Status:** Adopted (Phase 2 of Lumi → 100% design-system migration)
**Supersedes (in part):** the alias-based Button in [`2026-07-24-cyberskill-design-package.md`](./2026-07-24-cyberskill-design-package.md)
**Owner:** CyberSkill Engineering

---

## 1. Context

Lumi hand-rolled its buttons as `.cs-btn` / `.cs-btn-primary` / `.cs-btn-secondary` / `.cs-btn-brand` in `app/globals.css`, with an in-repo `components/ui/Button.tsx` emitting the same markup. The one package button (the consent banner) reached `@cyberskill/design` through a Next alias pointing at the published `components/button/Button.jsx`, because the package's `exports["."]` was a browser UMD bridge and not SSR-safe.

Design-system Phase 0 ([design-system #33](https://github.com/cyberskill-official/design-system/pull/33)) added a bundler-native React entry (`_esm/react.mjs`) behind `exports["."]` and `exports["./react"]`, with React as a peer dependency. That is the entry this phase consumes.

## 2. Decision

1. **Consume the official package export.** `lib/design-system/button.tsx` re-exports `Button` from `@cyberskill/design` — no alias, no deep path into a raw `.jsx` file. The Next / tsconfig / Vitest aliases are gone.
2. **Every button is a design-system button.** Real `<button>` elements render the package `Button` component (variant, size, `fullWidth`, `icon`, `loading`, disabled state, 44px coarse-pointer target, Ochre focus ring). Anchors and `next/link` — which the package `Button` cannot render — carry the same `.cs-button` / `.cs-button--*` classes.
3. **Variant mapping.** `primary → primary`, `secondary → secondary`, bare `.cs-btn → ghost`, `brand → tertiary`. No new package variant was invented.
4. **CTA wrappers take a variant, not a class string.** `LeadCta` and `GenieOpenButton` accept `variant` / `size` / `icon` and treat `className` as *local modifiers only*. Sparkle icons moved into the package `icon` slot.
5. **`components/ui/Button.tsx` is deleted.** `tests/ui-primitives.test.ts` now exercises the package button. Card / Field / Select / Dialog stay local until Phase 3.

## 3. The two Lumi deviations, and why they are tokens not overrides

Both are expressed through **package component tokens**, so the package keeps owning every `.cs-button` rule:

| Deviation | Token | Why |
|---|---|---|
| Pill silhouette | `--cs-component-button-radius: var(--cs-radius-pill)` | The pill is Lumi's button shape; the package default is an 8px rounded rect. |
| Gold CTA in both themes | `--cs-component-button-primary-bg/-fg` pinned to `#f4ba17` / `#3a2a05` under `:root[data-cs-element="hoa"]` | Inside an element scope the package remaps the primary CTA to the element accent — Hoả · plasma gives crimson `#A91A43` in dark and Umber `#45210E` in light. Lumi's CTA is gold, and that exact solid sRGB pair (≈7.85:1) is pinned by a Lighthouse contrast contract in `tests/pagespeed-perfect-score.test.ts`. Solid, never translucent, never P3-only, so WCAG sampling cannot drift. |

The dark selector is spelled out alongside the light one because the package's remap (`[data-cs-element][data-theme="dark"]`) matches the same `<html>` element that carries Lumi's identity.

## 4. Kept local (storytelling, not DS gaps)

Motion and layout only — never a colour role the package owns. Allowlisted and enforced by `tests/ds-phase2-buttons.test.ts`:

- `cs-cta-lumi` — breathing gold halo on the Lumi CTAs (replaces `cs-btn-lumi`, which no longer forces its own fill)
- `cs-lumi-alt` — the no-JS/pre-hydration alternate that hides once Lumi is live
- `cs-wish-go`, `cs-header-cta`, `cs-footer-verify-btn` — layout/visibility for the wish field, header CTA, and footer verify chip
- Hover lift, hover shine sweep, active spring, and the magnetic-cursor target (`MotionExtras` now matches `.cs-button`), all reduced-motion gated

## 5. Package dependency is pinned to a commit, not a version

`@cyberskill/design` moved from `1.0.0` to `github:cyberskill-official/design-system#49b7a4f…`.

`1.0.0` was published to npm **before** Phase 0 merged, so the registry tarball ships only `_esm/cs.mjs` and has no React entry. npm registry versions are immutable: a given `name@version` can never be republished, even after `npm unpublish`, so no amount of re-running `npm-publish.yml` can add the React entry to `1.0.0`. The design-system repo is public and commits `_esm/react.mjs`, so a commit-pinned git dependency delivers the official `exports` without bumping `VERSION` (which stays pinned at 1.0.0 until LAUNCH).

**Revisit at LAUNCH:** when the design system publishes its next version, change this back to a plain semver range. The Phase 2 gate asserts the pin is a full 40-character SHA so it can never drift to a moving branch.

## 6. Verification

- `tests/ds-phase2-buttons.test.ts` — deterministic gates over **every** file in `app/`, `components/`, `lib/`: no `.cs-btn` survives; no config aliases the package or names `Button.jsx`; the installed package really exposes `_esm/react.mjs`; every `cs-button--*` modifier is one the package declares; every local modifier is allowlisted *and* still styled.
- `scripts/probe-ds-buttons.mjs` — computed-style probe over **15 routes** × EN·VI × dark·light × 390/768/1440px (root, lite, work, work case study, services sample, notes, how-we-build, careers, now, team, accessibility, privacy, terms, cyberos/privacy, cyberos/content-policy). Contrast uses Porter-Duff source-over across solid `background-color` layers (alpha preserved, then flattened onto opaque white); gradients/images are flagged approximate rather than claimed as pixel-perfect composites. Colours are sampled through a canvas so `display-p3`, `oklab`, and `color-mix()` resolve to the sRGB bytes Lighthouse reads, and styles are allowed to settle first — reading mid-transition reports interpolated colours and produces phantom failures.
- All 48 prerendered HTML files contain `.cs-button` and zero contain `.cs-btn`.
- `tsc --noEmit`, `eslint`, `vitest` (349), `next build` all green.

## 7. Out of scope (later phases)

- Forms, tags, cards, icons → package components (Phase 3)
- The “100%” proof sweep and keep-local inventory (Phase 4)

## 8. Related

- Migration plan: Lumi full DS migration (Phase 2)
- Prior decisions: [`2026-07-25-lumi-ds-phase1-fonts-tokens.md`](./2026-07-25-lumi-ds-phase1-fonts-tokens.md), [`2026-07-24-cyberskill-design-package.md`](./2026-07-24-cyberskill-design-package.md)
- Design-system: `docs/consuming.md`, `docs/products.md`
