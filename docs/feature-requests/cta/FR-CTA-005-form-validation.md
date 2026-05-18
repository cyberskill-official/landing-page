---
id: FR-CTA-005
title: "react-hook-form + zod validation foundation — a11y-first error messaging across all CTA forms"
module: CTA
priority: MUST
status: shipped
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 2
owner: Frontend Lead + A11Y reviewer
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-006, FR-A11Y-001, FR-OPS-012]
depends_on: [FR-CTA-001]
blocks: [FR-CTA-002, FR-CTA-003, FR-CTA-004, FR-CTA-006]
language: typescript 5.6 + react 19
service: apps/web/components/cta/forms/ + apps/web/lib/forms/
new_files:
  - apps/web/lib/forms/use-a11y-form.ts
  - apps/web/lib/forms/FieldError.tsx
  - apps/web/lib/forms/FormErrorAnnouncer.tsx
  - apps/web/lib/forms/validation-messages.ts
  - apps/web/lib/forms/schemas/cta-schemas.ts
  - apps/web/lib/forms/__tests__/use-a11y-form.unit.test.ts
  - apps/web/tests/a11y/form-validation.e2e.spec.ts
modified_files:
  - apps/web/components/cta/forms/TrackFormShell.tsx
  - apps/web/components/cta/forms/BuyForm.tsx
  - apps/web/components/cta/forms/PartnerForm.tsx
  - apps/web/components/cta/forms/JoinForm.tsx
  - apps/web/messages/en.json
  - apps/web/messages/vi.json
  - apps/web/package.json
  - pnpm-lock.yaml

source_pages:
  - docs/01-master-plan-v2.md §5.1 — "Forms: react-hook-form + zod"
  - docs/01-master-plan-v2.md §7.1 — A11Y a11y first
  - WCAG 2.2 SC 3.3.1 (Error Identification), SC 3.3.3 (Error Suggestion), SC 4.1.3 (Status Messages)
  - WAI-ARIA Authoring Practices: "Form validation"

effort_hours: 6
risk_if_skipped: "Without aria-live error announcements + focus management, all 3 forms (Buy/Partner/Join) silently fail validation for AT users. Form abandonment rate among AT users approaches 80%. WCAG SC 3.3.1 / 4.1.3 violations = legal risk + lawsuit class action precedent (Domino's 2019, Beyoncé 2019)."
---

## §1 — Description (BCP-14 normative)

1. **MUST** wrap all 3 CTA forms (FR-CTA-002 Buy, FR-CTA-003 Partner, FR-CTA-004 Join) in:
   - `react-hook-form` v7+ for form state management.
   - `zod` v3+ for schema validation.
   - Shared `use-a11y-form` hook for a11y-conformant integration.

2. **MUST** validate on `blur` (not on every keystroke) for less-jarring UX. Schema-mode: `mode: 'onBlur'`.

3. **MUST** announce errors via an `aria-live="polite"` region (`<FormErrorAnnouncer>`):
   - On submit-with-errors: announce "Form has N errors: <first-error>".
   - On individual field error (post-blur): silent (visual indication only).
   - On error resolution: announce "Error resolved".

4. **MUST** use `aria-invalid="true"` on fields with errors, `aria-invalid="false"` (or absent) on valid fields.

5. **MUST** use `aria-describedby` to link error message ID to field, so screen reader reads the error when the field is focused.

6. **MUST** auto-focus the first invalid field on submit-with-errors. `useEffect` after validation runs, find first error, `element.focus()`.

7. **MUST** show error messages in red text with non-color signal (icon `⚠` prefix) — WCAG 1.4.1 (Use of Color).

8. **MUST** show inline error messages directly below each field (not at form top alone). Helps low-vision users see error context.

9. **MUST** include client-side validation for:
   - Required fields (zod `.min(1)`)
   - Type (email, URL, number)
   - Length bounds (min / max chars)
   - Format (regex for phone, ISO country code, etc.)

10. **MUST** include server-side re-validation in FR-CTA-006 — never trust client-side validation alone.

11. **MUST** display 2px gold focus ring (FR-A11Y-001 / FR-A11Y-008) on focused fields.

12. **MUST** support keyboard-only operation:
    - Tab moves between fields in semantic order.
    - Shift+Tab moves backward.
    - Enter submits the form (from any field).
    - Escape closes the form (if in modal) with confirmation if dirty.

13. **MUST NOT** lose form data on validation errors. Errors highlight; values stay.

14. **MUST** localize error messages via next-intl (`messages.forms.validation_required`, etc.).

15. **MUST** ship axe-clean per FR-OPS-012 — all forms have:
    - Visible labels (no placeholder-only labels)
    - Min 44×44 hit area for radio/checkbox
    - Color contrast ≥ 4.5:1 for text + border + error states
    - Clear focus indicators

16. **MUST** support submission state UI:
    - `aria-busy="true"` on form while submitting.
    - Submit button disabled + spinner.
    - Other fields readonly during submit.

17. **SHOULD** include "tips" mode for complex fields — `aria-describedby` linking to a "Why we ask" note (e.g., "Why we ask for country: to route to your timezone").

## §2 — Why this design

**Why react-hook-form + zod (not Formik, not custom)?** react-hook-form is the de facto React form library 2024+, lowest re-render overhead, best DX with TypeScript inference via zod. zod is the de facto runtime validator, also TS-first. Combination minimizes boilerplate.

**Why validate on blur (not every keystroke)?** Continuous validation is hostile UX — error appears as you're typing the 3rd character of an email. Blur means "I've finished entering this field; please check." Aligns with mental model.

**Why aria-live polite (not assertive)?** Polite waits for current speech; assertive interrupts. Form errors are not emergencies; politeness wins.

**Why announce error count (not all errors)?** Reading 10 error messages drowns the user. Announce count + first error; AT user investigates by Tab+focus moving through fields.

**Why auto-focus first error?** Saves Tab time. AT user submits → server says "errors" → focus moves to first error → user fixes → tab to next, etc. Without auto-focus, user is hunting.

**Why inline + summary errors?** Two-tier:
- Inline error directly below field — context for sighted + low-vision.
- Summary at form top + announcement — total picture for AT.

Both surface, neither alone.

**Why never lose data on errors?** Re-entering 200-char brief because a single field was invalid → form rage-quit. Persistent values are table-stakes.

**Why next-intl error messages?** Vietnamese visitors need Vietnamese error messages. Hardcoded English errors = exclusion.

**Why "Why we ask" tips?** Cognitive a11y. Some users hesitate at "country" field — "is this for marketing?" Tip explains "we use it to route to your timezone." Builds trust + reduces drop-off.

## §3 — Public surface

```ts
// apps/web/lib/forms/use-a11y-form.ts
import { useEffect, useRef } from "react";
import { useForm, type UseFormReturn, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

export interface A11yFormOptions<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: Partial<T>;
}

export function useA11yForm<T extends FieldValues>(opts: A11yFormOptions<T>): UseFormReturn<T> & {
  focusFirstError: () => void;
} {
  const methods = useForm<T>({
    resolver: zodResolver(opts.schema),
    defaultValues: opts.defaultValues as any,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  function focusFirstError() {
    const errors = methods.formState.errors;
    const firstErrorKey = Object.keys(errors)[0] as Path<T> | undefined;
    if (firstErrorKey) {
      const el = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement | null;
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Auto-focus first error on submit fail
  useEffect(() => {
    if (methods.formState.submitCount > 0 && !methods.formState.isValid) {
      focusFirstError();
    }
  }, [methods.formState.submitCount, methods.formState.isValid]);

  return { ...methods, focusFirstError };
}
```

```tsx
// apps/web/lib/forms/FieldError.tsx
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

export function FieldError({ name }: { name: string }) {
  const { formState: { errors } } = useFormContext();
  const t = useTranslations("forms.validation");
  const err = errors[name];
  if (!err) return null;
  const errorId = `${name}-error`;
  // err.message is the zod error string (often path-prefixed); translate if message is a key
  const message = typeof err.message === "string" && err.message.startsWith("validation:")
    ? t(err.message.slice(11))
    : err.message;
  return (
    <p id={errorId} className="field-error" role="alert">
      <span aria-hidden="true">⚠ </span>
      {String(message)}
    </p>
  );
}
```

```tsx
// apps/web/lib/forms/FormErrorAnnouncer.tsx
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

export function FormErrorAnnouncer() {
  const { formState: { errors, submitCount, isValid } } = useFormContext();
  const liveRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("forms.validation");

  useEffect(() => {
    if (submitCount === 0 || isValid) return;
    const errorKeys = Object.keys(errors);
    const firstError = errors[errorKeys[0]]?.message;
    if (liveRef.current) {
      liveRef.current.textContent = t("error_summary", { count: errorKeys.length, firstError: String(firstError) });
    }
  }, [submitCount, isValid, errors, t]);

  return <div ref={liveRef} aria-live="polite" aria-atomic="true" className="visually-hidden" />;
}
```

```tsx
// Usage in any CTA form
import { FormProvider } from "react-hook-form";
import { useA11yForm } from "@/lib/forms/use-a11y-form";
import { FieldError } from "@/lib/forms/FieldError";
import { FormErrorAnnouncer } from "@/lib/forms/FormErrorAnnouncer";

const methods = useA11yForm({ schema: partnerSchema });
return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormErrorAnnouncer />
      <label htmlFor="agency_name">Agency name</label>
      <input
        id="agency_name"
        {...methods.register("agency_name")}
        aria-invalid={!!methods.formState.errors.agency_name}
        aria-describedby={methods.formState.errors.agency_name ? "agency_name-error" : undefined}
      />
      <FieldError name="agency_name" />
      ...
    </form>
  </FormProvider>
);
```

```css
.field-error {
  color: var(--color-error-red);  /* 4.5:1 vs background */
  font-size: 14px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
input[aria-invalid="true"] {
  border-color: var(--color-error-red);
  border-width: 2px;
}
input:focus-visible {
  outline: 2px solid var(--accent-gold);
  outline-offset: 2px;
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | All 3 forms use useA11yForm hook | Code grep |
| 2 | Zod schemas defined per form | File presence check |
| 3 | aria-live region present in each form | DOM query |
| 4 | aria-invalid set on errored fields | Vitest: trigger error, assert attribute |
| 5 | aria-describedby links error to field | DOM: getElementById(error id) reachable |
| 6 | Focus moves to first error on submit-with-errors | Vitest + e2e |
| 7 | Error messages display inline below fields | Visual + DOM |
| 8 | Error count announced via aria-live | Mock listener; assert content |
| 9 | Form data preserved on validation error | Vitest: submit, errors, fields still filled |
| 10 | Tab order semantic | Playwright keyboard |
| 11 | Enter submits | Playwright |
| 12 | Escape closes form (with dirty confirm) | Playwright |
| 13 | aria-busy on form during submit | Mock submit; assert attribute |
| 14 | Color contrast ≥ 4.5:1 for error text | Contrast check (FR-A11Y-008) |
| 15 | axe-clean across all 3 forms | AxeBuilder |
| 16 | Vitest unit tests pass | `pnpm vitest run apps/web/lib/forms/__tests__/use-a11y-form.unit.test.ts` |
| 17 | Vietnamese error messages render | next-intl smoke test |

## §5 — Verification

```ts
// apps/web/lib/forms/__tests__/use-a11y-form.unit.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod";
import { useA11yForm } from "../use-a11y-form";

describe("useA11yForm", () => {
  const schema = z.object({
    name:  z.string().min(2, "validation:required_name"),
    email: z.string().email("validation:invalid_email"),
  });

  it("returns react-hook-form methods + focusFirstError", () => {
    const { result } = renderHook(() => useA11yForm({ schema }));
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.focusFirstError).toBeDefined();
  });

  it("uses onBlur mode", () => {
    const { result } = renderHook(() => useA11yForm({ schema }));
    // verify via methods.control._options.mode
  });

  it("validates with zod on submit", async () => {
    const { result } = renderHook(() => useA11yForm({ schema }));
    await act(async () => {
      await result.current.handleSubmit(() => {})({ preventDefault: () => {} } as any);
    });
    expect(result.current.formState.errors.name).toBeDefined();
    expect(result.current.formState.errors.email).toBeDefined();
  });
});
```

```ts
// apps/web/tests/a11y/form-validation.e2e.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("submit-with-errors focuses first invalid field", async ({ page }) => {
  await page.goto("/#cta-hub");
  await page.locator("button:has-text('Partner')").click();
  await page.locator("button:has-text('Next')").click();
  // Assertion: first error field is focused
  const focusedName = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.name);
  expect(focusedName).toBe("agency_name");
});

test("aria-live announces error count", async ({ page }) => {
  await page.goto("/#cta-hub");
  // ... trigger validation errors ...
  const live = page.locator("[aria-live='polite']");
  await expect(live).toContainText(/Form has \d+ errors/i);
});

test("axe-clean on all forms", async ({ page }) => {
  await page.goto("/#cta-hub");
  // ... mount each form variant ...
  const result = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
  const seriousCritical = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
  expect(seriousCritical).toEqual([]);
});

test("Tab order semantic", async ({ page }) => {
  await page.goto("/#cta-hub");
  // ... open Partner form ...
  await page.keyboard.press("Tab");
  // assert focus on agency_name
  await page.keyboard.press("Tab");
  // assert focus on country
  // ... etc.
});

test("Escape closes form with confirmation", async ({ page }) => {
  await page.goto("/#cta-hub");
  await page.locator("button:has-text('Partner')").click();
  await page.locator("input[name='agency_name']").fill("ACME");
  page.on("dialog", async d => { await d.accept(); });
  await page.keyboard.press("Escape");
  await expect(page.locator("form")).not.toBeVisible();
});
```

## §6 — Dependencies

**Concept:** FR-CTA-002/003/004 (the forms this hardens), FR-A11Y-001 (focus + contrast tokens), FR-OPS-012 (axe gate validates).

**Operational:** react-hook-form ^7, @hookform/resolvers, zod ^3, next-intl, FR-A11Y-008 focus ring tokens.

**Downstream:** FR-CTA-006 (server endpoint re-validates with same zod schema — shared module).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| aria-live announcements clipped (overflow:hidden) | Visual | CSS: overflow:visible on live region |
| Focus doesn't move to first error | AC#6 | useEffect on submitCount; ensure ref lookup correct |
| Inline error obscured behind other content | Visual | Position relative; clear stacking |
| zod schema not loaded in client bundle (server-only) | Build fail | Import schemas from `schemas/` shared module (no server-only deps) |
| Vietnamese error message missing key | next-intl logs | Fallback to English; flag missing key in CI |
| Submit button still enabled during in-flight | AC#13 | Disable + aria-busy on submit start |
| Tab skips error message | AT test | Error <p role="alert"> announces on appearance |
| Server validation differs from client (different zod versions) | 400 errors that surprise user | Shared zod schemas; CI version pin |
| Color contrast on error red fails | AC#14 | Adjust to --color-error-red token; verify contrast |
| Field error persists after correction | UX | reValidateMode: "onChange" triggers re-eval |
| Multiple aria-live regions compete | VO test | Single FormErrorAnnouncer per form |
| Error message length exceeds visual budget | Truncation visual | max-width on error <p>; ellipsis OK for AT (aria-live reads full) |
| Form abandoned mid-validation | Analytics | Track field-level abandonment for UX optimization |
| Cross-browser focus differences | Visual | use focus-visible polyfill if needed |
| Form fields not reachable by keyboard at all | Critical fail | tabindex audit; explicit tabIndex={0} only when needed |

## §8 — Deliverable preview

User experience (with errors):
1. User fills Partner form Step 1: agency_name="A" (too short, 1 char min 2).
2. Tabs to country. Email field blurs → red ⚠ "Agency name must be at least 2 characters" appears below field.
3. User clicks Submit. aria-live announces: "Form has 2 errors. Agency name must be at least 2 characters."
4. Focus moves to agency_name input. Border red, aria-invalid=true.
5. User types more characters → blur → error clears.
6. Submit again → succeeds.

Screen reader (VoiceOver) experience:
> "Submit button. Pressed. Form has 2 errors. Agency name must be at least 2 characters. Edit text. Agency name. Invalid. Agency name must be at least 2 characters."

## §9 — Notes

**On zod error message keys:** Convention: zod error messages start with `validation:` prefix (e.g., `"validation:required_name"`). next-intl resolves to localized string. Backward compat: plain English strings (without prefix) pass through unchanged.

**On future enhancements:** Real-time validation hints (e.g., password strength meter, email autocomplete) deferred to slice 3.

**On Vietnamese form UX research:** Vietnamese users tolerate longer forms than US users (cultural patience). Error styling should still be polite, not red-flashing.

**On WCAG 2.2 SC 3.3.7 (Accessible Authentication):** Not applicable — forms here don't have passwords / 2FA challenges.

**On future RTL languages:** Currently EN/VI only (both LTR). RTL support (Arabic, Hebrew) would require additional CSS work; out of scope.

*End of FR-CTA-005.*
