import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { notes } from "@/lib/content/notes";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

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
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container" style={{ maxWidth: "48rem" }}>
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Góc nhìn" : "Notes", path: `/${locale}/notes` },
          ]}
        />
        <p className="cs-eyebrow">{locale === "vi" ? "GÓC NHÌN & CHIA SẺ" : "ENGINEERING INSIGHTS"}</p>
        <h1>{locale === "vi" ? "Ghi chép kỹ thuật" : "Engineering Notes"}</h1>
        <p className="cs-section-lead" style={{ marginBottom: "var(--cs-space-12)" }}>
          {locale === "vi"
            ? "Chia sẻ kinh nghiệm thực tế về tối ưu hiệu năng, xây dựng tính năng tiếp cận và thiết lập kiến trúc CI tại studio."
            : "Practical thoughts on automating build quality gates, preventing code regression, and accessibility standards."}
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--cs-space-lg)"
        }}>
          {notes.map((post) => (
            <article key={post.slug} className="cs-surface-light cs-prose-card" style={{
              padding: "var(--cs-space-lg)",
              borderRadius: "var(--cs-radius-md)",
              border: "1px solid var(--cs-color-border)",
            }}>
              <time style={{
                fontSize: "var(--cs-text-xs)",
                color: "var(--cs-color-primary)",
                fontWeight: "bold"
              }}>
                {post.publishedAt}
              </time>
              
              <h2 style={{
                fontSize: "var(--cs-text-lg)",
                margin: "var(--cs-space-2xs) 0 var(--cs-space-sm) 0"
              }}>
                <Link href={`/${locale}/notes/${post.slug}`} style={{
                  color: "var(--cs-color-text-primary)",
                  textDecoration: "none"
                }} className="cs-hover-link">
                  {localize(post.title, locale)}
                </Link>
              </h2>
              
              <p style={{
                fontSize: "var(--cs-text-sm)",
                lineHeight: "1.6",
                color: "var(--cs-color-text-muted)",
                margin: "0 0 var(--cs-space-md) 0"
              }}>
                {localize(post.summary, locale)}
              </p>
              
              <Link href={`/${locale}/notes/${post.slug}`} style={{
                fontSize: "var(--cs-text-sm)",
                fontWeight: "bold",
                color: "var(--cs-color-primary)",
                textDecoration: "none"
              }}>
                {locale === "vi" ? "Đọc bài viết →" : "Read note →"}
              </Link>
            </article>
          ))}
        </div>

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {dict.hero.ctaPrimary}
          </a>
          <Link className="cs-btn" href={`/${locale}`}>
            {locale === "vi" ? "Quay lại" : "Back Home"}
          </Link>
        </div>
      </div>
    </section>
  );
}
