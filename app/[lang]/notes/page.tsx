import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { notes } from "@/lib/content/notes";
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
  const meta = resolveMetadata(locale, "/notes");
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        en: `/en/notes`,
        vi: `/vi/notes`,
      },
      types: {
        "application/rss+xml": [
          {
            url: `/${locale}/feed.xml`,
            title: locale === "vi" ? "Góc nhìn kỹ thuật — CyberSkill" : "Engineering Insights — CyberSkill",
          },
        ],
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/en/notes`,
      type: "website",
    },
  };
}

export default async function NotesListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <section className="cs-section cs-notes-page" suppressHydrationWarning>
      <div className="cs-container cs-notes-wrap">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Góc nhìn" : "Notes", path: `/${locale}/notes` },
          ]}
        />
        <header className="cs-notes-header">
          <p className="cs-eyebrow">{locale === "vi" ? "Góc nhìn kỹ thuật" : "Engineering insights"}</p>
          <h1>{locale === "vi" ? "Ghi chép kỹ thuật" : "Engineering Notes"}</h1>
          <p className="cs-section-lead">
            {locale === "vi"
              ? "Chia sẻ thực tế về cổng chất lượng CI, Core Web Vitals và tiêu chuẩn tiếp cận tại studio."
              : "Practical notes on CI quality gates, Core Web Vitals, and accessibility standards at the studio."}
          </p>
        </header>

        <ul className="cs-notes-list" role="list">
          {notes.map((post) => (
            <li key={post.slug}>
              <article className="cs-note-card">
                <time className="cs-note-card-date" dateTime={post.publishedAt}>
                  {post.publishedAt}
                </time>
                <h2 className="cs-note-card-title">
                  <Link href={`/${locale}/notes/${post.slug}`}>{localize(post.title, locale)}</Link>
                </h2>
                <p className="cs-note-card-summary">{localize(post.summary, locale)}</p>
                <Link className="cs-note-card-more" href={`/${locale}/notes/${post.slug}`}>
                  {locale === "vi" ? "Đọc bài →" : "Read note →"}
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <div className="cs-page-cta">
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">
            {dict.hero.ctaPrimary}
          </LeadCta>
        </div>
      </div>
    </section>
  );
}
