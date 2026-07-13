"use client";

import { useState } from "react";

interface NewsletterFormProps {
  locale: "en" | "vi";
}

export function NewsletterForm({ locale }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const labels =
    locale === "vi"
      ? {
          title: "Bản tin CyberSkill",
          promise: "Lời hứa: Mỗi tháng một email duy nhất bao gồm: những gì đã bàn giao, một bài học kinh nghiệm, và một phân tích chi tiết.",
          placeholder: "Nhập email của bạn...",
          submit: "Đăng ký",
          submitting: "Đang gửi...",
          success: "Đã gửi email xác nhận! Vui lòng kiểm tra hộp thư của bạn.",
          invalidEmail: "Email không hợp lệ.",
          error: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        }
      : {
          title: "CyberSkill Newsletter",
          promise: "Our promise: One email a month, containing: what we shipped, one lesson, and one teardown. No spam.",
          placeholder: "Enter your email address...",
          submit: "Subscribe",
          submitting: "Submitting...",
          success: "Confirmation email sent! Please check your inbox.",
          invalidEmail: "Please enter a valid email.",
          error: "An error occurred. Please try again later.",
        };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMsg(labels.invalidEmail);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, website }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.message || labels.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg(labels.error);
    }
  };

  if (status === "success") {
    return (
      <div className="cs-newsletter-success" role="alert" style={{ color: "var(--cs-color-gold)", padding: "var(--cs-space-4) 0" }}>
        <p style={{ fontWeight: 600, margin: 0 }}>{labels.success}</p>
      </div>
    );
  }

  return (
    <div className="cs-newsletter-container" style={{ margin: "var(--cs-space-4) 0" }}>
      <form onSubmit={handleSubmit} className="cs-newsletter-form" style={{ display: "flex", gap: "var(--cs-space-2)", maxWidth: "450px" }}>
        {/* Honeypot field */}
        <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.placeholder}
          required
          aria-label={labels.title}
          disabled={status === "loading"}
          style={{
            flex: 1,
            padding: "var(--cs-space-3) var(--cs-space-4)",
            borderRadius: "4px",
            border: "1px solid var(--cs-color-border)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "var(--cs-color-fg)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="cs-btn cs-btn-primary"
          disabled={status === "loading"}
          style={{
            padding: "0 var(--cs-space-6)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {status === "loading" ? labels.submitting : labels.submit}
        </button>
      </form>
      <p style={{ fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)", marginTop: "var(--cs-space-2)", lineHeight: 1.4, maxWidth: "450px" }}>
        {labels.promise}
      </p>
      {status === "error" && (
        <p style={{ color: "#EA3C3C", fontSize: "var(--cs-text-sm)", marginTop: "var(--cs-space-2)", fontWeight: 600 }} role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
