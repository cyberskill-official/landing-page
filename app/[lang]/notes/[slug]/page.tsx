import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { notes } from "@/lib/content/notes";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

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
  const bodyText = localize(post.body, locale);
  const altLocale = locale === "en" ? "vi" : "en";

  return (
    <article className="cs-section">
      <div className="cs-container" style={{ maxWidth: "42rem" }}>
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Góc nhìn" : "Notes", path: `/${locale}/notes` },
            { name: titleText, path: `/${locale}/notes/${slug}` },
          ]}
        />
        
        <header style={{ marginBottom: "var(--cs-space-lg)" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "var(--cs-text-xs)",
            color: "var(--cs-color-text-muted)",
            marginBottom: "var(--cs-space-sm)"
          }}>
            <time dateTime={post.publishedAt}>
              {locale === "vi" ? "Đăng ngày:" : "Published:"} {post.publishedAt}
            </time>
            
            {/* Cross-locale alternate link (FR-CMS-007) */}
            <Link
              href={`/${altLocale}/notes/${slug}`}
              lang={altLocale}
              style={{
                color: "var(--cs-color-primary)",
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              {locale === "vi" ? "English version" : "Bản tiếng Việt"}
            </Link>
          </div>
          
          <h1 style={{
            fontSize: "var(--cs-text-2xl)",
            lineHeight: "1.25",
            margin: "0 0 var(--cs-space-sm) 0",
            color: "var(--cs-color-text-primary)"
          }}>
            {titleText}
          </h1>
        </header>

        {/* Note Body with simple rendering */}
        <div style={{
          fontSize: "var(--cs-text-sm)",
          lineHeight: "1.7",
          color: "var(--cs-color-text-secondary)",
        }}>
          {bodyText.split("\n\n").map((para, i) => (
            <p key={i} style={{ marginBottom: "var(--cs-space-md)" }}>
              {para}
            </p>
          ))}
        </div>

        <footer style={{
          marginTop: "var(--cs-space-xl)",
          paddingTop: "var(--cs-space-md)",
          borderTop: "1px solid var(--cs-color-border)",
          fontSize: "var(--cs-text-xs)",
          color: "var(--cs-color-text-muted)"
        }}>
          <p>
            {locale === "vi" ? "Ký tên bởi:" : "Signed by:"} {post.permission.grantedBy} ({post.permission.reference})
          </p>
        </footer>

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <Link className="cs-btn cs-btn-primary" href={`/${locale}/notes`}>
            {locale === "vi" ? "← Xem tất cả ghi chép" : "← All Notes"}
          </Link>
          <a className="cs-btn" href={`/${locale}#contact`}>
            {dict.hero.ctaPrimary}
          </a>
        </div>
      </div>
    </article>
  );
}
