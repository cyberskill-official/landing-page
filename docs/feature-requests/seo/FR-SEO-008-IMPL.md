---
id: FR-SEO-008
title: "Analytics event taxonomy — 10 typed events with documented properties + Playwright coverage"
module: SEO
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Frontend Lead + Data
created: 2026-05-16
related_frs: [FR-SEO-007, FR-SEO-009, FR-PERF-011, FR-CTA-007, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-SCENE-024]
depends_on: [FR-SEO-007]
blocks: []
language: typescript 5.6
service: apps/web/lib/analytics.ts
new_files:
  - apps/web/lib/analytics.ts
  - apps/web/lib/analytics/events.ts
  - apps/web/lib/analytics/__tests__/events.unit.test.ts
  - apps/web/tests/e2e/product-critical-paths.spec.ts
  - apps/web/tests/a11y/skip-story.spec.ts
  - apps/web/tests/a11y/mute-toggle.spec.ts
  - apps/web/tests/a11y/skip-3d.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §8.4 events table
  - FR-SEO-007 proxy consumer

effort_hours: 6
risk_if_skipped: "Without typed event taxonomy: every component invents its own event names/props. Reports compare apples-to-oranges. Data analyst spends days reconciling. Typed taxonomy = single source of truth."
---

## §1 — Description (BCP-14 normative)

1. **MUST** emit 10 events per master plan §8.4:

   | Event | Properties | Fires on |
   |---|---|---|
   | `scene_enter` | `{ scene_id: string }` | Scroll into scene (FR-SCENE-020) |
   | `lumi_interact` | `{ trigger: 'hover'\|'tap', anim: string }` | Lumi hover/tap (FR-CTA-007) |
   | `cta_view` | `{ cta_id: string, scene_id: string }` | CTA visible in viewport |
   | `cta_click` | `{ cta_id: string, scene_id: string, track: string }` | CTA clicked |
   | `skip_story_used` | `{ breakpoint: string }` | Skip-story pill (FR-A11Y-003) |
   | `lite_mode_toggled` | `{ from, to, source }` | Lite toggle (FR-A11Y-005) |
   | `mute_toggled` | `{ from, to, source }` | Mute toggle (FR-A11Y-004) |
   | `form_submit` | `{ track: 'buy'\|'partner'\|'join', success: boolean }` | Form POST (FR-CTA-005) |
   | `form_error` | `{ track: string, error_type: string, field?: string }` | Form validation/server error |
   | `nonla_easter_egg` | `{ variant: 'tet'\|'midautumn'\|'sunset'\|'default' }` | Nón lá hover (FR-SCENE-024) |

2. **MUST** ship typed event constructors in `apps/web/lib/analytics.ts`:
   - `trackEvent<T extends EventName>(name: T, props: EventProps<T>): void`
   - TypeScript enforces: invalid name = compile error; missing props = compile error.
3. **MUST** each event has documented properties via discriminated union types.
4. **MUST** include locale (en/vi) as automatic global property on every event.
5. **MUST** include scene_id (current scene) as automatic global property where derivable.
6. **MUST** be tested via Vitest (type tests) + Playwright (event firing + payload).
7. **MUST** route all events through FR-SEO-007 proxy.

## §2 — Why this design

**Why 10 events (not 50)?** Discipline. Each event has a clear purpose. Less = clearer dashboards.

**Why typed constructors?** Type errors at compile time vs runtime. Catches "event name typo" instantly.

**Why discriminated union for props?** Each event has different shape. Single union ensures only valid combinations.

**Why automatic locale + scene_id?** Every event needs them for segmentation. Manual = error-prone.

**Why route through proxy?** FR-SEO-007 strips PII, retries on failure. Direct GA4 call bypasses.

## §3 — Public surface

```ts
// apps/web/lib/analytics/events.ts
export type EventMap = {
  scene_enter:        { scene_id: string };
  lumi_interact:      { trigger: "hover" | "tap"; anim: string };
  cta_view:           { cta_id: string; scene_id: string };
  cta_click:          { cta_id: string; scene_id: string; track: string };
  skip_story_used:    { breakpoint: "mobile" | "tablet" | "desktop" };
  lite_mode_toggled:  { from: "cinematic" | "lite"; to: "cinematic" | "lite"; source: "click" | "keyboard" | "auto_redirect" };
  mute_toggled:       { from: "muted" | "unmuted"; to: "muted" | "unmuted"; source: "click" | "keyboard" };
  form_submit:        { track: "buy" | "partner" | "join"; success: boolean };
  form_error:         { track: string; error_type: string; field?: string };
  nonla_easter_egg:   { variant: "tet" | "midautumn" | "sunset" | "default" };
};

export type EventName = keyof EventMap;
export type EventProps<T extends EventName> = EventMap[T];
```

```ts
// apps/web/lib/analytics.ts
import { useLocale } from "next-intl";
import { useSceneStore } from "@/lib/stores/scene-store";
import type { EventMap, EventName, EventProps } from "./analytics/events";

export async function trackEvent<T extends EventName>(name: T, props: EventProps<T>): Promise<void> {
  // Auto-augment with locale + scene_id (where available)
  const locale = (typeof document !== "undefined" && document.documentElement.lang) || "en";
  const scene_id = (typeof window !== "undefined" && useSceneStore.getState().activeScene !== null)
    ? `scene-${useSceneStore.getState().activeScene}`
    : undefined;

  const enriched = { ...props, locale, ...(scene_id ? { scene_id } : {}) };

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: name,
        properties: enriched,
        url: typeof window !== "undefined" ? window.location.href : "",
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      }),
      keepalive: true,  // ensure event fires on page-unload
    });
  } catch (e) {
    // Don't crash UI if analytics fails
    console.warn("[analytics]", e);
  }
}
```

```tsx
// Usage example
import { trackEvent } from "@/lib/analytics";

// Type-safe; TypeScript enforces correct props
trackEvent("cta_click", { cta_id: "buy", scene_id: "scene-6", track: "buy" });
// trackEvent("cta_click", { cta_id: "buy" });  // COMPILE ERROR — missing scene_id
// trackEvent("unknown_event", {});  // COMPILE ERROR — unknown event name
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 10 events defined in EventMap | Type check |
| 2 | trackEvent type-safe (compile-time errors on wrong props) | TS compiler |
| 3 | Each event has documented properties | Code comments |
| 4 | locale auto-added | Vitest |
| 5 | scene_id auto-added where derivable | Vitest |
| 6 | All events route through /api/analytics | Mock fetch; assert URL |
| 7 | keepalive flag set (page-unload fires) | Inspect fetch options |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | Playwright triggers + asserts each event | E2E |
| 10 | Event drift caught by TypeScript | Synthetic test |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { trackEvent } from "../analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("POSTs to /api/analytics", async () => {
    await trackEvent("scene_enter", { scene_id: "scene-0" });
    expect(global.fetch).toHaveBeenCalledWith("/api/analytics", expect.any(Object));
  });

  it("includes event_name in payload", async () => {
    await trackEvent("skip_story_used", { breakpoint: "mobile" });
    const body = JSON.parse(((global.fetch as any).mock.calls[0][1] as RequestInit).body as string);
    expect(body.event_name).toBe("skip_story_used");
  });

  it("auto-adds locale", async () => {
    document.documentElement.lang = "vi";
    await trackEvent("scene_enter", { scene_id: "scene-0" });
    const body = JSON.parse(((global.fetch as any).mock.calls[0][1] as RequestInit).body as string);
    expect(body.properties.locale).toBe("vi");
  });

  it("includes keepalive flag", async () => {
    await trackEvent("scene_enter", { scene_id: "scene-0" });
    const init = (global.fetch as any).mock.calls[0][1] as RequestInit;
    expect(init.keepalive).toBe(true);
  });

  // Type test — won't compile if signature wrong:
  it("type-checks event name + props", () => {
    // @ts-expect-error
    trackEvent("unknown_event", {});

    // @ts-expect-error
    trackEvent("cta_click", { cta_id: "x" });  // missing scene_id + track

    // Valid:
    trackEvent("cta_click", { cta_id: "x", scene_id: "scene-0", track: "buy" });
  });
});
```

```ts
// Playwright E2E
test("scene_enter event fires on scroll", async ({ page }) => {
  const events: any[] = [];
  page.on("request", req => {
    if (req.url().includes("/api/analytics")) {
      events.push(JSON.parse(req.postData() ?? "{}"));
    }
  });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "smooth" }));
  await page.waitForTimeout(1000);
  expect(events.some(e => e.event_name === "scene_enter")).toBe(true);
});
```

## §6 — Dependencies

**Concept:** FR-SEO-007 (proxy endpoint), FR-SEO-009 (web-vitals events extension), FR-PERF-011 (RUM dashboard consumer), FR-CTA-007 / FR-A11Y-003 / FR-A11Y-004 / FR-A11Y-005 / FR-SCENE-024 (event producers).

**Operational:** TypeScript 5.6 discriminated unions, next-intl.

**Downstream:** GA4 + Plausible dashboards.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Event drift (new event added without taxonomy update) | TS compile error | Type-safe; can't ship untyped event |
| Property typo | TS compile error | Same |
| Analytics fetch fails | Console warn | UI unaffected; FR-SEO-007 retries |
| keepalive not supported (old browser) | Page-unload event lost | Acceptable; modern browsers support |
| locale missing | Default "en" | Type allows; runtime fallback |
| scene_id missing | Optional in TS | Some events don't need; events.ts handles |
| Event payload exceeds size limit | API 413 | Validate at proxy; truncate properties |
| Naming collision with GA4 reserved names | GA4 ignores | Avoid reserved names (e.g., `page_view`) |
| Plausible vs GA4 schema mismatch | Manual reconcile | Proxy maps properties per target |
| Volume spike crashes proxy | FR-SEO-007 rate-limit | 100/min per IP; sample if exceeded |
| Vietnamese visitor locale="vi" but event in English context | Locale conflict | Locale = page locale, not visitor browser |
| Race: event fires after page unload | keepalive | Modern browsers buffer; fires async |

## §8 — Deliverable preview

User experience:
1. User scrolls to Scene 3. `scene_enter { scene_id: "scene-3", locale: "en" }` fires.
2. Hovers Lumi. `lumi_interact { trigger: "hover", anim: "mouth_smile" }`.
3. Clicks Partner CTA. `cta_click { cta_id: "partner", scene_id: "scene-6", track: "partner" }`.
4. Submits form. `form_submit { track: "partner", success: true }`.

Founder dashboard:
- "Scene 3 views: 1,247 (78% of /) " in Plausible.
- "Partner CTA click → submit conversion: 4.2%".
- Per-locale breakdown.

## §9 — Notes

**On 'why not auto-event tracking (Mixpanel autocapture)?'** Generates noise + privacy issues. Explicit events curated by team.

**On 10 events expansion:** Each new event = type addition + analyst review. Disciplined growth.

**On Vietnamese-specific events:** Locale field captures. Could add VI-specific events if needed (e.g., `vi_tagline_revealed` per FR-CMS-010). Slice 2.

*End of FR-SEO-008.*
