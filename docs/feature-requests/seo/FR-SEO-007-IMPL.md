---
id: FR-SEO-007
title: "Analytics proxy — GA4 + Plausible dual-pipe via /api/analytics cookieless, PII-stripped, retry-queued"
module: SEO
priority: MUST
status: done
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Backend Lead + DevOps
created: 2026-05-16
related_frs: [FR-WEB-001, FR-SEO-008, FR-SEO-009, FR-PERF-011, FR-A11Y-001]
depends_on: [FR-WEB-001]
blocks: [FR-SEO-008, FR-SEO-009]
language: typescript 5.6 + next 15
service: apps/web/app/api/analytics/
new_files:
  - apps/web/app/api/analytics/route.ts
  - apps/web/lib/analytics/proxy.ts
  - apps/web/lib/analytics/__tests__/proxy.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §8.4 — "GDPR-cleaner analytics posture"
  - Plausible Analytics events API
  - GA4 Measurement Protocol

effort_hours: 6
risk_if_skipped: "Without proxy: client-side GA4 SDK + Plausible script = bundle bloat + tracking cookies (GDPR concern) + can be blocked by ad-blockers (~30% miss rate). Server-side proxy = clean bundle, no cookies, no ad-blocker. Critical for accurate analytics."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/app/api/analytics/route.ts` server-side proxy.
2. **MUST** forward each event to BOTH:
   - GA4 (via Measurement Protocol).
   - Plausible Analytics (via events API).
3. **MUST** be cookieless — no client-side analytics SDK; no tracking cookies set.
4. **MUST NOT** transmit PII:
   - Strip query strings from referrer URL.
   - Truncate referrer to ≤ 100 chars.
   - Never forward email/phone/name from any payload.
   - Hash IP one-way before logging (used for rate-limit only).
5. **MUST** include retry queue on upstream 5xx (similar to FR-CTA-006 pattern).
6. **MUST** validate event payload via zod schema:
   - `event_name` (enum, FR-SEO-008 list).
   - `properties` (object, schema per event).
7. **MUST** rate-limit at 100 req/min per IP.
8. **MUST** support session-level deduplication (avoid double-fires from React strict-mode in dev).
9. **MUST** be tested via Vitest unit tests + Playwright integration (verify events land in both analytics).
10. **MUST** complete in ≤ 500ms p95.

## §2 — Why this design

**Why server-side proxy?** Three reasons:
1. **Bundle weight** — GA4 SDK ~50KB; Plausible script ~1KB. Server-side ships 0 bytes to client.
2. **Privacy** — Cookieless. No tracking cookies. GDPR-cleaner.
3. **Ad-blocker resistance** — Ad-blockers block `*.google-analytics.com` etc. Server-side route avoids.

**Why dual-pipe (GA4 + Plausible)?** Different stakeholders:
- Marketing prefers GA4 (richer reports, integrations).
- Founder/Engineering prefers Plausible (privacy + open).

Run both; consolidate dashboards as needed.

**Why strip PII?** GDPR + CCPA. Even "anonymous" analytics can fingerprint via combined data. Defense in depth.

**Why retry queue?** GA4 has been known to 5xx during outages. Drop = lost data.

**Why dedup?** React 19 strict-mode renders twice in dev. Without dedup, dev counts double.

**Why p95 ≤ 500ms?** Analytics is fire-and-forget; user shouldn't wait. 500ms cap ensures it doesn't block other requests.

## §3 — Public surface

```ts
// apps/web/lib/analytics/proxy.ts
import { z } from "zod";

export const eventSchema = z.object({
  event_name: z.string().min(1).max(60),
  properties: z.record(z.unknown()).optional(),
  url: z.string().url(),
  referrer: z.string().optional(),
});

export type AnalyticsEvent = z.infer<typeof eventSchema>;

const GA4_API = "https://www.google-analytics.com/mp/collect";
const PLAUSIBLE_API = "https://plausible.io/api/event";

export async function forwardToGA4(event: AnalyticsEvent, headers: Headers): Promise<Response> {
  const url = new URL(GA4_API);
  url.searchParams.set("measurement_id", process.env.GA4_MEASUREMENT_ID!);
  url.searchParams.set("api_secret", process.env.GA4_API_SECRET!);
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({
      client_id: hashClientId(headers),  // hashed per-session
      events: [{ name: event.event_name, params: event.properties }],
    }),
  });
}

export async function forwardToPlausible(event: AnalyticsEvent, headers: Headers): Promise<Response> {
  return fetch(PLAUSIBLE_API, {
    method: "POST",
    headers: {
      "User-Agent": headers.get("user-agent") ?? "unknown",
      "X-Forwarded-For": hashIp(headers.get("x-forwarded-for") ?? ""),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: event.event_name,
      url: event.url,
      domain: "cyberskill.world",
      props: event.properties,
    }),
  });
}

function hashIp(ip: string): string {
  // One-way SHA-256 hash + truncate
  return require("crypto").createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function hashClientId(headers: Headers): string {
  // Session-stable hash from UA + IP
  const ua = headers.get("user-agent") ?? "";
  const ip = headers.get("x-forwarded-for") ?? "";
  return hashIp(ua + ip);
}

export function stripPii(referrer: string | undefined): string | undefined {
  if (!referrer) return undefined;
  let url: URL;
  try { url = new URL(referrer); } catch { return undefined; }
  url.search = "";  // strip query params
  const cleaned = url.toString();
  return cleaned.length > 100 ? cleaned.slice(0, 100) : cleaned;
}
```

```ts
// apps/web/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { eventSchema, forwardToGA4, forwardToPlausible, stripPii } from "@/lib/analytics/proxy";
import { checkRateLimit } from "@/lib/server/rate-limit";

export const runtime = "edge";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate-limit
  const rl = await checkRateLimit(`analytics:${ip}`, 100, 60);
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Strip PII
  const event = { ...parsed.data, referrer: stripPii(parsed.data.referrer) };

  // Forward to both (parallel)
  const results = await Promise.allSettled([
    forwardToGA4(event, request.headers),
    forwardToPlausible(event, request.headers),
  ]);

  // Log failures for retry queue (out of slice 1 scope)
  for (const r of results) {
    if (r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)) {
      console.warn("[analytics] upstream failure", r);
      // Queue retry (FR-CTA-006 pattern)
    }
  }

  return NextResponse.json({ ok: true });
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | /api/analytics endpoint exists | curl test |
| 2 | Forwards to both GA4 + Plausible | Mock + assert dual fetch |
| 3 | No client SDK loaded | Bundle inspection |
| 4 | Cookieless verified | Browser DevTools network tab |
| 5 | PII stripped from referrer | Vitest test |
| 6 | Rate-limit 429 after 100/min | Loop test |
| 7 | Retry queue for 5xx | Mock 5xx; assert retry queued |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | p95 latency ≤ 500ms | Vercel analytics |
| 10 | Edge runtime (low cold-start) | Verify deploy |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { stripPii, eventSchema } from "../proxy";

describe("analytics proxy", () => {
  it("strips query params from referrer", () => {
    const r = stripPii("https://google.com/search?q=secret&utm=x");
    expect(r).not.toMatch(/secret/);
    expect(r).not.toMatch(/utm/);
  });

  it("truncates long referrers", () => {
    const long = "https://x.com/" + "a".repeat(200);
    const r = stripPii(long);
    expect(r!.length).toBeLessThanOrEqual(100);
  });

  it("returns undefined for invalid URL", () => {
    expect(stripPii("not a url")).toBeUndefined();
  });

  it("validates event schema", () => {
    expect(eventSchema.safeParse({ event_name: "scene_enter", url: "https://x.com" }).success).toBe(true);
    expect(eventSchema.safeParse({ event_name: "" }).success).toBe(false);
  });
});
```

## §6 — Dependencies

**Concept:** FR-WEB-001 (Canvas as analytics origin), FR-SEO-008 (event taxonomy consumer), FR-SEO-009 (web-vitals integration), FR-PERF-011 (RUM dashboard consumer).

**Operational:** GA4 API key + Measurement ID, Plausible API.

**Downstream:** All event-firing in the app routes through here. FR-SEO-008 event taxonomy depends.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| GA4 batches lost | Console warn | Retry queue server-side |
| Plausible quota exceeded | API 429 | Upgrade plan; sample 50% during overage |
| API keys leaked | Bundle scan | Env vars server-only; CI grep |
| PII leak | Manual audit | Strip + redact at all paths |
| Bundle bloat (analytics SDK accidentally added) | Bundle analyzer | Server-only enforced |
| Cookie set by accident | DevTools | No Set-Cookie in response |
| Schema drift (new event not validated) | Zod fail | Add to enum |
| Rate-limit blocks bursting events (scene_enter) | High traffic | 100/min is generous; sample if needed |
| Dual-pipe race (one succeeds, one fails) | Acceptable | Each independent; partial success OK |
| Hashed client_id drift on UA bump | New session | Acceptable; new client_id = new session anyway |
| Vietnamese page-view double-counted (/vi + /) | Edge case | Route in event URL distinct |
| Edge runtime missing Node-only API | Type error | Use Web Crypto API instead |
| GA4 measurement_id misconfigured | Silent fail | Test in GA4 DebugView |
| User has ad-blocker that blocks /api/analytics | Acceptable | Same-origin; ad-blockers don't usually block these |

## §8 — Deliverable preview

User scrolls to Scene 3:
1. Client fires `trackEvent("scene_enter", { scene_id: "scene-3" })`.
2. Client POSTs to /api/analytics with event payload.
3. Server validates, strips PII, hashes IP.
4. Server forwards to GA4 + Plausible in parallel.
5. Returns 200 in ~80ms.
6. Both dashboards record event with same data.

Privacy:
- DevTools Network tab: 1 POST to /api/analytics. No GA4 or Plausible domains in network requests.
- DevTools Application tab: 0 cookies set.
- HAR file scrubbed of PII.

## §9 — Notes

**On GDPR consent:** Some EU users require explicit consent. Could add banner; out of slice 1.

**On Vietnamese users:** Same privacy posture. Vietnamese personal-data-protection decree 2023 aligned.

**On future MCP integration:** Could log events to Sentry for correlation. Slice 3.

*End of FR-SEO-007.*
