import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { CountUp } from "@/components/ui/CountUp";

// Honest credibility strip (no invented logos or metrics). The first figure is a
// real derived number - years in business since founding - that counts up on
// scroll; the rest are qualitative legitimacy signals.
const years = new Date().getFullYear() - company.founded;

type Item = { figure: string; label: string; count?: number };
const items: Record<Locale, Item[]> = {
  en: [
    { count: years, figure: "years", label: "Shipping software for real clients since 2020" },
    { figure: "Web, mobile, internal", label: "Three focused practices" },
    { figure: "EN + VN", label: "Bilingual delivery" },
    { figure: "1 business day", label: "We reply within" },
  ],
  vi: [
    { count: years, figure: "năm", label: "Bàn giao phần mềm cho khách hàng thật từ 2020" },
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
              <p className="cs-trust-figure">
                {it.count !== undefined ? (
                  <>
                    <CountUp end={it.count} /> {it.figure}
                  </>
                ) : (
                  it.figure
                )}
              </p>
              <p className="cs-trust-label">{it.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
