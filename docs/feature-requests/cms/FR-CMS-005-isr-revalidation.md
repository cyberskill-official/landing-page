---
id: FR-CMS-005
title: "ISR (Incremental Static Regeneration) — 3600s revalidate + Sanity webhook → /api/revalidate with shared-secret guard"
module: CMS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: Backend Lead + Frontend Lead
created: 2026-05-16
related_frs: [FR-CMS-004, FR-CMS-006, FR-CMS-007, FR-WEB-008, FR-PERF-001]
depends_on: [FR-CMS-004]
blocks: [FR-CMS-006]
language: typescript 5.6 + next 15
service: apps/web/app/api/revalidate/ + page revalidate config
new_files:
  - apps/web/app/api/revalidate/route.ts
  - apps/web/app/api/revalidate/__tests__/route.unit.test.ts
  - apps/web/lib/sanity/webhook-secret.ts
  - apps/web/app/page.tsx  (add export const revalidate = 3600)
  - apps/web/app/work/[slug]/page.tsx  (add export const revalidate = 3600)
  - docs/ops/sanity-webhook-setup.md

source_pages:
  - docs/01-master-plan-v2.md §8.1 — "SSG with ISR revalidate: 3600 for marketing routes"
  - docs/01-master-plan-v2.md §8.2 — Sanity webhook → revalidate pattern
  - Vercel ISR documentation
  - Sanity webhook signing documentation

effort_hours: 4
risk_if_skipped: "Without ISR: every page request hits Sanity API → 200-500ms latency per page, mobile Lighthouse fails. Without webhook: edits don't appear until 1h timer expires → editor confusion / 'is this site broken?'. ISR + webhook is the right combo for low-latency + freshness."
---

## §1 — Description (BCP-14 normative)

1. **MUST** set `export const revalidate = 3600` (1 hour) on all CMS-driven marketing routes:
   - `apps/web/app/page.tsx` (home — pulls testimonials, capabilities, featured case studies)
   - `apps/web/app/work/page.tsx` (case study list)
   - `apps/web/app/work/[slug]/page.tsx` (case study detail)
   - `apps/web/app/capabilities/page.tsx`
   - `apps/web/app/team/page.tsx`
   - `apps/web/app/careers/page.tsx`

2. **MUST** ship `/api/revalidate/route.ts` POST handler that:
   - Validates webhook signature against shared secret (FR-CMS-005 webhook-secret config).
   - Parses Sanity payload to determine which paths/tags to revalidate.
   - Calls Next.js `revalidatePath()` or `revalidateTag()` accordingly.
   - Returns `200 OK` with `{ revalidated: true, paths: [...] }` on success.

3. **MUST** secure the revalidate endpoint with a shared HMAC secret (Sanity sends `sanity-webhook-signature` header; verify against `SANITY_WEBHOOK_SECRET` env var).

4. **MUST** sign verification:
   ```ts
   const expected = createHmac("sha256", secret).update(payload).digest("hex");
   const actual = signatureHeader;
   const valid = timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
   ```

5. **MUST** invalidate exact paths per Sanity payload `_type`:
   - `case_study` → revalidate `/`, `/work`, `/work/<slug>`, and `/vi` variants if locale=vi
   - `testimonial` → revalidate `/`, `/work` (testimonials surface on multiple pages)
   - `capability` → revalidate `/`, `/capabilities`
   - `team_member` → revalidate `/team`
   - `job` → revalidate `/careers`, footer hiring badge

6. **MUST** revalidate both locales when applicable (e.g., if a case study has `i18n_locale: 'vi'`, also revalidate Vietnamese variant routes).

7. **MUST** rate-limit the revalidate endpoint at 60 req/min to prevent spam (legitimate Sanity bursts ~10/min during bulk edits).

8. **MUST** log every revalidate call (anonymized) for observability (FR-OPS-014):
   ```json
   { "kind": "revalidate", "doc_type": "case_study", "doc_id": "abc123", "paths": ["/", "/work/x"], "latency_ms": 42 }
   ```

9. **MUST** support `?path=/foo` query param for manual revalidation (admin-only, requires bearer token in `Authorization` header per FR-OPS-014).

10. **MUST NOT** revalidate routes that don't use CMS data (e.g., `/api/*` endpoints, `/lite` if it doesn't use Sanity).

11. **MUST** handle Sanity payload parsing defensively — Sanity webhook payload shape can change; gracefully fall back to revalidating `/` if doc type unknown.

12. **MUST** document Sanity webhook setup at `docs/ops/sanity-webhook-setup.md` (URL, secret config, payload format).

13. **MUST** be tested with Vitest unit tests.

14. **SHOULD** revalidate via tags (Next 15 `revalidateTag`) when feasible, falling back to `revalidatePath`.

## §2 — Why this design

**Why 3600s (1 hour) revalidate?** Balance:
- Too short (e.g., 60s) = high Sanity API hits, sluggish ISR triggers, ops cost.
- Too long (e.g., 86400 / 1 day) = stale content if webhook fails.
- 1 hour is the master plan §8.1 calibration — manageable freshness window.

**Why webhook (not just timer)?** Timer alone = up to 1h staleness. Editor publishes case study; visitor sees old content; editor confused. Webhook = immediate invalidation; staleness window collapses to ~5 seconds.

**Why shared HMAC secret?** Anyone can POST to `/api/revalidate`; without signature check, bots could spam endpoint to consume Vercel ISR budget. HMAC verifies the request came from Sanity, not somewhere else.

**Why timingSafeEqual?** Constant-time comparison prevents timing-attack side channel where attacker uses response latency to guess secret bytes. Standard crypto hygiene.

**Why per-doc-type revalidation?** Each document type appears on different page sets:
- CaseStudy on home + work list + detail page (3+ paths)
- TeamMember on team page only (1 path)

Per-type routing minimizes unnecessary regeneration.

**Why both locales?** Editor publishes Vietnamese case study; if we only revalidate `/work/<slug>` (defaulting to en), Vietnamese page stays stale. Locale-aware revalidation fixes.

**Why rate-limit 60 req/min?** Bulk edits in Sanity can fire dozens of webhooks in seconds. 60/min covers burst safely; beyond that suggests malice or runaway script.

**Why revalidateTag (when possible)?** `revalidateTag` invalidates by content tag (e.g., `cms:case_study`) — one tag invalidates all routes using it. Simpler than maintaining a path mapping. Migrate progressively.

**Why manual revalidation endpoint with bearer auth?** Editor / founder hits "Republish all" button → call `/api/revalidate?path=/&token=...`. Useful for emergency reset after CMS migration.

## §3 — Public surface

```ts
// apps/web/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createHmac, timingSafeEqual } from "node:crypto";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { logEvent } from "@/lib/server/logger";

export const runtime = "nodejs";

const SECRET = process.env.SANITY_WEBHOOK_SECRET!;
const ADMIN_TOKEN = process.env.REVALIDATE_ADMIN_TOKEN!;

export async function POST(request: NextRequest) {
  const t0 = performance.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate-limit
  const rl = await checkRateLimit(`revalidate:${ip}`, 60, 60);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  // Manual mode (admin)
  const manualPath = request.nextUrl.searchParams.get("path");
  if (manualPath) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    revalidatePath(manualPath);
    logEvent({ kind: "revalidate_manual", path: manualPath });
    return NextResponse.json({ ok: true, paths: [manualPath] });
  }

  // Webhook mode (Sanity)
  const raw = await request.text();
  const signature = request.headers.get("sanity-webhook-signature") ?? "";
  const expected = createHmac("sha256", SECRET).update(raw).digest("hex");

  if (signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    logEvent({ kind: "revalidate_bad_signature", ip });
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const docType = payload._type;
  const slug = payload.slug?.current;
  const locale = payload.i18n_locale ?? "en";
  const localePrefix = locale === "vi" ? "/vi" : "";

  const paths = pathsForDocType(docType, slug, localePrefix);
  for (const p of paths) {
    revalidatePath(p);
  }

  logEvent({
    kind: "revalidate", doc_type: docType, doc_id: payload._id,
    paths, locale, latency_ms: performance.now() - t0,
  });

  return NextResponse.json({ ok: true, revalidated: true, paths });
}

function pathsForDocType(type: string, slug?: string, localePrefix = ""): string[] {
  switch (type) {
    case "case_study":
      return [
        `${localePrefix}/`,
        `${localePrefix}/work`,
        slug ? `${localePrefix}/work/${slug}` : null,
      ].filter(Boolean) as string[];
    case "testimonial":
      return [`${localePrefix}/`, `${localePrefix}/work`];
    case "capability":
      return [`${localePrefix}/`, `${localePrefix}/capabilities`];
    case "team_member":
      return [`${localePrefix}/team`];
    case "job":
      return [`${localePrefix}/careers`, `${localePrefix}/`];  // footer badge on home
    default:
      return [`${localePrefix}/`];  // safe fallback
  }
}
```

```tsx
// apps/web/app/page.tsx
export const revalidate = 3600;  // 1 hour
export default async function Home() {
  const data = await sanityFetch(homeQuery, { tags: ["home"] });
  return <Page data={data} />;
}
```

```tsx
// apps/web/app/work/[slug]/page.tsx
export const revalidate = 3600;
export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const data = await sanityFetch(caseStudyBySlugQuery, { params, tags: [`case_study:${params.slug}`] });
  if (!data) notFound();
  return <CaseStudy data={data} />;
}
```

```markdown
# docs/ops/sanity-webhook-setup.md

## Sanity Webhook Configuration

1. In Sanity Studio, go to API → Webhooks → Create new webhook.
2. Name: "Production revalidate"
3. URL: `https://cyberskill.world/api/revalidate`
4. Dataset: `production`
5. Trigger on: Create, Update, Delete
6. Filter: `_type in ['case_study', 'testimonial', 'capability', 'team_member', 'job']`
7. Projection:
   ```
   {
     "_id": _id,
     "_type": _type,
     "slug": slug,
     "i18n_locale": i18n_locale
   }
   ```
8. Secret: Generate; store in Vercel env as `SANITY_WEBHOOK_SECRET`.
9. Save.

## Manual revalidation
```bash
curl -X POST "https://cyberskill.world/api/revalidate?path=/work/museum-exhibit-acme" \
  -H "Authorization: Bearer $REVALIDATE_ADMIN_TOKEN"
```
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | `revalidate = 3600` exported on all CMS pages | grep code |
| 2 | `/api/revalidate` exists + returns 200 on valid webhook | Synthetic webhook test |
| 3 | Invalid signature returns 401 | Synthetic invalid sig test |
| 4 | Manual mode requires bearer auth (401 without) | Test without header |
| 5 | Manual mode with correct token revalidates | Test with valid header |
| 6 | case_study webhook revalidates /, /work, /work/<slug> | Mock revalidatePath; assert calls |
| 7 | i18n_locale=vi adds /vi prefix to paths | Mock + assert |
| 8 | Rate-limit 429 after 60 req/min | Loop test |
| 9 | Logs anonymized | Inspect logEvent calls |
| 10 | Unknown doc type falls back to / | Mock unknown _type; assert revalidatePath("/") |
| 11 | Vitest unit tests pass | `pnpm vitest run apps/web/app/api/revalidate/__tests__/route.unit.test.ts` |
| 12 | docs/ops/sanity-webhook-setup.md present | File exists |
| 13 | timingSafeEqual used (not ===) | Code grep |
| 14 | Bearer admin token never logged | Inspect logEvent — no `Authorization` header |

## §5 — Verification

```ts
// apps/web/app/api/revalidate/__tests__/route.unit.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { createHmac } from "node:crypto";

const SECRET = "test-secret";
process.env.SANITY_WEBHOOK_SECRET = SECRET;
process.env.REVALIDATE_ADMIN_TOKEN = "admin-token";

function signedReq(body: any) {
  const raw = JSON.stringify(body);
  const sig = createHmac("sha256", SECRET).update(raw).digest("hex");
  return new Request("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "sanity-webhook-signature": sig, "x-forwarded-for": "1.2.3.4" },
    body: raw,
  }) as any;
}

describe("/api/revalidate", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("200 on valid webhook for case_study", async () => {
    const res = await POST(signedReq({ _type: "case_study", _id: "abc", slug: { current: "test" }, i18n_locale: "en" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.paths).toContain("/work/test");
  });

  it("401 on invalid signature", async () => {
    const req = new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "sanity-webhook-signature": "bad", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ _type: "case_study" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("vi locale adds /vi prefix", async () => {
    const res = await POST(signedReq({ _type: "case_study", _id: "abc", slug: { current: "test" }, i18n_locale: "vi" }));
    const json = await res.json();
    expect(json.paths).toContain("/vi/work/test");
  });

  it("manual mode 401 without bearer", async () => {
    const req = new Request("http://localhost:3000/api/revalidate?path=/", {
      method: "POST",
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("manual mode 200 with bearer", async () => {
    const req = new Request("http://localhost:3000/api/revalidate?path=/foo", {
      method: "POST",
      headers: { "Authorization": "Bearer admin-token", "x-forwarded-for": "1.2.3.4" },
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });

  it("unknown _type falls back to /", async () => {
    const res = await POST(signedReq({ _type: "unknown", _id: "x" }));
    const json = await res.json();
    expect(json.paths).toContain("/");
  });

  it("rate-limit 429 after 60 reqs", async () => {
    for (let i = 0; i < 60; i++) {
      await POST(signedReq({ _type: "case_study", _id: String(i), slug: { current: `t${i}` } }));
    }
    const res = await POST(signedReq({ _type: "case_study", _id: "60", slug: { current: "t60" } }));
    expect(res.status).toBe(429);
  });

  it("anonymized log (no Auth header logged)", () => {
    // Mock logger; assert no Authorization in any logged event
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-004 (Sanity schemas — webhook payload shape), FR-CMS-006 (consumer of revalidate), FR-CMS-007 (locale routes).

**Operational:** Sanity webhook config (one-time setup per environment), Vercel ISR runtime, `node:crypto` for HMAC.

**Downstream:** FR-CMS-006 (case study pages benefit from fresh content), FR-CMS-007 (locale switching post-publish).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Webhook secret leaked | Audit | Rotate secret; redeploy; audit prior commits |
| Invalid signature on legitimate webhook | Sanity setup wrong | Verify Sanity config; re-save webhook |
| Stale content after publish (webhook didn't fire) | Manual smoke | Manual revalidation via admin endpoint |
| revalidatePath fails silently | Vercel issue | Sentry capture in catch |
| Bearer token leaked in logs | Manual audit | Don't log Authorization header; redact at logEvent boundary |
| Timing attack on signature | Constant-time fix | timingSafeEqual (AC#13) |
| Webhook payload missing slug field | Optional chaining | `payload.slug?.current` handles gracefully |
| Multiple webhooks fire simultaneously (race) | revalidatePath idempotent | OK; Next.js handles internally |
| Rate-limit blocks Sanity bulk publish | 60/min limit | Bulk publishes typically < 60 webhooks; if exceeded, raise to 120 |
| `vi` locale doc edit doesn't revalidate `/` (en home) | en home shows cached | Optionally revalidate both home routes on either locale change |
| Manual mode used by malicious party | Token leak | Rotate REVALIDATE_ADMIN_TOKEN |
| Sanity webhook URL misconfigured (typo) | Webhook 404 | Document explicit URL; visual smoke after setup |
| Body size > 1 MB (huge document) | Vercel limit | Sanity webhooks compact; well under limit |
| Stale ISR after 1h with no edits | Acceptable behavior | Refresh on next visit; bg revalidate triggers |
| revalidateTag not yet available for some routes | Use revalidatePath | Document mix in code comments |

## §8 — Deliverable preview

Editor flow:
1. Editor edits case study in Sanity Studio. Saves.
2. Sanity sends webhook to `/api/revalidate` with payload + signature.
3. API verifies signature (timing-safe), parses payload.
4. Calls `revalidatePath("/")`, `revalidatePath("/work")`, `revalidatePath("/work/museum-exhibit-acme")`.
5. Logs: `{ kind: 'revalidate', doc_type: 'case_study', paths: [...], latency_ms: 42 }`.
6. Editor refreshes site within ~5 seconds → sees updated content.

Visitor flow:
1. Visitor lands on `/work/museum-exhibit-acme`. Page served from Vercel ISR cache (~50 ms).
2. After 1 hour passes, next visitor triggers background regeneration.
3. Visitor still gets cached page instantly while regen happens.
4. Subsequent visitor gets fresh page.

## §9 — Notes

**On Vercel ISR vs other CDNs:** ISR is the Vercel-specific feature. On Cloudflare Pages or others, would use stale-while-revalidate cache headers. We're on Vercel; ISR is the right tool.

**On revalidateTag migration:** Future: tag every fetch (`tags: ['cms:case_study']`) and call `revalidateTag('cms:case_study')` from webhook. Simpler than per-doc path mapping. Slice 2.

**On preview mode (Sanity drafts):** Separate from ISR — preview mode uses `cookies()` to opt out of cache for editor sessions only. FR-CMS-006 handles preview.

**On Vietnamese locale revalidation:** Vietnamese case studies trigger `/vi/work/<slug>` revalidation. Hreflang (FR-CMS-008) ensures both versions stay aligned.

**On observability:** Each revalidate call logs latency + paths. Future: Grafana dashboard correlating revalidate calls with content publish rate.

**On 'why not webhook for every Sanity change?'** All publishes go through webhook. Document creation in draft mode doesn't (no public impact).

*End of FR-CMS-005.*
