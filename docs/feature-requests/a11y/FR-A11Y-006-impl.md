---
id: FR-A11Y-006
title: "Captions for every Lumi line — gold-on-charcoal, 18px min, aria-live polite, WCAG 1.4.3 + 1.2.2 compliance"
module: A11Y
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead + A11Y reviewer
created: 2026-05-16
related_frs: [FR-CMS-002, FR-SCENE-020, FR-DS-002, FR-A11Y-001, FR-A11Y-002, FR-CMS-007]
depends_on: [FR-CMS-002, FR-SCENE-020]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/a11y/
new_files:
  - apps/web/components/a11y/SceneCaption.tsx
  - apps/web/components/a11y/__tests__/SceneCaption.unit.test.tsx
  - apps/web/lib/a11y/use-current-narration.ts

source_pages:
  - docs/01-master-plan-v2.md §7.2 — "Captions for every Lumi line"
  - WCAG 2.2 SC 1.4.3 contrast minimum + SC 1.2.2 captions prerecorded
  - FR-CMS-002 narration schema

effort_hours: 6
risk_if_skipped: "Lumi's narrative is the brand's emotional core. Without captions: deaf/HoH users miss the entire story; audio-muted users (most visitors) lack context. WCAG 1.2.2 violation. Master plan §7.2 explicit requirement."
---

## §1 — Description (BCP-14 normative)

1. **MUST** render Lumi's narration as visible caption text on every scene with narrative content.
2. **MUST** wire `aria-live="polite"` + `aria-atomic="true"` so screen readers announce caption changes.
3. **MUST** meet WCAG SC 1.4.3 contrast — text vs background ≥ 4.5:1:
   - Gold text (`--text-gold` #D0B070) on charcoal (`--surface-deep-brown` #2C1F1A) = 7.2:1 ✅
4. **MUST** be ≥ **18px** font desktop, ≥ **16px** mobile (font-size critical for low-vision).
5. **MUST** update on scene transition (FR-SCENE-020).
6. **MUST** debounce caption updates 500ms — rapid scroll = single announcement.
7. **MUST** include "Scene N:" prefix for spatial context.
8. **MUST** fade in/out ~200ms unless `prefers-reduced-motion` is on (instant swap).
9. **MUST** position bottom of viewport, safe-area-inset-bottom padding on mobile.
10. **MUST** include semi-opaque dark background card (8px radius, 0.85 opacity) to guarantee contrast on bright scenes.
11. **MUST NOT** rely on color alone — text content carries meaning.
12. **MUST** localize via FR-CMS-007 (en + vi captions).

## §2 — Why this design

**Why polite aria-live?** Waits for current speech; doesn't interrupt. Scene transitions are not emergencies.

**Why 18px desktop / 16px mobile?** WCAG 1.4.4 says 200% zoom must not break content. 18px base = 36px at 200% — readable. Below 16px on mobile = bad UX even without zoom.

**Why fade animations?** Cinematic feel. Hard cuts feel like glitches.

**Why background card?** Scene 5 (sunny sky) is bright. Text-only would fail contrast. Card guarantees ≥ 4.5:1.

**Why scene prefix?** Same rationale as FR-A11Y-002 — spatial context.

## §3 — Public surface

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSceneStore } from "@/lib/stores/scene-store";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { useCurrentNarration } from "@/lib/a11y/use-current-narration";

export function SceneCaption() {
  const activeScene = useSceneStore(s => s.activeScene);
  const reduced = useReducedMotion();
  const narration = useCurrentNarration(activeScene);
  const [displayed, setDisplayed] = useState<string>("");

  useEffect(() => {
    if (!narration) return;
    const id = setTimeout(() => setDisplayed(narration), 500);
    return () => clearTimeout(id);
  }, [narration]);

  if (!displayed) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="scene-caption"
         style={{ transition: reduced ? "none" : "opacity 200ms ease-in-out" }}>
      <p>
        <span className="scene-prefix">Scene {(activeScene ?? 0) + 1}:</span>{" "}{displayed}
      </p>
    </div>
  );
}
```

```ts
import { useMemo } from "react";
import { useLocale } from "next-intl";
import enLines from "@/content/narrative/lines/en.json";
import viLines from "@/content/narrative/lines/vi.json";

export function useCurrentNarration(sceneId: number | null): string | null {
  const locale = useLocale() as "en" | "vi";
  return useMemo(() => {
    if (sceneId === null) return null;
    const lines = locale === "vi" ? viLines : enLines;
    return (lines as any[]).filter(l => l.scene === `scene-${sceneId}` && l.role !== "retired")[0]?.text ?? null;
  }, [sceneId, locale]);
}
```

```css
.scene-caption {
  position: fixed;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0; right: 0;
  padding: 1rem 2rem;
  pointer-events: none;
  z-index: 50;
}
.scene-caption p {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(44, 31, 26, 0.85);
  color: var(--text-gold);
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  padding: 12px 20px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(4px);
}
.scene-prefix { color: var(--accent-gold); font-weight: 600; margin-right: 0.5em; }
@media (max-width: 768px) { .scene-caption p { font-size: 16px; padding: 10px 16px; } }
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Captions render for every scene with narrative | Per-scene smoke |
| 2 | aria-live='polite' + aria-atomic='true' | DOM |
| 3 | Contrast ≥ 4.5:1 | FR-DS-002 contrast check |
| 4 | Font 18px desktop / 16px mobile | Computed style |
| 5 | Update on scene transition | Mock change; assert text |
| 6 | 500ms debounce | Mock timers |
| 7 | "Scene N:" prefix present | DOM |
| 8 | 200ms fade animation | CSS check |
| 9 | Instant swap when reduced-motion | Mock matchMedia |
| 10 | Safe-area-inset honored | iPhone viewport test |
| 11 | Background card on bright scenes | Scene 5 visual |
| 12 | Vietnamese localization | /vi smoke |
| 13 | Vitest unit tests pass | pnpm vitest |
| 14 | axe-clean | AxeBuilder |

## §5 — Verification

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SceneCaption } from "../SceneCaption";
import { useSceneStore } from "@/lib/stores/scene-store";

describe("SceneCaption", () => {
  it("renders narration after debounce", async () => {
    useSceneStore.setState({ activeScene: 0 });
    render(<SceneCaption />);
    await waitFor(() => expect(screen.getByText(/Scene 1:/)).toBeTruthy());
  });
  it("aria-live polite on caption region", async () => {
    useSceneStore.setState({ activeScene: 0 });
    render(<SceneCaption />);
    await waitFor(() => {
      const s = screen.getByRole("status");
      expect(s.getAttribute("aria-live")).toBe("polite");
    });
  });
  it("min 18px font on desktop", () => {
    useSceneStore.setState({ activeScene: 0 });
    render(<SceneCaption />);
    const p = screen.getByRole("status").querySelector("p");
    expect(parseInt(getComputedStyle(p!).fontSize)).toBeGreaterThanOrEqual(18);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-002 (narration schema), FR-SCENE-020 (transition trigger), FR-DS-002 (palette), FR-A11Y-001 (a11y baseline), FR-A11Y-002 (parallel shadow mirror), FR-CMS-007 (locale).

**Operational:** next-intl locale, Zustand scene store, useReducedMotion hook.

**Downstream:** FR-A11Y-012 audit; FR-OPS-012 axe gate.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Stale text after scroll-back | AC#5 | Subscribe to activeScene |
| Contrast fails on Scene 5 | AC#3 | Background card with backdrop-filter |
| Font < 18px on mobile (overlooked) | AC#4 | Media query mobile font 16px min |
| aria-live spam | AC#6 | 500ms debounce |
| Caption blocks content | UX | Bottom; semi-opaque |
| Localization missing | next-intl fallback | English fallback |
| Reduced-motion ignored | AC#9 | useReducedMotion hook |
| CLS spike | Lighthouse | Reserve space or fixed position |
| Mobile font too small at 200% zoom | Manual | 16px × 2 = 32px = readable |
| Layout shifts on Vietnamese (longer text) | Visual | Max-width caps; wrap to 2 lines OK |
| Caption overlaps Skip-story pill | Z-index | Pill z-index 100, caption 50 |
| Double announcement w/ FR-A11Y-002 mirror | AT test | One source authoritative; mirror handles AT, this handles sighted |

## §8 — Deliverable preview

Desktop Scene 3: gold-on-charcoal card bottom-center: "Scene 4: The wish unfolds — the user's intent crystallizes into a tangible mock-up under Lumi's hands."

Mobile (414px): same caption, narrower max-width, font 16px, safe-area-inset 16px from bottom.

VoiceOver: "Scene 4: The wish unfolds..." announced via aria-live.

## §9 — Notes

**On 'visible caption + shadow mirror?'** Different audiences:
- Caption = sighted users (including deaf).
- Shadow mirror = screen-reader users (FR-A11Y-002).
- Some users use both (low vision + SR).

**On Vietnamese typography:** Vietnamese diacritics render OK at 18px+. Validate visually.

**On audio sync:** If FR-AUDIO-001 ships VO, captions sync to audio timing. Slice 3.

*End of FR-A11Y-006.*
