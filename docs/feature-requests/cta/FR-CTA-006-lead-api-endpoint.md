---
id: FR-CTA-006
title: "/api/lead/route.ts — server endpoint posting to HubSpot CRM + ATS with rate-limit + bot defense"
module: CTA
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: Backend Lead + DevOps
created: 2026-05-16
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-005, FR-OPS-014, FR-A11Y-001]
depends_on: [FR-CTA-005]
blocks: [FR-CTA-002, FR-CTA-003, FR-CTA-004]
language: typescript 5.6 + next 15
service: apps/web/app/api/lead/
new_files:
  - apps/web/app/api/lead/route.ts
  - apps/web/app/api/lead/__tests__/route.unit.test.ts
  - apps/web/lib/server/rate-limit.ts
  - apps/web/lib/server/hubspot-client.ts
  - apps/web/lib/server/ats-client.ts
  - apps/web/lib/forms/schemas/lead-schema.ts  (shared client+server)

source_pages:
  - docs/01-master-plan-v2.md §5.2 — "Server forms forwarding to HubSpot CRM"
  - docs/01-master-plan-v2.md §9.1 — Three-track CTA flow
  - HubSpot Forms API documentation (POST /crm/v3/objects/contacts + POST /crm/v3/objects/deals)
  - GDPR Art. 6 (lawful basis) — consent for contact form storage

effort_hours: 4
risk_if_skipped: "No server endpoint = forms can't submit. Even if forms render, leads go to /dev/null. Also: client-only validation = bots can submit anything. Server endpoint is the security + lead-pipeline backbone of the entire CTA flow."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `apps/web/app/api/lead/route.ts` as Next.js 15 App Router POST handler. Edge runtime preferred (lower cold-start) unless rate-limit store requires Node runtime.

2. **MUST** validate request body against a shared zod schema (same schema as client per FR-CTA-005):

   ```ts
   const leadSchema = z.discriminatedUnion("track", [
     z.object({ track: z.literal("buy"),     ...buyFields,     consent: z.literal(true) }),
     z.object({ track: z.literal("partner"), ...partnerFields, consent: z.literal(true) }),
     z.object({ track: z.literal("join"),    ...joinFields,    consent: z.literal(true) }),
   ]);
   ```

3. **MUST** route to backend by `track` field:
   - `track === 'buy'` → HubSpot CRM, deal-stage `discovery-call-booked` (FR-CTA-002 Calendly handles scheduling).
   - `track === 'partner'` → HubSpot CRM, deal-stage `partner-inbound`.
   - `track === 'join'` → ATS provider (Workable / Greenhouse / Lever) candidate ingest API.

4. **MUST NOT** expose API keys to the client. All `*_API_KEY` env vars are server-side only. Verify via bundle inspection that `process.env.HUBSPOT_API_KEY` does not appear in any client chunk.

5. **MUST** rate-limit at **5 requests per IP per minute** using a server-side counter (memory-backed in dev; Upstash Redis or similar in prod). Returns `429 Too Many Requests` on overage.

6. **MUST** include bot defense:
   - Honeypot field — invisible `<input name="hp_email" tabIndex={-1}>` in client form; if non-empty in POST, server returns `200 OK` (silent reject — don't tip off bot).
   - Cloudflare Turnstile or hCaptcha challenge on rate-limit overage.
   - `User-Agent` heuristic: reject requests with empty UA or known bot UAs.

7. **MUST** return structured responses:
   - `200 OK` with `{ ok: true, lead_id: '...' }` on success.
   - `400 Bad Request` with `{ ok: false, errors: { field: ['msg'] } }` on validation fail.
   - `429 Too Many Requests` with `Retry-After: 60` header.
   - `503 Service Unavailable` with `{ ok: false, error: 'upstream' }` on HubSpot / ATS outage.

8. **MUST** log every request (anonymized) to structured logs (FR-OPS-014 observability):
   - `{ track, country, ts, ip_hash, user_agent_redacted, success, error?, latency_ms }`
   - IP is one-way hashed (not stored raw).
   - Email is redacted (e.g. `j***@a***.com`).

9. **MUST** include consent verification — `consent: true` field required in schema. Without it, return 400 with `consent: ['Required to process your data']`.

10. **MUST** queue retries on upstream 5xx — if HubSpot returns 503, queue to a server-side retry buffer (Vercel KV or Upstash) and respond to client `200 OK` with `lead_id: 'pending'`. Background worker retries up to 3 times with exponential backoff.

11. **MUST** include CORS headers for same-origin (cyberskill.world) only. Reject cross-origin POSTs.

12. **MUST** be tested with Vitest unit tests + Playwright E2E.

13. **MUST** post a slack notification to `#cs-leads-inbound` channel on each successful lead (founder visibility):
    ```
    🆕 Lead inbound — track: partner | country: VN | agency: ACME Studio
    ```

14. **MUST NOT** include PII (full email, name) in error responses sent to the client (avoid email enumeration). Generic "Submission failed; please try again" for non-validation errors.

15. **MUST** complete in ≤ 1500 ms (p95) — Calendly / HubSpot APIs are the main latency contributor.

16. **MUST** be observable via:
    - Sentry error capture for any thrown exception.
    - Vercel Analytics for endpoint latency.
    - Slack alerts for sustained 5xx rate.

## §2 — Why this design

**Why discriminated union schema?** Each track has different fields. Single flat schema with all fields optional → server cannot tell partner from join from buy. Discriminated union enforces "track" routing at type level.

**Why rate-limit 5/min/IP?** Empirical: legitimate users submit once. 5 submissions/min indicates bot or accident-spam. Below this threshold avoids false positives.

**Why honeypot (vs only Captcha)?** Captcha adds friction for every legitimate user. Honeypot is invisible to humans; bots fill all fields including the hidden one. Combo: honeypot for first defense (catches 80% of bots), Captcha only on rate-limit overage.

**Why 200 OK on honeypot detected?** Tipping off the bot ("you triggered our spam filter") helps them iterate. Silent 200 = bot thinks it succeeded; we drop the request server-side.

**Why anonymize logs?** GDPR / CCPA require minimization. We need debug data (latency, success/fail) without raw PII. One-way hashing + redaction balances both.

**Why background retry queue (vs synchronous retry)?** HubSpot 5xx is rare but persists (~30s outage). Synchronously retrying would block the user for 30+ seconds. Queue + ack means user gets fast feedback; lead still lands.

**Why CORS same-origin only?** Prevents form-from-other-site attacks. Cross-origin would let third-party sites POST to our lead endpoint, polluting our CRM.

**Why Slack notification to founder?** Lead inbound at small-co is high-signal — founder wants real-time visibility, not a daily digest.

**Why no PII in error responses?** Email enumeration attacks (server says "this email already exists" → bot harvests known emails). Generic errors prevent.

**Why p95 ≤ 1500 ms?** User waits during submit. > 1.5s feels broken. Upstream HubSpot latency is ~500-800ms; total budget room is tight.

## §3 — Public surface

```ts
// apps/web/lib/forms/schemas/lead-schema.ts
import { z } from "zod";

const baseFields = {
  contact_email: z.string().email("validation:invalid_email"),
  contact_name:  z.string().min(2).max(80),
  consent:       z.literal(true, { errorMap: () => ({ message: "validation:consent_required" }) }),
};

const buyFields = {
  ...baseFields,
  use_case: z.string().min(20).max(2000),
  budget_range: z.enum(["under-10k", "10k-50k", "50k-200k", "over-200k", "tbd"]),
};

const partnerFields = {
  ...baseFields,
  agency_name: z.string().min(2).max(120),
  country: z.string().length(2),
  monthly_capacity: z.number().int().min(10).max(2000),
  brief: z.string().min(50).max(2000),
};

const joinFields = {
  ...baseFields,
  role_id: z.string().min(1),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  cover_note: z.string().max(2000).optional(),
};

export const leadSchema = z.discriminatedUnion("track", [
  z.object({ track: z.literal("buy"),     ...buyFields }),
  z.object({ track: z.literal("partner"), ...partnerFields }),
  z.object({ track: z.literal("join"),    ...joinFields }),
]);

export type LeadPayload = z.infer<typeof leadSchema>;
```

```ts
// apps/web/app/api/lead/route.ts
import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/forms/schemas/lead-schema";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { hubspotCreateContact, hubspotCreateDeal } from "@/lib/server/hubspot-client";
import { atsCreateCandidate } from "@/lib/server/ats-client";
import { slackNotify } from "@/lib/server/slack";
import { hashIp, redactEmail, redactUserAgent } from "@/lib/server/anonymize";
import { logEvent } from "@/lib/server/logger";
import { queueRetry } from "@/lib/server/retry-queue";

export const runtime = "nodejs";  // need Node for retry queue
export const dynamic = "force-dynamic";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL!;

export async function POST(request: Request) {
  const t0 = performance.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "";
  const origin = request.headers.get("origin");

  // CORS guard
  if (origin && origin !== ALLOWED_ORIGIN) {
    return NextResponse.json({ ok: false, error: "origin_disallowed" }, { status: 403 });
  }

  // Rate-limit
  const rl = await checkRateLimit(ip, 5, 60);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot
  if (body.hp_email) {
    logEvent({ kind: "honeypot_caught", ip_hash: hashIp(ip), ua: redactUserAgent(ua), ts: Date.now() });
    return NextResponse.json({ ok: true, lead_id: "drop" }, { status: 200 });  // silent
  }

  // Schema validation
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const err of parsed.error.errors) {
      const key = err.path.join(".");
      errors[key] ??= [];
      errors[key].push(err.message);
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const data = parsed.data;

  // Route to backend
  let leadId: string;
  try {
    if (data.track === "buy" || data.track === "partner") {
      const contactId = await hubspotCreateContact(data);
      const dealStage = data.track === "buy" ? "discovery-call-booked" : "partner-inbound";
      leadId = await hubspotCreateDeal(contactId, dealStage, data);
    } else {
      leadId = await atsCreateCandidate(data);
    }
  } catch (err: any) {
    if (err.upstream5xx) {
      const queueId = await queueRetry({ data, attemptedAt: Date.now() });
      logEvent({
        kind: "upstream_5xx_queued", track: data.track,
        ip_hash: hashIp(ip), latency_ms: performance.now() - t0,
      });
      return NextResponse.json({ ok: true, lead_id: queueId }, { status: 200 });
    }
    logEvent({ kind: "upstream_error", error: String(err), ip_hash: hashIp(ip) });
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 503 });
  }

  // Side-effects
  await slackNotify(`🆕 Lead inbound — track: ${data.track} | country: ${"country" in data ? data.country : "—"} | name: ${data.contact_name}`);
  logEvent({
    kind: "lead_success", track: data.track,
    email_redacted: redactEmail(data.contact_email),
    ip_hash: hashIp(ip), ua_redacted: redactUserAgent(ua),
    latency_ms: performance.now() - t0,
  });

  return NextResponse.json({ ok: true, lead_id: leadId }, { status: 200 });
}
```

```ts
// apps/web/lib/server/rate-limit.ts
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(ip: string, limit: number, windowSec: number) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now >= b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true };
}
// Production: replace with Upstash Redis to share state across Vercel edge regions
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Route exists at /api/lead | curl -X POST http://localhost:3000/api/lead → response |
| 2 | Returns 200 on valid body | Synthetic valid payload |
| 3 | Returns 400 on schema fail | Synthetic invalid (missing field) |
| 4 | Returns 429 + Retry-After after 5 reqs in 60s | Loop 6 requests; assert 429 on 6th |
| 5 | Honeypot triggers silent 200 | Body with hp_email filled → 200 + no upstream call |
| 6 | API keys not in client bundle | grep build output |
| 7 | Routes to HubSpot for buy / partner | Mock hubspotCreateDeal; assert called |
| 8 | Routes to ATS for join | Mock atsCreateCandidate; assert called |
| 9 | Consent required (400 if false) | Submit with consent:false → 400 |
| 10 | Queues retry on upstream 5xx | Mock 503; assert queueRetry called + client gets 200 with lead_id |
| 11 | CORS rejects cross-origin POST | Submit from different Origin → 403 |
| 12 | Slack notification fires on success | Mock slackNotify; assert called |
| 13 | Logs anonymized (no raw email, no raw IP) | Inspect log output |
| 14 | p95 latency ≤ 1500 ms | Load test |
| 15 | Vitest unit tests pass | `pnpm vitest run apps/web/app/api/lead/__tests__/route.unit.test.ts` |
| 16 | Sentry captures exceptions | Synthetic throw; verify Sentry event |

## §5 — Verification

```ts
// apps/web/app/api/lead/__tests__/route.unit.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

describe("/api/lead", () => {
  function makeReq(body: any, opts: { ip?: string; origin?: string } = {}) {
    return new Request("http://localhost:3000/api/lead", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": opts.ip ?? "1.2.3.4",
        "origin": opts.origin ?? "http://localhost:3000",
        "user-agent": "Mozilla/5.0",
      },
      body: JSON.stringify(body),
    });
  }

  beforeEach(() => {
    // Reset rate-limit buckets
  });

  it("200 on valid buy payload", async () => {
    const res = await POST(makeReq({
      track: "buy",
      contact_email: "test@example.com",
      contact_name: "Test User",
      use_case: "We want to build a museum exhibit with 3D...",
      budget_range: "50k-200k",
      consent: true,
    }));
    expect(res.status).toBe(200);
  });

  it("400 on missing required field", async () => {
    const res = await POST(makeReq({ track: "buy", contact_email: "x@y.com" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toBeDefined();
  });

  it("400 when consent false", async () => {
    const res = await POST(makeReq({
      track: "buy", contact_email: "test@example.com", contact_name: "X",
      use_case: "Twenty characters here is enough", budget_range: "tbd",
      consent: false,
    }));
    expect(res.status).toBe(400);
  });

  it("429 on rate limit", async () => {
    for (let i = 0; i < 5; i++) {
      await POST(makeReq({ track: "buy", contact_email: "a@b.com", contact_name: "X", use_case: "x".repeat(30), budget_range: "tbd", consent: true }, { ip: "9.9.9.9" }));
    }
    const res = await POST(makeReq({ track: "buy", contact_email: "a@b.com", contact_name: "X", use_case: "x".repeat(30), budget_range: "tbd", consent: true }, { ip: "9.9.9.9" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });

  it("honeypot returns 200 silently", async () => {
    const res = await POST(makeReq({
      track: "buy", contact_email: "x@y.com", contact_name: "X",
      use_case: "x".repeat(30), budget_range: "tbd", consent: true,
      hp_email: "spam@spam.com",
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.lead_id).toBe("drop");
  });

  it("403 on cross-origin", async () => {
    const res = await POST(makeReq({ track: "buy", contact_email: "x@y.com", contact_name: "X", use_case: "x".repeat(30), budget_range: "tbd", consent: true }, { origin: "https://evil.com" }));
    expect(res.status).toBe(403);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-003 (Partner form payload), FR-CTA-004 (Join form payload), FR-CTA-005 (shared schema), FR-OPS-014 (analytics/observability), FR-A11Y-001 (consent UX requirements).

**Operational:** Next.js 15 App Router runtime, env vars `HUBSPOT_API_KEY` / `ATS_API_KEY` / `SLACK_WEBHOOK_URL`, Upstash Redis or Vercel KV for prod rate-limit.

**Downstream:** All 3 CTA forms consume this endpoint. FR-CTA-009 (post-submit confirmation flow).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| API key in client bundle | AC#6 | bundler scan in CI; FR-OPS-013 catches |
| Rate-limit shares state across edge regions (in-memory) | Bypass scenario | Migrate to Upstash Redis in prod; in-memory dev only |
| Honeypot field discovered by sophisticated bot | High submit volume | Add Cloudflare Turnstile on rate-limit threshold |
| Consent unchecked but form still POSTs | AC#9 | Server enforces; client also disables submit until checked |
| HubSpot 5xx during high traffic | Sentry alerts | queueRetry; exponential backoff |
| ATS rate-limit hit | 429 from ATS | Surface to user as "Try again in N minutes" |
| PII logged in error path | Audit | Run periodic log scan; redact at logEvent boundary |
| CORS misconfigured (legitimate request blocked) | User reports | Whitelist exact origin; document |
| Email enumeration via timing attack | Manual probe | Server returns generic error after constant-time hash check |
| Slack notification spammed (every retry fires Slack) | Channel monitor | Idempotency: only notify on first success; not retries |
| Sentry quota exhausted | Sentry overage | Sample rate; only log errors not info |
| User submits 10MB JSON body (DoS) | Resource exhaustion | Body size limit at Vercel/Next config (1 MB max) |
| Schema discriminator missing (no `track` field) | Bad client | Schema validates → 400; surfaces in errors |
| Server clock drift (rate-limit window confusion) | Test | Use server-side Date.now consistently; document |
| User accidentally double-submits | UX | Idempotency key in request; server deduplicates within 60s |
| Honeypot field accidentally rendered visible | Visual leak | CSS: position absolute + left -9999px; tabIndex={-1} |

## §8 — Deliverable preview

User submits Partner form via curl:
```bash
curl -X POST https://cyberskill.world/api/lead \
  -H "Content-Type: application/json" \
  -d '{"track":"partner","agency_name":"ACME Studio","country":"VN","monthly_capacity":80,"brief":"We need React + R3F help for a museum exhibit installation in Hanoi…","contact_email":"alex@acme.studio","contact_name":"Alex Tran","consent":true}'
```

Server response: `{"ok":true,"lead_id":"hubspot-d-12345"}`.

Behind the scenes:
1. HubSpot contact created.
2. HubSpot deal created in stage `partner-inbound`, linked to contact.
3. Slack `#cs-leads-inbound`: "🆕 Lead inbound — track: partner | country: VN | name: Alex Tran".
4. Log: `{"kind":"lead_success","track":"partner","email_redacted":"a***@a***.com","ip_hash":"sha256:9f...","ua_redacted":"Mozilla/...","latency_ms":820}`.

Bot scenario:
1. Bot POSTs `{"track":"buy","hp_email":"spam@spam.com",...}`.
2. Server: `{"ok":true,"lead_id":"drop"}` (silent).
3. Log: `{"kind":"honeypot_caught","ip_hash":"sha256:7b..."}`.
4. No HubSpot call, no Slack ping. Bot thinks it succeeded.

## §9 — Notes

**On Upstash Redis migration:** In-memory rate-limit works for dev + small traffic. At ~10k visitors/day, Vercel edge replicas drift; Upstash KV is the recommended drop-in.

**On Vietnamese consent compliance:** Vietnamese privacy law (Personal Data Protection Decree 2023) requires explicit consent. The `consent: true` literal in schema satisfies. Localized consent text in form (FR-CMS-vi).

**On Turnstile addition:** Cloudflare Turnstile is the recommended Captcha alternative (no ad-tech, privacy-first). Trigger only on rate-limit threshold breach.

**On future webhook validation:** HubSpot can webhook back on deal-stage changes; could trigger automated emails. Slice 3.

**On observability dashboard:** Vercel Analytics + Sentry give us latency + error tracking. A Grafana dashboard could correlate with ATS / HubSpot performance — slice 3.

**On idempotency keys:** Slice 2 enhancement — client-generated UUID in submit; server deduplicates if same UUID within 60s window.

*End of FR-CTA-006.*
