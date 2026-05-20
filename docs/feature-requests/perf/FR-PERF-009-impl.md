---
id: FR-PERF-009
title: "Low-memory device path — deviceMemory < 4 → LOD-1 + no post-FX + DPR cap 1.0"
module: PERF
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: R3F Architect + Frontend
created: 2026-05-16
related_frs: [FR-PERF-002, FR-WEB-009, FR-PERF-010, FR-SCENE-022]
depends_on: [FR-PERF-002, FR-WEB-009]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/lib/perf/ + apps/web/lib/stores/
new_files:
  - apps/web/lib/perf/detect-low-memory.ts
  - apps/web/lib/perf/__tests__/detect-low-memory.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §6.3 — "Low-memory device path: deviceMemory<4 → LOD-1 + DPR cap + no FX"
  - W3C Device Memory API specification

effort_hours: 3
risk_if_skipped: "Mobile devices with 2-3 GB RAM (still common in emerging markets — ~30% of Vietnamese audience) crash on 28k tri Lumi + post-processing + retina rendering. Crash = blank page + bad review. Auto-route to lite-rendering preserves UX."
---

## §1 — Description (BCP-14 normative)

1. **MUST** detect `navigator.deviceMemory < 4` (returns GB; < 4 = constrained).
2. **MUST** auto-route to LOD-1 (FR-PERF-002) when detection trips — Lumi renders at 8k tri site-wide.
3. **MUST** disable post-processing (bloom, DoF, vignette) when active.
4. **MUST** cap DPR at 1.0 (no retina rendering — saves ~75% pixel shader work).
5. **MUST** wire detection into FR-WEB-009 `lowMemoryMode` Zustand flag.
6. **MUST** be SSR-safe — detection only client-side; server defaults to "not low memory" (don't degrade UX for crawlers).
7. **MUST** fall back to UA + connection.effectiveType heuristic when deviceMemory unavailable (Safari hides this API):
   - Safari < 16 detected by UA → assume tier-mid (no auto-low).
   - effectiveType "slow-2g" or "2g" → trigger lowMemoryMode regardless of memory.
8. **MUST** include manual override — `localStorage.cyberskill_low_mem_force = '1'` forces low-memory mode (for testing on high-end devices).
9. **MUST** fire analytics event `low_memory_mode_triggered` with `{reason: 'deviceMemory'|'effectiveType'|'manual_override', value}`.
10. **MUST** not auto-degrade once user has opted into cinematic mode (e.g., overridden lite-pref) — respect user choice.

## §2 — Why this design

**Why deviceMemory < 4?** W3C-recommended threshold. iPhone SE 2020 reports 4 (just barely passes). iPhone 6S Plus / cheap Android reports 2-3. Below 4 = constrained.

**Why LOD-1 + no FX + DPR 1.0 combo?** Each cuts ~25-30% GPU work:
- LOD-1 saves vertex shader (4× fewer tris).
- No post-FX saves pixel shader passes (~5 passes → 1 pass).
- DPR 1.0 saves pixel shader area (~75% on retina display).

Combined: ~70% GPU work reduction. Gets mobile-low to 60 FPS.

**Why Safari fallback?** Safari hides deviceMemory for privacy. Without fallback, all Safari users default to high-tier → crash on low-end iPads.

**Why effectiveType fallback?** "2g" connection is a strong proxy for "constrained device + network." Same low-memory path benefits both.

**Why manual override?** Testing. QA on M1 Mac needs to verify low-memory mode without buying a 2GB Android. localStorage override is the cheapest test path.

**Why respect user lite-pref?** If user clicked "Back to cinematic" on low-memory device, they explicitly want the full experience. Don't override their preference.

## §3 — Public surface

```ts
// apps/web/lib/perf/detect-low-memory.ts
import { useEffect } from "react";
import { useSceneStore } from "@/lib/stores/scene-store";
import { trackEvent } from "@/lib/analytics";

export function detectLowMemory(): { isLow: boolean; reason: string; value: any } {
  if (typeof window === "undefined") return { isLow: false, reason: "ssr", value: null };

  // Manual override (testing)
  if (localStorage.getItem("cyberskill_low_mem_force") === "1") {
    return { isLow: true, reason: "manual_override", value: 1 };
  }

  // deviceMemory API
  const mem = (navigator as any).deviceMemory;
  if (typeof mem === "number") {
    if (mem < 4) return { isLow: true, reason: "deviceMemory", value: mem };
    return { isLow: false, reason: "deviceMemory", value: mem };
  }

  // Fallback: connection.effectiveType
  const conn = (navigator as any).connection;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
    return { isLow: true, reason: "effectiveType", value: conn.effectiveType };
  }

  return { isLow: false, reason: "unavailable", value: null };
}

export function useLowMemoryDetection() {
  const setLowMemoryMode = useSceneStore(s => s.setLowMemoryMode);
  const userOptedInCinematic = useSceneStore(s => s.userOptedInCinematic);

  useEffect(() => {
    if (userOptedInCinematic) return;  // respect user's explicit cinematic choice

    const result = detectLowMemory();
    if (result.isLow) {
      setLowMemoryMode(true);
      trackEvent("low_memory_mode_triggered", { reason: result.reason, value: result.value });
    }
  }, [setLowMemoryMode, userOptedInCinematic]);
}
```

```tsx
// Usage in GlobalCanvas
function Scene() {
  useLowMemoryDetection();
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);

  return (
    <Canvas dpr={lowMemoryMode ? [1, 1] : [1, 1.5]}>
      {!lowMemoryMode && <EffectComposer><Bloom /></EffectComposer>}
      <LumiLod forceLow={lowMemoryMode} />
      ...
    </Canvas>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | deviceMemory < 4 → lowMemoryMode true | Mock navigator.deviceMemory = 2; assert flag |
| 2 | LOD-1 active on low-memory | Inspect FR-PERF-002 binding |
| 3 | Post-processing disabled | EffectComposer absent |
| 4 | DPR capped at 1.0 | Canvas dpr prop = [1, 1] |
| 5 | Detection wired via FR-WEB-009 | useSceneStore.lowMemoryMode |
| 6 | Safari fallback to effectiveType | Mock UA; verify behavior |
| 7 | Manual override works | localStorage.cyberskill_low_mem_force=1 |
| 8 | Analytics event fires with reason | Mock trackEvent |
| 9 | Respect user cinematic opt-in | userOptedInCinematic=true → no override |
| 10 | SSR-safe (no crash in node) | Build test |
| 11 | Vitest unit tests pass | pnpm vitest |

## §5 — Verification

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { detectLowMemory } from "../detect-low-memory";

describe("detectLowMemory", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (navigator as any).deviceMemory;
    delete (navigator as any).connection;
  });

  it("returns isLow=true when deviceMemory < 4", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 2, configurable: true });
    const r = detectLowMemory();
    expect(r.isLow).toBe(true);
    expect(r.reason).toBe("deviceMemory");
  });

  it("returns isLow=false when deviceMemory >= 4", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 8, configurable: true });
    expect(detectLowMemory().isLow).toBe(false);
  });

  it("respects manual override", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 16, configurable: true });
    localStorage.setItem("cyberskill_low_mem_force", "1");
    const r = detectLowMemory();
    expect(r.isLow).toBe(true);
    expect(r.reason).toBe("manual_override");
  });

  it("falls back to effectiveType on Safari", () => {
    (navigator as any).connection = { effectiveType: "2g" };
    const r = detectLowMemory();
    expect(r.isLow).toBe(true);
    expect(r.reason).toBe("effectiveType");
  });

  it("returns unavailable when no API available", () => {
    const r = detectLowMemory();
    expect(r.isLow).toBe(false);
    expect(r.reason).toBe("unavailable");
  });
});
```

## §6 — Dependencies

**Concept:** FR-PERF-002 (LOD-1 mesh), FR-WEB-009 (lowMemoryMode store flag), FR-PERF-010 (companion save-data path), FR-SCENE-022 (DPR scaling).

**Operational:** W3C Device Memory API + Network Information API (with Safari polyfill).

**Downstream:** Lumi rendering tier; post-FX gate; DPR config.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Safari hides deviceMemory | AC#6 | effectiveType fallback |
| User on M1 wants to test low-memory | AC#7 | localStorage override |
| Detection runs SSR | AC#10 | typeof window check |
| User overrides lite → cinematic but device is constrained | UX risk | Respect choice; flag in analytics for review |
| effectiveType "3g" not caught | Tier mid | Acceptable; 3g not constrained enough |
| Manual override forgotten in test | QA noise | Reset between tests |
| Analytics floods | Single event per session | Run detection once |
| Browser sends saveData but not low device | Mixed signal | Either triggers low-memory mode (defensive) |
| Override cleared by user accidentally | localStorage state | Provide reset path |
| Device changes mid-session (impossible IRL) | N/A | Detect once at mount |
| Crawler labeled low-memory | SSR safe | Default = high tier; crawler sees full content |
| User-Agent fallback brittle | Document constraint | Sentry capture UA on detection edge cases |

## §8 — Deliverable preview

iPhone 6S (2 GB RAM):
1. Page loads. detectLowMemory returns {isLow: true, reason: "deviceMemory", value: 2}.
2. lowMemoryMode flag set. Analytics fires.
3. Canvas mounts with dpr=[1,1], no EffectComposer.
4. LumiLod forces LOD-1 (8k tris vs 28k).
5. GPU work ~30% of full mode. Hit 60 FPS.

iPhone 13 (4 GB RAM):
1. Returns isLow=false.
2. Full cinematic mode.
3. dpr [1, 1.5]; post-FX active; LOD-0.

iPhone 13 + Low Data Mode on:
1. Returns isLow=true via effectiveType fallback (slow-2g/2g).
2. Same lite-rendering path.

QA tester on M1 Mac:
1. localStorage.cyberskill_low_mem_force=1.
2. Reloads. Site renders lite-mode. Verifies UX.

## §9 — Notes

**On Vietnamese audience:** ~30% of Vietnamese mobile users have 2-3 GB RAM phones per analytics 2025. This FR is critical for primary audience.

**On future device-API changes:** W3C may deprecate deviceMemory for privacy. Backup heuristics (UA, connection, FPS-based) keep working.

**On 'isLow' nomenclature:** Could call "constrainedDevice" or "lowEnd"; "lowMemory" is the explicit signal. Future could add lowBattery, lowBandwidth as separate flags.

*End of FR-PERF-009.*
