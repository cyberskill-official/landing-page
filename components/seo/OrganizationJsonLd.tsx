import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

// Organization + WebSite structured data. A <canvas> is invisible to crawlers
// and AI answer engines, so the meaningful facts must live in the DOM and in
// JSON-LD (research doc §E SEO/GEO).
//
// TASK-SEO-019: enriched with sameAs (config-driven), founder (Person node),
// and LocalBusiness/ProfessionalService sub-type with geo + opening hours.
export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;

  // TASK-SEO-019 §1.2: only emit URLs that are actually configured.
  const profileUrls = Object.values(company.profiles ?? {}).filter(Boolean);
  const sameAs = profileUrls.length > 0 ? profileUrls : undefined;

  const organizationNode: Record<string, unknown> = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${url}/#organization`,
    name: company.shortName,
    legalName: company.legalName,
    url,
    foundingDate: String(company.founded),
    slogan: company.slogan[locale],
    description: company.entity[locale],
    email: company.email,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward",
      addressLocality: company.city,
      addressCountry: "VN",
      postalCode: "700000",
    },
    // TASK-SEO-019: geo + opening hours for LocalBusiness disambiguation.
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.geo.lat,
      longitude: company.geo.lng,
    },
    openingHoursSpecification: company.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    })),
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
    // TASK-SEO-019 §1.1: sameAs only when profiles are configured.
    ...(sameAs ? { sameAs } : {}),
    // TASK-SEO-019 §1.1: founder as a Person node.
    founder: {
      "@type": "Person",
      name: company.founder.name,
      url: company.founder.url,
    },
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode,
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
