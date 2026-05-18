---
id: FR-CTA-007
title: "Lumi form reactions — mouth_smile/summon/wave_goodbye animations on form step changes + outcomes"
module: CTA
priority: SHOULD
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: Frontend Lead + Animator
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-005, FR-CHAR-011, FR-WEB-004, FR-SCENE-018]
depends_on: [FR-CTA-002, FR-CHAR-011]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/lib/stores/ + apps/web/components/cta/forms/
new_files:
  - apps/web/lib/stores/lumiStore.ts
  - apps/web/lib/forms/use-lumi-form-reactions.ts
  - apps/web/lib/forms/__tests__/use-lumi-form-reactions.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §9.1 Track 1 — "Lumi reacts on each form step"
  - FR-CHAR-011 §3 — animation priority + NLA clip names
  - FR-WEB-004 — Zustand store contract

effort_hours: 4
risk_if_skipped: "Form-Lumi sync is a brand-personality beat. Without it: forms feel like generic React forms; Lumi sits idle while user fills out fields, breaking the cinematic continuity. COULD-be-SHOULD priority — not blocking, but a meaningful piece of brand differentiation."
---

## §1 — Description (BCP-14 normative)

1. **MUST** trigger Lumi animation changes on the following form events (CTA-002 Buy, CTA-003 Partner, CTA-004 Join forms):

   | Event | Animation | Priority |
   |---|---|---|
   | Form mount (any track) | `mouth_smile` | 30 |
   | Step 1 → Step 2 advance | `summon` | 40 |
   | Step 2 → Step 3 advance | `summon` | 40 |
   | Field focus (any) | (no change — too noisy) | — |
   | Validation error | `idle_concerned` (gentle frown) | 50 |
   | Submit success | `wave_goodbye` | 60 |
   | Submit error (network) | `idle_concerned` | 50 |
   | Form close (cancel) | `idle` | 20 |
   | Form close (after success) | `idle` after `wave_goodbye` completes | 20 |

2. **MUST** use Zustand store `useLumiStore.setCurrentAnim(anim, priority)` from FR-WEB-004 / FR-CHAR-011.

3. **MUST NOT** interrupt a higher-priority animation:
   - Scene transition animations have priority **100** (e.g. `wave_at_lumi` during Scene 0→1 transition).
   - Form animations top out at **60** (wave_goodbye) — never override scene transitions.

4. **MUST** restore Lumi to `idle` after form closes — `useEffect` cleanup handler sets idle on unmount.

5. **MUST** queue animations correctly when multiple form events fire rapidly:
   - User submits, then quickly clicks cancel → wave_goodbye plays out, then idle.
   - Priority queue manages: lower-priority anim does not interrupt higher-priority in progress.

6. **MUST** be implemented as a shared hook `useLumiFormReactions(formState)` that all 3 form components import. Single source of truth for the form → Lumi binding.

7. **MUST** respect FR-WEB-009 `lowMemoryMode` — when active, do NOT trigger Lumi animations (Lumi may not be rendering in lite mode).

8. **MUST** respect `prefers-reduced-motion` — when active, do NOT trigger animations (only static poses).

9. **MUST** debounce step-advance triggers ≥ 200 ms — prevents rapid double-click spamming animations.

10. **MUST NOT** rely on form-specific anim names — animations are generic ("summon", "mouth_smile") so all 3 forms reuse same library.

11. **MUST** track analytics event `lumi_form_reaction_fired` with `{ anim, trigger, form_track }` for design tuning observability.

12. **MUST** cleanup correctly when form unmounts mid-anim — set idle, do not leave Lumi stuck.

13. **SHOULD** include subtle Lumi gaze direction toward form (camera-relative head-look bone tilt) when form is mounted, return to default look forward when form closes. Out of slice 1 scope unless trivial.

## §2 — Why this design

**Why per-step animation reaction?** Static Lumi during a 3-step form feels like Lumi "fell asleep." Per-step animation gives the user a sense of "Lumi is paying attention." Brand: Lumi is a companion, not a chatbot.

**Why priority queue?** Multiple animations could be triggered simultaneously (e.g., user submits while another scene-transition fires). Without priority, lower-importance animation overrides higher → cinematic continuity breaks. Priority enum is master plan §9.1 codified.

**Why centralized hook?** Each form would otherwise re-implement the same logic. Centralized hook = single test surface, single bug-fix location.

**Why no focus-event animations?** Initially planned, removed in design review: every focus change firing an animation made Lumi look "twitchy." Step-level granularity is the right interval.

**Why debounce 200 ms?** Rapid Next button clicks (user double-click, accessibility tool repeat) could fire 5 animations in 1 second. Debounce smooths to one anim per intentional advance.

**Why respect lowMemoryMode + reduced-motion?** Both signal "don't render animation." Lumi animations are NOT essential to form function — they're delight. Easy to disable when constrained.

**Why analytics on reactions?** Hypothesis testing: which reactions correlate with form completion? wave_goodbye after submit success → does it help next-page conversion? Data-informed iteration.

**Why don't animations stack (queue, not interrupt)?** Half-played animations look broken. Letting the current animation complete before next, even if it takes 600ms, preserves polish.

## §3 — Public surface

```ts
// apps/web/lib/stores/lumi-store.ts (extension)
import { create } from "zustand";

export type LumiAnim =
  | "idle"
  | "mouth_smile"
  | "summon"
  | "wave_goodbye"
  | "wave_at_lumi"
  | "idle_concerned"
  | "fly_in"
  | "fly_out";

interface QueuedAnim {
  anim: LumiAnim;
  priority: number;
  startedAt: number;
}

interface LumiState {
  currentAnim: LumiAnim;
  currentPriority: number;
  queue: QueuedAnim[];
  setCurrentAnim: (anim: LumiAnim, priority: number) => boolean;
  resetIdle: () => void;
}

export const useLumiStore = create<LumiState>((set, get) => ({
  currentAnim: "idle",
  currentPriority: 0,
  queue: [],
  setCurrentAnim: (anim, priority) => {
    const cur = get().currentPriority;
    if (priority < cur) {
      // Lower priority; queue but don't interrupt
      set(s => ({ queue: [...s.queue, { anim, priority, startedAt: Date.now() }] }));
      return false;
    }
    set({ currentAnim: anim, currentPriority: priority });
    return true;
  },
  resetIdle: () => set({ currentAnim: "idle", currentPriority: 0, queue: [] }),
}));
```

```ts
// apps/web/lib/forms/use-lumi-form-reactions.ts
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useLumiStore, type LumiAnim } from "@/lib/stores/lumi-store";
import { useSceneStore } from "@/lib/stores/scene-store";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { trackEvent } from "@/lib/analytics";

interface FormReactionOptions {
  track: "buy" | "partner" | "join";
  currentStep?: number;
  submitStatus?: "idle" | "submitting" | "success" | "error";
}

export function useLumiFormReactions(opts: FormReactionOptions) {
  const setAnim = useLumiStore(s => s.setCurrentAnim);
  const resetIdle = useLumiStore(s => s.resetIdle);
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);
  const prefersReducedMotion = useReducedMotion();
  const lastStepRef = useRef<number | undefined>(undefined);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const disabled = lowMemoryMode || prefersReducedMotion;

  // Mount → mouth_smile
  useEffect(() => {
    if (disabled) return;
    setAnim("mouth_smile", 30);
    trackEvent("lumi_form_reaction_fired", { anim: "mouth_smile", trigger: "mount", form_track: opts.track });
    return () => {
      resetIdle();
    };
  }, []);  // intentionally empty: only on mount

  // Step advance → summon (debounced)
  useEffect(() => {
    if (disabled) return;
    if (lastStepRef.current !== undefined && opts.currentStep !== lastStepRef.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAnim("summon", 40);
        trackEvent("lumi_form_reaction_fired", { anim: "summon", trigger: "step_advance", form_track: opts.track });
      }, 200);
    }
    lastStepRef.current = opts.currentStep;
  }, [opts.currentStep, disabled]);

  // Submit status changes
  useEffect(() => {
    if (disabled) return;
    if (opts.submitStatus === "success") {
      setAnim("wave_goodbye", 60);
      trackEvent("lumi_form_reaction_fired", { anim: "wave_goodbye", trigger: "submit_success", form_track: opts.track });
      // Restore to idle after anim completes (clip length from FR-CHAR-011, typically 2.5s)
      setTimeout(() => resetIdle(), 2500);
    } else if (opts.submitStatus === "error") {
      setAnim("idle_concerned", 50);
      trackEvent("lumi_form_reaction_fired", { anim: "idle_concerned", trigger: "submit_error", form_track: opts.track });
    }
  }, [opts.submitStatus, disabled]);

  return { disabled };  // expose for testing
}
```

```tsx
// Usage in any CTA form
function PartnerForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  useLumiFormReactions({ track: "partner", currentStep: step, submitStatus: status });
  // ... rest of form ...
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | mouth_smile on form mount | Mock setAnim; assert called with "mouth_smile" |
| 2 | summon on step advance | Vitest: increment currentStep, assert summon fires |
| 3 | wave_goodbye on submit success | Mock setAnim |
| 4 | idle_concerned on validation/network error | Mock setAnim |
| 5 | idle restored on form unmount | Vitest cleanup; assert resetIdle called |
| 6 | Priority enforcement — scene transition not overridden | Mock currentPriority=100; assert form anim (priority 40) does NOT change state |
| 7 | Debounce 200 ms on rapid step changes | Trigger 5 step changes in 100ms; assert single setAnim call |
| 8 | No anims when lowMemoryMode | Mock store; assert setAnim NOT called |
| 9 | No anims when prefers-reduced-motion | Mock matchMedia; assert setAnim NOT called |
| 10 | Analytics event fires per reaction | Mock trackEvent; assert called with correct args |
| 11 | Shared across all 3 forms | All 3 import useLumiFormReactions |
| 12 | Vitest unit tests pass | `pnpm vitest run apps/web/lib/forms/__tests__/use-lumi-form-reactions.unit.test.ts` |
| 13 | Visual smoke test (Playwright) — submit form, see Lumi wave | Manual verify on staging |

## §5 — Verification

```ts
// apps/web/lib/forms/__tests__/use-lumi-form-reactions.unit.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLumiFormReactions } from "../use-lumi-form-reactions";
import { useLumiStore } from "@/lib/stores/lumi-store";

describe("useLumiFormReactions", () => {
  beforeEach(() => {
    useLumiStore.setState({ currentAnim: "idle", currentPriority: 0, queue: [] });
  });

  it("fires mouth_smile on mount", () => {
    renderHook(() => useLumiFormReactions({ track: "buy", currentStep: 1 }));
    expect(useLumiStore.getState().currentAnim).toBe("mouth_smile");
    expect(useLumiStore.getState().currentPriority).toBe(30);
  });

  it("fires summon on step advance (debounced)", async () => {
    const { rerender } = renderHook(
      (props) => useLumiFormReactions(props),
      { initialProps: { track: "buy" as const, currentStep: 1 } }
    );
    rerender({ track: "buy", currentStep: 2 });
    await act(() => new Promise(r => setTimeout(r, 250)));
    expect(useLumiStore.getState().currentAnim).toBe("summon");
  });

  it("fires wave_goodbye on submit success", async () => {
    const { rerender } = renderHook(
      (props) => useLumiFormReactions(props),
      { initialProps: { track: "buy" as const, submitStatus: "idle" as any } }
    );
    rerender({ track: "buy", submitStatus: "success" as const });
    expect(useLumiStore.getState().currentAnim).toBe("wave_goodbye");
    expect(useLumiStore.getState().currentPriority).toBe(60);
  });

  it("does NOT override higher-priority scene anim", () => {
    useLumiStore.setState({ currentAnim: "fly_in", currentPriority: 100 });
    renderHook(() => useLumiFormReactions({ track: "buy", currentStep: 1 }));
    expect(useLumiStore.getState().currentAnim).toBe("fly_in");  // not changed
  });

  it("debounces rapid step changes", async () => {
    const setSpy = vi.spyOn(useLumiStore.getState(), "setCurrentAnim");
    const { rerender } = renderHook(
      (props) => useLumiFormReactions(props),
      { initialProps: { track: "buy" as const, currentStep: 1 } }
    );
    rerender({ track: "buy", currentStep: 2 });
    rerender({ track: "buy", currentStep: 3 });
    rerender({ track: "buy", currentStep: 2 });
    await act(() => new Promise(r => setTimeout(r, 250)));
    // Only last step change should fire (others debounced away)
    const summonCalls = setSpy.mock.calls.filter(c => c[0] === "summon");
    expect(summonCalls.length).toBe(1);
  });

  it("disables when lowMemoryMode", () => {
    useSceneStore.setState({ lowMemoryMode: true });
    const setSpy = vi.spyOn(useLumiStore.getState(), "setCurrentAnim");
    renderHook(() => useLumiFormReactions({ track: "buy", currentStep: 1 }));
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("disables on prefers-reduced-motion", () => {
    Object.defineProperty(window, "matchMedia", {
      value: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
      configurable: true,
    });
    const setSpy = vi.spyOn(useLumiStore.getState(), "setCurrentAnim");
    renderHook(() => useLumiFormReactions({ track: "buy", currentStep: 1 }));
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("restores idle on unmount", () => {
    const { unmount } = renderHook(() => useLumiFormReactions({ track: "buy", currentStep: 1 }));
    unmount();
    expect(useLumiStore.getState().currentAnim).toBe("idle");
  });

  it("fires analytics events", () => {
    const trackMock = vi.fn();
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    renderHook(() => useLumiFormReactions({ track: "partner", currentStep: 1 }));
    expect(trackMock).toHaveBeenCalledWith("lumi_form_reaction_fired", expect.objectContaining({
      anim: "mouth_smile",
      trigger: "mount",
      form_track: "partner",
    }));
  });
});
```

## §6 — Dependencies

**Concept:** FR-CHAR-011 (NLA clip catalog provides anim names + lengths), FR-WEB-004 (Zustand store contract), FR-CTA-005 (form state observation).

**Operational:** Zustand, react-hook-form FormContext (optional pass-through).

**Downstream:** All 3 CTA form components import this hook.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Animation queue race (rapid step changes) | AC#7 | 200ms debounce |
| Lumi stuck in mid-anim after form close | AC#5 | useEffect cleanup; resetIdle |
| Priority override breaks scene transition | AC#6 | priority queue in store; lower never overrides higher |
| Animation doesn't exist (typo / wrong name) | Three.js console error | Type-checked LumiAnim enum |
| wave_goodbye doesn't restore to idle | AC#5 | setTimeout(resetIdle, 2500) after submit success |
| Lumi never reacts (hook not called in form) | Manual visual | All 3 forms import hook; CI grep check |
| Analytics event spam (every render fires) | trackEvent call count | useEffect dependency arrays correct; only state changes trigger |
| Multiple forms mounted simultaneously (race) | Edge case | Single form open at a time; CTA hub orchestrates |
| Animation plays while user reads error (distracting) | Visual UX | idle_concerned is subtle; not a flashy clip |
| Lumi not rendering in /lite | Visual | useEffect guard checks lowMemoryMode; no-op on lite |
| Reduced-motion edge case (user toggles mid-form) | Manual test | useReducedMotion subscribes to media query; re-evaluates |
| Hook re-creates timeout on every render | Memory leak | useRef stores timeout; cleanup on unmount |
| FormState subscription causes excessive renders | Performance | useFormContext only for status; not field values |
| `idle_concerned` not in FR-CHAR-011 catalog | Spec mismatch | Verify clip name; if missing, fallback to idle |
| Scene transition fires during form open | Conflict | Priority queue resolves; scene wins (priority 100) |

## §8 — Deliverable preview

User experience:
1. User clicks "Partner with us" → form mounts. Lumi smiles (`mouth_smile`).
2. User fills Step 1, clicks Next. Lumi performs `summon` gesture (palms forward, gentle pulse, 1.2s).
3. User completes Step 2 → 3 advance: another `summon`.
4. User clicks Submit. Loading state. Server returns 200.
5. Lumi performs `wave_goodbye` (2.5s clip — hand wave, head bow).
6. Success card displays "Thanks. Our partner-success lead will respond in 24h."
7. Form closes. Lumi returns to idle.

User experience with error:
1. User fills + submits.
2. Server returns 503 (HubSpot down).
3. Lumi shows `idle_concerned` (subtle frown, looks down).
4. Error banner: "Network error. Retry?"
5. User clicks retry → submit succeeds → wave_goodbye → idle.

User with reduced-motion preference:
1. Form mounts. Lumi remains in idle pose (no animation change).
2. User completes flow. Submit succeeds. Lumi stays idle.
3. Success card still appears; cinematic-Lumi just stays static.

## §9 — Notes

**On animation timing calibration:** All clip lengths from FR-CHAR-011 catalog. `wave_goodbye` ~2.5s; `summon` ~1.2s; `mouth_smile` ~0.8s loop-and-hold. Pacing matches form step cadence.

**On gaze direction (slice 2 enhancement):** Subtle head-look toward open form would deepen the connection. Requires bone-targeting math (camera-relative head rotation); out of slice 1 scope.

**On Vietnamese cultural fit:** `wave_goodbye` is a casual hand wave (Vietnamese norm). NOT a deep bow (too formal) or a salute (too military). Matches the casual nón lá brand register (FR-CHAR-003).

**On future audio cues:** Could add subtle sound on Lumi animations (page-turn whisper on summon, soft "ding" on wave_goodbye). Slice 3 + requires FR-A11Y-004 mute toggle integration.

**On A/B testing:** Hypothesis — does Lumi-reaction increase form-completion rate? Track via analytics. If no measurable lift, scope down to mount + success only. Slice 2 data review.

*End of FR-CTA-007.*
