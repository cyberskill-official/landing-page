import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { notes } from "@/lib/content/notes";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { LeadCta } from "@/components/cta/LeadCta";

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  notes.forEach((post) => {
    params.push({ lang: "en", slug: post.slug });
    params.push({ lang: "vi", slug: post.slug });
  });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const post = notes.find((n) => n.slug === slug);
  if (!post) return {};

  const meta = resolveMetadata(locale, `/notes/${slug}`);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        en: `/en/notes/${slug}`,
        vi: `/vi/notes/${slug}`,
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
      url: `/en/notes/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const post = notes.find((n) => n.slug === slug);
  if (!post) {
    notFound();
  }

  const titleText = localize(post.title, locale);
  const tldrText = localize(post.tldr, locale);
  const bodyText = localize(post.body, locale);
  const altLocale = locale === "en" ? "vi" : "en";

  return (
    <article className="cs-section cs-note-detail" suppressHydrationWarning>
      <ArticleJsonLd post={post} locale={locale} />
      <div className="cs-container cs-notes-wrap">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Góc nhìn" : "Notes", path: `/${locale}/notes` },
            { name: titleText, path: `/${locale}/notes/${slug}` },
          ]}
        />

        <header className="cs-note-detail-header">
          <div className="cs-note-detail-meta">
            <time dateTime={post.publishedAt}>
              {locale === "vi" ? "Đăng" : "Published"} {post.publishedAt}
            </time>
            {post.updatedAt !== post.publishedAt && (
              <span>
                · {locale === "vi" ? "Cập nhật" : "Updated"} {post.updatedAt}
              </span>
            )}
            <span className="cs-note-detail-author">
              · {post.author.name}
            </span>
            <Link className="cs-note-detail-lang" href={`/${altLocale}/notes/${slug}`} lang={altLocale}>
              {locale === "vi" ? "English" : "Tiếng Việt"}
            </Link>
          </div>
          <h1>{titleText}</h1>
        </header>

        <aside className="cs-note-tldr" aria-label="TL;DR">
          <p className="cs-eyebrow">{locale === "vi" ? "Tóm tắt" : "TL;DR"}</p>
          <p>{tldrText}</p>
        </aside>

        <div className="cs-note-body cs-prose">
          {bodyText.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <p className="cs-note-signed">
          {locale === "vi" ? "Ký bởi" : "Signed by"} {post.permission.grantedBy} ({post.permission.reference})
        </p>

        <div className="cs-page-cta">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}/notes`}>
            {locale === "vi" ? "← Tất cả ghi chép" : "← All notes"}
          </Link>
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">
            {dict.hero.ctaPrimary}
          </LeadCta>
        </div>
      </div>
    </article>
  );
}
