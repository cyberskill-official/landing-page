import type { Locale } from "@/lib/i18n/config";

// Honest credibility strip (no invented logos or metrics). Reinforces the
// legitimacy signals an international B2B buyer looks for.
const items: Record<Locale, { figure: string; label: string }[]> = {
  en: [
    { figure: "Since 2020", label: "Shipping software for real clients" },
    { figure: "Web, mobile, internal", label: "Three focused practices" },
    { figure: "EN + VN", label: "Bilingual delivery" },
    { figure: "1 business day", label: "We reply within" },
  ],
  vi: [
    { figure: "Từ 2020", label: "Bàn giao phần mềm cho khách hàng thật" },
    { figure: "Web, di động, nội bộ", label: "Ba mảng chuyên sâu" },
    { figure: "Anh + Việt", label: "Bàn giao song ngữ" },
    { figure: "1 ngày làm việc", label: "Chúng tôi phản hồi trong vòng" },
  ],
};

export function TrustBand({ locale }: { locale: Locale }) {
  return (
    <section className="cs-trust cs-no-print" aria-label={locale === "vi" ? "Tín nhiệm" : "Credibility"}>
      <div className="cs-container">
        <ul className="cs-trust-grid" role="list">
          {items[locale].map((it) => (
            <li key={it.figure} className="cs-trust-item">
              <p className="cs-trust-figure">{it.figure}</p>
              <p className="cs-trust-label">{it.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
