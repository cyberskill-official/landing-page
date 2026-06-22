import type { Locale } from "@/lib/i18n/config";
import { company, services } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";

// OfferCatalog of CyberSkill services as structured, citable data for search and
// AI answer engines (FR-SEO-007 GEO). Built from the same service facts the DOM
// Services section renders, and provided by the Organization node emitted by
// OrganizationJsonLd, so the structured and prose forms agree.
export function ServicesJsonLd({ locale }: { locale: Locale }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  const data = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: locale === "vi" ? "Dịch vụ CyberSkill" : "CyberSkill services",
    url: `${base}/${locale}#services`,
    inLanguage: locale === "vi" ? "vi-VN" : "en",
    provider: { "@id": `${base}/#organization` },
    itemListElement: services.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: localize(s.title, locale),
        description: localize(s.summary, locale),
        areaServed: "Worldwide",
        provider: { "@id": `${base}/#organization` },
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
