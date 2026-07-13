"use client";

import { useState } from "react";

type Locale = "en" | "vi";

interface TalentPoolFormProps {
  locale: Locale;
}

const ROLE_OPTIONS: Record<Locale, { value: string; label: string }[]> = {
  en: [
    { value: "senior_engineer", label: "Senior Software Engineer" },
    { value: "staff_engineer", label: "Staff / Principal Engineer" },
    { value: "tech_lead", label: "Tech Lead / Architect" },
    { value: "devops", label: "DevOps / Platform Engineer" },
    { value: "other", label: "Other / Open to discussion" },
  ],
  vi: [
    { value: "senior_engineer", label: "Kỹ sư Phần mềm Cấp cao (Senior)" },
    { value: "staff_engineer", label: "Kỹ sư Staff / Principal" },
    { value: "tech_lead", label: "Tech Lead / Kiến trúc sư hệ thống" },
    { value: "devops", label: "Kỹ sư DevOps / Platform" },
    { value: "other", label: "Khác / Linh hoạt theo dự án" },
  ],
};

const labels: Record<Locale, {
  emailPlaceholder: string;
  roleLabel: string;
  roleDefault: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  invalidEmail: string;
  error: string;
  retentionTitle: string;
  retentionBody: string;
  deletionNote: string;
  consentNote: string;
}> = {
  en: {
    emailPlaceholder: "Your email address",
    roleLabel: "Area of interest",
    roleDefault: "Select a role...",
    submit: "Join Talent Pool",
    submitting: "Submitting…",
    successTitle: "You're in the talent pool!",
    successBody:
      "We've sent a confirmation email — please verify to complete your registration. We'll reach out when a matching project opens.",
    invalidEmail: "Please enter a valid email address.",
    error: "Something went wrong. Please try again.",
    retentionTitle: "Data retention",
    retentionBody:
      "Your information is held for up to 12 months from the date of submission. We will notify you before deletion if no role has opened.",
    deletionNote:
      `To request early deletion, email us at privacy@cyberskill.vn with the subject line "Talent Pool Deletion Request".`,
    consentNote:
      "By joining, you consent to CyberSkill contacting you about relevant engineering opportunities. We will never share your data.",
  },
  vi: {
    emailPlaceholder: "Địa chỉ email của bạn",
    roleLabel: "Lĩnh vực quan tâm",
    roleDefault: "Chọn vị trí...",
    submit: "Tham gia Kho tài năng",
    submitting: "Đang gửi…",
    successTitle: "Bạn đã được thêm vào Kho tài năng!",
    successBody:
      "Chúng tôi đã gửi email xác nhận — vui lòng xác minh để hoàn tất đăng ký. Chúng tôi sẽ liên hệ khi có dự án phù hợp.",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ.",
    error: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    retentionTitle: "Thời gian lưu trữ dữ liệu",
    retentionBody:
      "Thông tin của bạn được lưu trữ tối đa 12 tháng kể từ ngày gửi. Chúng tôi sẽ thông báo trước khi xóa nếu chưa có vị trí phù hợp.",
    deletionNote:
      `Để yêu cầu xóa dữ liệu sớm, vui lòng gửi email đến privacy@cyberskill.vn với tiêu đề "Yêu cầu xóa dữ liệu Talent Pool".`,
    consentNote:
      "Bằng cách tham gia, bạn đồng ý để CyberSkill liên hệ về các cơ hội kỹ thuật phù hợp. Chúng tôi không chia sẻ dữ liệu của bạn.",
  },
};

export function TalentPoolForm({ locale }: TalentPoolFormProps) {
  const t = labels[locale];
  const roles = ROLE_OPTIONS[locale];

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMsg(t.invalidEmail);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale,
          website,
          audienceTag: "talent-pool",
          roleInterest: role || undefined,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setRole("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.message || t.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg(t.error);
    }
  };

  if (status === "success") {
    return (
      <div
        className="cs-talent-success"
        role="alert"
        style={{
          background: "rgba(234, 160, 66, 0.08)",
          border: "1px solid var(--cs-color-gold)",
          borderRadius: "8px",
          padding: "var(--cs-space-md) var(--cs-space-lg)",
          marginTop: "var(--cs-space-md)",
        }}
      >
        <h3 style={{ color: "var(--cs-color-gold)", margin: "0 0 var(--cs-space-xs) 0" }}>
          {t.successTitle}
        </h3>
        <p style={{ margin: 0, fontSize: "var(--cs-text-sm)", lineHeight: 1.6 }}>
          {t.successBody}
        </p>
      </div>
    );
  }

  return (
    <div className="cs-talent-pool-form" style={{ marginTop: "var(--cs-space-md)" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--cs-space-sm)", maxWidth: "480px" }}
      >
        {/* Honeypot */}
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

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--cs-space-xs)" }}>
          <label
            htmlFor="talent-email"
            style={{ fontSize: "var(--cs-text-sm)", fontWeight: 600, color: "var(--cs-color-fg)" }}
          >
            Email
          </label>
          <input
            id="talent-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
            disabled={status === "loading"}
            style={{
              padding: "var(--cs-space-3) var(--cs-space-4)",
              borderRadius: "4px",
              border: "1px solid var(--cs-color-border)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--cs-color-fg)",
              fontSize: "var(--cs-text-sm)",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--cs-space-xs)" }}>
          <label
            htmlFor="talent-role"
            style={{ fontSize: "var(--cs-text-sm)", fontWeight: 600, color: "var(--cs-color-fg)" }}
          >
            {t.roleLabel}
          </label>
          <select
            id="talent-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={status === "loading"}
            style={{
              padding: "var(--cs-space-3) var(--cs-space-4)",
              borderRadius: "4px",
              border: "1px solid var(--cs-color-border)",
              background: "var(--cs-color-surface)",
              color: role ? "var(--cs-color-fg)" : "var(--cs-color-text-muted)",
              fontSize: "var(--cs-text-sm)",
            }}
          >
            <option value="">{t.roleDefault}</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          id="talent-pool-submit"
          className="cs-btn cs-btn-primary"
          disabled={status === "loading"}
          style={{
            padding: "var(--cs-space-3) var(--cs-space-6)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            marginTop: "var(--cs-space-xs)",
            alignSelf: "flex-start",
          }}
        >
          {status === "loading" ? t.submitting : t.submit}
        </button>

        {status === "error" && (
          <p
            role="alert"
            style={{ color: "#EA3C3C", fontSize: "var(--cs-text-sm)", fontWeight: 600, margin: 0 }}
          >
            {errorMsg}
          </p>
        )}
      </form>

      {/* Bilingual retention & deletion statement (PDPL / FR-CTA-020 §1.2, §1.3) */}
      <aside
        style={{
          marginTop: "var(--cs-space-lg)",
          padding: "var(--cs-space-md)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--cs-color-border)",
          borderRadius: "6px",
          maxWidth: "480px",
        }}
      >
        <p
          style={{
            fontSize: "var(--cs-text-xs)",
            fontWeight: 700,
            color: "var(--cs-color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 var(--cs-space-xs) 0",
          }}
        >
          {t.retentionTitle}
        </p>
        <p style={{ fontSize: "var(--cs-text-xs)", color: "var(--cs-color-text-muted)", lineHeight: 1.6, margin: "0 0 var(--cs-space-xs) 0" }}>
          {t.retentionBody}
        </p>
        <p style={{ fontSize: "var(--cs-text-xs)", color: "var(--cs-color-text-muted)", lineHeight: 1.6, margin: "0 0 var(--cs-space-xs) 0" }}>
          {t.deletionNote}
        </p>
        <p style={{ fontSize: "var(--cs-text-xs)", color: "var(--cs-color-text-muted)", lineHeight: 1.6, margin: 0 }}>
          {t.consentNote}
        </p>
      </aside>
    </div>
  );
}
