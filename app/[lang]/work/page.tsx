import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { work } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return pageMetadata({
    locale,
    path: "/work",
    title: locale === "vi" ? "Dự án" : "Work",
    description:
      locale === "vi"
        ? "Tuyển chọn dự án CyberSkill đã xây và bàn giao: nền tảng web, ứng dụng di động, cổng thương mại."
        : "Selected CyberSkill projects we built and shipped: web platforms, mobile apps, and commerce portals.",
  });
}

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <section className="cs-section">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Dự án" : "Work", path: `/${locale}/work` },
          ]}
        />
        <p className="cs-eyebrow">{dict.nav.work}</p>
        <h1>{dict.sections.workTitle}</h1>
        <p className="cs-section-lead">{dict.sections.workLead}</p>
        <div className="cs-work-grid">
          {work.map((item) => (
            <article key={item.slug} className="cs-work-card cs-surface-light">
              <p className="cs-eyebrow">{item.client}</p>
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
                <Link className="cs-stretch" href={`/${locale}/work/${item.slug}`}>
                  {localize(item.title, locale)}
                </Link>
              </h2>
              <p>{localize(item.result, locale)}</p>
              <ul className="cs-tag-row" role="list">
                {item.tags.map((t) => (
                  <li key={t} className="cs-tag">{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="cs-section-more">
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {dict.hero.ctaPrimary}
          </a>
        </p>
      </div>
    </section>
  );
}
