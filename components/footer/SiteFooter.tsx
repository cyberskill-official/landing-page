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
          <p className="cs-footer-meta">
            <a href={`mailto:${company.email}`}>{company.email}</a>
            {" · "}
            <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
              {company.phone} ({company.phoneContact})
            </a>
          </p>
          <p className="cs-footer-meta">
            {dict.footer.duns}: {company.duns}
          </p>
        </div>
        <div className="cs-footer-end">
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
