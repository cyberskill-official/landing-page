import { siteUrl } from "@/lib/content/site";

export const runtime = "nodejs";

export async function GET() {
  const content = `User-agent: *
Allow: /

# Explicit AI crawler stance (Allow by default, stated deliberately)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# LLM context files (llmstxt.org) — well-known paths, not robots.txt directives.
# Google/Bing validators flag unknown fields as "Syntax not understood".
# https://llmstxt.org/
# ${siteUrl}/llms.txt
# ${siteUrl}/llms-full.txt

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
