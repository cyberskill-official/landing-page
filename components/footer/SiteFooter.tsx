import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
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

        </div>
        <div className="cs-footer-end">
          <nav className="cs-footer-links" aria-label={locale === "vi" ? "Liên kết chân trang" : "Footer links"}>
            <a href={`/${locale}/how-we-build`}>{locale === "vi" ? "Cách chúng tôi xây" : "How we build"}</a>
            <a href={`/${locale}/privacy`}>{dict.footer.privacy}</a>
            <a href={`/${locale}/accessibility`}>{dict.footer.accessibility}</a>
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
