"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import { emit, readUtm } from "@/lib/analytics/taxonomy";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { NewsletterForm } from "@/components/cta/NewsletterForm";
import { BookingLink } from "@/components/cta/BookingLink";
import { ProfileDownloadLink } from "@/components/cta/ProfileDownloadLink";
import { DesignSystemButton } from "@/lib/design-system/button";
import { TextField, Textarea, Select, Checkbox } from "@/lib/design-system/forms";
import { Card } from "@/lib/design-system/card";

// Maps zod error codes to localised messages.
function messageFor(code: string | undefined, dict: Dictionary): string | undefined {
  switch (code) {
    case "required":
      return dict.form.required;
    case "invalid_email":
      return dict.form.invalidEmail;
    case "consent_required":
      return dict.form.consentRequired;
    default:
      return code;
  }
}

export function LeadForm({
  locale,
  dict,
  source = "contact",
  defaultIntent = "project",
  hasNewsletter,
}: {
  locale: Locale;
  dict: Dictionary;
  source?: string;
  /** TASK-CMS-019: partnership section pre-selects intent=partnership */
  defaultIntent?: LeadInput["intent"];
  hasNewsletter?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");

  // Funnel tracking (TASK-CTA-009): form_start on first interaction, lead_abandoned
  // if the form was started but never submitted when the user leaves. Refs keep
  // these one-shot and out of render.
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonedRef = useRef(false);

  function markStarted() {
    if (!startedRef.current) {
      startedRef.current = true;
      emit("form_started", { formId: source });
    }
  }

  useEffect(() => {
    function reportAbandon() {
      if (startedRef.current && !submittedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        emit("form_abandoned", { formId: source });
      }
    }
    window.addEventListener("pagehide", reportAbandon);
    return () => {
      window.removeEventListener("pagehide", reportAbandon);
      reportAbandon();
    };
  }, [source]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { intent: defaultIntent, consent: false, locale, source, website: "" },
  });

  async function onSubmit(values: LeadInput) {
    setStatus("submitting");
    const utm = readUtm();
    // TASK-OPS-011: append UTM fields if captured from session
    const payload = {
      ...values,
      ...utm,
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        submittedRef.current = true;
        emit("lead_submitted", { source: source as any, locale, utm });
        // The wish is granted: Lumi (when mounted) celebrates with a burst.
        window.dispatchEvent(new CustomEvent(WISH_GRANTED_EVENT));
      }
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <Card
        className="cs-form-success cs-surface-standard"
        role="status"
        aria-live="polite"
        style={{
          padding: "var(--cs-space-md) var(--cs-space-lg)",
          borderTop: "1px solid var(--cs-color-border)",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "var(--cs-color-primary)", marginBottom: "var(--cs-space-sm)" }}>{dict.form.successTitle}</h3>
        <p style={{ margin: 0, fontSize: "var(--cs-text-md)", marginBottom: "var(--cs-space-4)" }}>{dict.form.successBody}</p>
        {/* TASK-CTA-005 thank-you booking path + TASK-CTA-016 profile PDF */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--cs-space-2)", justifyContent: "center", marginBottom: "var(--cs-space-4)" }}>
          <BookingLink locale={locale} location="thank-you" />
          <ProfileDownloadLink locale={locale} location="thank-you" />
        </div>
        {hasNewsletter && (
          <div style={{ marginTop: "var(--cs-space-6)", paddingTop: "var(--cs-space-6)", borderTop: "1px dashed var(--cs-color-border)", textAlign: "left" }}>
            <h4 style={{ color: "var(--cs-color-gold)", margin: 0, fontSize: "var(--cs-text-md)", fontWeight: 600 }}>
              {locale === "vi" ? "Nhận thêm thông tin mỗi tháng" : "Get monthly insights delivered"}
            </h4>
            <NewsletterForm locale={locale} />
          </div>
        )}
      </Card>
    );
  }

  return (
    <form className="cs-form clarity-mask" data-clarity-mask="true" onSubmit={handleSubmit(onSubmit)} onFocus={markStarted} noValidate>
      {/* Honeypot: hidden from people, tempting to bots (TASK-CTA-013 §1.3). */}
      <div className="cs-visually-hidden" aria-hidden="true">
        <label htmlFor="website" aria-hidden="true">Leave this empty</label>
        <input id="website" type="text" tabIndex={-1} aria-hidden="true" autoComplete="off" {...register("website")} />
      </div>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            id="name"
            label={dict.form.name}
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            error={errors.name ? messageFor(errors.name.message, dict) : undefined}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            id="email"
            label={dict.form.email}
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            error={errors.email ? messageFor(errors.email.message, dict) : undefined}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        name="company"
        control={control}
        render={({ field }) => (
          <TextField
            id="company"
            label={
              <>
                {dict.form.company} <span className="cs-field-optional">({dict.form.optional})</span>
              </>
            }
            type="text"
            autoComplete="organization"
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        name="intent"
        control={control}
        render={({ field }) => (
          <Select
            id="intent"
            label={dict.form.intent}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={[
              { value: "project", label: dict.form.intentProject },
              { value: "partnership", label: dict.form.intentPartnership },
              { value: "careers", label: dict.form.intentCareers },
              { value: "other", label: dict.form.intentOther },
            ]}
          />
        )}
      />

      <Controller
        name="message"
        control={control}
        render={({ field }) => (
          <Textarea
            id="message"
            label={
              <>
                {dict.form.message} <span className="cs-field-optional">({dict.form.optional})</span>
              </>
            }
            rows={3}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        name="consent"
        control={control}
        render={({ field }) => (
          <Checkbox
            id="consent"
            label={
              <>
                {dict.form.consent}{" "}
                <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
                  {dict.footer.privacy}
                </a>
              </>
            }
            required
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            name={field.name}
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
          />
        )}
      />
      {errors.consent && (
        <span id="consent-error" className="cs-field__error" role="alert">
          {messageFor(errors.consent.message, dict)}
        </span>
      )}

      <div style={{ marginTop: "var(--cs-space-md)" }}>
        <DesignSystemButton
          type="submit"
          variant="primary"
          fullWidth
          disabled={status === "submitting"}
          style={{ marginBottom: "var(--cs-space-xs)" }}
        >
          {status === "submitting" ? dict.form.submitting : dict.form.submit}
        </DesignSystemButton>
        <p style={{ textAlign: "center", fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)", margin: 0 }}>
          {dict.form.trustLine}
        </p>
      </div>

      {status === "error" && (
        <p className="cs-field__error" role="alert" style={{ marginTop: "var(--cs-space-sm)" }}>
          {dict.form.errorGeneric}
        </p>
      )}
    </form>
  );
}
