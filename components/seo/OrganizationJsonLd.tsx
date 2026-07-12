import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

// Organization + WebSite structured data. A <canvas> is invisible to crawlers
// and AI answer engines, so the meaningful facts must live in the DOM and in
// JSON-LD (research doc §E SEO/GEO).
export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: company.shortName,
        legalName: company.legalName,
        url,
        foundingDate: String(company.founded),
        slogan: company.slogan[locale],
        email: company.email,
        telephone: company.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward",
          addressLocality: company.city,
          addressCountry: "VN",
        },
        identifier: { "@type": "PropertyValue", propertyID: "DUNS", value: company.duns },
        areaServed: "Worldwide",
        knowsAbout: ["Web applications", "Mobile applications", "Internal software systems"],
        knowsLanguage: ["en", "vi"],
        // A raster brand mark (the gold Lumi orb) - Google shows this as the
        // organization logo in search results and the Knowledge Panel.
        logo: `${url}/apple-icon`,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: company.phone,
          email: company.email,
          areaServed: "Worldwide",
          availableLanguage: ["en", "vi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: company.shortName,
        inLanguage: locale === "vi" ? "vi-VN" : "en",
        publisher: { "@id": `${url}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
