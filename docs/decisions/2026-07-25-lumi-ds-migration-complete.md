# Decision: Lumi → `@cyberskill/design` migration complete (Phases 0–4)

**Date:** 2026-07-25  
**Status:** Adopted (summary of the full migration)  
**Owner:** CyberSkill Engineering  

This note **summarizes** the per-phase decisions. It does **not** delete or rewrite them — each phase note remains the detailed record. Prefer this file for “how did we get to 100% for what maps?”; follow the links for phase-specific rationale.

---

## 1. Locked definition of “100%”

**In scope:** semantic tokens from the package as SoT; interactive UI primitives that map (Button, form fields, Tag, mappable Card, line Icon); package CSS for those contracts; Lumi identity `hoa` · `plasma`; tests on DS class contracts.

**Out of scope (keep local):** R3F/3D, cosmos, scroll/motion storytelling, genie cloud chrome, Space Grotesk display, messaging chips / BrandIcon / wish field, critical-CSS perf bridge, allowlisted button motion modifiers. Full inventory: [`docs/ds-keep-local-inventory.md`](../ds-keep-local-inventory.md). Coverage numbers: [`docs/ds-coverage-report.md`](../ds-coverage-report.md).

---

## 2. Phase timeline (history preserved)

| Phase | What shipped | Decision note |
|---|---|---|
| **0** (design-system) | Bundler-native React entry `_esm/react.mjs`, React peerDeps, dual export | Design-system PR #33; consuming docs there |
| **First slice** | Install package, identity attrs, initial styles + consent Button | [`2026-07-24-cyberskill-design-package.md`](./2026-07-24-cyberskill-design-package.md) |
| **1** | Fonts: no package `fonts.css`; token SoT via `cs-package.css`; storytelling aliases | [`2026-07-25-lumi-ds-phase1-fonts-tokens.md`](./2026-07-25-lumi-ds-phase1-fonts-tokens.md) |
| **2** | Every button is a package button; drop `Button.jsx` alias; git SHA pin | [`2026-07-25-lumi-ds-phase2-buttons.md`](./2026-07-25-lumi-ds-phase2-buttons.md) |
| **3** | Forms, tags, cards, icons; genie stays local | [`2026-07-25-lumi-ds-phase3-forms-polish.md`](./2026-07-25-lumi-ds-phase3-forms-polish.md) |
| **4** | Grep/CI proof, keep-local inventory, coverage report, this summary | This file + inventory + coverage report |

---

## 3. Standing technical decisions (still true)

1. **Official export only** — `import { … } from "@cyberskill/design"` via `lib/design-system/*`. No deep import to `Button.jsx`.
2. **Git pin, not npm `1.0.0`** — registry `1.0.0` predates the React entry and is immutable. Revisit at LAUNCH when a newer version publishes.
3. **No invented DS variants** — Lumi pill + gold CTA are package *component token* overrides; motion classes are local modifiers on DS roots.
4. **Genie / 3D / cosmos stay out of the package** — storytelling product surface.
5. **VERSION / CHANGELOG** — design-system stays at 1.0.0 until owner LAUNCH; this app does not invent package version bumps.

---

## 4. Phase 4 proof gates

- No production `.cs-btn`
- Token SoT: `npm run check:ds:tokens` (allowlisted overrides only)
- No Next alias to raw `Button.jsx`
- Docs: inventory + coverage + this summary; README “How Lumi consumes DS”
- Prior probes: `check:ds:buttons`, `check:ds:phase3`
- `tests/ds-phase4-prove-100.test.ts` encodes the checklist

---

## 5. Related

- Plan: Lumi full DS migration (Phase 4)
- Inventory: [`docs/ds-keep-local-inventory.md`](../ds-keep-local-inventory.md)
- Coverage: [`docs/ds-coverage-report.md`](../ds-coverage-report.md)
