"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import { track } from "@/lib/analytics";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
}: {
  locale: Locale;
  dict: Dictionary;
  source?: string;
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
      track("form_start", { source });
    }
  }

  useEffect(() => {
    function reportAbandon() {
      if (startedRef.current && !submittedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        track("lead_abandoned", { source });
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
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        submittedRef.current = true;
        track("lead_submitted", { source });
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
      <div className="cs-form-success cs-surface-standard" role="status" aria-live="polite">
        <h3>{dict.form.successTitle}</h3>
        <p>{dict.form.successBody}</p>
      </div>
    );
  }

  return (
    <form className="cs-form" onSubmit={handleSubmit(onSubmit)} onFocus={markStarted} noValidate>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="cs-visually-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="cs-field">
        <label htmlFor="name">{dict.form.name}</label>
        <input id="name" type="text" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <span className="cs-field-error">{messageFor(errors.name.message, dict)}</span>}
      </div>

      <div className="cs-field">
        <label htmlFor="email">{dict.form.email}</label>
        <input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <span className="cs-field-error">{messageFor(errors.email.message, dict)}</span>}
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
        <input id="consent" type="checkbox" aria-invalid={!!errors.consent} {...register("consent")} />
        <label htmlFor="consent">
          {dict.form.consent}{" "}
          <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
            {dict.footer.privacy}
          </a>
        </label>
      </div>
      {errors.consent && <span className="cs-field-error">{messageFor(errors.consent.message, dict)}</span>}

      <button type="submit" className="cs-btn cs-btn-primary" disabled={status === "submitting"}>
        {status === "submitting" ? dict.form.submitting : dict.form.submit}
      </button>

      {status === "error" && (
        <p className="cs-field-error" role="alert">
          {dict.form.errorGeneric}
        </p>
      )}
    </form>
  );
}
