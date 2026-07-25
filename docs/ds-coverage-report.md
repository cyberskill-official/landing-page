# Lumi × `@cyberskill/design` coverage report (Phase 4)

**Date:** 2026-07-25  
**Claim:** **100% design-system adoption for what maps** — not “every pixel is a DS component.”  
**Identity:** `hoa` · `plasma`  
**Package pin:** `github:cyberskill-official/design-system#3edeb1350c2e48761bee18f7c10c323e6103ff7d` (bundler-native `_esm/react.mjs`; includes `--cs-font-family-display`)

---

## Summary

| Bucket | Coverage | Notes |
|---|---|---|
| **Mappable UI primitives** (Button, form fields, Tag, mappable Card, line Icon) | **~100%** | Every production call site uses the package (via `lib/design-system/*`) or package class contracts |
| **Semantic token SoT** | **Package owns** | Globals only alias + 4 documented overrides (`check:ds:tokens`) |
| **Storytelling / scene / genie / motion** | **0% intended** | Keep-local by doctrine — see inventory |

Approximate share of *interactive UI primitives that have a DS mapping*: **~100%**.  
Approximate share of *all UI chrome including storytelling surfaces*: majority local by design (3D, cosmos, genie cloud, motion, messaging chips) — those are out of the “100%” claim.

---

## In-scope primitives (on DS)

| Primitive | Status | Evidence |
|---|---|---|
| Buttons / CTA | DS | No `.cs-btn`; `DesignSystemButton` + `.cs-button--*`; gates in `tests/ds-phase2-buttons.test.ts`, `check:ds:buttons` |
| Lead / Newsletter / TalentPool fields | DS | Components use package fields (`tests/ds-phase3-forms-polish.test.ts`). Live routes are Genie-primary for lead/talent; `NewsletterForm` mounts in the footer when `RESEND_API_KEY` is present at SSG build time (`PROBE_EXPECT_NEWSLETTER=1` for the runtime probe) |
| Work / services tags | DS | Package `Tag`; phase 3 gates + `check:ds:phase3` |
| Mappable cards | DS | Package `Card` on lead/talent success, contact aside, careers shell |
| Line icons (9) | DS | Package `Icon`; local `lib/icons` deleted |
| Semantic tokens | Package SoT | `app/cs-package.css` + `scripts/check-ds-token-sot.mjs` |
| Display / UI / mono type roles | Package SoT | `--cs-font-family-*` + `.cs-display-face`; optional bytes via `sync-ds-fonts` |

---

## Remaining local surfaces (and why)

Full file-level list: [`docs/ds-keep-local-inventory.md`](./ds-keep-local-inventory.md).

Highlights:

- **Genie message rows + prompt** — package `ChatMessage` / `PromptInput` do not map to cloud chrome (`components/genie/GenieChatPanel.tsx`); decision: [`docs/decisions/2026-07-25-lumi-genie-chat-keep-local.md`](./decisions/2026-07-25-lumi-genie-chat-keep-local.md)
- **3D / cosmos / scroll / motion** — storytelling product (`components/canvas`, `scroll`, `motion`)
- **DeferredFonts optional loading** — CLS adapter over package faces (not a display-role exception); see [`docs/decisions/2026-07-25-lumi-ds-display-face.md`](./decisions/2026-07-25-lumi-ds-display-face.md)
- **Messaging chips / BrandIcon / wish field** — channel + scene chrome
- **Allowlisted button modifiers** — motion/layout only on DS roots (`cs-cta-lumi`, …)
- **Layout glass** — `.cs-surface-*` without forcing `.cs-card` on work/header/metric tiles

---

## LAUNCH revisit

When the design system publishes a version **after** `1.0.0` that includes `_esm/react.mjs` on the registry:

1. Change `package.json` `"@cyberskill/design"` from the git SHA pin to a semver range / exact published version.
2. Keep `transpilePackages: ["@cyberskill/design"]` until confirmed unnecessary.
3. Re-run `npm test`, `check:ds:tokens`, `check:ds:buttons`, `check:ds:phase3`, build, a11y.

Do **not** try to republish `1.0.0` — npm versions are immutable. Design-system `VERSION` stays `1.0.0` until the owner says LAUNCH.

---

## Verification (Phase 4)

| Gate | Role |
|---|---|
| `npm run check:ds:tokens` / `check:ds:phase4` | Whole-set token collision scan |
| `tests/ds-phase4-prove-100.test.ts` | DoD checklist (no `.cs-btn`, no Button.jsx alias, docs present, …) |
| `tests/ds-phase{1,2,3}-*.test.ts` | Prior phase contracts remain green |
| `npm run check:ds:buttons` | Runtime button contrast/target probe (all routes × lang × theme × breakpoint) |
| `npm run check:ds:phase3` | Runtime field/tag/card presence probe |
| `npm run check:ds:live` | Whole-set live/production probe (identity, buttons, tags/cards, consent, genie keep-local, axe) — report: [`docs/verification/2026-07-25-ds-live-report.md`](./verification/2026-07-25-ds-live-report.md) |
| `npm test`, `typecheck`, `lint`, `next build` | Repo CI floor |
| `check:a11y:routes` + Lighthouse CI | Served a11y + perf budget (CI jobs) |
