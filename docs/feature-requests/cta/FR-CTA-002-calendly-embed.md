---
id: FR-CTA-002
title: "Buy form (Calendly embed) — 3-step flow + Lumi reactions + lazy-loaded chunk"
module: CTA
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
shipped: 2026-05-18
verify: T
phase: P4
slice: 2
owner: Frontend Lead
created: 2026-05-16
related_frs: [FR-CTA-001, FR-CTA-005, FR-CTA-006, FR-CTA-007, FR-WEB-006, FR-A11Y-008]
depends_on: [FR-CTA-001, FR-CTA-005, FR-CTA-006]
blocks: []
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §9.1 Track 1 — Buy: "Book Discovery Call"
  - docs/01-master-plan-v2.md §5.3 — lazy-load modal forms
  - docs/01-master-plan-v2.md §9.2 — qualifying questions for discovery call

language: typescript + react 19 + react-hook-form + zod
service: apps/web/components/cta/forms/
new_files:
  - apps/web/components/cta/forms/BuyForm.tsx
  - apps/web/components/cta/forms/BuyFormSchema.ts
  - apps/web/components/cta/forms/CalendlyEmbed.tsx
  - apps/web/components/cta/forms/__tests__/buy-form.spec.ts
  - apps/web/tests/cta/buy-form.spec.ts
modified_files:
  - apps/web/components/canvas/GlobalCanvasShell.tsx
  - apps/web/app/globals.css
  - apps/web/lib/analytics/events.ts
  - apps/web/vitest.config.ts
  - apps/web/package.json
  - pnpm-lock.yaml

effort_hours: 6
risk_if_skipped: "Buy track is the highest-revenue conversion path. Without a polished 3-step flow, buyer-track friction drops conversion. Without lazy-loading, the form bloats main bundle (Calendly embed widget is ~ 80 KB). Without form validation, users hit server-side errors that erode trust."
---

## §1 — Description (BCP-14 normative)

1. **MUST** be exposed via `React.lazy(() => import('./BuyForm'))` from FR-CTA-001's dynamic factory. NOT in the initial bundle.

2. **MUST** be a **3-step flow** rendered inside the FR-CTA-001 modal:

   **Step 1 — "What kind of help?":** 4 selectable chips
   - "Net-new product / MVP"
   - "Existing product / scaling team"
   - "AI / RAG integration"
   - "Other / not sure yet"

   **Step 2 — "About you":**
   - Full name (required)
   - Company name (required)
   - Role (required, free text)
   - Work email (required, validated email format)
   - Time zone (auto-detected, editable)
   - Brief project description (textarea, 280 chars max)

   **Step 3 — "Pick a time":** Calendly embed widget showing available slots for a 30-minute discovery call.

3. **MUST** use `react-hook-form` + `zod` schema validation per FR-CTA-005. Validation fires on blur and on submit; aria-live polite announces errors per FR-A11Y-010.

4. **MUST** integrate Calendly via their **embed widget** (`<InlineWidget />` from `react-calendly`), NOT a raw iframe — the widget exposes proper a11y semantics + form pre-fill from Step 2 data.

5. **MUST** wire Lumi reactions through FR-CTA-007:
   - Step 1 entry: subtle `mouth_smile` shape-key blend (0.3 intensity).
   - Step 2 entry: `mouth_smile` increases to 0.6.
   - Step 3 entry / submit: `summon` clip plays (welcoming gesture).

6. **MUST** persist form state across step navigation. User can go back from Step 3 to Step 1 and forward again without losing entries. Use React-Hook-Form's stateful pattern.

7. **MUST** POST submission to `/api/lead` (FR-CTA-006) with payload `{ track: "buy", step1, step2, scheduledSlot }`. Server enriches + forwards to HubSpot CRM.

8. **MUST** include fallback `mailto:` link for users who can't load Calendly (ad-blocker, corporate firewall): "Can't see the calendar? Email info@cyberskill.world".

9. **MUST NOT** auto-submit on field change. Submit fires only on "Schedule call" CTA in Step 3.

10. **MUST** show a success confirmation step after submit: "Booked. We'll be in touch by [next business day]." with a calendar invite preview.

11. **MUST** ship Vitest unit tests for `BuyFormSchema` validation + step navigation.

12. **MUST** ship Playwright integration tests: form lazy-loads, 3 steps render in order, validation fires, Calendly widget loads at Step 3, submit POSTs to /api/lead, Lumi reactions fire.

## §2 — Why this design

**Why 3 steps, not single form?** Buyer-track conversion research: long single forms have higher abandon rates. 3-step splits cognitive load — chip-pick is low-effort, details are mid-effort, slot-pick is final-effort. Each step provides feedback (Lumi reactions) reinforcing progress.

**Why Calendly?** Decision-call scheduling is solved by Calendly. Self-hosting calendar logic is wasted engineering. Calendly's a11y is good; their pricing is workable; team already uses it.

**Why lazy-load?** Main bundle budget is 200 KB gz (FR-PERF-001). Calendly's widget is ~ 80 KB compressed. Lazy-loading saves the 95% of visitors who never open the Buy modal from paying for the JS.

**Why Lumi reactions through Step 2/3?** Form-filling is transactional; Lumi reactions make it conversational. The mouth_smile during personal info collection feels reassuring; the summon clip on slot-pick feels welcoming. Master plan §3.3 emotional vocabulary.

## §3 — Public surface

```ts
// BuyFormSchema.ts
import { z } from "zod";
export const buyFormSchema = z.object({
  helpType: z.enum(["net-new", "existing", "ai-rag", "other"]),
  fullName: z.string().min(2),
  company: z.string().min(2),
  role: z.string().min(2),
  email: z.string().email(),
  timezone: z.string(),
  description: z.string().max(280).optional(),
});
export type BuyFormValues = z.infer<typeof buyFormSchema>;
```

```tsx
// BuyForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyFormSchema, type BuyFormValues } from "./BuyFormSchema";
import { CalendlyEmbed } from "./CalendlyEmbed";
import { useLumiStore } from "@/lib/stores";

const STEPS = ["help-type", "about-you", "pick-time"] as const;

export default function BuyForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<typeof STEPS[number]>("help-type");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BuyFormValues>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });

  useEffect(() => {
    if (step === "help-type") useLumiStore.getState().setEmissiveBoost(0.3);
    if (step === "about-you") useLumiStore.getState().setEmissiveBoost(0.6);
    if (step === "pick-time") useLumiStore.getState().setCurrentAnim("summon");
  }, [step]);

  const onSubmit = async (data: BuyFormValues, scheduledSlot: string) => {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track: "buy", ...data, scheduledSlot }),
    });
    setStep("confirm" as any);
  };

  return (
    <form className="cta-form-buy" aria-labelledby="buy-form-title">
      <h2 id="buy-form-title">Book a Discovery Call</h2>
      {step === "help-type" && (
        <fieldset>
          <legend>What kind of help?</legend>
          {[
            { value: "net-new", label: "Net-new product / MVP" },
            { value: "existing", label: "Existing product / scaling team" },
            { value: "ai-rag", label: "AI / RAG integration" },
            { value: "other", label: "Other / not sure yet" },
          ].map((opt) => (
            <label key={opt.value}>
              <input type="radio" value={opt.value} {...register("helpType")} />
              {opt.label}
            </label>
          ))}
          <button type="button" onClick={() => setStep("about-you")}>Next</button>
        </fieldset>
      )}
      {step === "about-you" && (
        <fieldset>
          <legend>About you</legend>
          <input {...register("fullName")} placeholder="Full name" aria-invalid={!!errors.fullName} />
          <input {...register("company")} placeholder="Company" />
          <input {...register("role")} placeholder="Role" />
          <input {...register("email")} placeholder="Work email" type="email" />
          <input {...register("timezone")} placeholder="Time zone" />
          <textarea {...register("description")} placeholder="Brief project description (optional)" maxLength={280} />
          <button type="button" onClick={() => setStep("help-type")}>Back</button>
          <button type="button" onClick={() => setStep("pick-time")}>Continue</button>
        </fieldset>
      )}
      {step === "pick-time" && (
        <fieldset>
          <legend>Pick a time</legend>
          <CalendlyEmbed
            url="https://calendly.com/cyberskill/discovery"
            prefill={{ name: watch("fullName"), email: watch("email"), customAnswers: { /* helpType etc */ } }}
            onEventScheduled={(slot) => handleSubmit((data) => onSubmit(data, slot))()}
          />
          <p>Can't see the calendar? Email <a href="mailto:info@cyberskill.world">info@cyberskill.world</a></p>
        </fieldset>
      )}
    </form>
  );
}
```

## §4 — Acceptance criteria

| # | Test | How to verify |
|---|---|---|
| 1 | Lazy-loaded chunk (not in initial bundle) | `pnpm -F web analyze`; verify BuyForm in separate chunk |
| 2 | 3 steps render in order | Playwright click-through |
| 3 | react-hook-form + zod schema validates | Vitest schema test |
| 4 | Calendly widget loads at Step 3 | Playwright network observation |
| 5 | Lumi mouth_smile blend at Step 2 | Playwright eval emissiveBoost = 0.6 |
| 6 | Lumi summon clip at Step 3 | currentAnim === "summon" |
| 7 | Form state persists across step nav | Playwright back/forward |
| 8 | Submit POSTs to /api/lead with full payload | Playwright network intercept |
| 9 | mailto fallback link present | DOM check |
| 10 | Success confirmation after submit | Playwright |
| 11 | aria-live announces validation errors | Accessibility tree |
| 12 | aria-invalid on errored fields | DOM check |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { buyFormSchema } from "../BuyFormSchema";

describe("BuyForm schema", () => {
  it("validates correct payload", () => {
    const r = buyFormSchema.safeParse({
      helpType: "ai-rag", fullName: "Test User", company: "Acme",
      role: "CTO", email: "test@acme.com", timezone: "UTC",
    });
    expect(r.success).toBe(true);
  });
  it("rejects invalid email", () => {
    const r = buyFormSchema.safeParse({
      helpType: "ai-rag", fullName: "X", company: "X", role: "X",
      email: "not-an-email", timezone: "UTC",
    });
    expect(r.success).toBe(false);
  });
  it("enforces max 280 chars on description", () => {
    const r = buyFormSchema.safeParse({
      helpType: "ai-rag", fullName: "X", company: "X", role: "X",
      email: "x@y.com", timezone: "UTC", description: "x".repeat(281),
    });
    expect(r.success).toBe(false);
  });
});
```

## §6 — Dependencies

**Concept:** FR-CTA-001 (modal host), FR-CTA-005 (form validation pattern), FR-CTA-007 (Lumi reactions), FR-WEB-006 (lazy-load chain).

**Operational:** react-hook-form, zod, react-calendly, FR-A11Y-008 focus-visible rings.

**Downstream:** FR-CTA-006 /api/lead endpoint.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Calendly widget blocked by ad-blocker | Visual + AC#9 | mailto fallback link visible alongside; explicit message |
| /api/lead POST fails (5xx) | AC#8 + Sentry | Show retry UI; queue payload for retry |
| Form state lost on back-navigation | AC#7 | react-hook-form's defaultValues + stateful pattern |
| Email validation false-rejects valid (e.g. +tags) | AC#3 | zod email() handles standard RFC; test edge cases |
| Lumi reaction missed (timing race) | AC#5 + AC#6 | useEffect dep on step ensures sequencing |
| Lazy-load fails (chunk missing on prod) | AC#1 + smoke | Verify build emits chunk; CDN deploy includes it |
| Vietnamese diacritics break email | Vietnamese user test | Unicode email RFC support |
| Calendly prefill doesn't pass step2 data | AC#4 + manual | Verify `customAnswers` field mapping |
| Submission idempotent on double-click | UX smoke | Disable Submit button during in-flight POST |
| Timezone auto-detect wrong (Safari ITP) | Fallback to UTC | Manual edit input always available |
| Modal close during in-flight submit (data loss) | UX smoke | Confirm dialog before close if dirty |

## §8 — Deliverable preview

User clicks Buy portal → modal opens → Lumi mouth_smile subtle → Step 1 chips → Step 2 form (mouth_smile increases) → Step 3 Calendly with pre-filled data → user picks slot → submit POSTs to /api/lead → confirmation screen → Lumi summon clip plays.

## §9 — Notes

**On Calendly's react-calendly library:** Version-pin to ^3.0.0; their breaking-changes happen on minor bumps.

**On future enhancements:** Slice 2 could integrate with FR-CMS-004 Sanity to dynamically show case-study links matching helpType. Out of slice 1.

*End of FR-CTA-002.*
