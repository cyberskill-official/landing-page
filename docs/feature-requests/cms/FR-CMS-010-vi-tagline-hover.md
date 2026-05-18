---
id: FR-CMS-010
title: "Lumi hover-reveal Vietnamese tagline — soft fade-in, cultural Easter egg, /vi-always + /en-first-time"
module: CMS
priority: SHOULD
status: blocked
blocked_reason: "Implementation is ready, but final FR-CMS-009 external native-review signoff for the tagline is pending."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead + Founder (cultural signoff)
created: 2026-05-16
related_frs: [FR-CMS-003, FR-CMS-007, FR-CMS-009, FR-CHAR-003, FR-SCENE-019, FR-SCENE-017]
depends_on: [FR-CMS-007]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/lumi/
new_files:
  - apps/web/components/lumi/LumiTaglineReveal.tsx
  - apps/web/components/lumi/__tests__/LumiTaglineReveal.unit.test.tsx
  - apps/web/lib/lumi/use-tagline-state.ts

source_pages:
  - docs/01-master-plan-v2.md §1.1 — "Bilingual tagline hover-reveal"
  - FR-CMS-003 — Vietnamese variant rules
  - FR-CMS-009 — native review (tagline reviewed there)
  - FR-CHAR-003 — cultural register

effort_hours: 2
risk_if_skipped: "Cultural Easter egg signals Vietnamese identity to international visitors. Without it, brand feels English-default. With it, English visitors see 'wow, this is a Vietnamese studio' moment — strengthens FR-SCENE-017 cultural anchor."
---

## §1 — Description (BCP-14 normative)

1. **MUST** show Vietnamese tagline `"Lumi — vì ánh sáng biến nguyện ước thành sự thật"` on hover (desktop) or tap (mobile) of Lumi mesh.
2. **MUST** use a soft fade-in (240ms ease-genie cubic-bezier curve, FR-CHAR-013 motion grammar) — NOT a tooltip / standard browser title.
3. **MUST** persist visible for ~3 seconds, then fade out (300ms ease-out).
4. **MUST** only display:
   - **On /vi route:** always shown on hover/tap.
   - **On /en route:** first hover only per session (Easter egg). Subsequent hovers do not re-trigger.
5. **MUST** read text byte-identically from `vi.json` key `lumi-tagline-hover` (per FR-CMS-007).
6. **MUST** be culturally-reviewed by FR-CMS-009 native reviewer (tagline-specific signoff).
7. **MUST** be visible: contrast ≥ 4.5:1 vs scene background; min font 18px; readable for low-vision.
8. **MUST** be accessible:
   - aria-live="polite" on the reveal element.
   - Keyboard-discoverable (Tab + Enter shows reveal).
   - Tappable on touch.
9. **MUST** respect `prefers-reduced-motion` — instant show/hide on reduced-motion preference.
10. **MUST** include analytics event `vi_tagline_revealed` with `{locale, trigger_type: hover|tap|keyboard}`.
11. **MUST NOT** auto-reveal — user-initiated only.
12. **MUST NOT** persist localStorage for Easter-egg state — once-per-session via sessionStorage.

## §2 — Why this design

**Why hover Easter egg (not always visible)?** Always-visible would clutter. Hover is a "discoverable surprise" — Vietnamese identity revealed on engagement.

**Why first-time only on /en?** Repeated hover spam shouldn't keep firing. Easter eggs work because they're rare. sessionStorage limits to once.

**Why fade vs tooltip?** Cinematic feel. Standard tooltip = generic UX. Custom fade = brand-aligned.

**Why ease-genie cubic-bezier?** FR-CHAR-013 motion grammar establishes this curve as Lumi's signature; reveal matches Lumi's animation style.

**Why 3-second persist?** Enough time to read; not so long it overstays. Calibrated to ~25 character/sec reading speed in Vietnamese.

**Why cultural review?** Tagline is a brand-anchor phrase. "Vì ánh sáng biến nguyện ước thành sự thật" — wrong translation choices = wrong brand voice. FR-CMS-009 reviewer signoff matters.

**Why aria-live polite?** Screen-reader users discover the tagline via Tab navigation; aria-live announces.

**Why analytics?** Hypothesis: ~5% of /en visitors discover; ~50% of /vi visitors hover. Confirms reach.

## §3 — Public surface

```ts
// apps/web/lib/lumi/use-tagline-state.ts
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

const SESSION_KEY = "cyberskill_vi_tagline_shown";

export function useTaglineState() {
  const locale = useLocale();
  const [canReveal, setCanReveal] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (locale === "vi") {
      setCanReveal(true);  // always available on VI
    } else {
      // EN: once per session
      const shown = sessionStorage.getItem(SESSION_KEY);
      setCanReveal(!shown);
    }
  }, [locale]);

  function trigger(triggerType: "hover" | "tap" | "keyboard") {
    if (!canReveal) return;
    setActive(true);
    if (locale === "en") {
      sessionStorage.setItem(SESSION_KEY, "1");
      setCanReveal(false);  // disable for rest of session
    }
    setTimeout(() => setActive(false), 3000 + 300);  // 3s + fade
  }

  return { canReveal, active, trigger, locale };
}
```

```tsx
// apps/web/components/lumi/LumiTaglineReveal.tsx
"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useTaglineState } from "@/lib/lumi/use-tagline-state";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { trackEvent } from "@/lib/analytics";

export function LumiTaglineReveal() {
  const t = useTranslations("lumi");
  const { canReveal, active, trigger, locale } = useTaglineState();
  const reduced = useReducedMotion();

  function handleHover() {
    trigger("hover");
    trackEvent("vi_tagline_revealed", { locale, trigger_type: "hover" });
  }
  function handleTap() {
    trigger("tap");
    trackEvent("vi_tagline_revealed", { locale, trigger_type: "tap" });
  }
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      trigger("keyboard");
      trackEvent("vi_tagline_revealed", { locale, trigger_type: "keyboard" });
    }
  }

  if (!canReveal && !active) return null;

  return (
    <div
      onMouseEnter={canReveal ? handleHover : undefined}
      onTouchEnd={canReveal ? handleTap : undefined}
      onKeyDown={handleKey}
      tabIndex={0}
      aria-label={t("hover_lumi_for_tagline")}
      className="lumi-tagline-reveal-trigger"
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`tagline-reveal ${active ? "active" : ""}`}
        style={{ transition: reduced ? "none" : "opacity 240ms cubic-bezier(0.4, 0.0, 0.2, 1)" }}
      >
        {active && t("lumi-tagline-hover")}  {/* "Lumi — vì ánh sáng biến nguyện ước thành sự thật" */}
      </div>
    </div>
  );
}
```

```css
.tagline-reveal {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  background: rgba(44, 31, 26, 0.95);
  color: var(--accent-gold);
  font-size: 18px;
  font-style: italic;
  padding: 12px 20px;
  border-radius: 9999px;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(8px);
}
.tagline-reveal.active {
  opacity: 1;
}
@media (max-width: 768px) {
  .tagline-reveal { font-size: 16px; padding: 10px 16px; white-space: normal; max-width: 320px; }
}
```

```json
// apps/web/messages/en.json + vi.json
{
  "lumi": {
    "lumi-tagline-hover": "Lumi — vì ánh sáng biến nguyện ước thành sự thật",
    "hover_lumi_for_tagline": "Hover Lumi to reveal the Vietnamese tagline"  // English; localized to VI on /vi
  }
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Hover/tap reveals tagline | Mock + assert |
| 2 | Text byte-identical to vi.json `lumi-tagline-hover` | Compare bytes |
| 3 | Fade animation 240ms ease-genie | CSS check |
| 4 | Persists ~3s then fades | Timer test |
| 5 | /vi: always reveals | sessionStorage absent triggers |
| 6 | /en: first hover only per session | sessionStorage flag set |
| 7 | aria-live polite | DOM |
| 8 | Keyboard Enter/Space triggers | Playwright |
| 9 | Analytics event fires | Mock trackEvent |
| 10 | Contrast ≥ 4.5:1 | FR-DS-002 check |
| 11 | Min 18px font desktop / 16px mobile | Computed style |
| 12 | Reduced-motion instant transition | matchMedia mock |
| 13 | Vitest unit tests pass | pnpm vitest |
| 14 | axe-clean | AxeBuilder |
| 15 | Cultural review signoff by FR-CMS-009 reviewer | Doc reference |

## §5 — Verification

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaglineState } from "../use-tagline-state";

vi.mock("next-intl", () => ({ useLocale: vi.fn() }));

describe("useTaglineState", () => {
  beforeEach(() => sessionStorage.clear());

  it("always reveals on /vi locale", () => {
    require("next-intl").useLocale.mockReturnValue("vi");
    const { result } = renderHook(() => useTaglineState());
    expect(result.current.canReveal).toBe(true);
  });

  it("reveals first time only on /en locale", () => {
    require("next-intl").useLocale.mockReturnValue("en");
    const { result, rerender } = renderHook(() => useTaglineState());
    expect(result.current.canReveal).toBe(true);
    act(() => result.current.trigger("hover"));
    rerender();
    expect(result.current.canReveal).toBe(false);
  });

  it("re-renders after 3s + fade clears active state", () => {
    vi.useFakeTimers();
    require("next-intl").useLocale.mockReturnValue("vi");
    const { result } = renderHook(() => useTaglineState());
    act(() => result.current.trigger("hover"));
    expect(result.current.active).toBe(true);
    vi.advanceTimersByTime(3500);
    expect(result.current.active).toBe(false);
  });

  it("sessionStorage flag prevents replay on /en", () => {
    require("next-intl").useLocale.mockReturnValue("en");
    sessionStorage.setItem("cyberskill_vi_tagline_shown", "1");
    const { result } = renderHook(() => useTaglineState());
    expect(result.current.canReveal).toBe(false);
  });
});

// Playwright integration
test("Hover Lumi reveals Vietnamese tagline on /vi", async ({ page }) => {
  await page.goto("/vi/");
  await page.locator(".lumi-corner-avatar").hover();
  await expect(page.locator(".tagline-reveal.active")).toContainText("vì ánh sáng biến nguyện ước thành sự thật");
});
```

## §6 — Dependencies

**Concept:** FR-CMS-003 (Vietnamese variant), FR-CMS-007 (locale loader source of strings), FR-CMS-009 (cultural review of this tagline), FR-CHAR-003 (register), FR-SCENE-019 (corner avatar host), FR-SCENE-017 (cultural anchor).

**Operational:** sessionStorage, next-intl, Zustand if integrated with FR-CHAR-013 motion.

**Downstream:** Brand identity reinforcement; FR-A11Y-012 audit verifies a11y.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Tooltip readability | AC#10 contrast | Background card ensures contrast |
| Diacritics corrupted | UTF-8 byte check | next-intl preserves; verify in DOM |
| Easter-egg fires on every hover (/en) | AC#6 sessionStorage | Once per session enforced |
| /vi doesn't show (sessionStorage bug) | AC#5 | /vi always-show ignores sessionStorage |
| Touch tap not registered | AC#1 mobile | onTouchEnd listener |
| Keyboard not discoverable | AC#8 | tabIndex 0 + aria-label |
| aria-live spam | AC#7 | Trigger once per show; not on every render |
| Mobile font too small | AC#11 | 16px responsive min |
| Layout shift on mount | CLS | Use position:absolute; no shift |
| Reveal blocks Lumi click | UX | pointer-events:none on tagline div |
| Fade animation glitchy | Visual | cubic-bezier matches FR-CHAR-013 |
| Cultural mis-step (wrong word choice) | FR-CMS-009 signoff | Reviewed in native review |
| Analytics fires multiple times | Trigger debounce | sessionStorage flag prevents |
| sessionStorage quota | Catch | Graceful fallback |
| Vietnamese text wraps on narrow viewport | Visual | max-width + wrap allowed mobile |

## §8 — Deliverable preview

User on /vi:
1. Hovers Lumi corner avatar.
2. After 240ms, gold italic tagline fades in: "Lumi — vì ánh sáng biến nguyện ước thành sự thật".
3. Persists ~3 seconds.
4. Fades out over 300ms.
5. Hover again → re-reveals (locale = vi always-show).

User on /en, first visit:
1. Hovers Lumi.
2. Tagline reveals.
3. Hover again — no reveal (Easter-egg consumed).
4. Reload (sessionStorage preserved within session) — no reveal.
5. New session (close+reopen browser) — reveals again.

Screen reader user:
1. Tabs to Lumi avatar.
2. Hears "Hover Lumi to reveal the Vietnamese tagline" (aria-label).
3. Presses Enter.
4. aria-live polite announces tagline.

## §9 — Notes

**On 'why not just always show?'** Always-shown taglines feel like marketing slogans. Hover-reveal feels like character. Brand voice = personality, not slogan.

**On Vietnamese-only visibility consideration:** Could limit to /vi only. Choosing Easter-egg on /en strengthens FR-SCENE-017 cross-cultural appeal.

**On future variants:** Could rotate among multiple cultural phrases. Slice 3.

**On 'why italic font?'** Slight visual differentiation; signals "this is a quote/tagline."

*End of FR-CMS-010.*
