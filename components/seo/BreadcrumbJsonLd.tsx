import { company } from "@/lib/content/site";

// Emits BreadcrumbList structured data for sub-pages (research doc §E SEO/GEO:
// give crawlers and AI answer engines explicit structure). TASK-SEO-003.
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
