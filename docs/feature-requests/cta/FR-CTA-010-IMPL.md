---
id: FR-CTA-010
title: "Form error states + retry logic + abandonment prevention — exponential backoff + beforeunload + sessionStorage drafts"
module: CTA
priority: SHOULD
status: shipped
shipped_at: 2026-05-18
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P6
slice: 1
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-005, FR-CTA-006, FR-A11Y-005]
depends_on: [FR-CTA-005]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/lib/forms/
new_files:
  - apps/web/lib/forms/use-form-retry.ts
  - apps/web/lib/forms/use-beforeunload-guard.ts
  - apps/web/lib/forms/__tests__/use-form-retry.unit.test.ts
modified_files:
  - apps/web/components/cta/forms/BuyForm.tsx
  - apps/web/components/cta/forms/PartnerForm.tsx
  - apps/web/components/cta/forms/JoinForm.tsx
  - apps/web/components/cta/forms/__tests__/PartnerForm.unit.test.tsx
  - apps/web/tests/cta/partner-form.spec.ts

source_pages:
  - docs/01-master-plan-v2.md §9 — funnel design + abandonment prevention
  - FR-CTA-005 form validation pattern
  - FR-A11Y-005 aria-live announcements

effort_hours: 4
risk_if_skipped: "Form abandonment rate is the #1 conversion killer. Without retry on network errors: every blip = lost lead. Without beforeunload warning: user accidentally closes tab → loses all entered data. Without session persistence: refresh kills form mid-fill. Each mitigation captures ~3-5% additional leads."
---

## §1 — Description (BCP-14 normative)

1. **MUST** every form has retry-on-network-error with exponential backoff:
   - 3 attempts total.
   - Delay: 1s, 2s, 4s between attempts.
   - Only retry on 5xx / network errors, NOT on 4xx (validation).
2. **MUST** show retry state UI:
   - "Network error. Retrying in N seconds..."
   - Manual "Retry now" button after all auto-attempts.
3. **MUST** beforeunload warning when form has unsaved data:
   - "Your form has unsaved changes. Leave anyway?"
   - Trigger only when `formState.isDirty === true`.
   - Clear on successful submit OR explicit user dismiss.
4. **MUST** persist partially-filled forms in sessionStorage for 30 minutes:
   - Auto-save on every blur.
   - Key: `cyberskill_form_draft_<track>`.
   - Restore on mount.
   - Clear on successful submit.
5. **MUST** announce errors via aria-live (FR-CTA-005 integration).
6. **MUST** invalidate stored drafts on app version mismatch (clear sessionStorage if `app_version` cookie differs from current build).
7. **MUST** be tested via Vitest unit tests + Playwright integration.
8. **MUST NOT** retry on user-cancel (AbortController triggers).

## §2 — Why this design

**Why exponential backoff?** Server hiccup (~1-2s) recovers naturally. Linear backoff thunders server. 1-2-4s is industry-standard.

**Why only 3 attempts?** After 3, server-side likely persistent issue. Manual button gives user agency.

**Why beforeunload?** Major form abandonment cause is "I accidentally closed the tab." Warning prompts user; gives chance to save.

**Why 30 min session draft?** Calibrated to typical form fill time (5-10 min). 30 min covers reasonable interruption.

**Why version invalidation?** Schema changes between deploys = stale drafts cause server validation errors. Better to start fresh.

**Why announce via aria-live?** Network errors are invisible to AT without it. WCAG 4.1.3.

## §3 — Public surface

```ts
// apps/web/lib/forms/use-form-retry.ts
import { useState } from "react";

const DELAYS = [1000, 2000, 4000];

export function useFormRetry<T>(submitFn: (data: T) => Promise<Response>) {
  const [attempt, setAttempt] = useState(0);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(data: T): Promise<Response | null> {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await submitFn(data);
        if (res.ok) {
          setAttempt(0);
          return res;
        }
        if (res.status >= 400 && res.status < 500) {
          return res;  // validation; don't retry
        }
        // 5xx — retry
        if (i < 2) {
          setAttempt(i + 1);
          setRetryAt(Date.now() + DELAYS[i]);
          await new Promise(r => setTimeout(r, DELAYS[i]));
        }
      } catch (err: any) {
        if (err.name === "AbortError") return null;  // user cancelled
        if (i < 2) {
          setError(`Network error. Retry ${i + 2} of 3...`);
          await new Promise(r => setTimeout(r, DELAYS[i]));
        }
      }
    }
    setError("Submission failed after 3 attempts. Click Retry now.");
    return null;
  }

  return { submit, attempt, error, retryAt };
}
```

```ts
// apps/web/lib/forms/use-beforeunload-guard.ts
import { useEffect } from "react";

export function useBeforeunloadGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";  // legacy browsers
      return "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
```

```ts
// apps/web/lib/forms/use-session-draft.ts
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const APP_VERSION_KEY = "cyberskill_app_version";

export function useSessionDraft(formKey: string, currentVersion: string) {
  const { watch, reset } = useFormContext();

  // Restore on mount
  useEffect(() => {
    try {
      const storedVer = sessionStorage.getItem(APP_VERSION_KEY);
      if (storedVer !== currentVersion) {
        sessionStorage.removeItem(`cyberskill_form_draft_${formKey}`);
        sessionStorage.setItem(APP_VERSION_KEY, currentVersion);
        return;
      }
      const draft = sessionStorage.getItem(`cyberskill_form_draft_${formKey}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.expires_at > Date.now()) {
          reset(parsed.data);
        }
      }
    } catch {}
  }, [formKey, currentVersion, reset]);

  // Auto-save on every change
  useEffect(() => {
    const sub = watch(values => {
      try {
        sessionStorage.setItem(`cyberskill_form_draft_${formKey}`, JSON.stringify({
          data: values,
          expires_at: Date.now() + 30 * 60 * 1000,  // 30 min
        }));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch, formKey]);

  function clearDraft() {
    sessionStorage.removeItem(`cyberskill_form_draft_${formKey}`);
  }

  return { clearDraft };
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Retry triggers on 5xx with exponential backoff | Mock fetch; assert timing |
| 2 | Validation errors (4xx) skip retry | Mock 400; assert no retry |
| 3 | Beforeunload warning on dirty form | Mock dirty state; trigger event |
| 4 | Session draft persists across reload | Mock sessionStorage |
| 5 | Draft expires after 30 min | Mock Date |
| 6 | App version mismatch clears draft | Mock version mismatch |
| 7 | aria-live announces retry state | FR-CTA-005 integration |
| 8 | Manual Retry button after 3 auto-attempts | Visual + click test |
| 9 | Vitest unit tests pass | pnpm vitest |
| 10 | AbortController cancels retry loop | Test mock |

## §5 — Verification

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormRetry } from "../use-form-retry";

describe("useFormRetry", () => {
  it("returns success on first attempt", async () => {
    const submitFn = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const { result } = renderHook(() => useFormRetry(submitFn));
    const res = await result.current.submit({} as any);
    expect(res?.ok).toBe(true);
    expect(submitFn).toHaveBeenCalledTimes(1);
  });

  it("retries on 5xx with exponential backoff", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const submitFn = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls < 3) return { ok: false, status: 503 };
      return { ok: true, status: 200 };
    });
    const { result } = renderHook(() => useFormRetry(submitFn));
    const promise = result.current.submit({} as any);
    await vi.advanceTimersByTimeAsync(8000);
    const res = await promise;
    expect(res?.ok).toBe(true);
    expect(calls).toBe(3);
  });

  it("does NOT retry on 4xx (validation)", async () => {
    const submitFn = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    const { result } = renderHook(() => useFormRetry(submitFn));
    const res = await result.current.submit({} as any);
    expect(res?.status).toBe(400);
    expect(submitFn).toHaveBeenCalledTimes(1);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-005 (form validation pattern), FR-A11Y-005 (aria-live), FR-CTA-006 (server endpoint that may 5xx).

**Operational:** Fetch API, react-hook-form, sessionStorage.

**Downstream:** All CTA forms benefit; conversion rate metric (FR-SEO-008).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Stale draft after deploy | AC#6 | Version mismatch clears |
| Beforeunload spam (every keystroke triggers warning) | AC#3 | Only when isDirty |
| Retry loop hangs UI | AbortController | Allow cancel |
| sessionStorage quota | catch | In-memory fallback |
| Draft contains stale field schema | AC#6 | Version invalidation |
| beforeunload doesn't fire (browser policy) | Test | Most browsers honor; acceptable degradation |
| Retry counter visible during AT announcement | Vocal | aria-live polite + concise |
| Manual retry button confused with submit | UX | Different visual style |
| Multiple forms share draft (collision) | formKey unique | Per-track key |
| 30-min expiry too tight | UX | Adjust if data shows |
| User clicks Retry while auto-retry in flight | Race | Disable button during retry |
| Network restored during backoff | OK | Auto-resumes |

## §8 — Deliverable preview

User fills Partner form. Mid-submit, server hiccups (503):
1. Form shows "Network error. Retrying in 2 seconds..."
2. aria-live announces.
3. Auto-retry after 2s.
4. Succeeds on 2nd attempt.
5. Success card.

User fills 80% then closes tab:
1. beforeunload warning: "Your form has unsaved changes. Leave?"
2. User clicks Cancel.
3. Continues editing.

User accidentally refreshes:
1. Form re-mounts.
2. Session draft restored.
3. User picks up where left off.

App version mismatch:
1. Session draft from yesterday's deploy.
2. Today's build invalidates draft.
3. Form starts fresh (avoids schema mismatch).

## §9 — Notes

**On beforeunload UX:** Browsers limit to generic message; can't customize. Accept the standard browser warning UX.

**On Vietnamese:** Localized announcement strings via FR-CMS-007.

**On future enhancements:** Visual progress indicator during retry. Slice 2.

*End of FR-CTA-010.*

## §10 — Implementation status

Status: **shipped 2026-05-18**.

Delivered:

- Shared `use-form-retry.ts` implements 3 total attempts, 1s/2s exponential retry delays, 5xx/network-only retry behavior, AbortError cancellation, retry state messages, and manual `retryNow`.
- Shared `use-beforeunload-guard.ts` implements dirty-form beforeunload protection plus 30-minute session draft helpers under `cyberskill_form_draft_<track>` with app-version invalidation.
- Buy, Partner, and Join forms now use shared retry state and beforeunload guards.
- Buy, Partner, and Join forms clear drafts on successful submit.
- Join now has session draft restore/save parity with Buy and Partner.
- Partner E2E covers 5xx auto-retry exhaustion plus the manual `Retry now` recovery path.

Verified:

- `node_modules/.bin/vitest run lib/forms/__tests__/use-form-retry.unit.test.ts components/cta/forms/__tests__/PartnerForm.unit.test.tsx components/cta/forms/__tests__/JoinForm.unit.test.tsx components/cta/forms/__tests__/buy-form.spec.ts --config vitest.config.ts`
- `node_modules/.bin/tsc -p tsconfig.json --noEmit`
- `node_modules/.bin/playwright test tests/cta/partner-form.spec.ts tests/cta/buy-form.spec.ts tests/cta/join-form.spec.ts --project=chromium`
- `node_modules/.bin/next build`
- Post-restart live retry smoke: `node_modules/.bin/playwright test tests/cta/partner-form.spec.ts -g "auto-retries" --project=chromium`
