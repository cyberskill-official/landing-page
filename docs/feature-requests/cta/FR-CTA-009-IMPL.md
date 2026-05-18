---
id: FR-CTA-009
title: "HubSpot deal-stage routing — buy/partner/join → separate pipelines with UTM + scene_id metadata"
module: CTA
priority: MUST
status: blocked
blocked_reason: "Code, unit tests, local API smoke, and production build are complete; HubSpot test-environment verification and test pipeline cleanup require HubSpot sandbox credentials."
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Backend Lead + Sales Ops
created: 2026-05-16
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-006, FR-SEO-007, FR-SEO-008]
depends_on: [FR-CTA-006]
blocks: []
language: typescript 5.6
service: apps/web/lib/server/
new_files:
  - apps/web/lib/server/hubspot-stage-router.ts
  - apps/web/lib/server/__tests__/hubspot-stage-router.unit.test.ts
modified_files:
  - apps/web/app/api/lead/route.ts
  - apps/web/lib/forms/schemas/lead-schema.ts
  - apps/web/lib/server/hubspot-client.ts
  - apps/web/lib/server/slack-client.ts
  - apps/web/components/cta/forms/BuyForm.tsx
  - apps/web/components/cta/forms/PartnerForm.tsx
  - apps/web/components/cta/forms/JoinForm.tsx
  - apps/web/components/cta/forms/__tests__/PartnerForm.unit.test.tsx
  - apps/web/components/cta/forms/__tests__/JoinForm.unit.test.tsx
  - apps/web/components/cta/forms/__tests__/buy-form.spec.ts
  - apps/web/tests/cta/lead-api.e2e.spec.ts
  - apps/web/tests/cta/partner-form.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §9.1 — multi-track HubSpot pipeline
  - FR-CTA-006 — server endpoint backbone
  - HubSpot CRM API documentation

effort_hours: 4
risk_if_skipped: "Without deal-stage routing, all leads pile in one pipeline → founder can't tell partner from talent from prospect. Misrouted leads damages reputation. Per-track pipelines = correct stakeholders see right leads."
---

## §1 — Description (BCP-14 normative)

1. **MUST** route /api/lead leads by `track` field:
   - `track === "buy"` → HubSpot deal-stage `inbound-discovery`.
   - `track === "partner"` → HubSpot deal-stage `partner-pipeline`.
   - `track === "join"` → ATS (NOT HubSpot).
2. **MUST** include in deal metadata: UTM source/medium/campaign/content/term (from cookie or query), scene_id (which scene CTA clicked from), referrer, locale, timestamp, redacted user_agent.
3. **MUST** verify each pipeline via HubSpot test environment before launch.
4. **MUST** alert (Slack + email) if a deal lands in unexpected stage.
5. **MUST** version stage names — env-driven, not hardcoded.
6. **MUST** be tested via Vitest unit tests.

## §2 — Why this design

**Why separate pipelines?** Different stakeholders own different funnels: Buy=Sales, Partner=BD, Join=HR. Stuffing into one = noise.

**Why ATS for Join?** ATS purpose-built for hiring stages (interview tracking, offers). HubSpot deal-stage is wrong abstraction.

**Why UTM + scene_id?** Marketing attribution. Which scene drives conversion? Which campaign sends best-value leads?

**Why versioned stages?** HubSpot pipeline can reorg. Hardcoded breaks on rename.

**Why alerts on misrouting?** Catch silent breakage early.

## §3 — Public surface

```ts
// apps/web/lib/server/hubspot-stage-router.ts
export type Track = "buy" | "partner" | "join";

export const STAGE_BY_TRACK: Record<Track, string | "ats"> = {
  buy:     process.env.HUBSPOT_STAGE_BUY     ?? "inbound-discovery",
  partner: process.env.HUBSPOT_STAGE_PARTNER ?? "partner-pipeline",
  join:    "ats",
};

export interface LeadMetadata {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  scene_id?: string;
  referrer?: string;
  locale: "en" | "vi";
  timestamp: string;
  user_agent_redacted: string;
}

export interface RoutingResult {
  destination: "hubspot" | "ats";
  stage?: string;
  metadata: LeadMetadata;
}

export function routeLead(track: Track, metadata: LeadMetadata): RoutingResult {
  const stage = STAGE_BY_TRACK[track];
  if (stage === "ats") return { destination: "ats", metadata };
  return { destination: "hubspot", stage, metadata };
}

export function extractUtmFromHeaders(headers: Headers): Partial<LeadMetadata> {
  const referrer = headers.get("referer") ?? undefined;
  if (!referrer) return {};
  try {
    const url = new URL(referrer);
    return {
      utm_source:   url.searchParams.get("utm_source")   ?? undefined,
      utm_medium:   url.searchParams.get("utm_medium")   ?? undefined,
      utm_campaign: url.searchParams.get("utm_campaign") ?? undefined,
      utm_content:  url.searchParams.get("utm_content")  ?? undefined,
      utm_term:     url.searchParams.get("utm_term")     ?? undefined,
      referrer,
    };
  } catch {
    return { referrer };
  }
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 3 destinations correctly routed | Vitest |
| 2 | UTM extracted from referrer | Test with mock headers |
| 3 | scene_id in metadata | Vitest |
| 4 | Stage names env-driven | Code grep |
| 5 | Alert fires on unrouted track | Mock; assert |
| 6 | HubSpot test pipeline verified | Manual |
| 7 | locale tracked | Vitest |
| 8 | Vitest unit tests pass | pnpm vitest |
| 9 | Test pipeline cleared before launch | Manual |
| 10 | Stage names versioned via config | Env-driven |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { routeLead, extractUtmFromHeaders } from "../hubspot-stage-router";

describe("hubspot-stage-router", () => {
  const base = { locale: "en" as const, timestamp: "2026-05-19T00:00:00Z", user_agent_redacted: "..." };

  it("routes buy to inbound-discovery", () => {
    const r = routeLead("buy", base);
    expect(r.destination).toBe("hubspot");
    expect(r.stage).toBe("inbound-discovery");
  });
  it("routes partner to partner-pipeline", () => {
    expect(routeLead("partner", base).stage).toBe("partner-pipeline");
  });
  it("routes join to ATS", () => {
    expect(routeLead("join", base).destination).toBe("ats");
  });
  it("extracts UTM from referrer", () => {
    const h = new Headers({ referer: "https://twitter.com/x?utm_source=twitter&utm_campaign=launch" });
    const meta = extractUtmFromHeaders(h);
    expect(meta.utm_source).toBe("twitter");
    expect(meta.utm_campaign).toBe("launch");
  });
  it("metadata includes scene_id + locale", () => {
    const r = routeLead("partner", { ...base, scene_id: "scene-6" });
    expect(r.metadata.scene_id).toBe("scene-6");
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-006 (server endpoint), FR-SEO-007 (analytics correlates), FR-SEO-008 (event taxonomy).

**Operational:** HubSpot CRM with 2 named pipelines + ATS provider.

**Downstream:** Sales + BD + HR dashboards.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| HubSpot pipeline reorg | AC#4 | Stage names in env; update + redeploy |
| Misrouted lead | AC#5 alert | Slack; manual triage in HubSpot |
| UTM missing on direct visits | AC#2 | Defaults to "direct" |
| scene_id missing | "unknown" passed | Acceptable |
| HubSpot API down | FR-CTA-006 retry queue | Inherits parent retry |
| Test/prod isolation | Manual | Separate API keys per env |
| Metadata exceeds field size | API 4xx | Trim referrer to 500 chars |
| Concurrent writes to same contact | Race | HubSpot handles idempotency |
| Locale missing | Default "en" | Routing unaffected |
| ATS API differs from HubSpot pattern | Different client | atsCreateCandidate abstracts |

## §8 — Deliverable preview

User submits Partner form:
1. /api/lead receives `{ track: "partner", scene_id: "scene-6", locale: "vi", ... }`.
2. Router: hubspot + partner-pipeline stage.
3. HubSpot deal created with UTM + metadata.
4. Slack: "🆕 Lead — partner | VN | ACME (utm: linkedin/launch)".

User submits Join form:
1. Router: destination=ats.
2. Workable candidate created. HubSpot untouched.
3. Hiring manager alerted.

## §9 — Notes

**On stage naming:** Lowercase + dash convention. "inbound-discovery" standard CRM.

**On Vietnamese leads:** locale="vi" tracked; founder may follow up in Vietnamese.

*End of FR-CTA-009.*

## §10 — Implementation status

Status: **implemented locally, blocked on HubSpot sandbox verification**.

Delivered:

- `hubspot-stage-router.ts` routes `buy` and `partner` to env-driven HubSpot stages and pipelines, routes `join` to ATS, enriches metadata with UTM, scene, referrer, locale, timestamp, and redacted user agent, and emits an alert path for unexpected tracks.
- `/api/lead` now dispatches through the router instead of hardcoded stages.
- HubSpot deal creation receives the configured stage, pipeline, and CyberSkill metadata properties.
- Buy, Partner, and Join forms include `scene_id: "scene-6"` and route-derived locale.
- Partner form no longer posts a hardcoded `deal_stage`.
- Slack plus optional email-webhook alert support exists for unexpected routing.

Verified:

- `node_modules/.bin/vitest run lib/server/__tests__/hubspot-stage-router.unit.test.ts components/cta/forms/__tests__/PartnerForm.unit.test.tsx components/cta/forms/__tests__/JoinForm.unit.test.tsx components/cta/forms/__tests__/buy-form.spec.ts --config vitest.config.ts`
- `node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `node_modules/.bin/playwright test tests/cta/lead-api.e2e.spec.ts tests/cta/partner-form.spec.ts tests/cta/buy-form.spec.ts tests/cta/join-form.spec.ts --project=chromium`
- `node_modules/.bin/next build`
- Warm dev-server smoke: `node_modules/.bin/playwright test tests/cta/lead-api.e2e.spec.ts --project=chromium`

Blocked items:

- AC#3 HubSpot test-environment verification needs sandbox API credentials.
- AC#9 test pipeline cleanup needs access to the HubSpot test account.
