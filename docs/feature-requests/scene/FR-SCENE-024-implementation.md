---
id: FR-SCENE-024
title: "Nón lá Easter-egg hover-reveal — 3 cultural-variant textures (Tết / Mid-Autumn / sunset-lit)"
module: SCENE
priority: COULD
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: Frontend Lead + Founder (cultural-variant signoff)
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
mocked_dependency: "Variant KTX2 files currently reuse the base nonla KTX2 pending Founder-reviewed distinct artwork."
related_frs: [FR-SCENE-019, FR-OPS-007, FR-CHAR-012, FR-CHAR-003]
depends_on: [FR-SCENE-019, FR-OPS-007, FR-CHAR-012]
blocks: []
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.3b — "Nón lá Easter-egg variants"
  - docs/01-master-plan-v2.md §11.1 Recipe G — texture variants generation
  - FR-CHAR-003 cultural-note — casual register binding

language: typescript + react 19
service: apps/web/components/scenes/footer/
new_files:
  - apps/web/components/scenes/footer/NonlaEasterEgg.tsx
  - assets-built/optimized/textures/lumi-nonla-{tet,midautumn,sunset}.ktx2
  - apps/web/components/scenes/footer/__tests__/easter-egg.unit.test.ts

effort_hours: 4
risk_if_skipped: "Easter egg is a delight beat. COULD priority — not a blocker. Skipping = users miss a moment of brand-personality reveal on repeat visits."
implementation_kind: mocked
---

## §1 — Description (BCP-14 normative)

1. **MUST** on hover-or-click of the corner-avatar nón lá (FR-SCENE-019 LumiCornerAvatar), swap to one of 3 texture variants from FR-OPS-007 Recipe G:
   - `tet` (Tết festival variant — warmer gold accents)
   - `midautumn` (Mid-Autumn variant — gentler yellow tint)
   - `sunset` (sunset-lit variant — peach/orange wash on the brim)

2. **MUST** rotate variants in sequence per hover/click — first hover shows `tet`, second shows `midautumn`, third shows `sunset`, fourth returns to default `--accent-flag-red`, etc.

3. **MUST** persist the last-seen variant index in `localStorage.cyberskill_nonla_variant` so the same user sees progression across reloads.

4. **MUST NOT** preload variant KTX2 textures eagerly. Lazy-load on first hover via FR-WEB-005 dynamic-three.ts factory: `dynamic(() => import('/textures/lumi-nonla-tet.ktx2'))`. Until first hover, only the default texture is in memory.

5. **MUST** be culturally accurate — each variant respects FR-CHAR-003 cultural-note casual register:
   - Tết variant: warmer gold (no dragons, no calligraphy, no áo dài patterns).
   - Mid-Autumn: subtle moon-glow tint (no overt mooncake imagery).
   - Sunset-lit: photographic-style warm light, no ceremonial elements.

6. **MUST** be reviewed and signed off by **Founder** for cultural correctness per variant — each variant has its own signoff line in `design/character-sheets/nonla/cultural-variants-signoff.md`.

7. **MUST** maintain hover-state on touch devices via tap (single tap rotates to next variant; tap-outside dismisses to default).

8. **MUST NOT** introduce variant-specific narration changes or accessibility regressions. Easter egg is visual-only; aria-label always reads "Lumi the genie" regardless of variant.

9. **MUST** ship Vitest unit tests: rotation cycle, localStorage persistence, lazy-load.

10. **MUST** ship Playwright integration test: hover corner avatar → texture variant changes; reload → progression continues; touch device tap works.

## §2 — Why this design

**Why an Easter egg at all?** Master plan §3.3b explicitly references "Easter-egg variants." Repeat-visit users (interested buyers / partners returning after first read) deserve a moment of delight. The variant rotation says "you found something" without forcing the discovery on first-time users.

**Why rotation through 3 + default (not single variant)?** Single variant feels random. Sequential rotation gives the user a sense of "I'm progressing through something." Looping back to default ensures users who hover repeatedly don't feel stuck.

**Why founder cultural signoff per variant?** Cultural authenticity matters — a "Tết variant" that accidentally evokes another festival or culture undermines the entire FR-CHAR-003 cultural beat. Each variant gets explicit cultural review like the main nón lá did.

**Why lazy-load (not preload)?** Variants are tier-COULD optional content. Bundling 3 extra KTX2 textures into the main download is wasted bandwidth for the 95% of users who never hover the corner avatar.

## §3 — Public surface

```tsx
// NonlaEasterEgg.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";

const VARIANT_KEYS = ["tet", "midautumn", "sunset"] as const;
type Variant = typeof VARIANT_KEYS[number] | "default";
const STORAGE_KEY = "cyberskill_nonla_variant";

export function useNonlaVariant() {
  const [variantIdx, setVariantIdx] = useState(0);

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved && !isNaN(parseInt(saved))) setVariantIdx(parseInt(saved));
  }, []);

  function cycleVariant() {
    const next = (variantIdx + 1) % (VARIANT_KEYS.length + 1);  // +1 for "default"
    setVariantIdx(next);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, String(next));
  }

  const currentVariant: Variant = variantIdx === 0 ? "default" : VARIANT_KEYS[variantIdx - 1];
  return { currentVariant, cycleVariant };
}

// Integration into LumiCornerAvatar (FR-SCENE-019):
// onPointerEnter (or onTap on touch): cycleVariant()
// Texture URL: `/textures/lumi-nonla-${currentVariant}.ktx2`
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | 3 variant KTX2 textures exist at `assets-built/optimized/textures/lumi-nonla-{tet,midautumn,sunset}.ktx2` | File existence check |
| 2 | Hover corner avatar → first variant (tet) applies | Playwright hover + texture URL check |
| 3 | Second hover → midautumn | Same |
| 4 | Third → sunset; fourth → default | Same |
| 5 | localStorage persists variant index across reloads | Playwright reload test |
| 6 | Variants are lazy-loaded (not in main bundle) | bundle analyzer; KTX2 not in initial download |
| 7 | Touch tap cycles variant on mobile | Playwright touch event |
| 8 | aria-label unchanged across variants | a11y tree |
| 9 | Founder cultural signoff archived (3 entries) | File existence: `design/character-sheets/nonla/cultural-variants-signoff.md` |
| 10 | No texture pop on swap (smooth crossfade) | Visual smoke |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNonlaVariant } from "../NonlaEasterEgg";

describe("nón lá variant rotation", () => {
  it("starts at default", () => {
    const { result } = renderHook(() => useNonlaVariant());
    expect(result.current.currentVariant).toBe("default");
  });
  it("cycles tet → midautumn → sunset → default", () => {
    const { result } = renderHook(() => useNonlaVariant());
    act(() => result.current.cycleVariant());
    expect(result.current.currentVariant).toBe("tet");
    act(() => result.current.cycleVariant());
    expect(result.current.currentVariant).toBe("midautumn");
    act(() => result.current.cycleVariant());
    expect(result.current.currentVariant).toBe("sunset");
    act(() => result.current.cycleVariant());
    expect(result.current.currentVariant).toBe("default");
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-019 (corner avatar host), FR-OPS-007 Recipe G (variant texture generation), FR-CHAR-012 (nón lá mesh + texture binding), FR-CHAR-003 (cultural-note casual register).

**Operational:** FR-WEB-005 (dynamic-three.ts for lazy-load), localStorage available.

**Downstream:** None — Easter egg, not blocking.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Cultural mis-step in variant texture | Founder cultural review | Reject variant; iterate per FR-CHAR-003 cultural-note rules |
| Texture pop on swap | AC#10 + visual | Use Three.js material crossfade over 200ms |
| Variant rotation doesn't persist | AC#5 | Verify localStorage.setItem fires; ITP graceful no-op |
| Eager-loaded variants (bundle bloat) | AC#6 | Verify lazy-load via dynamic import; CI bundle check |
| Touch tap doesn't cycle | AC#7 | Add onTap handler; touch-action: manipulation |
| aria-label changes per variant (a11y break) | AC#8 | aria-label stays "Lumi the genie" regardless |
| KTX2 textures not generated by FR-OPS-007 | AC#1 | Verify Recipe G outputs the 3 textures during build |
| Variant cycles too fast on rapid hover | UX smoke | Debounce 300ms between cycles |
| User on /lite never sees Easter egg | AC#1 (no canvas) | Acceptable — /lite is reduced-motion variant by design |

## §8 — Deliverable preview

After shipping:
- User scrolls to footer; corner avatar visible with default red+gold nón lá.
- User hovers (or taps) corner avatar → texture swaps to Tết variant (warmer accents).
- User hovers again → Mid-Autumn variant.
- User hovers again → sunset-lit variant.
- User hovers again → back to default.
- Browser reload → variant index restored from localStorage; user starts from last-seen variant.

## §9 — Notes

**On variant cultural cadence:** Future amendment could surface the relevant variant on its actual date (Tết on Lunar New Year, Mid-Autumn at the festival). Slice 2 scope. Requires master plan amendment.

**On future variants:** Halloween / Christmas variants would be culturally inappropriate (Vietnam doesn't culturally celebrate these — would feel performative). The 3 variants are Vietnamese-anchored on purpose.

**On a11y first-time-user concern:** Easter egg is hover/click only — keyboard users discover it via tab + Enter. Tooltip explains "Tap to cycle" on touch devices.

*End of FR-SCENE-024.*
