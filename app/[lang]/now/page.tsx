import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { changelog } from "@/lib/content/changelog";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LeadCta } from "@/components/cta/LeadCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const meta = resolveMetadata(locale, "/now");
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        en: `/en/now`,
        vi: `/vi/now`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/en/now`,
      type: "website",
    },
  };
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container" style={{ maxWidth: "42rem" }}>
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Nhật ký" : "Changelog", path: `/${locale}/now` },
          ]}
        />
        <p className="cs-eyebrow">{locale === "vi" ? "TIẾN ĐỘ & PHÁT HÀNH" : "SHIPPED HISTORY"}</p>
        <h1>{locale === "vi" ? "Chúng tôi đang làm gì lúc này" : "What we are doing now"}</h1>
        <p className="cs-section-lead" style={{ marginBottom: "var(--cs-space-12)" }}>
          {locale === "vi"
            ? "Báo cáo tiến độ phát triển thực tế, các tính năng và cột mốc kỹ thuật đã bàn giao trực tiếp tại studio TP.HCM."
            : "A public, reverse-chronological timeline of features, structural upgrades, and verified updates shipped in Saigon."}
        </p>

        <div className="cs-changelog-timeline" style={{
          position: "relative",
          paddingLeft: "var(--cs-space-lg)",
          borderLeft: "2px solid var(--cs-color-border)",
        }}>
          {changelog.map((entry) => (
            <article key={entry.date + localize(entry.title, "en")} style={{
              position: "relative",
              marginBottom: "var(--cs-space-12)"
            }}>
              {/* Timeline dot */}
              <div style={{
                position: "absolute",
                left: "calc(-1 * var(--cs-space-lg) - 7px)",
                top: "6px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--cs-color-primary)",
                border: "2px solid var(--cs-color-bg)",
              }} />
              
              <time style={{
                display: "inline-block",
                fontSize: "var(--cs-text-xs)",
                fontWeight: "bold",
                color: "var(--cs-color-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--cs-space-2xs)",
              }}>
                {entry.date}
              </time>
              
              <h2 style={{
                fontSize: "var(--cs-text-lg)",
                margin: "0 0 var(--cs-space-sm) 0",
                color: "var(--cs-color-text-primary)"
              }}>
                {localize(entry.title, locale)}
              </h2>
              
              <ul className="cs-service-outcomes" role="list" style={{
                fontSize: "var(--cs-text-sm)",
                lineHeight: "1.6",
                color: "var(--cs-color-text-muted)"
              }}>
                {entry.items.map((item, index) => (
                  <li key={index}>{localize(item, locale)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">{dict.hero.ctaPrimary}</LeadCta>
          <Link className="cs-btn" href={`/${locale}`}>
            {locale === "vi" ? "Quay lại" : "Back Home"}
          </Link>
        </div>
      </div>
    </section>
  );
}
