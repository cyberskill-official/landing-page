---
id: FR-SCENE-022
title: "DPR + particle scaling per breakpoint — high 1.5 / mid 1.0 / low 0.75 + particle count caps"
module: SCENE
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: R3F Architect + Frontend Lead
created: 2026-05-16
shipped: 2026-05-19
strict_audited: 2026-05-19
related_frs: [FR-SCENE-012, FR-SCENE-016, FR-WEB-009, FR-PERF-006, FR-PERF-010]
depends_on: [FR-WEB-001, FR-SCENE-012]
blocks: [FR-PERF-010]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.5 — "DPR scaling: high-end 1.5, mid 1.0, low 0.75"
  - docs/01-master-plan-v2.md §6.3 — particle count caps by device tier
  - docs/01-master-plan-v2.md §6.1 — perf budgets (60 fps target / 45 fps fail)

language: typescript + react 19 + r3f 9
service: apps/web/lib/
new_files:
  - apps/web/lib/dpr-scaling.ts
  - apps/web/lib/device-tier.ts
  - apps/web/lib/use-device-tier.ts
  - apps/web/lib/__tests__/dpr-scaling.unit.test.ts

effort_hours: 8
risk_if_skipped: "Without DPR scaling, mid-tier mobile runs canvas at full DPR 3.0 + 200 particles, dropping fps to 15-20. Cinematic feels broken. FR-PERF-010 mobile gate fails."
---

## §1 — Description (BCP-14 normative)

1. **MUST** detect device tier via `useDeviceTier()` hook combining `navigator.deviceMemory`, `navigator.hardwareConcurrency`, and GPU renderer (UNMASKED_RENDERER_WEBGL). Three tiers: `"high" | "mid" | "low"`.

2. **MUST** scale Canvas DPR per tier:
   - high: `[1, 1.5]` (cap at 1.5 retina)
   - mid: `[1, 1.0]`
   - low: `[0.5, 0.75]` (sub-native for speed)

3. **MUST** scale FR-SCENE-012 particle counts per tier × viewport:
   - high: 200 desktop / 100 tablet / 50 mobile
   - mid: 100 / 50 / 25
   - low: 50 / 25 / 0 (disabled on low mobile)

4. **MUST** scale FR-SCENE-016 Scene 4 bokeh count per tier: 12 / 8 / 4.

5. **MUST** scale post-processing FX (when FR-PERF-003 lands): high=all, mid=bloom only, low=none.

6. **MUST** integrate with FR-WEB-009 lowMemoryMode signal — force tier to "low" when set.

7. **MUST** be SSR-safe (default "high" on server; client overrides post-hydration).

8. **MUST** ship Vitest unit tests for tier detection + DPR mapping + override.

9. **MUST** ship Playwright integration tests at mocked tiers verifying applied DPR + particle counts.

10. **SHOULD** include `?debug=tier` dev overlay showing detected tier + applied DPR + particle counts.

## §2 — Why this design

**Why three tiers (not continuous DPR)?** Continuous DPR creates inconsistent visual experience between similar devices. Three buckets give predictable QA behavior. Each tier explicitly testable.

**Why GPU renderer detection?** deviceMemory isn't always exposed (Safari/Firefox); hardwareConcurrency isn't always accurate. GPU renderer string is the most reliable signal — Apple M1+ is high regardless of memory; older Adreno is low regardless of cores.

**Why disable particles entirely on low mobile?** Allocating GPU resources for 25 particles when device can barely render Lumi is wasteful. Disabling preserves the budget for critical content.

**Why FR-WEB-009 override?** lowMemoryMode is authoritative "this device is constrained" signal. Tier detection is auto-fallback; user/system override is the gate.

## §3 — Public surface

```ts
// device-tier.ts
export type DeviceTier = "high" | "mid" | "low";

export function detectDeviceTier(): DeviceTier {
  if (typeof navigator === "undefined") return "high";
  const memory = (navigator as any).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memTier: DeviceTier = memory >= 8 ? "high" : memory >= 4 ? "mid" : "low";
  const cpuTier: DeviceTier = cores >= 8 ? "high" : cores >= 4 ? "mid" : "low";
  let gpuTier: DeviceTier = "high";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
    if (dbg && gl) {
      const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
      if (/M1|M2|M3|RTX|Adreno 7|Mali-G7/.test(renderer)) gpuTier = "high";
      else if (/Adreno 6|Mali-G5|Intel/.test(renderer)) gpuTier = "mid";
      else gpuTier = "low";
    }
  } catch { /* graceful */ }
  const order = { high: 3, mid: 2, low: 1 };
  const resolved = Math.min(Math.max(order[memTier], order[cpuTier]), order[gpuTier]);
  return resolved === 3 ? "high" : resolved === 2 ? "mid" : "low";
}

// dpr-scaling.ts
export const DPR_BY_TIER = {
  high: [1, 1.5] as [number, number],
  mid:  [1, 1.0] as [number, number],
  low:  [0.5, 0.75] as [number, number],
};
export const PARTICLE_COUNT_BY_TIER_VIEWPORT = {
  high: { desktop: 200, tablet: 100, mobile: 50 },
  mid:  { desktop: 100, tablet: 50,  mobile: 25 },
  low:  { desktop: 50,  tablet: 25,  mobile: 0  },
};
export const BOKEH_COUNT_BY_TIER = { high: 12, mid: 8, low: 4 };

// use-device-tier.ts
import { useEffect, useState } from "react";
import { detectDeviceTier, type DeviceTier } from "./device-tier";
import { useSceneStore } from "./stores";

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");
  const lowMemoryMode = useSceneStore(s => s.lowMemoryMode);
  useEffect(() => {
    setTier(lowMemoryMode ? "low" : detectDeviceTier());
  }, [lowMemoryMode]);
  return tier;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | High-tier device → DPR [1, 1.5] | Vitest mock navigator + Canvas dpr prop |
| 2 | Mid-tier device → DPR [1, 1.0] | Same |
| 3 | Low-tier device → DPR [0.5, 0.75] | Same |
| 4 | High desktop → 200 particles | Particle count match |
| 5 | Low mobile → 0 particles (disabled) | Particle component returns null |
| 6 | High Scene 4 bokeh = 12 spheres | Component count |
| 7 | lowMemoryMode forces tier "low" | Override test |
| 8 | SSR defaults "high" | curl HTML check |
| 9 | GPU renderer detection on Apple M1 | Mock UNMASKED_RENDERER_WEBGL |
| 10 | Vitest unit tests pass | CI |
| 11 | `?debug=tier` overlay renders | Query param |
| 12 | FR-PERF-010 mobile perf gate passes at low-tier | Lighthouse |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { detectDeviceTier } from "../device-tier";

describe("device tier", () => {
  it("high on 16GB + 12 cores", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 16, configurable: true });
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 12, configurable: true });
    expect(detectDeviceTier()).toBe("high");
  });
  it("low on 2GB + 2 cores", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 2, configurable: true });
    Object.defineProperty(navigator, "hardwareConcurrency", { value: 2, configurable: true });
    expect(detectDeviceTier()).toBe("low");
  });
});
```

## §6 — Dependencies

**Concept:** FR-SCENE-012 (particles), FR-SCENE-016 (bokeh), FR-WEB-009 (lowMemoryMode).

**Operational:** FR-WEB-001 (Canvas), FR-WEB-004 (stores).

**Downstream:** FR-PERF-010 (mobile perf gate).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Tier detection wrong on M1 (false low) | AC#9 | Adjust GPU regex |
| Particles still render at high on low tier | AC#5 | Particle component subscribes to tier |
| DPR overshoot on retina | AC#1 | Cap at 1.5 max |
| SSR ships low tier (degradation pre-hydration) | AC#8 | Default "high" SSR; client overrides |
| lowMemoryMode doesn't downgrade | AC#7 | Subscribe useSceneStore.lowMemoryMode |
| Resize doesn't re-detect | Manual test | resize listener |
| GPU detection throws (Firefox privacy) | Try/catch | Default to mid on failure |
| Particle disable still runs useFrame | Perf | Early-return when count === 0 |
| Tier swap mid-session causes flicker | Visual | Debounce changes |

## §8 — Deliverable preview

- High desktop: DPR 1.5, 200 particles, 12 bokeh, all FX.
- Mid laptop: DPR 1.0, 100 particles, 8 bokeh, bloom only.
- Low mobile: DPR 0.75, 0 particles, 4 bokeh, no FX.
- lowMemoryMode override forces low.

## §9 — Notes

**On user override:** Slice 2 may add user settings panel to manually pick tier.

**On real-world GPU strings:** Returns prefixed like "ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro)". Regex liberal — match key terms not exact strings.

*End of FR-SCENE-022.*
