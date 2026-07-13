import { NotePost } from "@/lib/content/notes";
import { siteUrl, company } from "@/lib/content/site";
import type { Locale } from "@/lib/i18n/config";
import { localize } from "@/lib/i18n/types";

export function ArticleJsonLd({ post, locale }: { post: NotePost; locale: Locale }) {
  const url = `${siteUrl}/${locale}/notes/${post.slug}`;

  const articleNode = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    isPartOf: {
      "@type": "WebPage",
      "@id": url,
      url,
      name: localize(post.title, locale),
    },
    headline: localize(post.title, locale),
    description: localize(post.summary, locale),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url || company.founder.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: company.shortName,
      logo: `${siteUrl}/apple-icon`,
    },
    mainEntityOfPage: url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleNode) }}
    />
  );
}
