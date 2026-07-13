import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import { company, clientLogos, industriesServed } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
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
              // The reveal observer (MotionExtras) flips data-pop to "shown"
              // once in view. TrustBand sits just under the hero, so on a
              // streamed hydrate the observer can mark it shown before React
              // hydrates this node - a benign attribute-only mismatch. Suppress
              // it so the reveal stays decorative and the console stays clean.
              suppressHydrationWarning
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

        {/* Client Logos / Industries Served (FR-CMS-013) */}
        {clientLogos.length >= 3 ? (
          <div className="cs-logo-strip" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "var(--cs-space-lg)",
            flexWrap: "wrap",
            marginTop: "var(--cs-space-md)",
            opacity: 0.6,
            filter: "grayscale(100%)",
          }}>
            {clientLogos.map((logo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={logo.name}
                src={logo.logoUrl}
                alt={logo.name}
                title={logo.name}
                width={120}
                height={40}
                style={{ objectFit: "contain", maxHeight: "30px" }}
              />
            ))}
          </div>
        ) : (
          <p className="cs-trust-industries" style={{
            textAlign: "center",
            marginTop: "var(--cs-space-md)",
            color: "var(--cs-color-fg-muted)",
            fontSize: "var(--cs-text-sm)",
            fontStyle: "italic"
          }}>
            {localize(industriesServed, locale)}
          </p>
        )}
      </div>
    </section>
  );
}
