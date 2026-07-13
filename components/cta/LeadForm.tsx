"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import { emit, readUtm } from "@/lib/analytics/taxonomy";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { NewsletterForm } from "@/components/cta/NewsletterForm";

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
  hasNewsletter,
}: {
  locale: Locale;
  dict: Dictionary;
  source?: string;
  hasNewsletter?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");

  // Funnel tracking (FR-CTA-009): form_start on first interaction, lead_abandoned
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
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { intent: "project", consent: false, locale, source, website: "" },
  });

  async function onSubmit(values: LeadInput) {
    setStatus("submitting");
    const utm = readUtm();
    // FR-OPS-011: append UTM fields if captured from session
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
      <div className="cs-form-success cs-surface-standard" role="status" aria-live="polite" style={{ padding: "var(--cs-space-md) var(--cs-space-lg)", borderTop: "1px solid var(--cs-color-border)", textAlign: "center" }}>
        <h3 style={{ color: "var(--cs-color-primary)", marginBottom: "var(--cs-space-sm)" }}>{dict.form.successTitle}</h3>
        <p style={{ margin: 0, fontSize: "var(--cs-text-md)", marginBottom: "var(--cs-space-4)" }}>{dict.form.successBody}</p>
        {hasNewsletter && (
          <div style={{ marginTop: "var(--cs-space-6)", paddingTop: "var(--cs-space-6)", borderTop: "1px dashed var(--cs-color-border)", textAlign: "left" }}>
            <h4 style={{ color: "var(--cs-color-gold)", margin: 0, fontSize: "var(--cs-text-md)", fontWeight: 600 }}>
              {locale === "vi" ? "Nhận thêm thông tin mỗi tháng" : "Get monthly insights delivered"}
            </h4>
            <NewsletterForm locale={locale} />
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="cs-form" onSubmit={handleSubmit(onSubmit)} onFocus={markStarted} noValidate>
      {/* Honeypot: hidden from people, tempting to bots (FR-CTA-013 §1.3). */}
      <div className="cs-visually-hidden" aria-hidden="true">
        <label htmlFor="website" aria-hidden="true">Leave this empty</label>
        <input id="website" type="text" tabIndex={-1} aria-hidden="true" autoComplete="off" {...register("website")} />
      </div>

      <div className="cs-field">
        <label htmlFor="name">{dict.form.name}</label>
        <input
          id="name"
          type="text"
          required
          aria-required="true"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <span id="name-error" className="cs-field-error" role="alert">
            {messageFor(errors.name.message, dict)}
          </span>
        )}
      </div>

      <div className="cs-field">
        <label htmlFor="email">{dict.form.email}</label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <span id="email-error" className="cs-field-error" role="alert">
            {messageFor(errors.email.message, dict)}
          </span>
        )}
      </div>

      <div className="cs-field">
        <label htmlFor="company">
          {dict.form.company} <span className="cs-field-optional">({dict.form.optional})</span>
        </label>
        <input id="company" type="text" autoComplete="organization" {...register("company")} />
      </div>

      <div className="cs-field">
        <label htmlFor="intent">{dict.form.intent}</label>
        <select id="intent" {...register("intent")}>
          <option value="project">{dict.form.intentProject}</option>
          <option value="partnership">{dict.form.intentPartnership}</option>
          <option value="careers">{dict.form.intentCareers}</option>
          <option value="other">{dict.form.intentOther}</option>
        </select>
      </div>

      <div className="cs-field">
        <label htmlFor="message">
          {dict.form.message} <span className="cs-field-optional">({dict.form.optional})</span>
        </label>
        <textarea id="message" rows={3} {...register("message")} />
      </div>

      <div className="cs-field cs-field-check">
        <input
          id="consent"
          type="checkbox"
          required
          aria-required="true"
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          {...register("consent")}
        />
        <label htmlFor="consent">
          {dict.form.consent}{" "}
          <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
            {dict.footer.privacy}
          </a>
        </label>
      </div>
      {errors.consent && (
        <span id="consent-error" className="cs-field-error" role="alert">
          {messageFor(errors.consent.message, dict)}
        </span>
      )}

      <div style={{ marginTop: "var(--cs-space-md)" }}>
        <button type="submit" className="cs-btn cs-btn-primary" disabled={status === "submitting"} style={{ width: "100%", marginBottom: "var(--cs-space-xs)" }}>
          {status === "submitting" ? dict.form.submitting : dict.form.submit}
        </button>
        <p style={{ textAlign: "center", fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)", margin: 0 }}>
          {dict.form.trustLine}
        </p>
      </div>

      {status === "error" && (
        <p className="cs-field-error" role="alert" style={{ marginTop: "var(--cs-space-sm)" }}>
          {dict.form.errorGeneric}
        </p>
      )}
    </form>
  );
}
