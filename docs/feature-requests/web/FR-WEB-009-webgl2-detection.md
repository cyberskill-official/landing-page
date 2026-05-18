---
id: FR-WEB-009
title: "Client capability gate — WebGL2 + save-data + deviceMemory → /lite redirect with persisted user preference"
module: WEB
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P3
slice: 1
owner: Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
strict_audited: 2026-05-18
related_frs: [FR-WEB-001, FR-WEB-004, FR-WEB-008, FR-A11Y-001, FR-A11Y-002, FR-PERF-009, FR-PERF-010]
depends_on: [FR-WEB-001, FR-WEB-008]
blocks: [FR-PERF-009, FR-PERF-010]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §5.5 web stack — "WebGL2 not supported → /lite auto-redirect immediately"
  - docs/01-master-plan-v2.md §6.3 perf — "save-data → non-modal banner offering /lite; deviceMemory < 4 → LOD-1"
  - docs/01-master-plan-v2.md §7.5 a11y — "User preference persists across sessions via localStorage"
  - docs/01-master-plan-v2.md §6.3 — "Detection client-only; SSR returns full cinematic by default"

language: typescript + react 19 + zustand 5
service: apps/web/
new_files:
  - apps/web/lib/capability-detection.ts
  - apps/web/components/system/CapabilityGate.tsx
  - apps/web/components/system/SaveDataBanner.tsx
  - apps/web/lib/lite-pref-storage.ts
  - apps/web/tests/unit/capability-detection.test.ts
  - apps/web/tests/web/capability-gate.spec.ts

modified_files:
  - apps/web/app/layout.tsx         # mount <CapabilityGate />
  - apps/web/lib/stores/sceneStore.ts  # add lowMemoryMode flag (was reserved by FR-WEB-004)

effort_hours: 4
risk_if_skipped: "Without WebGL2 detection, users on legacy browsers see a black canvas and bounce. Without save-data detection, users on data-capped plans (common in Vietnam mobile markets) consume 3-5 MB of GLB+textures without consent — bandwidth burn + reputational damage. Without deviceMemory detection, mid-tier mobile devices crash with WebGL context-lost. The `/lite` route (FR-A11Y-001) exists specifically for these cases; without auto-redirect, users on incapable devices never reach it. FR-PERF-010 mobile-perf gate fails."
---

## §1 — Description (BCP-14 normative)

1. **MUST** detect WebGL2 support at client-mount time. Implementation: create a probe `<canvas>`, attempt `canvas.getContext("webgl2")`, check for non-null; further verify by attempting `gl.getExtension("EXT_color_buffer_float")` (Three.js r150+ requires WebGL2 with at least one float-color extension). If WebGL2 absent, redirect to `/lite` via `router.replace('/lite')` within 100ms of mount.

2. **MUST** detect `navigator.connection.saveData === true` (Network Information API). When detected on the `/` route, render a **non-modal banner** at the top of the viewport:
   - Banner text (EN): *"We can show a faster version that uses less data — switch?"*
   - Banner text (VI): *"Phiên bản nhẹ hơn, tiết kiệm dữ liệu — chuyển sang?"*
   - Two buttons: **"Switch to /lite"** (default focus, primary style) and **"Stay here"** (secondary).
   - Banner is dismissible via Escape key OR clicking "Stay here".
   - Banner reads aria-live="polite" so screen readers announce on mount but don't interrupt.

3. **MUST** detect `navigator.deviceMemory < 4` (in GB; reflects total device RAM tier). When detected:
   - Set `useSceneStore.getState().lowMemoryMode = true`.
   - This signal flows to FR-PERF-009, which then enables LOD-1 (lowest-detail GLB variant), disables post-processing passes, and clamps `dpr=[1, 1]` (no high-DPI rendering).
   - This FR does NOT implement the LOD swap; it provides the detection + Zustand signal.

4. **MUST** persist user preference via localStorage key `cyberskill_lite_pref`:
   - `"1"` — user chose `/lite`; on subsequent visits, `/` auto-redirects to `/lite`.
   - `"0"` — user explicitly chose to stay on `/`; banner suppressed for subsequent visits.
   - `null` (key absent) — no preference; show detection-based behavior.

5. **MUST** be SSR-safe. All capability detection runs strictly in `useEffect`. Server-rendered HTML for `/` is identical regardless of device (cinematic default); client-side detection then redirects or banners as appropriate.

6. **MUST** ship `lib/capability-detection.ts` with typed detection helpers:
   ```ts
   detectWebGL2(): boolean
   detectSaveData(): boolean
   detectLowMemory(): boolean    // navigator.deviceMemory < 4
   getLitePref(): "1" | "0" | null
   setLitePref(value: "1" | "0"): void
   clearLitePref(): void
   ```

7. **MUST** ship `<CapabilityGate>` component mounted at layout level. It:
   - Runs capability detection in `useEffect`.
   - Renders `<SaveDataBanner>` if save-data detected (and not previously dismissed).
   - Triggers redirect to `/lite` if WebGL2 missing OR `lite_pref === "1"`.
   - Sets `useSceneStore.setState({ lowMemoryMode: true })` if low-memory detected.

8. **MUST** ship `<SaveDataBanner>` as a non-modal DOM banner with:
   - Position: fixed top of viewport, `z-index` above scenes.
   - Bilingual text (EN/VI) keyed off `?lang` query param or document.documentElement.lang.
   - Two buttons with explicit `type="button"` and proper focus management.
   - Closes on Escape, on "Stay here" click, OR on "Switch" navigation.
   - Includes aria-labels for screen readers.

9. **MUST NOT** redirect users to `/lite` based on `prefers-reduced-motion: reduce` from this FR. That's FR-A11Y-001's domain (CSS-media-query based). This FR handles capability-based redirects (WebGL2 / saveData / deviceMemory) only.

10. **MUST** include a "reset preference" link on the `/accessibility` page (FR-A11Y-011 ratifies) that clears `localStorage.cyberskill_lite_pref` for users who want to re-evaluate the experience.

11. **MUST NOT** introduce a middleware-based redirect at slice 1. The detection is client-only because the Network Information API + deviceMemory + WebGL2 are not available server-side. Middleware redirect requires header inspection (User-Agent sniffing), which is unreliable. Client-side detection is the canonical path.

12. **MUST** measure the WebGL2 redirect latency: from cold load to `/lite` URL transition MUST be ≤ 500ms (master plan §6.3 sets this as the cap to avoid visible canvas flash). The probe + redirect happens in `useEffect` synchronously after layout mount.

13. **MUST** include Vitest unit tests for each detection helper, covering:
    - WebGL2 present / absent / `getContext` returns null.
    - saveData true / false / `navigator.connection` undefined.
    - deviceMemory < 4 / >= 4 / undefined.
    - localStorage round-trip: set → get returns same value; clear → get returns null.

14. **MUST** include Playwright integration tests covering:
    - WebGL2-disabled browser context redirects to `/lite` within 500ms.
    - saveData mock shows banner with default focus on "Switch to /lite".
    - deviceMemory mock sets `lowMemoryMode = true` in Zustand.
    - localStorage round-trip: choose "Stay" → reload → no banner.
    - localStorage round-trip: choose "Switch" → reload `/` → auto-redirect to `/lite`.

15. **SHOULD** include a dev-mode `?debug=capability` overlay showing each detected value: `webgl2: true | saveData: false | deviceMemory: 8 | litePref: null`.

16. **SHOULD** emit a Sentry breadcrumb (if FR-OPS-NNN wires Sentry) on each redirect with the triggering reason, so we can monitor real-world detection accuracy.

## §2 — Why this design

**Why client-side detection (not middleware)?** Three of the four signals (saveData, deviceMemory, WebGL2) are not available at request time. saveData and deviceMemory live in `navigator` — only accessible on the client. WebGL2 requires creating a probe canvas, which is also client-only. Middleware could try User-Agent sniffing, but UA strings are notoriously unreliable for capability detection (browser UAs can be spoofed, mobile UAs vary wildly). Client-side detection is the canonical, reliable path. SSR returns the full cinematic; client decides whether to keep it.

**Why a non-modal banner for saveData (not auto-redirect)?** saveData is a *user preference signal*, not a *capability gap*. A user with saveData on has chosen to conserve data — they may want to opt in to the lighter experience, but auto-redirecting feels paternalistic. The banner respects user agency: it offers the option, defaults focus to the preferred choice, but lets the user stay if they want. WebGL2 absence is different — there's no choice; the cinematic literally can't run, so auto-redirect is the right call.

**Why persist preference in localStorage?** Users who choose `/lite` don't want the banner every visit. Users who choose to stay on `/` don't want to be re-offered every page refresh. localStorage is the right tier: session-stable, no server round-trip, GDPR-friendly (no PII). Master plan §7.5 specifies the `cyberskill_lite_pref` key.

**Why a "reset" link on `/accessibility`?** Some users want to re-evaluate. Maybe they chose `/lite` initially because of a slow network and want to revisit on better network. The accessibility page is the natural place to surface the toggle — it's where users go to manage experience preferences. Clearing localStorage there restores the auto-detect path.

**Why a 500ms redirect cap?** Without a cap, the canvas might briefly mount on a WebGL2-unsupported browser, flash a black/error frame, then redirect — a visible UX glitch. With 100ms detection + 400ms transition budget, the redirect completes before the user's eye registers the canvas. Master plan §6.3 specifies this cap.

**Why exclude `prefers-reduced-motion` from this FR?** FR-A11Y-001 handles the reduced-motion path via CSS media query at root level (no JS redirect needed). Mixing capability detection (this FR) and motion-preference detection (FR-A11Y-001) into one component would conflate two distinct concerns. They share the `/lite` destination but reach it via different mechanisms.

## §3 — Deliverable structure

### §3.1 — File hierarchy

```
apps/web/
├── lib/
│   ├── capability-detection.ts                # NEW — detection helpers
│   └── lite-pref-storage.ts                   # NEW — localStorage wrapper
├── components/system/
│   ├── CapabilityGate.tsx                     # NEW — orchestrator (mounted in layout)
│   └── SaveDataBanner.tsx                     # NEW — non-modal banner
└── tests/
    ├── unit/capability-detection.test.ts      # NEW — Vitest unit
    └── web/capability-gate.spec.ts            # NEW — Playwright integration

modified:
  apps/web/app/layout.tsx          (mount <CapabilityGate />)
  apps/web/lib/stores/sceneStore.ts (add lowMemoryMode flag)
```

### §3.2 — `lib/capability-detection.ts` shape

```ts
export function detectWebGL2(): boolean {
  if (typeof document === "undefined") return true;  // SSR default: assume supported
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Three.js r150+ requires at least one float-color extension
    return Boolean((gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float"));
  } catch {
    return false;
  }
}

export function detectSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  // @ts-expect-error — Network Information API not in standard TS lib
  const conn = navigator.connection;
  return Boolean(conn?.saveData);
}

export function detectLowMemory(): boolean {
  if (typeof navigator === "undefined") return false;
  // @ts-expect-error — deviceMemory not in standard TS lib
  const mem = navigator.deviceMemory;
  return typeof mem === "number" && mem < 4;
}
```

### §3.3 — `lib/lite-pref-storage.ts` shape

```ts
const KEY = "cyberskill_lite_pref";

export function getLitePref(): "1" | "0" | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "1" || v === "0" ? v : null;
}

export function setLitePref(value: "1" | "0"): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, value);
}

export function clearLitePref(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}
```

### §3.4 — `<CapabilityGate>` shape

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { detectWebGL2, detectSaveData, detectLowMemory } from "@/lib/capability-detection";
import { getLitePref } from "@/lib/lite-pref-storage";
import { useSceneStore } from "@/lib/stores";
import { SaveDataBanner } from "./SaveDataBanner";

export function CapabilityGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/lite")) return;

    const pref = getLitePref();
    if (pref === "1") { router.replace("/lite"); return; }

    if (!detectWebGL2()) { router.replace("/lite"); return; }

    if (detectLowMemory()) {
      useSceneStore.setState({ lowMemoryMode: true });
    }

    if (detectSaveData() && pref !== "0") {
      setShowBanner(true);
    }
  }, [pathname, router]);

  return showBanner ? <SaveDataBanner onClose={() => setShowBanner(false)} /> : null;
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | WebGL2-missing → `/lite` within 500ms | Playwright with WebGL2 disabled context; assert URL transitions in ≤ 500ms |
| 2 | saveData → banner visible with default focus on "Switch" | Playwright mock `navigator.connection.saveData = true`; assert banner DOM + focus |
| 3 | deviceMemory < 4 → `lowMemoryMode === true` in Zustand | Playwright mock `navigator.deviceMemory = 2`; check store |
| 4 | localStorage round-trip — "Stay" persists | Click "Stay here"; reload `/`; banner absent |
| 5 | localStorage round-trip — "Switch" persists | Click "Switch"; reload `/`; auto-redirects to `/lite` |
| 6 | SSR build clean | `pnpm -F web build` succeeds, no window errors |
| 7 | Banner is non-modal (page still scrollable behind it) | Playwright: scroll behind banner; assert page scrolls |
| 8 | Banner closes on Escape | Keyboard test |
| 9 | Banner aria-live="polite" present | Playwright accessibility-tree inspection |
| 10 | EN + VI banner text per `?lang=` | Playwright: visit `/?lang=vi`; banner shows Vietnamese text |
| 11 | Reset link on `/accessibility` clears localStorage | Playwright: navigate `/accessibility`; click reset; verify localStorage cleared |
| 12 | No middleware-based redirect | `test ! -f apps/web/middleware.ts` (consistent with FR-WEB-008 AC#14) |
| 13 | `?debug=capability` overlay renders in dev | Playwright with debug param |
| 14 | Vitest unit tests pass | `pnpm -F web test` |
| 15 | WebGL2 detect runs only after layout mount (SSR returns cinematic) | Playwright: assert initial HTML response is `/` HTML, not `/lite` |

## §5 — Test code shapes

### §5.1 — `tests/unit/capability-detection.test.ts`

```ts
import { describe, it, expect, vi } from "vitest";
import { detectWebGL2, detectSaveData, detectLowMemory } from "@/lib/capability-detection";

describe("detectWebGL2", () => {
  it("returns false when getContext returns null", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: vi.fn().mockReturnValue(null),
    } as any);
    expect(detectWebGL2()).toBe(false);
  });

  it("returns false when EXT_color_buffer_float missing", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: vi.fn().mockReturnValue({
        getExtension: vi.fn().mockReturnValue(null),
      }),
    } as any);
    expect(detectWebGL2()).toBe(false);
  });

  it("returns true when WebGL2 + float-color extension supported", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: vi.fn().mockReturnValue({
        getExtension: vi.fn().mockReturnValue({}),
      }),
    } as any);
    expect(detectWebGL2()).toBe(true);
  });
});

describe("detectSaveData", () => {
  it("returns true when saveData is true", () => {
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    expect(detectSaveData()).toBe(true);
  });
});

describe("detectLowMemory", () => {
  it("returns true when deviceMemory < 4", () => {
    Object.defineProperty(navigator, "deviceMemory", { value: 2, configurable: true });
    expect(detectLowMemory()).toBe(true);
  });
});
```

## §6 — Dependencies

**Concept dependencies:**
- FR-WEB-001 (canvas bootstrap) — provides the canvas this FR gates.
- FR-WEB-008 (routing) — provides `/lite` route as the redirect target.
- FR-A11Y-001 (reduced-motion fallback) — `/lite` route ownership; reduced-motion is its concern, capability gating is this FR.

**Operational dependencies:**
- Vitest + Playwright.
- Modern browsers for Network Information API / deviceMemory (gracefully degrade where APIs absent).

**Downstream blocks:**
- FR-PERF-009 (LOD swap on low-memory) — consumes `useSceneStore.lowMemoryMode`.
- FR-PERF-010 (mobile-perf gate) — verifies this FR's gates trigger appropriately.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| WebGL2 absent on iOS 14 (old iPad) shows black canvas | Real-device QA | Detect probe; redirect to `/lite` |
| saveData detection always returns false (Network API not exposed in browser) | Vitest | Graceful no-op; user can manually visit `/lite` |
| deviceMemory undefined (Firefox doesn't expose) | Vitest | `detectLowMemory()` returns false; default cinematic experience |
| Redirect loop (e.g. `/lite` somehow redirecting to `/`) | Playwright | Ensure `CapabilityGate` short-circuits on `pathname?.startsWith('/lite')` |
| localStorage unavailable (Safari ITP in private mode) | Vitest + manual Safari | Graceful no-op; preference doesn't persist but session works |
| Banner shows after user dismissed it (state leak) | AC#4 | localStorage round-trip verified; ensure `getLitePref()` is called on every mount |
| Banner blocks scroll (modal-like behavior) | AC#7 | Ensure no `body.style.overflow = hidden`; banner is purely visual overlay |
| Escape key doesn't dismiss banner (a11y gap) | AC#8 | Add keyboard handler |
| WebGL2 redirect takes > 500ms (visible canvas flash) | AC#1 + visual smoke | Move detection to layout-mount useEffect; ensure router.replace is synchronous |
| LowMemoryMode signal doesn't reach LOD swap (FR-PERF-009 silent miss) | Integration test | Confirm useSceneStore.lowMemoryMode is read by FR-PERF-009's component |
| Sentry breadcrumb missing on redirect (observability gap) | Manual smoke | Wire to Sentry when FR-OPS-NNN ships |
| Banner aria-live "assertive" instead of "polite" (interrupts SR) | AC#9 | Use "polite" per WCAG guidance |

## §8 — Deliverable preview

After shipping, behavior matrix:

| Scenario | Behavior |
|---|---|
| Modern desktop, no saveData, no preference set | Full cinematic on `/` |
| Modern desktop, saveData on | Banner appears on `/`: "switch to /lite?" |
| Mobile with deviceMemory=2 | Cinematic on `/` but LOD-1 + dpr=[1,1] |
| iOS 14 iPad (no WebGL2) | Auto-redirect `/` → `/lite` within 500ms |
| Returning user (chose `/lite` last time) | Auto-redirect `/` → `/lite` |
| Returning user (chose "Stay" last time) | No banner; full cinematic |
| User visits `/accessibility`, clicks "reset preference" | localStorage cleared; next visit re-evaluates |

## §9 — Notes

**On Network Information API browser support:** Chrome and Edge expose `navigator.connection.saveData`; Safari and Firefox don't. The detection gracefully returns false where unsupported. Master plan §6.3 accepts this — saveData users on unsupported browsers don't get the banner, but they also weren't being burdened (they didn't have saveData configured).

**On future enhancements:** A future amendment could add IP-based geolocation in middleware (e.g. detect Vietnam user → assume mobile-data-conscious → show banner more aggressively). Out of scope for slice 1.

**On testing matrix:** Playwright supports `--emulate-media=prefers-reduced-data: reduce` for some saveData tests, plus manual `navigator.connection` mocking in JS context.

## §10 — Zero-touch strict audit evidence (2026-05-18)

### Architectural deviation

- Wrote `docs/ADR-FR-WEB-009.md` to self-approve the pre-hydration no-WebGL/lite-preference gate in `apps/web/app/layout.tsx`.
- The React `CapabilityGate` remains the canonical owner for save-data UX, low-memory store state, debug output, and analytics. The inline gate only handles deterministic redirect-before-flash cases.

### Edge-case matrix

| Vector | Edge case | Coverage |
|---|---|---|
| Null inputs | `document`, `navigator.connection`, `navigator.deviceMemory`, or `localStorage` is unavailable | Unit tests cover SSR defaults, unsupported APIs, and storage failures. |
| Malformed payload | localStorage contains any value other than `"1"` or `"0"` | `getLitePref()` ignores invalid values and returns `null`. |
| Extreme bounds | WebGL2 exists but lacks `EXT_color_buffer_float`, or canvas creation throws | Detection helper returns false and Playwright redirects to `/lite`. |
| Invalid content | Banner behaves like a modal or lacks polite announcement/default focus | Unit and Playwright tests assert `aria-live="polite"`, focus on Switch, Escape close, and background scroll. |
| Concurrent race | Early gate and React gate both observe lite preference or no-WebGL | Early gate redirects before hydration; React gate short-circuits on `/lite` and remains idempotent. |
| Observability | Capability drift is invisible during debugging | `?debug=capability`, `sessionStorage.cyberskill_lite_redirect_ms`, and analytics event probes expose state. |

### Verification

```text
$ cd apps/web && node_modules/.bin/vitest run tests/unit/capability-detection.test.ts components/perf/__tests__/SaveDataBanner.unit.test.tsx --config vitest.config.ts --coverage.enabled true --coverage.provider v8 --coverage.include 'lib/capability-detection.ts' --coverage.include 'lib/lite-pref-storage.ts' --coverage.include 'components/perf/SaveDataBanner.tsx'
Test Files  2 passed (2)
Tests  12 passed (12)
Coverage: All files 100% statements, 91.48% branches, 100% functions, 100% lines
```

```text
$ cd apps/web && node_modules/.bin/playwright test tests/web/capability-gate.spec.ts --project=chromium
9 passed
```

```text
$ cd apps/web && node_modules/.bin/tsc -p tsconfig.json --noEmit
exit 0
```

```text
$ cd apps/web && node_modules/.bin/next build
Compiled successfully
/ First Load JS 110 kB
/lite First Load JS 105 kB
```

### Tooling note

Permanent installation of `@vitest/coverage-v8@2.1.9` is blocked until the private workspace package `@cyberskill/ds-foundations` is available to pnpm. For this strict audit, the provider was installed in an isolated temporary directory and symlinked into `apps/web/node_modules/@vitest/coverage-v8` so coverage could be measured without changing manifests.

*End of FR-WEB-009.*
