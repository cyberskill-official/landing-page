"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emit, readUtm } from "@/lib/analytics/taxonomy";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const teardownSchema = z.object({
  name: z.string().trim().min(1, "required").max(120),
  email: z.string().trim().email("invalid_email").max(200),
  url: z.string().trim().min(1, "required").max(300),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, { message: "consent_required" }),
  website: z.string().max(0).optional().or(z.literal("")),
});

type TeardownFormInput = z.infer<typeof teardownSchema>;

export function TeardownCta({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [capExceeded, setCapExceeded] = useState(false);
  const [loadingCap, setLoadingCap] = useState(true);

  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonedRef = useRef(false);

  function markStarted() {
    if (!startedRef.current) {
      startedRef.current = true;
      emit("form_started", { formId: "teardown" });
    }
  }

  useEffect(() => {
    async function checkCap() {
      try {
        const res = await fetch("/api/teardown/status");
        if (res.ok) {
          const data = await res.json();
          setCapExceeded(data.capExceeded);
        }
      } catch (err) {
        console.error("Failed to check teardown cap status", err);
      } finally {
        setLoadingCap(false);
      }
    }
    void checkCap();
  }, []);

  useEffect(() => {
    function reportAbandon() {
      if (startedRef.current && !submittedRef.current && !abandonedRef.current) {
        abandonedRef.current = true;
        emit("form_abandoned", { formId: "teardown" });
      }
    }
    window.addEventListener("pagehide", reportAbandon);
    return () => {
      window.removeEventListener("pagehide", reportAbandon);
      reportAbandon();
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeardownFormInput>({
    resolver: zodResolver(teardownSchema),
    defaultValues: { name: "", email: "", url: "", message: "", consent: false, website: "" },
  });

  async function onSubmit(values: TeardownFormInput) {
    setStatus("submitting");
    const utm = readUtm();
    const payload = {
      name: values.name,
      email: values.email,
      company: values.url, // map website URL to company name as well to keep DB schema happy
      url: values.url,
      intent: "project" as const,
      message: values.message || "",
      consent: values.consent,
      website: values.website || "",
      locale,
      source: "teardown",
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
        emit("lead_submitted", { source: "teardown", locale, utm });
        window.dispatchEvent(new CustomEvent(WISH_GRANTED_EVENT));
        setStatus("ok");
      } else {
        if (res.status === 429) {
          setCapExceeded(true);
        }
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function messageFor(code: string | undefined): string | undefined {
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

  return (
    <section id="teardown" className="cs-section" aria-labelledby="teardown-title" style={{ position: "relative" }}>
      <div className="cs-container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--cs-space-xl)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--cs-space-lg)" }} className="cs-contact-grid">
          <div className="cs-contact-intro">
            <h2 id="teardown-title" className="cs-kt-h" style={{ fontSize: "var(--cs-text-3xl)", fontWeight: 800 }}>
              {dict.teardown.title}
            </h2>
            <p className="cs-section-lead">{dict.teardown.lead}</p>
          </div>

          <div className="cs-contact-form cs-surface-light" style={{ padding: "var(--cs-space-lg)", borderRadius: "8px", border: "1px solid var(--cs-color-border)" }}>
            {loadingCap ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--cs-space-lg)" }}>
                <span className="cs-loader" />
              </div>
            ) : capExceeded ? (
              <div className="cs-form-success cs-surface-standard" role="status" aria-live="polite" style={{ padding: "var(--cs-space-md) var(--cs-space-lg)", textAlign: "center" }}>
                <h3 style={{ color: "var(--cs-color-gold)", marginBottom: "var(--cs-space-sm)" }}>{dict.teardown.capFullTitle}</h3>
                <p style={{ margin: 0, fontSize: "var(--cs-text-md)" }}>{dict.teardown.capFullBody}</p>
              </div>
            ) : status === "ok" ? (
              <div className="cs-form-success cs-surface-standard" role="status" aria-live="polite" style={{ padding: "var(--cs-space-md) var(--cs-space-lg)", textAlign: "center" }}>
                <h3 style={{ color: "var(--cs-color-primary)", marginBottom: "var(--cs-space-sm)" }}>{dict.teardown.successTitle}</h3>
                <p style={{ margin: 0, fontSize: "var(--cs-text-md)" }}>{dict.teardown.successBody}</p>
              </div>
            ) : (
              <form className="cs-form clarity-mask" data-clarity-mask="true" onSubmit={handleSubmit(onSubmit)} onFocus={markStarted} noValidate>
                {/* Honeypot */}
                <div className="cs-visually-hidden" aria-hidden="true">
                  <label htmlFor="website" aria-hidden="true">Leave this empty</label>
                  <input id="website" type="text" tabIndex={-1} aria-hidden="true" autoComplete="off" {...register("website")} />
                </div>

                <div className="cs-field">
                  <label htmlFor="td-name">{dict.teardown.nameLabel}</label>
                  <input
                    id="td-name"
                    type="text"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "td-name-error" : undefined}
                    {...register("name")}
                  />
                  {errors.name && (
                    <span id="td-name-error" className="cs-field-error" role="alert">
                      {messageFor(errors.name.message)}
                    </span>
                  )}
                </div>

                <div className="cs-field">
                  <label htmlFor="td-email">{dict.teardown.emailLabel}</label>
                  <input
                    id="td-email"
                    type="email"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "td-email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <span id="td-email-error" className="cs-field-error" role="alert">
                      {messageFor(errors.email.message)}
                    </span>
                  )}
                </div>

                <div className="cs-field">
                  <label htmlFor="td-url">{dict.teardown.urlLabel}</label>
                  <input
                    id="td-url"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="https://example.com"
                    aria-invalid={!!errors.url}
                    aria-describedby={errors.url ? "td-url-error" : undefined}
                    {...register("url")}
                  />
                  {errors.url && (
                    <span id="td-url-error" className="cs-field-error" role="alert">
                      {messageFor(errors.url.message)}
                    </span>
                  )}
                </div>

                <div className="cs-field">
                  <label htmlFor="td-message">
                    {dict.teardown.messageLabel}
                  </label>
                  <textarea id="td-message" rows={3} {...register("message")} />
                  {errors.message && (
                    <span id="td-message-error" className="cs-field-error" role="alert">
                      {messageFor(errors.message.message)}
                    </span>
                  )}
                </div>

                <div className="cs-field cs-field-check">
                  <input
                    id="td-consent"
                    type="checkbox"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "td-consent-error" : undefined}
                    {...register("consent")}
                  />
                  <label htmlFor="td-consent">
                    {dict.teardown.consentLabel}{" "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
                      {dict.footer.privacy}
                    </a>
                  </label>
                </div>
                {errors.consent && (
                  <span id="td-consent-error" className="cs-field-error" role="alert">
                    {messageFor(errors.consent.message)}
                  </span>
                )}

                <div style={{ marginTop: "var(--cs-space-md)" }}>
                  <button type="submit" className="cs-btn cs-btn-primary" disabled={status === "submitting"} style={{ width: "100%", marginBottom: "var(--cs-space-xs)" }}>
                    {status === "submitting" ? dict.form.submitting : dict.teardown.submitLabel}
                  </button>
                </div>

                {status === "error" && (
                  <p className="cs-field-error" role="alert" style={{ marginTop: "var(--cs-space-sm)" }}>
                    {dict.form.errorGeneric}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
