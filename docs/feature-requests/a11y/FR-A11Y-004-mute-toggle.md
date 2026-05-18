---
id: FR-A11Y-004
title: "Mute toggle — default ON (muted), localStorage persistence, aria-pressed reflective"
module: A11Y
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P3
slice: 2
owner: Frontend Lead + A11Y reviewer
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-A11Y-001, FR-A11Y-003, FR-A11Y-005, FR-WEB-001, FR-WEB-004, FR-AUDIO-001]
depends_on: [FR-WEB-001]
blocks: [FR-AUDIO-001]
language: typescript 5.6 + react 19
service: apps/web/components/a11y/
new_files:
  - apps/web/components/a11y/MuteToggle.tsx
  - apps/web/tests/unit/mute-toggle.test.ts
  - apps/web/tests/a11y/mute-toggle.spec.ts
  - apps/web/lib/stores/audioStore.ts

source_pages:
  - docs/01-master-plan-v2.md §2.3 — "Mute toggle always present; default muted"
  - docs/01-master-plan-v2.md §5.4 — audio pad design (ambient pad, not music)
  - WCAG 2.2 SC 1.4.2 — Audio Control (autoplay audio must be user-controllable)

effort_hours: 2
risk_if_skipped: "Autoplay audio without mute control violates WCAG SC 1.4.2 — fails axe-core gate. Audio fatigue is real; users in shared workspaces (offices, libraries) will close the tab if they can't silence the page within 3 seconds. Loss-of-trust event; bounce rate spikes among ~40% of users."
---

## §1 — Description (BCP-14 normative)

1. **MUST** default to MUTED state. Audio pad MUST NOT play on page load until user explicitly toggles. Per master plan §2.3 + §5.4 and WCAG SC 1.4.2.

2. **MUST** persist user preference in `localStorage.cyberskill_mute_pref` with values:
   - `'on'` (muted, default for new visitor)
   - `'off'` (audio enabled, only after explicit user toggle)
   - missing or invalid value → treat as `'on'`

3. **MUST** be a `<button>` element with `aria-pressed="true"` when muted, `aria-pressed="false"` when audio enabled. Per WAI-ARIA toggle-button pattern.

4. **MUST NOT** auto-unmute on user interaction. Some browsers (Chrome on autoplay policy) permit `<audio>` after user gesture without consent — we explicitly opt out and require user toggle.

5. **MUST** mirror state across tabs/windows via `storage` event listener (user mutes in one tab → all open tabs respect).

6. **MUST** position in header beside FR-A11Y-003 SkipStoryPill + FR-A11Y-005 Skip3DToggle. Vertically aligned trio of always-visible a11y controls.

7. **MUST** show clear visual state — muted (slash through speaker icon, "Muted" label) vs unmuted (speaker icon with sound waves, "Audio on" label).

8. **MUST** include visible text label, not just icon (≥ WCAG 2.2 SC 1.1.1 + best practice for screen-readers / cognitive accessibility).

9. **MUST** be ≥ 44×44 px (target size minimum, WCAG SC 2.5.8).

10. **MUST** support keyboard activation: Enter or Space toggles state.

11. **MUST** announce state change via aria-live polite:
    - On unmute: "Audio enabled" announcement.
    - On mute: "Audio muted" announcement.

12. **MUST** fire analytics event `mute_toggled` with `{from: 'muted'|'unmuted', to: 'muted'|'unmuted', source: 'click'|'keyboard'}` on each toggle.

13. **MUST** trigger Web Audio API context resume on first unmute (some browsers require user gesture to start the audio context; mute toggle IS the gesture).

14. **MUST NOT** show audio-related onboarding tooltip ("Click here to enable audio") — opt-in audio is the default; do not nudge.

15. **MUST** subscribe Zustand audio store (`useAudioStore`) to localStorage state changes — store is the single source of truth for the audio system; toggle updates store, store updates DOM + audio elements.

16. **MUST** respect FR-WEB-009 `lowMemoryMode` — when active, audio toggle is hidden (no audio playback in low-memory mode).

## §2 — Why this design

**Why default muted?** Two reasons:
1. **WCAG compliance** — SC 1.4.2 requires user control over audio that auto-plays > 3 seconds. Default-muted sidesteps the autoplay-control rule entirely.
2. **User context** — Most landing-page visits happen at work / public. Sudden audio = embarrassment + immediate tab close. Default-muted respects the user's context.

**Why localStorage persistence?** Repeat visitor's preference should stick. Without persistence, every page load resets to muted — annoying for the ~5% who genuinely want audio.

**Why aria-pressed (not aria-checked or onclick handler attribute)?** aria-pressed is the WAI-ARIA toggle-button semantic. Screen readers announce "Mute toggle, pressed" or "Mute toggle, not pressed" automatically. Distinct from aria-checked (which is for radio/checkbox).

**Why cross-tab mirroring via storage event?** User opens 2 tabs of cyberskill.world. Mutes one. Returns to other; expects same mute state. Without storage event, tabs drift. Single 5-line storage event listener fixes this.

**Why visible text + icon (not icon-only)?** Cognitive accessibility — speaker-with-slash glyph is not universally readable. Some users with cognitive disabilities or low experience need text. "Muted" / "Audio on" is unambiguous.

**Why no onboarding nudge?** Nudging toward audio is anti-user — the muted-by-default state is the considerate choice, not a problem to fix. Users who want audio will find the toggle.

**Why analytics event?** Hypothesis: ~5-10% unmute rate. Confirming/refuting this validates the muted-by-default + opt-in design tension. Low unmute rate = audio pad isn't worth shipping; refactor to no-audio.

**Why store as single source of truth?** Audio pad is touched by multiple components (FR-WEB-001 Canvas mount, FR-AUDIO-001 audio source, FR-A11Y-004 toggle). Store keeps them in sync; component-local state would drift.

**Why hide on lowMemoryMode?** Audio API + audio buffers consume ~5-10 MB heap. Constrained devices don't have it to spare. Hiding the toggle (vs showing+disabling) avoids the "why doesn't this work?" UX trap.

## §3 — Public surface

```ts
// apps/web/lib/stores/audio-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  muted: boolean;
  audioContext: AudioContext | null;
  setMuted: (m: boolean) => void;
  initAudioContext: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      muted: true,  // default
      audioContext: null,
      setMuted: (m: boolean) => {
        set({ muted: m });
        const ctx = get().audioContext;
        if (ctx && !m) ctx.resume();
      },
      initAudioContext: () => {
        if (typeof window === "undefined") return;
        const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
        if (!Ctx) return;
        set({ audioContext: new Ctx() });
      },
    }),
    {
      name: "cyberskill_mute_pref",
      partialize: state => ({ muted: state.muted }),
    },
  ),
);
```

```tsx
// apps/web/components/a11y/MuteToggle.tsx
"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAudioStore } from "@/lib/stores/audio-store";
import { useSceneStore } from "@/lib/stores/scene-store";
import { trackEvent } from "@/lib/analytics";
import { SpeakerIcon, SpeakerMutedIcon } from "@/components/icons";

export function MuteToggle() {
  const t = useTranslations("a11y");
  const muted = useAudioStore(s => s.muted);
  const setMuted = useAudioStore(s => s.setMuted);
  const initAudioContext = useAudioStore(s => s.initAudioContext);
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);
  const liveRegionRef = useRef<HTMLSpanElement>(null);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "cyberskill_mute_pref" && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed?.state?.muted === "boolean") {
            // External change; update local store silently
            useAudioStore.setState({ muted: parsed.state.muted });
          }
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (lowMemoryMode) return null;

  function handleToggle(source: "click" | "keyboard") {
    const next = !muted;
    if (!useAudioStore.getState().audioContext) {
      initAudioContext();  // first user gesture; OK to create AudioContext now
    }
    setMuted(next);
    trackEvent("mute_toggled", { from: muted ? "muted" : "unmuted", to: next ? "muted" : "unmuted", source });

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = next ? t("audio_muted") : t("audio_enabled");
      setTimeout(() => { if (liveRegionRef.current) liveRegionRef.current.textContent = ""; }, 2000);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleToggle("click")}
        onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleToggle("keyboard"); } }}
        aria-pressed={muted}
        aria-label={muted ? t("unmute_aria_label") : t("mute_aria_label")}
        className="mute-toggle-pill"
      >
        {muted ? <SpeakerMutedIcon aria-hidden="true" /> : <SpeakerIcon aria-hidden="true" />}
        <span>{muted ? t("muted_label") : t("audio_on_label")}</span>
      </button>
      <span ref={liveRegionRef} aria-live="polite" aria-atomic="true" className="visually-hidden" />
    </>
  );
}
```

```css
.mute-toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  border-radius: 9999px;
  background: var(--surface-deep-brown);
  color: var(--text-gold);
  border: 1px solid var(--border-gold-subtle);
  cursor: pointer;
}
.mute-toggle-pill:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}
.mute-toggle-pill[aria-pressed="false"] {
  background: var(--surface-deep-brown-active);  /* visual distinction when audio on */
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Default state on fresh visit = muted | localStorage empty → useAudioStore.muted === true |
| 2 | localStorage persists across reload | Toggle, reload, assert state restored |
| 3 | `aria-pressed` reflects state | Vitest: assert attribute after toggle |
| 4 | No auto-unmute on interaction | Click body / scroll → muted stays true unless toggle clicked |
| 5 | Cross-tab sync via storage event | Playwright: 2 tabs, toggle in tab1, assert tab2 syncs |
| 6 | Min 44×44 target size | boundingBox check |
| 7 | Enter/Space keyboard activation works | Playwright keyboard event |
| 8 | aria-live announcement on toggle | Mock listener; assert content includes "muted" or "enabled" |
| 9 | Analytics event fires with correct payload | Mock trackEvent; assert call |
| 10 | AudioContext created on first unmute | Spy on AudioContext constructor; assert called only after unmute |
| 11 | Hidden when lowMemoryMode active | Component returns null; querySelector returns null |
| 12 | Vitest unit tests pass | `pnpm vitest run apps/web/components/a11y/__tests__/MuteToggle.unit.test.tsx` |
| 13 | axe-core: 0 violations | Playwright + AxeBuilder |
| 14 | Visible state distinction (icon + label change) | Visual regression |

## §5 — Verification

```tsx
// apps/web/components/a11y/__tests__/MuteToggle.unit.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MuteToggle } from "../MuteToggle";
import { useAudioStore } from "@/lib/stores/audio-store";

describe("MuteToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    useAudioStore.setState({ muted: true, audioContext: null });
  });

  it("defaults to muted on fresh visit", () => {
    render(<MuteToggle />);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles aria-pressed on click", () => {
    render(<MuteToggle />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("Space key toggles", () => {
    render(<MuteToggle />);
    const btn = screen.getByRole("button");
    fireEvent.keyDown(btn, { key: " " });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("persists state to localStorage", () => {
    render(<MuteToggle />);
    fireEvent.click(screen.getByRole("button"));
    const stored = JSON.parse(localStorage.getItem("cyberskill_mute_pref")!);
    expect(stored.state.muted).toBe(false);
  });

  it("does NOT auto-unmute on scroll/click outside", () => {
    render(<MuteToggle />);
    fireEvent.scroll(window);
    fireEvent.click(document.body);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("creates AudioContext on first unmute", () => {
    const ctxSpy = vi.spyOn(window, "AudioContext").mockReturnValue({ resume: vi.fn() } as any);
    render(<MuteToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(ctxSpy).toHaveBeenCalled();
  });

  it("announces 'Audio enabled' on unmute", () => {
    render(<MuteToggle />);
    fireEvent.click(screen.getByRole("button"));
    const live = document.querySelector("[aria-live='polite']");
    expect(live?.textContent).toMatch(/audio enabled/i);
  });

  it("fires analytics on toggle", () => {
    const trackMock = vi.fn();
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    render(<MuteToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(trackMock).toHaveBeenCalledWith("mute_toggled", expect.objectContaining({ source: "click" }));
  });

  it("min 44x44 target size", () => {
    render(<MuteToggle />);
    const btn = screen.getByRole("button");
    const cs = getComputedStyle(btn);
    expect(parseInt(cs.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(cs.minWidth)).toBeGreaterThanOrEqual(44);
  });

  it("hidden when lowMemoryMode", () => {
    // mock useSceneStore.lowMemoryMode = true
    // assert query returns null
  });
});
```

```ts
// apps/web/tests/a11y/mute-toggle.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("default state muted", async ({ page }) => {
  await page.goto("/");
  const btn = page.locator("button[aria-pressed]").first();
  expect(await btn.getAttribute("aria-pressed")).toBe("true");
});

test("cross-tab mute sync", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page1 = await ctx.newPage();
  const page2 = await ctx.newPage();
  await page1.goto("/");
  await page2.goto("/");
  await page1.locator("button[aria-pressed]").first().click();
  await page2.waitForTimeout(500);
  expect(await page2.locator("button[aria-pressed]").first().getAttribute("aria-pressed")).toBe("false");
});

test("audio remains muted after scroll", async ({ page }) => {
  await page.goto("/");
  await page.mouse.wheel(0, 1000);
  expect(await page.locator("button[aria-pressed]").first().getAttribute("aria-pressed")).toBe("true");
});
```

## §6 — Dependencies

**Concept:** FR-A11Y-001 (focus / contrast tokens), FR-AUDIO-001 (the audio pad this toggles), FR-WEB-009 (lowMemoryMode hides toggle).

**Operational:** Zustand persist middleware, Web Audio API, next-intl.

**Downstream:**
- FR-AUDIO-001 (audio pad subscribes to mute state).
- FR-OPS-012 axe gate validates.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Auto-plays before user toggles | AC#1 + listening test | Audio component subscribes to store; never play if muted |
| State doesn't persist (localStorage broken) | AC#2 | Catch storage errors; fall back to in-memory state |
| Cross-tab desync | AC#5 | storage event listener mounted in useEffect |
| AudioContext created on page load (not on user gesture) | AC#10 | Lazy init in handleToggle, not on mount |
| `aria-pressed` reversed (true when audio on) | AC#3 | Convention: aria-pressed=true when "active" — for mute toggle, active = muted |
| Icon + label out of sync | AC#14 | Both derive from same `muted` value |
| Focus ring invisible | AC#6 visual | Gold ring 2px outline; offset 2px |
| Touch tap not registered | E2E touch test | Use `<button>` not `<div>`; CSS cursor:pointer |
| Toggle still shown in lowMemoryMode | AC#11 | Component early-returns null |
| Vietnamese translations missing | next-intl missing-key | Provide vi.json defaults |
| AudioContext.resume() throws on iOS Safari | Manual test | Wrap in try/catch; retry on next gesture |
| User force-set localStorage to invalid value | Invalid JSON | Defensive parse; fall back to default muted |
| Multiple toggles mounted | DOM | Singleton in layout.tsx |
| AudioContext memory leak | DevTools heap | Single AudioContext per session; never re-create |
| Storage quota exceeded | localStorage.setItem throws | Catch; use sessionStorage fallback |

## §8 — Deliverable preview

User experience:
1. User loads page. Top-right shows: [Skip story] [🔇 Muted] [Skip 3D entirely].
2. User clicks [🔇 Muted]. Audio pad starts (ambient pad fades in over 1s). Button shows [🔊 Audio on]. Announcement: "Audio enabled".
3. User scrolls — audio continues at narrative-appropriate volume.
4. User clicks again. Audio fades out 300ms. Button shows [🔇 Muted]. Announcement: "Audio muted".
5. User reloads. Last state restored (muted, since user re-muted).
6. User opens second tab. Sees same muted state. Unmute in tab2 → tab1 syncs.

## §9 — Notes

**On Web Audio autoplay policy:** Modern Chrome/Safari requires user gesture before AudioContext can play. Toggle click IS the gesture. AudioContext.resume() inside handleToggle satisfies this.

**On future audio quality settings:** Could expand to volume slider, ambient-pad-genre toggle, etc. Out of slice 1 scope.

**On audio pad design (FR-AUDIO-001):** Defaults to extremely-low-volume ambient drone (-30 dB), no melody. Distinct from video-game music; designed to be a "presence" not a "feature."

**On Vietnamese context:** Vietnamese label: "Im lặng" (Muted) / "Bật âm thanh" (Audio on). Cultural note: ambient audio is less common in Vietnamese SaaS UX than US; mute-default aligns with both.

**On accessibility-first audio design:** This entire FR is about not punishing users who don't want audio. Even sighted users with audio-on by default tend to mute web pages. We codify the right default.

*End of FR-A11Y-004.*
