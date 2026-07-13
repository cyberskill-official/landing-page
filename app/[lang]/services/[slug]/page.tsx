import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { services, work, company, siteUrl, testimonials, serviceDetails } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

// One detail page per service (web-apps, mobile-apps, internal-systems), per
// locale. The copy is honest and capability-level: no invented client names,
// logos, or metrics. Titles and descriptions are written for the searches
// buyers actually use, so these pages give the site real entry points from
// organic search without overpromising.

export function generateStaticParams() {
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.id })));
}

import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, `/services/${slug}`);
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const service = services.find((s) => s.id === slug);
  const detail = serviceDetails[slug];
  if (!service || !detail) {
    notFound();
  }

  const base = siteUrl;
  // Related work: engagements tagged with this service, linked for internal
  // discovery (and honest proof that the practice is real).
  const related = work.filter((w) => w.tags.includes(slug));

  // FR-SEO-015: Map rated testimonials to Review and AggregateRating entities
  const ratedTestimonials = testimonials.filter((t) => typeof t.rating === "number");

  const reviews = ratedTestimonials.map((t) => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": t.author,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": t.rating,
      "bestRating": 5,
    },
    "reviewBody": localize(t.quote, locale),
  }));

  const aggregateRating = ratedTestimonials.length > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": ratedTestimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / ratedTestimonials.length,
    "reviewCount": ratedTestimonials.length,
  } : undefined;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localize(detail.metaTitle, locale),
    serviceType: localize(service.title, locale),
    description: localize(detail.metaDescription, locale),
    inLanguage: locale === "vi" ? "vi-VN" : "en",
    url: `${base}/${locale}/services/${slug}`,
    // Resolve to the single Organization node emitted by OrganizationJsonLd.
    provider: { "@type": "Organization", "@id": `${base}/#organization`, name: company.shortName },
    areaServed: [
      { "@type": "Country", name: "Vietnam" },
      { "@type": "AdministrativeArea", name: "Ho Chi Minh City" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${base}/${locale}#contact`,
    },
    ...(reviews.length > 0 ? { review: reviews } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
  };

  // FR-SEO-016: Service-specific FAQPage JSON-LD schema
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: detail.faqs.map((f) => ({
      "@type": "Question",
      name: localize(f.q, locale),
      acceptedAnswer: {
        "@type": "Answer",
        text: localize(f.a, locale),
      },
    })),
  };

  const labels =
    locale === "vi"
      ? {
          eyebrow: "Dịch vụ",
          forWho: "Dành cho ai",
          scope: "Phạm vi công việc",
          process: "Quy trình làm việc",
          timeline: "Thời gian thực hiện",
          engagement: "Mô hình hợp tác",
          stack: "Công nghệ cốt lõi",
          faqSection: "Câu hỏi thường gặp",
          related: "Dự án liên quan",
          cta: "Bắt đầu dự án",
          how: "Cách chúng tôi làm việc",
          back: "Xem tất cả dịch vụ",
          summary: "Tóm tắt dịch vụ",
          problem: "Vấn đề giải quyết",
          approach: "Phương pháp triển khai",
          ctaNotice: "Cam kết hành động",
        }
      : {
          eyebrow: "Service",
          forWho: "Who it is for",
          scope: "Scope of work",
          process: "The process",
          timeline: "Typical timeline",
          engagement: "Engagement models",
          stack: "Core stack",
          faqSection: "Frequently Asked Questions",
          related: "Related work",
          cta: "Start my project",
          how: "How we build",
          back: "See all services",
          summary: "Service Summary",
          problem: "Problems Solved",
          approach: "Our Engineering Approach",
          ctaNotice: "Action Promise",
        };

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: labels.eyebrow, path: `/${locale}#services` },
            { name: localize(service.title, locale), path: `/${locale}/services/${slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />

        <p className="cs-eyebrow">{labels.eyebrow}</p>
        <h1>{localize(service.title, locale)}</h1>
        <p className="cs-section-lead">{localize(detail.lead, locale)}</p>

        <div className="cs-surface-light cs-prose-card" style={{ marginTop: "var(--cs-space-12)", maxWidth: "48rem" }}>
          {/* FR-CMS-005: Summary */}
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.summary}</h2>
          <p>{localize(detail.summary, locale)}</p>

          {/* FR-CMS-005: Problem */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.problem}</h2>
          <p>{localize(detail.problem, locale)}</p>

          {/* Who it is for */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.forWho}</h2>
          <p>{localize(detail.forWho, locale)}</p>

          {/* Scope of Work */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.scope}</h2>
          <p>{localize(detail.scopeIntro, locale)}</p>
          <ul className="cs-service-outcomes" role="list" style={{ listStyleType: "none", paddingLeft: 0 }}>
            {detail.scopeItems.map((item, i) => (
              <li key={i} style={{ marginBottom: "var(--cs-space-4)" }}>
                <strong>{localize(item.title, locale)}:</strong> {localize(item.description, locale)}
              </li>
            ))}
          </ul>

          {/* FR-CMS-005: Approach */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.approach}</h2>
          <p>{localize(detail.approach, locale)}</p>

          {/* Core Stack */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.stack}</h2>
          <p>{localize(detail.stack, locale)}</p>

          {/* The Process */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.process}</h2>
          <p>{localize(detail.processIntro, locale)}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--cs-space-4)", marginTop: "var(--cs-space-4)" }}>
            {detail.processSteps.map((step, i) => (
              <div key={i} style={{ paddingLeft: "var(--cs-space-4)", borderLeft: "2px solid var(--cs-color-gold)" }}>
                <strong style={{ display: "block" }}>{localize(step.title, locale)}</strong>
                <span style={{ fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)" }}>{localize(step.body, locale)}</span>
              </div>
            ))}
          </div>

          {/* Typical Timeline */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.timeline}</h2>
          <p>{localize(detail.timeline, locale)}</p>

          {/* Engagement Models (optional range block absent per BIZ approvals status) */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.engagement}</h2>
          <p>{localize(detail.engagementIntro, locale)}</p>

          {/* FR-CMS-005: Call to Action Promise */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.ctaNotice}</h2>
          <p>{localize(detail.cta, locale)}</p>

          {/* Service FAQs */}
          <h2 style={{ fontSize: "var(--cs-text-xl)", marginTop: "var(--cs-space-8)" }}>{labels.faqSection}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--cs-space-4)", marginTop: "var(--cs-space-4)" }}>
            {detail.faqs.map((faq, i) => (
              <details key={i} className="cs-faq-details" style={{ padding: "var(--cs-space-3)", border: "1px solid var(--cs-color-border)", borderRadius: "4px" }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>{localize(faq.q, locale)}</summary>
                <p style={{ marginTop: "var(--cs-space-2)", fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)" }}>
                  {localize(faq.a, locale)}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Related Work */}
        {related.length > 0 ? (
          <div style={{ marginTop: "var(--cs-space-12)" }}>
            <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.related}</h2>
            <ul className="cs-tag-row" role="list">
              {related.map((w) => (
                <li key={w.slug} className="cs-tag">
                  <a href={`/${locale}/work/${w.slug}`}>{localize(w.title, locale)}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {labels.cta}
          </a>
          <a className="cs-btn" href={`/${locale}/how-we-build`}>
            {labels.how}
          </a>
          <a className="cs-btn" href={`/${locale}#services`}>
            {labels.back}
          </a>
        </div>
      </div>
    </section>
  );
}
