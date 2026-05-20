---
id: FR-CTA-004
title: "ATS-fed 'We're hiring N' badge + Join form — Workable / Greenhouse role-source, multi-step intake"
module: CTA
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P4
slice: 2
owner: Frontend Lead + Backend + HR
created: 2026-05-16
related_frs: [FR-CTA-001, FR-CTA-005, FR-CTA-006, FR-CTA-007, FR-CMS-005, FR-SCENE-018]
depends_on: [FR-CTA-001, FR-CTA-005, FR-CTA-006]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/cta/forms/ + apps/web/app/api/jobs-count/
new_files:
  - apps/web/components/cta/forms/JoinForm.tsx
  - apps/web/components/cta/forms/__tests__/JoinForm.unit.test.tsx
  - apps/web/components/cta/forms/schemas/join-schema.ts
  - apps/web/app/api/jobs-count/route.ts
  - apps/web/app/api/jobs-count/__tests__/route.unit.test.ts
  - apps/web/lib/server/jobs-count.ts
  - apps/web/components/footer/HiringBadge.tsx
  - apps/web/tests/cta/join-form.spec.ts
modified_files:
  - apps/web/app/page.tsx
  - apps/web/app/globals.css
  - apps/web/lib/analytics/events.ts
  - apps/web/tests/a11y/form-validation.e2e.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §9.1 Track 3 — "Join us: hiring page entry"
  - docs/01-master-plan-v2.md §9.2 — Footer trust signals
  - Workable Public API or Greenhouse Job Board API documentation

effort_hours: 6
risk_if_skipped: "Join-track CTA is one of the 3 CTA hub paths. Without it, talent inbound goes to email — high friction, no funnel visibility. ATS-fed badge ('We're hiring 3') is a credibility signal: visible on every page (footer), signals momentum to all visitors not just job-seekers."
---

## Implementation Status

Shipped 2026-05-18.

Delivered:
- Lazy `JoinForm` with zod/react-hook-form validation, no resume upload, privacy notice, rate/retry/validation/success states, `/api/lead` join payload, and Lumi `mouth_smile`/`wave_goodbye` reactions.
- Server-only `/api/jobs-count` route with 5-minute successful ATS cache, 60-second soft-fallback cache, Workable/Greenhouse/Lever normalization, and local role fallback when ATS env is absent or unavailable.
- Footer `HiringBadge` with all required count, zero, and failure states.
- Unit and E2E coverage for ATS role loading, fallback roles, lead submission, privacy copy, mobile fit, a11y validation, and caching.

Verification completed:
- `node_modules/.bin/vitest run app/api/jobs-count/__tests__/route.unit.test.ts components/cta/forms/__tests__/JoinForm.unit.test.tsx --config vitest.config.ts`
- `node_modules/.bin/playwright test tests/cta/join-form.spec.ts tests/cta/partner-form.spec.ts tests/cta/buy-form.spec.ts tests/cta/lead-api.e2e.spec.ts tests/cta/cta-hub.spec.ts tests/a11y/form-validation.e2e.spec.ts --project=chromium`
- `node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `node_modules/.bin/next build`
- Client bundle scans confirmed ATS server env names are absent from `.next/static` and Join form strings are absent from `page`/`layout` chunks.

## §1 — Description (BCP-14 normative)

1. **MUST** ship `JoinForm.tsx` as a lazy chunk (FR-CTA-001 factory pattern). 4 fields, single step:

   | Field | Type | Validation | Source |
   |---|---|---|---|
   | Full name | text | required, 2-80 chars | user input |
   | Email | email | required, RFC 5321 valid | user input |
   | Role of interest | select | required, ATS-driven | live from ATS |
   | GitHub / portfolio URL | url | optional, valid URL | user input |
   | Cover note | textarea | optional, ≤ 2000 chars | user input |

2. **MUST** populate the "Role of interest" dropdown dynamically from the ATS API (Workable, Greenhouse, or Lever). Implementation:
   - Server route `/api/jobs-count/route.ts` proxies ATS API (keeps API key server-side).
   - Returns `{ count: N, roles: [{ id, title, location }] }`.
   - Form fetches on mount; populates dropdown.
   - Falls back to manual options if ATS unreachable.

3. **MUST** display "We're hiring N" badge in the page footer (FR-SCENE-018 footer hosts it). `N` is the count from ATS. Updates on page load (no realtime polling).

4. **MUST** support these dynamic badge states:
   - `count > 0` → "We're hiring 3 — see open roles" with link to `/work?role=open`
   - `count === 0` → "We're not hiring right now — leave us your details" with link to passive-talent form
   - ATS API failure → fallback: "We're growing — get in touch" (no count shown)

5. **MUST** POST to `/api/lead/route.ts` with `track: 'join'` + the 5 collected fields.

6. **MUST** show same status states as FR-CTA-003 (loading / success / error_retry / error_rate / error_validation).

7. **MUST** integrate with FR-CTA-007 Lumi reactions: on form mount → `mouth_smile`, on submit success → `wave_goodbye`.

8. **MUST** ship axe-clean per FR-OPS-012.

9. **MUST** cache the ATS API response server-side for 5 minutes (avoid hammering ATS rate limits on page load spike).

10. **MUST** include attribution event: `trackEvent('join_form_open', { source: 'cta_hub' | 'footer_badge' })`.

11. **MUST** include privacy notice: "We'll store your application for 12 months per our [privacy policy]. You can request deletion anytime."

12. **MUST NOT** require a resume upload. Single-page bio + portfolio link is sufficient at this stage.

13. **MUST** redirect the ATS forwarding logic via FR-CTA-006 — server pipes the application to the ATS's "candidate ingest" endpoint (Workable: POST /candidates; Greenhouse: POST /v1/applications).

14. **MUST** be tested on mobile (375px) — form stacks vertically.

15. **SHOULD** offer "Apply with LinkedIn" prefill if user clicks a special button (slice 3 enhancement; out of P4 scope).

## §2 — Why this design

**Why ATS-driven roles dropdown?** Manually maintaining a list of open roles in 2 places (ATS + CTA form) drifts within a week. Single source of truth = ATS. Form always shows what's actually open.

**Why "We're hiring N" badge?** Trust signal. "We're hiring" without N is generic; "We're hiring 3" is concrete. Concrete signals momentum. Sighted users see at-a-glance company is alive + growing.

**Why fallback states for badge?** Edge cases:
- 0 roles open — common between hiring cycles. Showing "We're hiring 0" is bad UX. Manual fallback ("We're growing") preserves intent.
- ATS API down — bad to show nothing or "Error". Soft fallback is the right behavior.

**Why no resume upload?** Resume parsing is unreliable; LinkedIn is the de facto standard. Asking for GitHub + portfolio + cover note captures everything we need to decide on a first call.

**Why 12-month retention notice?** GDPR / CCPA compliance — users need to know how long data is kept and how to request deletion. 12 months matches typical ATS retention.

**Why server-side ATS proxy?** ATS API keys are sensitive. Proxying through Next.js API route keeps keys in env vars, allows caching, enables logging/observability.

**Why 5-min cache?** ATS doesn't change rapidly (1-2 roles/week). 5 min cache reduces ATS API hits by ~99% while keeping data fresh enough for users.

**Why single-step (not multi-step like Partner form)?** Join applications are shorter than partner conversations. Multi-step would feel padded. Single step + concise validation is the right UX.

**Why no LinkedIn prefill in slice 1?** OAuth integration adds 2 days work; not blocking; can layer in later.

## §3 — Public surface

```ts
// apps/web/components/cta/forms/schemas/join-schema.ts
import { z } from "zod";

export const joinSchema = z.object({
  full_name:    z.string().min(2).max(80),
  email:        z.string().email(),
  role_id:      z.string().min(1),  // ATS role ID
  portfolio_url:z.string().url().optional().or(z.literal("")),
  cover_note:   z.string().max(2000).optional(),
  attribution_source: z.string().max(120).optional(),
});

export type JoinFormData = z.infer<typeof joinSchema>;
```

```ts
// apps/web/app/api/jobs-count/route.ts
import { NextResponse } from "next/server";

const ATS_PROVIDER = process.env.ATS_PROVIDER ?? "workable";  // 'workable' | 'greenhouse' | 'lever'
const ATS_BASE_URL = process.env.ATS_BASE_URL!;
const ATS_API_KEY  = process.env.ATS_API_KEY!;

// In-memory cache; 5-min TTL
let cache: { data: any; expiresAt: number } | null = null;

export async function GET() {
  if (cache && Date.now() < cache.expiresAt) {
    return NextResponse.json(cache.data);
  }

  try {
    const url = ATS_PROVIDER === "workable"
      ? `${ATS_BASE_URL}/spi/v3/jobs?state=published`
      : ATS_PROVIDER === "greenhouse"
        ? `${ATS_BASE_URL}/v1/boards/cyberskill/jobs`
        : `${ATS_BASE_URL}/v0/postings/cyberskill?mode=json`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${ATS_API_KEY}` },
      signal: AbortSignal.timeout(5000),  // 5s ATS timeout
    });

    if (!res.ok) throw new Error(`ATS ${res.status}`);
    const raw = await res.json();
    const data = normalizeAts(raw, ATS_PROVIDER);

    cache = { data, expiresAt: Date.now() + 5 * 60 * 1000 };
    return NextResponse.json(data);
  } catch (err) {
    console.error("[jobs-count] ATS fetch failed", err);
    return NextResponse.json({ count: null, roles: [], error: "ATS unavailable" }, { status: 200 });
  }
}

function normalizeAts(raw: any, provider: string) {
  if (provider === "workable") {
    return {
      count: raw.jobs.length,
      roles: raw.jobs.map((j: any) => ({ id: j.shortcode, title: j.title, location: j.location.location_str })),
    };
  }
  // ... similar for greenhouse, lever
  return { count: 0, roles: [] };
}
```

```tsx
// apps/web/components/footer/HiringBadge.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function HiringBadge() {
  const [data, setData] = useState<{ count: number | null; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/jobs-count")
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ count: null, error: "fetch failed" }));
  }, []);

  if (!data) return null;
  if (data.count === null) {
    return <Link href="/work" className="hiring-badge fallback">We're growing — get in touch →</Link>;
  }
  if (data.count === 0) {
    return <Link href="/work?passive=1" className="hiring-badge zero">We're not hiring right now — leave us your details →</Link>;
  }
  return (
    <Link href="/work?role=open" className="hiring-badge active">
      We're hiring {data.count} — see open roles →
    </Link>
  );
}
```

```tsx
// apps/web/components/cta/forms/JoinForm.tsx
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLumiStore } from "@/lib/stores/lumi-store";
import { trackEvent } from "@/lib/analytics";
import { joinSchema, type JoinFormData } from "./schemas/join-schema";

export function JoinForm({ onClose, defaultRoleId }: { onClose: () => void; defaultRoleId?: string }) {
  const [roles, setRoles] = useState<{ id: string; title: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const setLumiAnim = useLumiStore(s => s.setCurrentAnim);

  const methods = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: { role_id: defaultRoleId ?? "" },
  });

  useEffect(() => {
    setLumiAnim("mouth_smile");
    fetch("/api/jobs-count").then(r => r.json()).then(d => setRoles(d.roles ?? []));
    trackEvent("join_form_open", { source: defaultRoleId ? "footer_badge" : "cta_hub" });
    return () => setLumiAnim("idle");
  }, [defaultRoleId, setLumiAnim]);

  async function handleSubmit(data: JoinFormData) {
    setStatus("submitting");
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, track: "join" }),
    });
    if (res.ok) {
      setStatus("success");
      setLumiAnim("wave_goodbye");
      trackEvent("join_form_success");
    } else {
      setStatus("error");
    }
  }

  // ... render form fields + roles dropdown + privacy notice ...
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | JoinForm.tsx is lazy chunk | Bundle analyzer |
| 2 | 4 fields rendered | Render test |
| 3 | Role dropdown sourced from /api/jobs-count | Mock fetch; assert options |
| 4 | Footer "We're hiring N" updates on load | Visual / DOM assertion |
| 5 | Zero-state badge variant ("not hiring right now") | Mock ATS count=0 |
| 6 | Error-state badge variant ("we're growing") | Mock ATS 500 |
| 7 | POSTs to /api/lead with track:'join' | Mock fetch |
| 8 | 5-min server cache on /api/jobs-count | Second call within 5min returns cached data; > 5min refetches |
| 9 | Lumi anim mouth_smile on mount, wave on success | Mock lumi store |
| 10 | axe-clean | AxeBuilder |
| 11 | Privacy notice present | Visual check |
| 12 | Mobile responsive (375px) | Visual regression |
| 13 | Analytics events fire | Mock trackEvent |
| 14 | Vitest unit tests pass | `pnpm vitest run apps/web/components/cta/forms/__tests__/JoinForm.unit.test.tsx` |
| 15 | API key not in client bundle | grep client bundle for ATS_API_KEY |

## §5 — Verification

```tsx
// apps/web/components/cta/forms/__tests__/JoinForm.unit.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JoinForm } from "../JoinForm";

describe("JoinForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 3, roles: [{ id: "eng", title: "Senior Engineer" }] }),
    });
  });

  it("loads roles from /api/jobs-count on mount", async () => {
    render(<JoinForm onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/Senior Engineer/i)).toBeTruthy();
    });
  });

  it("POSTs to /api/lead on submit with track:'join'", async () => {
    render(<JoinForm onClose={() => {}} />);
    // ... fill fields ...
    fireEvent.click(screen.getByText(/Submit/i));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/lead",
        expect.objectContaining({ body: expect.stringContaining('"track":"join"') }),
      );
    });
  });

  it("respects defaultRoleId from footer badge", async () => {
    render(<JoinForm onClose={() => {}} defaultRoleId="eng" />);
    await waitFor(() => {
      const select = screen.getByLabelText(/Role of interest/i) as HTMLSelectElement;
      expect(select.value).toBe("eng");
    });
  });

  it("fires analytics on open", () => {
    const trackMock = vi.fn();
    vi.doMock("@/lib/analytics", () => ({ trackEvent: trackMock }));
    render(<JoinForm onClose={() => {}} />);
    expect(trackMock).toHaveBeenCalledWith("join_form_open", expect.any(Object));
  });
});

describe("HiringBadge", () => {
  it("renders 'We're hiring 3' when count > 0", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 3, roles: [] }) });
    render(<HiringBadge />);
    await waitFor(() => expect(screen.getByText(/hiring 3/i)).toBeTruthy());
  });

  it("renders 'not hiring' fallback at count 0", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 0, roles: [] }) });
    render(<HiringBadge />);
    await waitFor(() => expect(screen.getByText(/not hiring right now/i)).toBeTruthy());
  });

  it("renders 'we're growing' fallback on ATS error", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: null, error: "x" }) });
    render(<HiringBadge />);
    await waitFor(() => expect(screen.getByText(/growing/i)).toBeTruthy());
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-001 (CTA hub factory), FR-CTA-005 (validation pattern), FR-CTA-006 (server forwarding), FR-CTA-007 (Lumi reactions), FR-SCENE-018 (footer hosts badge).

**Operational:** Workable / Greenhouse / Lever API key in env, Next.js API route, react-hook-form, zod.

**Downstream:** FR-CTA-006 expects `track: 'join'` payload routing.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| ATS API down | AC#6 | Fallback badge "we're growing"; manual roles fallback in form |
| ATS rate-limit | 429 | 5-min cache + exponential backoff if still failing |
| API key leaked in client bundle | grep | Server-only env var; never `NEXT_PUBLIC_` prefix |
| Stale role shown (closed but still in cache) | 5min cache | Acceptable lag; cache TTL appropriate |
| Submit fails silently | Status state stuck | Always update status in catch |
| Mobile: role dropdown not searchable | UX | Use HTML <datalist> or react-select |
| Privacy notice not localized | Vietnamese visitor | next-intl translation |
| Resume upload requested by user | Out of scope; explain | Provide email path "Send your CV to careers@" |
| GitHub URL validation too strict (rejects valid Bitbucket) | Validation false-positive | Use generic URL validator, not GitHub-specific |
| Footer badge flickers on every page load (cached fetch reuses) | Visual | useSWR or persist in localStorage 5min |
| Analytics event named wrong | Inspection | Centralize event names in `lib/analytics/events.ts` |
| Lumi anim doesn't restore | Visual | useEffect cleanup |
| Cover note > 2000 chars | Validation | zod schema; show count |
| Wide-character bypass of length validation | Server-side double-check | FR-CTA-006 re-validates |
| Concurrent submissions | Race | Disable button during in-flight |

## §8 — Deliverable preview

User flow (Join from footer badge):
1. User scrolls to footer. Sees "We're hiring 3 — see open roles →".
2. Clicks. Form opens, Role dropdown pre-selected if badge linked to specific role.
3. User fills: Alex Tran, alex@gmail.com, GitHub: github.com/alextran, Cover: "I built a Three.js studio in Saigon..."
4. Clicks Submit. Loading ~ 1s. Success card: "Thanks! Our team will be in touch within a week."
5. Lumi waves goodbye.

User flow (zero hiring state):
1. User scrolls to footer. Sees "We're not hiring right now — leave us your details →".
2. Clicks. Form mounts in passive-talent mode (no role dropdown; just bio + portfolio + cover).
3. Same flow; HubSpot logs as passive talent.

Founder sees:
- HubSpot deal-stage `join-passive` or `join-active` per branch.
- ATS receives candidate ingest via webhook (FR-CTA-006).
- Email alert.

## §9 — Notes

**On ATS provider choice:** Initially target Workable (simpler API). Greenhouse / Lever support added on demand. ATS_PROVIDER env var switches.

**On Vietnamese language toggling:** Vietnamese candidate visitor sees Vietnamese form labels per FR-CMS-vi. Role titles from ATS remain English (industry-standard).

**On data retention compliance:** 12-month retention is industry norm for unsolicited applications. GDPR Art. 17 right to erasure honored via email request.

**On future enhancements:**
- LinkedIn OAuth prefill (slice 3).
- Resume upload with parsing (slice 3, once retention + privacy story tightened).
- Asynchronous video intro upload (slice 4 candidate).

**On Vietnamese talent pool:** Most Vietnamese applicants will use Vietnamese GitHub bio; ensure form supports UTF-8 across all fields.

**On footer badge visibility:** Badge is part of footer (FR-SCENE-018); visible on every page including /work, /accessibility, /lite. Cross-page consistency = momentum signal.

*End of FR-CTA-004.*
