import type { CSSProperties } from "react";
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
    { count: years, figure: "years", label: "of building software for real clients, since 2020" },
    { figure: "3 practices", label: "web, mobile, and the internal systems that run a company" },
    { figure: "EN + VN", label: "we scope, build, and ship in both languages" },
    { figure: "1 business day", label: "the longest you will wait for a reply" },
  ],
  vi: [
    { count: years, figure: "năm", label: "xây phần mềm cho khách hàng thật, kể từ 2020" },
    { figure: "3 mảng", label: "web, di động, và hệ thống nội bộ vận hành cả công ty" },
    { figure: "Anh + Việt", label: "tư vấn, xây dựng và bàn giao bằng cả hai ngôn ngữ" },
    { figure: "1 ngày làm việc", label: "khoảng chờ lâu nhất để bạn nhận phản hồi" },
  ],
};

export function TrustBand({ locale }: { locale: Locale }) {
  return (
    <section className="cs-trust cs-no-print" aria-label={locale === "vi" ? "Tín nhiệm" : "Credibility"}>
      <div className="cs-container">
        <ul className="cs-trust-grid" role="list">
          {items[locale].map((it, i) => (
            <li
              key={it.figure}
              className="cs-trust-item"
              data-pop=""
              style={{ "--pi": i } as CSSProperties}
            >
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
