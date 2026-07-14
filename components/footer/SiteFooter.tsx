import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { MessagingChips } from "@/components/cta/MessagingChips";
import { NewsletterForm } from "@/components/cta/NewsletterForm";

// FR-SEO-019: Label maps for social profile accessible names.
const profileLabels: Record<string, Record<string, string>> = {
  linkedin: { en: "CyberSkill on LinkedIn", vi: "CyberSkill trên LinkedIn" },
  github: { en: "CyberSkill on GitHub", vi: "CyberSkill trên GitHub" },
  zalo: { en: "CyberSkill on Zalo", vi: "CyberSkill trên Zalo" },
  facebook: { en: "CyberSkill on Facebook", vi: "CyberSkill trên Facebook" },
  clutch: { en: "CyberSkill on Clutch", vi: "CyberSkill trên Clutch" },
};

export function SiteFooter({ locale, dict, hasNewsletter }: { locale: Locale; dict: Dictionary; hasNewsletter?: boolean }) {
  const year = new Date().getFullYear();
  const socialProfiles = Object.entries(company.profiles ?? {}).filter(([, url]) => Boolean(url));

  return (
    <footer className="cs-footer cs-no-print">
      <div className="cs-container cs-footer-inner">
        <div>
          <p className="cs-footer-name">{company.legalName}</p>
          <p className="cs-footer-meta">
            {company.address}
          </p>
          <p className="cs-footer-entity" lang={locale}>
            {company.entity[locale]}
          </p>
          <p className="cs-footer-meta">
            <a href={`mailto:${company.email}`}>{company.email}</a>
            {" - "}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
              {company.phone} ({company.phoneContact})
            </a>
          </p>

          {/* FR-SEO-019 §1.3: Config-driven social profile row.
              Hidden entirely when no profiles are configured. */}
          {socialProfiles.length > 0 && (
            <nav
              className="cs-footer-social"
              aria-label={locale === "vi" ? "Mạng xã hội" : "Social profiles"}
            >
              {socialProfiles.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  rel="me noopener"
                  target="_blank"
                  aria-label={profileLabels[key]?.[locale] ?? `CyberSkill on ${key}`}
                  className="cs-footer-social-link"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              ))}
            </nav>
          )}

          {/* FR-CTA-012: Messaging chips — rendered only when configured */}
          <MessagingChips locale={locale} location="footer" />
        </div>
        <div className="cs-footer-end">
          {hasNewsletter && (
            <div className="cs-footer-newsletter" style={{ marginBottom: "var(--cs-space-6)" }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: "var(--cs-text-md)" }}>
                {locale === "vi" ? "Đăng ký nhận bản tin" : "Subscribe to Newsletter"}
              </p>
              <NewsletterForm locale={locale} />
            </div>
          )}
          <nav className="cs-footer-links" aria-label={locale === "vi" ? "Liên kết chân trang" : "Footer links"}>
            <a href={`/${locale}/how-we-build`}>{dict.nav.howWeBuild}</a>
            <a href={`/${locale}/now`}>{locale === "vi" ? "Nhật ký" : "Changelog"}</a>
            <a href={`/${locale}/notes`}>{dict.nav.notes}</a>
            <a href={`/${locale}/privacy`}>{dict.footer.privacy}</a>
            <a href={`/${locale}/accessibility`}>{dict.footer.accessibility}</a>
            <a href={`/${locale}/terms`}>{dict.footer.terms}</a>
          </nav>
          <p>
            © {year} {company.shortName}. {dict.footer.rights}
          </p>
          <p lang={locale === "vi" ? "vi" : "en"} className="cs-footer-slogan">
            {company.slogan[locale]}
          </p>
        </div>
      </div>
    </footer>
  );
}

