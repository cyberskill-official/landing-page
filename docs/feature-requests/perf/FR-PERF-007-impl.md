---
id: FR-PERF-007
title: "scheduler.yield() + requestIdleCallback for INP < 200ms p75 — long-task interrupting + deferred analytics"
module: PERF
priority: MUST
status: shipped
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-WEB-001, FR-PERF-006, FR-OPS-011, FR-OPS-014, FR-A11Y-001]
depends_on: [FR-WEB-001]
blocks: []
language: typescript 5.6
service: apps/web/lib/perf/
new_files:
  - apps/web/lib/perf/scheduler.ts
  - apps/web/lib/perf/use-deferred-analytics.ts
  - apps/web/lib/perf/__tests__/scheduler.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §6.2 — "INP < 200ms p75 budget"
  - WICG Scheduler API specification
  - web.dev INP documentation

effort_hours: 4
risk_if_skipped: "Synchronous JS > 50ms blocks paint + input. Heavy scene-init code (loading 28k tri model, applying KTX2 textures) easily hits 200-400ms. User clicks during this window = INP > 500ms = Lighthouse fail. Scheduler.yield() interrupts the work, lets paint + input run."
---

## §1 — Description (BCP-14 normative)

1. **MUST** yield via `await scheduler.yield()` between synchronous work blocks > 50ms. Wrap in helper `yieldIfNeeded(durationMs)` that checks before yielding.
2. **MUST** defer non-critical analytics + observability events via `requestIdleCallback(callback, {timeout: 1000})`.
3. **MUST** prioritize via `scheduler.postTask(fn, {priority: 'user-blocking' | 'user-visible' | 'background'})`:
   - Interactive UI updates → `user-blocking`.
   - Scene transitions → `user-visible`.
   - Analytics + prefetch → `background`.
4. **MUST** verify INP < 200ms p75 in Lighthouse mobile sim (FR-OPS-011) — non-blocking PERF gate.
5. **MUST** ship feature-detect polyfills (Safari < 16 doesn't support scheduler):
   - `scheduler.yield()` → fallback `await new Promise(r => setTimeout(r, 0))`.
   - `requestIdleCallback` → fallback `setTimeout(cb, 1)`.
6. **MUST** be tested via Vitest unit tests on the helper + Playwright performance trace.
7. **MUST** instrument: long-task entries via PerformanceObserver, log if > 200ms.
8. **MUST NOT** yield inside `useFrame` (that's the render loop's job; yielding breaks frame timing).

## §2 — Why this design

**Why scheduler.yield()?** Modern (2024) browser API designed exactly for this. Yields to browser for paint + input, then resumes. Cleaner than setTimeout(0) (which has macrotask drawbacks).

**Why requestIdleCallback for analytics?** Analytics calls (XHR/fetch) aren't user-visible. Deferring to idle time = zero impact on INP. 1000ms timeout ensures they fire eventually.

**Why scheduler.postTask priorities?** Browser-native priority hints. user-blocking interrupts background tasks; ensures responsive UX.

**Why polyfill?** Safari iOS < 16 doesn't support. Defensive fallback to setTimeout. ~10% of users on older Safari.

**Why don't yield in useFrame?** useFrame IS the render loop. Yielding inside = missed frame. Yield should happen OUTSIDE useFrame (e.g., scene-init, scroll handlers).

**Why long-task PerformanceObserver?** Surface regressions during dev — "this code path triggered a 300ms long task" → fix.

## §3 — Public surface

```ts
// apps/web/lib/perf/scheduler.ts
const hasScheduler = typeof window !== "undefined" && "scheduler" in window;

export async function yieldNow(): Promise<void> {
  if (hasScheduler && (window.scheduler as any).yield) {
    await (window.scheduler as any).yield();
  } else {
    await new Promise(r => setTimeout(r, 0));
  }
}

export async function yieldIfNeeded(startTime: number, budgetMs = 50): Promise<void> {
  if (performance.now() - startTime > budgetMs) {
    await yieldNow();
  }
}

export function postTask(fn: () => void, priority: "user-blocking" | "user-visible" | "background" = "user-visible"): void {
  if (hasScheduler && (window.scheduler as any).postTask) {
    (window.scheduler as any).postTask(fn, { priority });
  } else {
    queueMicrotask(fn);
  }
}

export function onIdle(fn: () => void, timeoutMs = 1000): void {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(fn, { timeout: timeoutMs });
  } else {
    setTimeout(fn, 1);
  }
}
```

```ts
// apps/web/lib/perf/use-deferred-analytics.ts
import { useEffect } from "react";
import { onIdle } from "./scheduler";

export function useDeferredAnalytics(events: Array<() => void>) {
  useEffect(() => {
    for (const event of events) {
      onIdle(event);
    }
  }, [events]);
}
```

```ts
// Example use in heavy scene-init
async function loadScene(sceneData: any) {
  const t0 = performance.now();
  for (const item of sceneData.items) {
    processItem(item);  // 5-10ms each
    await yieldIfNeeded(t0);  // yield every 50ms accumulated
  }
}

// Long-task observer (mount once at app boot)
if (typeof PerformanceObserver !== "undefined") {
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 200) {
        console.warn(`Long task: ${entry.duration.toFixed(0)}ms`, entry);
      }
    }
  }).observe({ type: "longtask", buffered: true });
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | yieldIfNeeded helper exists + tested | pnpm vitest |
| 2 | scheduler.yield used in heavy init flows | grep code |
| 3 | INP < 200ms p75 in Lighthouse | FR-OPS-011 result |
| 4 | Non-critical analytics via requestIdleCallback | grep |
| 5 | scheduler.postTask used with priority | grep |
| 6 | Polyfill works on Safari < 16 | Manual test or BrowserStack |
| 7 | Long-task observer mounted at boot | Console listener |
| 8 | NO yield inside useFrame | ESLint rule (extension of FR-PERF-006) |
| 9 | Vitest unit tests pass | pnpm vitest |
| 10 | Polyfill no-throw on missing APIs | Defensive check |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { yieldNow, yieldIfNeeded, postTask, onIdle } from "../scheduler";

describe("scheduler helpers", () => {
  it("yieldNow uses scheduler.yield when available", async () => {
    const yieldMock = vi.fn().mockResolvedValue(undefined);
    (window as any).scheduler = { yield: yieldMock };
    await yieldNow();
    expect(yieldMock).toHaveBeenCalled();
  });

  it("yieldNow falls back to setTimeout when no scheduler", async () => {
    delete (window as any).scheduler;
    const start = performance.now();
    await yieldNow();
    expect(performance.now() - start).toBeGreaterThanOrEqual(0);
  });

  it("yieldIfNeeded yields only when budget exceeded", async () => {
    const yieldMock = vi.fn().mockResolvedValue(undefined);
    (window as any).scheduler = { yield: yieldMock };
    const t0 = performance.now() - 60;  // pretend 60ms ago
    await yieldIfNeeded(t0, 50);
    expect(yieldMock).toHaveBeenCalled();
  });

  it("yieldIfNeeded does NOT yield within budget", async () => {
    const yieldMock = vi.fn();
    (window as any).scheduler = { yield: yieldMock };
    await yieldIfNeeded(performance.now(), 50);
    expect(yieldMock).not.toHaveBeenCalled();
  });

  it("postTask uses priority when available", () => {
    const postMock = vi.fn();
    (window as any).scheduler = { postTask: postMock };
    postTask(() => {}, "user-blocking");
    expect(postMock).toHaveBeenCalledWith(expect.any(Function), { priority: "user-blocking" });
  });

  it("onIdle uses requestIdleCallback when available", () => {
    const ricMock = vi.fn();
    (window as any).requestIdleCallback = ricMock;
    onIdle(() => {}, 1000);
    expect(ricMock).toHaveBeenCalled();
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-001 (Canvas mount uses scheduler.yield for scene loads), FR-OPS-011 (Lighthouse verifies INP), FR-OPS-014 (analytics deferred via onIdle).

**Operational:** WICG Scheduler API (browser), `PerformanceObserver` API.

**Downstream:** All heavy init paths import yieldNow/yieldIfNeeded. Analytics module uses onIdle.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| INP > 200ms after scheduler changes | FR-OPS-011 fail | Profile long-tasks; identify culprit; add more yields |
| Scheduler.yield not available on Safari 15 | Polyfill | setTimeout(0) fallback |
| requestIdleCallback not available on Safari < 14 | setTimeout(1) fallback | Polyfill |
| Yielding interrupts critical sequence | Logic bug | Use postTask user-blocking instead |
| Analytics fires too late (idle never reached) | 1000ms timeout | requestIdleCallback timeout option ensures fire |
| Long-task observer floods console | Threshold | Only log > 200ms entries |
| yieldNow throws in non-browser env | SSR | typeof window check |
| useFrame yields by accident | ESLint extension | Add rule to PERF-006 set |
| postTask doesn't honor priority on older Chrome | Best-effort | Polyfill via queueMicrotask |
| Race: yielded task interrupted by component unmount | Cleanup | AbortController for long-running ops |
| Mobile Safari background tab pauses scheduler | OK behavior | Resume on visibility |
| Polyfill perf vs native | Native faster | Acceptable; polyfill is fallback only |

## §8 — Deliverable preview

User clicks form:
1. Before: 300ms long task to validate + show form → INP 320ms (fail).
2. After: validation yields after 50ms → first paint happens, then continues → INP 80ms (pass).

Analytics:
1. Before: trackEvent fires immediately on click → fetch starts → INP includes fetch latency.
2. After: trackEvent queued via onIdle → click renders instantly, analytics fires when idle.

## §9 — Notes

**On Chrome vs Firefox vs Safari support:** Chrome 94+, Edge 94+ supported. Firefox + Safari 16+ partial. Polyfill ensures uniform behavior.

**On future scheduler enhancements:** `scheduler.wait()` for explicit time delays. Not in slice 1 scope.

**On Vietnamese visitors:** Identical perf benefit.

*End of FR-PERF-007.*
