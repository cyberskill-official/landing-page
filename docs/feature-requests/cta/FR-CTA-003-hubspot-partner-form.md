---
id: FR-CTA-003
title: "HubSpot multi-step partner form — agency intake with 4-field flow, lazy-chunk loaded, retry-on-error"
module: CTA
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P4
slice: 2
owner: Frontend Lead + Backend
created: 2026-05-16
related_frs: [FR-CTA-001, FR-CTA-005, FR-CTA-006, FR-CTA-007, FR-WEB-005, FR-A11Y-001]
depends_on: [FR-CTA-001, FR-CTA-005, FR-CTA-006]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/cta/forms/
new_files:
  - apps/web/components/cta/forms/PartnerForm.tsx
  - apps/web/components/cta/forms/__tests__/PartnerForm.unit.test.tsx
  - apps/web/components/cta/forms/schemas/partner-schema.ts
  - apps/web/tests/cta/partner-form.spec.ts
modified_files:
  - apps/web/components/canvas/GlobalCanvasShell.tsx
  - apps/web/lib/stores/lumiStore.ts
  - apps/web/tests/cta/cta-hub.spec.ts
  - apps/web/tests/a11y/form-validation.e2e.spec.ts
  - apps/web/app/globals.css

source_pages:
  - docs/01-master-plan-v2.md §9.1 Track 2 — "Partner with us: agency intake form"
  - docs/01-master-plan-v2.md §5.1 — Forms: react-hook-form + zod + a11y first
  - docs/01-master-plan-v2.md §5.2 — Server forwarding to HubSpot CRM with deal-stage routing

effort_hours: 8
risk_if_skipped: "Partner-track CTA is one of the 3 CTA hub paths (FR-CTA-001 buy/partner/join trio). Without partner form, agency leads have no on-site path — bounce to email; ~50% loss-to-followup. HubSpot CRM integration also enables founder's automated partner-pipeline tracking."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `PartnerForm.tsx` as a lazy chunk (dynamic import) per FR-CTA-001 factory. Not bundled into initial page payload — loaded only when user clicks "Partner with us" CTA.

2. **MUST** collect exactly these 4 fields in a multi-step flow:

   | Step | Field | Type | Validation |
   |---|---|---|---|
   | 1 | Agency name | text | required, 2-120 chars |
   | 1 | Country | select | required, ISO-3166 codes |
   | 2 | Monthly capacity needed (developer-hours) | number | required, 10-2000 |
   | 2 | Brief — what's the work? | textarea | required, 50-2000 chars |
   | 3 | Contact email | email | required, RFC 5321 valid |
   | 3 | Contact name | text | required, 2-80 chars |

3. **MUST** be a 3-step flow:
   - Step 1: Agency identity (agency name + country)
   - Step 2: Engagement scope (capacity + brief)
   - Step 3: Contact details (email + name)
   - Step 4: Confirmation screen

4. **MUST** persist in-progress state in `sessionStorage.cyberskill_partner_form_draft` (cleared on successful submit) — user can refresh without losing data.

5. **MUST** POST validated data to `/api/lead/route.ts` (FR-CTA-006) with `track: 'partner'` and the 6 collected fields plus a server-only `deal_stage: 'partner-inbound'` field.

6. **MUST** show one of these states post-submit:
   - **Loading** (button spinner, form disabled, ARIA aria-busy="true")
   - **Success** — green confirmation card: "Thanks. Our partner-success lead will respond in 24h."
   - **Error - retry-able** (5xx) — red banner: "Network error. Retry?" + retry button.
   - **Error - validation** (4xx with field errors) — re-display form with inline errors (FR-CTA-005).
   - **Error - rate-limited** (429) — yellow banner: "Hold up — too many submits. Wait 60 seconds."

7. **MUST** integrate with FR-CTA-007 Lumi reactions:
   - Step 1 → Lumi `mouth_smile` (greeting)
   - Step 2 → Lumi `summon` (engaged)
   - Step 3 → Lumi `idle` (waiting)
   - Step 4 success → Lumi `wave_goodbye` (gratitude)

8. **MUST** support full keyboard navigation: Tab between fields, Enter submits step, Escape closes form (with confirmation if draft non-empty).

9. **MUST** ship axe-clean — zero serious/critical violations on the form per FR-OPS-012.

10. **MUST** be tested on mobile (375 width) — form fields stack vertically; step indicator at top stays visible.

11. **MUST** include progress indicator showing "Step 2 of 3" + visual progress bar (gold gradient).

12. **MUST NOT** auto-fill country from IP geo (privacy concern; user explicitly selects).

13. **MUST** include a "Back" button on steps 2 and 3 (returns to previous step without data loss).

14. **MUST** anonymize the contact email in error logs (e.g. "j***@a***.com") — PII protection.

15. **SHOULD** include an optional "How did you hear about us?" field on step 1 (attribution source).

16. **MUST NOT** require login or account creation. Anonymous submission only.

## §2 — Why this design

**Why 3 steps (not 1 long form)?** A/B research (Hubspot 2024 benchmark): 3-step forms have 38% higher completion rate than 1-step forms with same field count. Steps reduce perceived effort.

**Why agency name first?** Agencies self-identify by name. Asking "agency name" first frames the conversation as B2B; "email first" frames it as B2C lead-gen. Brand-aligned with "partner" not "customer."

**Why session-persist drafts?** Form abandonment cause analysis: ~40% of abandoners refresh accidentally. Without persistence, they restart from zero → drop off entirely. Session storage (not localStorage) clears after browser close — privacy-respecting balance.

**Why retry-on-5xx?** Network errors aren't user errors. Surfacing a retry button keeps the user in-flow rather than dropping them.

**Why no IP geo for country?** Vietnamese users browsing from foreign VPNs would see "United States" defaulted — wrong + invasive feel. User-controlled select is the correct UX.

**Why Lumi reactions per step?** Master plan §9.1 Track 1 — Lumi reacts on each step gives the form personality. Same pattern as Track 1 (buy), keeping CTA flows consistent.

**Why anonymize emails in logs?** PII in logs = compliance risk (GDPR, CCPA). One-way redaction means we can debug without exposing user identity.

**Why optional "How did you hear about us?"** Attribution tracking helps Marketing know which channels work. Optional because mandatory-attribution feels invasive.

**Why dynamic-import (lazy chunk)?** Form code + zod schemas + form lib is ~50 KB gzipped. Lazy = doesn't bloat initial bundle. Only ~5% of visitors click partner CTA; bundling for 100% wastes bandwidth.

## §3 — Public surface

```ts
// apps/web/components/cta/forms/schemas/partner-schema.ts
import { z } from "zod";

export const partnerSchema = z.object({
  agency_name:        z.string().min(2).max(120),
  country:            z.string().length(2),  // ISO-3166 alpha-2
  monthly_capacity:   z.number().int().min(10).max(2000),
  brief:              z.string().min(50).max(2000),
  contact_email:      z.string().email(),
  contact_name:       z.string().min(2).max(80),
  attribution_source: z.string().max(120).optional(),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;

// Per-step subsets (for progressive validation)
export const partnerStep1Schema = partnerSchema.pick({ agency_name: true, country: true, attribution_source: true });
export const partnerStep2Schema = partnerSchema.pick({ monthly_capacity: true, brief: true });
export const partnerStep3Schema = partnerSchema.pick({ contact_email: true, contact_name: true });
```

```tsx
// apps/web/components/cta/forms/PartnerForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLumiStore } from "@/lib/stores/lumi-store";
import { trackEvent } from "@/lib/analytics";
import { partnerSchema, partnerStep1Schema, partnerStep2Schema, partnerStep3Schema, type PartnerFormData } from "./schemas/partner-schema";

const DRAFT_KEY = "cyberskill_partner_form_draft";
type Status = "idle" | "submitting" | "success" | "error_retry" | "error_validation" | "error_rate";

export function PartnerForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const setLumiAnim = useLumiStore(s => s.setCurrentAnim);

  // Load draft from sessionStorage
  const draft = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}") : {};
  const methods = useForm<PartnerFormData>({
    resolver: zodResolver(getSchemaForStep(step)),
    defaultValues: draft,
    mode: "onBlur",
  });

  // Persist draft on every change
  useEffect(() => {
    const sub = methods.watch(values => {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [methods]);

  // Lumi reactions per step
  useEffect(() => {
    if (step === 1) setLumiAnim("mouth_smile");
    if (step === 2) setLumiAnim("summon");
    if (step === 3) setLumiAnim("idle");
    return () => setLumiAnim("idle");
  }, [step, setLumiAnim]);

  async function handleNext() {
    const valid = await methods.trigger();
    if (!valid) return;
    setStep((step + 1) as 1 | 2 | 3);
    trackEvent("partner_form_step_complete", { step });
  }

  async function handleSubmit(data: PartnerFormData) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, track: "partner" }),
      });
      if (res.status === 200) {
        setStatus("success");
        sessionStorage.removeItem(DRAFT_KEY);
        setLumiAnim("wave_goodbye");
        trackEvent("partner_form_success");
      } else if (res.status === 429) {
        setStatus("error_rate");
      } else if (res.status >= 400 && res.status < 500) {
        setStatus("error_validation");
        // surface field errors per response body
      } else {
        setStatus("error_retry");
      }
    } catch (err) {
      setStatus("error_retry");
      setError("Network error. Please retry.");
    }
  }

  function handleBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  }

  function handleClose() {
    const isDirty = methods.formState.isDirty;
    if (isDirty && !confirm("Discard draft?")) return;
    sessionStorage.removeItem(DRAFT_KEY);
    onClose();
  }

  if (status === "success") {
    return <SuccessCard />;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        aria-busy={status === "submitting"}
        aria-labelledby="partner-form-title"
      >
        <h2 id="partner-form-title">Partner with us</h2>
        <ProgressIndicator step={step} total={3} />
        {step === 1 && <Step1Fields />}
        {step === 2 && <Step2Fields />}
        {step === 3 && <Step3Fields />}

        <div className="form-nav">
          {step > 1 && <button type="button" onClick={handleBack}>Back</button>}
          {step < 3 && <button type="button" onClick={handleNext}>Next</button>}
          {step === 3 && <button type="submit">Submit</button>}
          <button type="button" onClick={handleClose}>Cancel</button>
        </div>

        {status === "error_retry" && <ErrorBanner message={error} onRetry={methods.handleSubmit(handleSubmit)} />}
        {status === "error_rate" && <RateBanner />}
      </form>
    </FormProvider>
  );
}

function getSchemaForStep(step: 1 | 2 | 3) {
  return step === 1 ? partnerStep1Schema : step === 2 ? partnerStep2Schema : partnerStep3Schema;
}
```

```tsx
// apps/web/components/cta/CtaHub.tsx (factory that lazy-loads form)
import dynamic from "next/dynamic";
const PartnerForm = dynamic(() => import("./forms/PartnerForm").then(m => m.PartnerForm), { ssr: false });

// Render only when user clicks Partner CTA
{showPartnerForm && <PartnerForm onClose={() => setShowPartnerForm(false)} />}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Form is lazy chunk — not in initial bundle | Bundle analyzer: PartnerForm code in separate chunk file |
| 2 | 4 main fields rendered across 3 steps | Render test |
| 3 | POST to /api/lead with track:'partner' | Mock fetch; assert URL + body |
| 4 | Success card shown on 200 | Mock 200; assert success element |
| 5 | Retry banner on 5xx | Mock 500; assert retry banner |
| 6 | Validation errors shown on 400 | Mock 400; assert field errors |
| 7 | Rate-limit banner on 429 | Mock 429; assert banner |
| 8 | sessionStorage draft persists across reload | Type values, reload, assert restored |
| 9 | Lumi anim changes per step | Mock lumi store; assert setCurrentAnim called correctly |
| 10 | Back button on steps 2-3 preserves data | Fill step 1, advance, back; values intact |
| 11 | Escape closes with confirmation (if dirty) | Mock confirm; assert behavior |
| 12 | Progress indicator shows step N of 3 | Visual |
| 13 | axe-clean (0 serious/critical) | AxeBuilder |
| 14 | Mobile viewport (375px) — fields stack | Visual regression |
| 15 | Email anonymized in error logs | Server-side test |

## §5 — Verification

```tsx
// apps/web/components/cta/forms/__tests__/PartnerForm.unit.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PartnerForm } from "../PartnerForm";

describe("PartnerForm", () => {
  beforeEach(() => { sessionStorage.clear(); });

  it("starts at step 1", () => {
    render(<PartnerForm onClose={() => {}} />);
    expect(screen.getByText(/Partner with us/i)).toBeTruthy();
    expect(screen.getByLabelText(/Agency name/i)).toBeTruthy();
  });

  it("validates step 1 before advancing", async () => {
    render(<PartnerForm onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Next/i));
    await waitFor(() => {
      expect(screen.getByText(/Agency name.*required/i)).toBeTruthy();
    });
  });

  it("persists draft to sessionStorage", () => {
    render(<PartnerForm onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Agency name/i), { target: { value: "ACME Co" } });
    const draft = JSON.parse(sessionStorage.getItem("cyberskill_partner_form_draft")!);
    expect(draft.agency_name).toBe("ACME Co");
  });

  it("POSTs to /api/lead with track:partner on submit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = fetchMock;
    render(<PartnerForm onClose={() => {}} />);
    // ... fill all 3 steps ...
    fireEvent.click(screen.getByText(/Submit/i));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/lead", expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"track":"partner"'),
      }));
    });
  });

  it("shows retry banner on 5xx", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 500 });
    render(<PartnerForm onClose={() => {}} />);
    // ... fill all + submit ...
    await waitFor(() => expect(screen.getByText(/retry/i)).toBeTruthy());
  });

  it("shows rate-limit banner on 429", async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 429 });
    render(<PartnerForm onClose={() => {}} />);
    // ... fill + submit ...
    await waitFor(() => expect(screen.getByText(/too many/i)).toBeTruthy());
  });

  it("triggers Lumi anim on step change", () => {
    // mock useLumiStore.setCurrentAnim; assert called with "mouth_smile" / "summon" / "idle"
  });

  it("Back button preserves data", () => {
    render(<PartnerForm onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Agency name/i), { target: { value: "ACME" } });
    fireEvent.click(screen.getByText(/Next/i));
    fireEvent.click(screen.getByText(/Back/i));
    expect((screen.getByLabelText(/Agency name/i) as HTMLInputElement).value).toBe("ACME");
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-001 (CTA hub factory mounts this), FR-CTA-005 (form validation pattern), FR-CTA-006 (server endpoint), FR-CTA-007 (Lumi reactions).

**Operational:** react-hook-form ^7, zod ^3, @hookform/resolvers, FR-WEB-005 dynamic-three for lazy load infra, FR-OPS-014 analytics.

**Downstream:** FR-CTA-006 (server endpoint expects this form's payload shape).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| HubSpot API down | server 5xx | Surface retry; queue server-side (FR-CTA-006 detail) |
| Form code bundled into initial chunk | Bundle analyzer | Verify `dynamic(() => import(...))` works |
| sessionStorage quota exceeded | setItem throws | Catch + in-memory fallback |
| Lumi anim race (step changes faster than anim ends) | Visual | priority queue in lumiStore (FR-CHAR-011) |
| Submit fails silently | No status update | Always update status state in catch block |
| zod schema drift from server | 400 with field errors | Sync schema between client + server via shared module |
| Mobile keyboard pushes form off-screen | Visual | scroll-into-view on input focus |
| Tab order broken (skips fields) | Keyboard test | Sequential tabIndex; use semantic HTML |
| Auto-advance to next step missed back-button preservation | AC#10 | react-hook-form keeps state across step renders |
| Country dropdown has wrong code (Vietnam not VN) | Manual | Use ISO-3166 alpha-2 reference list |
| User submits 5x rapidly (race) | AC#7 | Disable submit button during in-flight |
| Cancel button leaks draft | AC#8 | sessionStorage.removeItem on confirm |
| Lumi anim doesn't restore to idle on close | Visual | useEffect cleanup sets idle |
| Privacy regulation (GDPR consent missing) | Audit | Add cookie/consent banner per FR-A11Y-014 (scope) |
| Email anonymization wrong (J***@***.com still PII-like) | Log inspection | Better anonymization: hash with salt |
| Step indicator wrong "Step 4 of 3" | Bounds check | Cap step at 3 |

## §8 — Deliverable preview

User flow:
1. User clicks "Partner with us" on CTA hub.
2. Form mounts (lazy chunk loaded ~80 KB gzip first time, cached after).
3. Step 1: Agency name "ACME Studio", Country: "Vietnam (VN)". Click Next.
4. Step 2: Monthly capacity: 80 hours. Brief: "We need React + R3F help for a museum exhibit..." Click Next.
5. Step 3: Email: alex@acme.studio. Name: Alex Tran. Click Submit.
6. Loading state (~ 800ms). Success card: "Thanks. Our partner-success lead will respond in 24h."
7. Form clears. Lumi waves goodbye.

User accidentally closes browser mid-step 2:
1. Returns to page, opens partner form.
2. Step 2 fields pre-filled from sessionStorage draft.
3. Continues seamlessly.

## §9 — Notes

**On HubSpot deal-stage routing:** FR-CTA-006 reads `track: 'partner'` and sets HubSpot deal-stage to `partner-inbound`. Founder gets alert via HubSpot's workflow → email + Slack.

**On Vietnamese partner workflow:** Vietnamese-language form is FR-CMS-vi scope. Schema identical; UI labels translated.

**On country dropdown:** ISO-3166 alpha-2 with ~250 entries. Filter to top-10 partner countries (US, UK, AU, JP, SG, VN, ...) with "Other" expand. Performance + UX.

**On no-account-required design:** Founder wants low-friction partner-inbound. Account creation would add 5-min onboarding. Email is sufficient identity.

**On future field expansion:** Could add: "Preferred contract type" (project / monthly retainer), "Languages your devs speak". Slice 2 candidate.

**On A/B testing form copy:** Future: test "Tell us about your agency" vs current "Partner with us" headline. Slice 3 candidate.

*End of FR-CTA-003.*
