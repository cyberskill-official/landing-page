import { notes } from "@/lib/content/notes";
import { siteUrl, company } from "@/lib/content/site";
import { isLocale } from "@/lib/i18n/config";
import { localize } from "@/lib/i18n/types";

export const runtime = "nodejs";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "vi" }];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";

  // Filter out drafts and sort newest first
  const publishedNotes = notes
    .filter((n) => !n.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const feedUrl = `${siteUrl}/${locale}/feed.xml`;
  const channelTitle =
    locale === "vi"
      ? "Góc nhìn kỹ thuật — CyberSkill"
      : "Engineering Insights — CyberSkill";
  const channelDesc =
    locale === "vi"
      ? "Chia sẻ kinh nghiệm thực tế về tối ưu hiệu năng, xây dựng tính năng tiếp cận và thiết lập kiến trúc CI tại studio."
      : "Practical thoughts on automating build quality gates, preventing code regression, and accessibility standards.";

  const itemsXml = publishedNotes
    .map((post) => {
      const itemUrl = `${siteUrl}/${locale}/notes/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      const title = localize(post.title, locale);
      const description = localize(post.summary, locale);

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <author>${company.email} (${post.permission.grantedBy})</author>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>${siteUrl}/${locale}/notes</link>
    <description>${channelDesc}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
