# Live DS verification report — Lumi × `@cyberskill/design`

**Date:** 2026-07-25  
**Production URL:** https://cyberskill.world  
**Identity:** `hoa` · `plasma`  
**Gate:** `npm run check:ds:live` → `scripts/probe-ds-live.mjs`

---

## Matrix covered (whole-set, not a sample)

| Axis | Values |
|---|---|
| Routes | 23 — home, lite, work (+4 case studies), services (3), notes (+2 posts), how-we-build, careers, now, team, accessibility, privacy, terms, cyberos/{privacy,content-policy,delete-account} |
| Languages | `en`, `vi` |
| Themes | `light`, `dark` (forced via `data-theme` + `localStorage`) |
| Breakpoints | 390 · 768 · 1440 |
| Cells | **276** surface/button/identity cells |
| Buttons measured | **1598** (AA solid-layer contrast, ≥44px, pill, in-viewport) |
| axe runs | **276** (WCAG 2.x A/AA + 2.1/2.2 AA; serious/critical) |
| Consent | **12** (home × lang × theme × width; clear `cs-consent`, arm hydration, Accept/Decline = `.cs-button`) |
| Genie | **24** (home + careers × lang × theme × width; cloud `.cs-genie-*`, no `.cs-chat-msg` / `.cs-prompt`) |

Also asserts: `data-cs-element=hoa`, `data-cs-variant=plasma`; no legacy `.cs-btn`; route-expected `.cs-tag` / `.cs-card` / `.cs-field` (newsletter expected on production).

Client boot: production defers Next hydration until input — probe arms scripts + `DeferredEnhancements` before consent/genie checks.

---

## Production run (pre-fix CSS)

| Result | Detail |
|---|---|
| Identity / buttons / tags / cards / genie keep-local / consent | Pass across the matrix |
| axe | **18 failures** — all **light** theme on **notes** routes only |

Failing selectors (EN·VI × 390/768/1440):

- `time.cs-note-card-date`, `.cs-note-card-more` on `/notes`
- `.cs-note-detail-lang` on note detail pages

Root cause: text colour `var(--cs-color-accent)` (ochre ≈ `#f4ba17`) on light glass ≈ white — ~1.8:1. Matches DS doctrine “text never sits on the mid-tone accent” (here the text *is* the mid-tone). Same brand/accent split already used by `.cs-service-more`.

**Fix in this PR:** notes date / “read more” / lang switch use `--cs-color-brand` on light, `--cs-color-accent` on dark (`app/globals.css`).

---

## Local verification after fix

| Gate | Result |
|---|---|
| `npm test` | 380 passed |
| `npm run typecheck` | pass |
| `npm run build` | pass |
| `check:ds:tokens` / `check:ds:phase4` | pass |
| `check:ds:buttons` @ localhost | 528 states / 180 cells — PASS |
| `check:ds:phase3` @ localhost | 40 cells — PASS |
| `check:a11y:routes` @ localhost | 5 routes — PASS |
| Notes light axe (targeted) | EN·VI × 3 widths × list+detail — PASS |
| `check:ds:live` @ localhost (post-fix) | see CI / local log |

Production will stay red on notes light until this PR deploys; re-run `npm run check:ds:live -- https://cyberskill.world` after merge.

---

## Genie → ChatMessage / PromptInput (task 3)

**Stopped — does not map.** Decision: [`docs/decisions/2026-07-25-lumi-genie-chat-keep-local.md`](./decisions/2026-07-25-lumi-genie-chat-keep-local.md).

Package `ChatMessage` always renders avatar + name columns; `PromptInput` is a multi-line ask box with disclosure bar and no `inputMode`. Cloud chrome needs compact `.cs-genie-msg` bubbles + single-line wish-step input with scene-orbit Lumi. No invented DS variants. hoa/plasma unchanged. Hold: LAUNCH, Code Connect. Status Hub out of scope.
