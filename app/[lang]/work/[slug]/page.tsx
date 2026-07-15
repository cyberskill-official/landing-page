import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { work, caseStudyDetails, company, siteUrl } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LeadCta } from "@/components/cta/LeadCta";

// One detail page per work item per locale. The narrative below is deliberately
// generic and honest: no invented client names, exact percentages, or logos.
// Outcomes stay qualitative, matching the cleared copy in lib/content/site.ts.

export function generateStaticParams() {
  return locales.flatMap((lang) => work.map((item) => ({ lang, slug: item.slug })));
}

import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, `/work/${slug}`);
}

const tagTranslations: Record<string, Record<Locale, string>> = {
  "web-apps": { en: "Web apps", vi: "Ứng dụng web" },
  "mobile-apps": { en: "Mobile apps", vi: "Ứng dụng di động" },
  "internal-systems": { en: "Internal systems", vi: "Hệ thống nội bộ" },
};

export default async function WorkDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const item = work.find((w) => w.slug === slug);
  if (!item) {
    notFound();
  }
  const study = caseStudyDetails.find((d) => d.slug === item.slug);

  const base = siteUrl;
  const published = "2026-06-22";
  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: localize(item.title, locale),
    headline: localize(item.title, locale),
    description: localize(item.result, locale),
    inLanguage: locale === "vi" ? "vi-VN" : "en",
    url: `${base}/${locale}/work/${item.slug}`,
    keywords: item.tags.join(", "),
    datePublished: published,
    dateModified: published,
    author: { "@type": "Organization", "@id": `${base}/#organization`, name: company.shortName },
    publisher: { "@id": `${base}/#organization` },
  };

  const labels =
    locale === "vi"
      ? {
          challenge: "Thách thức",
          approach: "Việc chúng tôi đã làm",
          outcome: "Kết quả",
          techStack: "Công nghệ sử dụng",
          metricsTitle: "Chỉ số kết quả",
          clientQuote: "Đánh giá từ khách hàng",
          anonymized: "Mô hình ẩn danh",
          cta: "Bắt đầu dự án",
          back: "Quay lại danh sách dự án"
        }
      : {
          challenge: "The challenge",
          approach: "What we did",
          outcome: "The outcome",
          techStack: "Tech stack",
          metricsTitle: "Measured outcomes",
          clientQuote: "Client feedback",
          anonymized: "Anonymized pattern",
          cta: "Start my project",
          back: "Back to work"
        };

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Dự án" : "Work", path: `/${locale}/work` },
            { name: localize(item.title, locale), path: `/${locale}/work/${item.slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }}
        />
        
        {/* Client identity: handles NDA vs Public Client name */}
        <p className="cs-eyebrow">
          {study?.isNda
            ? (study.ndaMeta ? localize(study.ndaMeta, locale) : localize(item.client, locale))
            : (study?.clientName || localize(item.client, locale))}
        </p>

        <h1>{localize(item.title, locale)}</h1>
        <p className="cs-section-lead">{localize(item.result, locale)}</p>
        
        {/* Category tags localized (TASK-CMS-011 §1.5) */}
        <ul className="cs-tag-row" role="list">
          {item.tags.map((t) => (
            <li key={t} className="cs-tag">
              {tagTranslations[t]?.[locale] ?? t}
            </li>
          ))}
        </ul>

        {study ? (
          <div className="cs-prose-container" style={{ marginTop: "var(--cs-space-12)", maxWidth: "44rem" }}>
            
            {/* Anonymized pattern banner if zero metrics are present (TASK-CMS-011 §1.2) */}
            {(!study.metrics || study.metrics.length === 0) && (
              <div className="cs-anonymized-pattern-banner cs-surface-solid" style={{ padding: "1rem", borderRadius: "var(--cs-radius-md)", marginBottom: "2rem", borderLeft: "4px solid var(--cs-ochre)" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{labels.anonymized}</p>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "var(--cs-text-sm)", color: "var(--cs-text-muted)" }}>
                  {locale === "vi"
                    ? "Dự án này được mô tả dưới dạng mô hình ẩn danh do thỏa thuận bảo mật (NDA). Mọi chi tiết kỹ thuật và quy trình đều là thực tế."
                    : "This project is presented as an anonymized pattern due to non-disclosure agreements (NDA). All engineering and process details are real."}
                </p>
              </div>
            )}

            <div className="cs-surface-light cs-prose-card">
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.challenge}</h2>
              <p>{localize(study.challenge, locale)}</p>
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.approach}</h2>
              <p>{localize(study.approach, locale)}</p>
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.outcome}</h2>
              <p>{localize(study.outcome, locale)}</p>
            </div>

            {/* Tech stack list */}
            {study.techStack && study.techStack.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-text-muted)", marginBottom: "0.5rem" }}>{labels.techStack}</h3>
                <ul className="cs-tag-row" role="list">
                  {study.techStack.map((tech) => (
                    <li key={tech} className="cs-tag cs-tag-tech" style={{ background: "var(--cs-surface-light)", border: "1px solid var(--cs-border)" }}>{tech}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metrics band (TASK-CMS-011 §1.1, §1.3) */}
            {study.metrics && study.metrics.length > 0 && (
              <div style={{ marginTop: "2.5rem" }}>
                <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-text-muted)", marginBottom: "1rem" }}>{labels.metricsTitle}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "1rem" }}>
                  {study.metrics.map((m, idx) => (
                    <div key={idx} className="cs-metric-card cs-surface-solid" style={{ padding: "1.25rem", borderRadius: "var(--cs-radius-md)", display: "flex", flexDirection: "column" }}>
                      <span className="cs-metric-value" style={{ fontSize: "var(--cs-text-2xl)", fontWeight: "bold", color: "var(--cs-ochre)", lineHeight: 1 }}>{m.value}</span>
                      <span className="cs-metric-label" style={{ fontSize: "var(--cs-text-sm)", fontWeight: "500", marginTop: "0.5rem" }}>{localize(m.label, locale)}</span>
                      <span className="cs-metric-source" style={{ fontSize: "var(--cs-text-xs)", color: "var(--cs-text-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                        Source: {localize(m.source, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client quote (TASK-CMS-011 §1.1) */}
            {study.quote && (
              <blockquote className="cs-blockquote" style={{ borderLeft: "4px solid var(--cs-ochre)", paddingLeft: "1.25rem", margin: "2.5rem 0", fontStyle: "italic" }}>
                <p style={{ fontSize: "var(--cs-text-lg)", marginBottom: "0.5rem" }}>&ldquo;{localize(study.quote.text, locale)}&rdquo;</p>
                <cite style={{ fontStyle: "normal", fontSize: "var(--cs-text-sm)", color: "var(--cs-text-muted)" }}>
                  <strong>{study.quote.author}</strong> — {localize(study.quote.role, locale)}, {study.quote.company}
                </cite>
              </blockquote>
            )}

            {/* Screenshots (TASK-CMS-011 §1.1, §1.4) */}
            {study.screenshots && study.screenshots.length > 0 && (
              <div style={{ marginTop: "2.5rem" }}>
                {study.screenshots.map((s, idx) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={idx}
                    src={s.url}
                    alt={localize(s.alt, locale)}
                    loading="lazy"
                    style={{ width: "100%", height: "auto", borderRadius: "var(--cs-radius-md)", marginTop: "1rem", border: "1px solid var(--cs-border)" }}
                  />
                ))}
              </div>
            )}

          </div>
        ) : null}

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">{labels.cta}</LeadCta>
          <a className="cs-btn" href={`/${locale}/work`}>
            {labels.back}
          </a>
        </div>
      </div>
    </section>
  );
}
