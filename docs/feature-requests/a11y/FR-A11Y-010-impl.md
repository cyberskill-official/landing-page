---
id: FR-A11Y-010
title: "Form autofill + Redundant-Entry compliance — autocomplete attrs + cross-form data carry"
module: A11Y
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-005, FR-A11Y-001]
depends_on: [FR-CTA-005]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/cta/forms/ + apps/web/lib/forms/
new_files:
  - apps/web/lib/forms/use-form-prefill.ts
  - apps/web/lib/forms/__tests__/use-form-prefill.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §7.5 — "WCAG 3.3.7 Redundant Entry compliance"
  - WCAG 2.2 SC 3.3.7 Redundant Entry (A) + SC 1.3.5 Identify Input Purpose
  - WHATWG autocomplete spec

effort_hours: 2
risk_if_skipped: "WCAG 3.3.7 violation. Users with cognitive disabilities, motor disabilities, or simply impatient users abandon when asked to retype email/name across 3 CTA flows. Form completion rate drops ~25%."
---

## §1 — Description (BCP-14 normative)

1. **MUST** every form field has the appropriate `autocomplete` attribute per WHATWG spec:
   - Name field → `autocomplete="name"`
   - Email → `autocomplete="email"`
   - Organization → `autocomplete="organization"`
   - Country → `autocomplete="country"` or `country-name`
   - Phone (if present) → `autocomplete="tel"`
2. **MUST** never require user to re-enter the same data twice across the CTA flows.
3. **MUST** populate Partner / Join form from prior Buy form session if same user (within 24h, via localStorage or sessionStorage).
4. **MUST** ship `useFormPrefill(formType)` hook that:
   - Checks sessionStorage / localStorage for previously-entered data.
   - Returns prefill object for `react-hook-form` `defaultValues`.
   - Persists current submission for future prefill.
5. **MUST** include user-facing prefill consent UX — banner: "We saved your details from your last visit. [Use them] [Clear]" on form open if prefill data exists.
6. **MUST** support clear-data flow — user can wipe all stored form data via accessibility/privacy page.
7. **MUST** be axe-clean per WCAG 1.3.5 + 3.3.7.
8. **MUST** respect FR-CTA-005 form validation — prefilled data still validates.

## §2 — Why this design

**Why autocomplete attrs?** Browser's password manager + autofill uses these. Without them, users manually type even though browser knows their email. WCAG 1.3.5 codifies this.

**Why cross-form prefill?** Same user fills Buy form, then changes mind and opens Partner form. Should they retype email + name? No. Prefill from session.

**Why 24h expiry?** Privacy + freshness. After 24h, user may have moved offices / forgotten details. Re-confirm.

**Why consent banner?** Privacy. Some users don't want prefill (privacy-conscious; shared device). Explicit choice respects.

**Why clear-data path?** GDPR Art. 17 right to erasure analog. Even though we don't transmit prefill data, user controls local storage.

## §3 — Public surface

```ts
// apps/web/lib/forms/use-form-prefill.ts
import { useEffect, useState } from "react";

const STORAGE_KEY = "cyberskill_form_prefill";
const TTL_MS = 24 * 60 * 60 * 1000;  // 24h

interface PrefillData {
  contact_email?: string;
  contact_name?: string;
  organization?: string;
  country?: string;
  expires_at: number;
}

export function useFormPrefill() {
  const [prefill, setPrefill] = useState<Partial<PrefillData> | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: PrefillData = JSON.parse(raw);
      if (data.expires_at < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setPrefill(data);
      setShowBanner(true);
    } catch {}
  }, []);

  function saveOnSubmit(data: Partial<PrefillData>) {
    const merged = { ...prefill, ...data, expires_at: Date.now() + TTL_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function clearPrefill() {
    localStorage.removeItem(STORAGE_KEY);
    setPrefill(null);
    setShowBanner(false);
  }

  return { prefill, saveOnSubmit, clearPrefill, showBanner };
}
```

```tsx
// In any CTA form
const { prefill, saveOnSubmit, clearPrefill, showBanner } = useFormPrefill();
const methods = useForm({ defaultValues: prefill ?? {} });

async function onSubmit(data) {
  // ... server submit ...
  saveOnSubmit({ contact_email: data.email, contact_name: data.name, ... });
}

return (
  <FormProvider {...methods}>
    {showBanner && (
      <div role="region" aria-label="Prefill notice">
        <p>We saved your details from your last visit.</p>
        <button onClick={() => setShowBanner(false)}>Use them</button>
        <button onClick={clearPrefill}>Clear</button>
      </div>
    )}
    <form>
      <input {...methods.register("name")} autoComplete="name" />
      <input {...methods.register("email")} autoComplete="email" />
      <input {...methods.register("organization")} autoComplete="organization" />
      <input {...methods.register("country")} autoComplete="country" />
    </form>
  </FormProvider>
);
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | autocomplete attrs present on all form fields | grep + manual |
| 2 | No re-entry required across multi-step forms | Manual test: Buy → Partner; data carried |
| 3 | Prefill banner shown on second form | DOM after first submit + open second form |
| 4 | Clear button removes localStorage | Vitest |
| 5 | 24h TTL respected | Mock Date; assert expiry |
| 6 | axe-clean WCAG 3.3.7 + 1.3.5 | AxeBuilder |
| 7 | Vitest unit tests pass | pnpm vitest |
| 8 | Prefilled data still validates | Submit prefilled form; assert validation runs |

## §5 — Verification

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormPrefill } from "../use-form-prefill";

describe("useFormPrefill", () => {
  beforeEach(() => localStorage.clear());

  it("returns null prefill when no storage", () => {
    const { result } = renderHook(() => useFormPrefill());
    expect(result.current.prefill).toBeNull();
  });

  it("returns stored data when fresh", () => {
    localStorage.setItem("cyberskill_form_prefill", JSON.stringify({
      contact_email: "a@b.com",
      expires_at: Date.now() + 60_000,
    }));
    const { result } = renderHook(() => useFormPrefill());
    expect(result.current.prefill?.contact_email).toBe("a@b.com");
  });

  it("expires after 24h", () => {
    localStorage.setItem("cyberskill_form_prefill", JSON.stringify({
      contact_email: "a@b.com",
      expires_at: Date.now() - 1000,  // expired
    }));
    const { result } = renderHook(() => useFormPrefill());
    expect(result.current.prefill).toBeNull();
  });

  it("clearPrefill removes localStorage", () => {
    localStorage.setItem("cyberskill_form_prefill", JSON.stringify({ contact_email: "a@b.com", expires_at: Date.now() + 60000 }));
    const { result } = renderHook(() => useFormPrefill());
    act(() => result.current.clearPrefill());
    expect(localStorage.getItem("cyberskill_form_prefill")).toBeNull();
  });

  it("saveOnSubmit persists data with 24h expiry", () => {
    const { result } = renderHook(() => useFormPrefill());
    act(() => result.current.saveOnSubmit({ contact_email: "x@y.com" }));
    const stored = JSON.parse(localStorage.getItem("cyberskill_form_prefill")!);
    expect(stored.contact_email).toBe("x@y.com");
    expect(stored.expires_at).toBeGreaterThan(Date.now());
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-002 / 003 / 004 (forms that integrate prefill), FR-CTA-005 (validation pattern compatible).

**Operational:** localStorage, react-hook-form defaultValues.

**Downstream:** FR-CTA-006 server validation (verify prefilled data passes schema).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| autocomplete mismatch with backend field names | Manual | HubSpot field names align with autocomplete tokens |
| Prefill data invalid (different field shape) | Form errors | Schema validates; clears bad prefill |
| Stored data > 24h shows | AC#5 | TTL check |
| User shared device privacy concern | UX | Clear button visible; banner mentions privacy |
| GDPR concern (storing personal data) | Privacy | localStorage scoped per-origin; no transmission |
| Locale change invalidates prefill (e.g., country EN → VN) | UX | Country dropdown options consistent across locales |
| Cross-domain leak | localStorage origin scope | Per-origin only; impossible across domains |
| Quota exceeded | Try/catch | Graceful fallback to no-prefill |
| Prefill banner blocks form on small screen | Layout | Dismiss + form continues |
| User rejects prefill but data still in localStorage | UX | Clear button explicitly removes |
| autoComplete React vs HTML naming | Convention | React uses camelCase autoComplete |
| Vietnamese country dropdown different label | Locale | Country code stored is same; label per locale |

## §8 — Deliverable preview

First-time visitor:
1. Opens Buy form. Empty fields.
2. Fills: name="Alex Tran", email="alex@gmail.com", org="ACME", country="VN".
3. Submits. localStorage saves.

Returns next day:
1. Opens Partner form. Banner: "We saved your details from your last visit. [Use them] [Clear]".
2. Clicks Use them. Fields pre-filled.
3. Adds Partner-specific fields (capacity, brief). Submits.

Clears:
1. Banner: clicks Clear. Form empty. localStorage wiped.

## §9 — Notes

**On autocomplete spec:** WHATWG defines exact field tokens. Use them precisely (e.g., "given-name" + "family-name" if separate fields, or "name" if single).

**On Vietnamese context:** Some Vietnamese users prefer no autofill (shared family devices). Clear option matters.

**On future server-side prefill:** Could augment with email-based session lookup. Slice 3 scope.

*End of FR-A11Y-010.*
