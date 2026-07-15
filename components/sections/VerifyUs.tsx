import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import {
  commercialPolicy,
  getPublishableRegistrationNumber,
} from "@/lib/content/policy";

/**
 * FR-CMS-014 §1.2–1.3: only claims the repo actually enforces in CI.
 * Each entry's `ciCommand` is the exact `run:` / script token that must appear
 * in `.github/workflows/ci.yml` (not a vague substring match).
 */
export type EngineeringClaim = {
  en: string;
  vi: string;
  /** Short id for data-gate / tests */
  gate: string;
  /** Exact command fragment required in ci.yml (e.g. `npm run lint`) */
  ciCommand: string;
};

export const ENGINEERING_CLAIMS: EngineeringClaim[] = [
  {
    en: "Static import and content integrity check on every push",
    vi: "Kiểm tra import tĩnh và tính toàn vẹn nội dung trên mọi push",
    gate: "verify",
    ciCommand: "npm run verify",
  },
  {
    en: "Lint on every push",
    vi: "Lint trên mọi push",
    gate: "lint",
    ciCommand: "npm run lint",
  },
  {
    en: "Typecheck on every push",
    vi: "Typecheck trên mọi push",
    gate: "typecheck",
    ciCommand: "npm run typecheck",
  },
  {
    en: "Automated unit tests on every push",
    vi: "Kiểm thử đơn vị tự động trên mọi push",
    gate: "test",
    ciCommand: "npm test",
  },
  {
    en: "Served-route axe gate (serious/critical) for accessibility",
    vi: "Cổng axe trên route đã phục vụ (serious/critical) cho tiếp cận",
    gate: "check:a11y:routes",
    ciCommand: "npm run check:a11y:routes",
  },
  {
    en: "Performance budget (LCP) validated in CI",
    vi: "Ngân sách hiệu năng (LCP) được xác thực trong CI",
    gate: "budget.json",
    ciCommand: "lighthouse/budget.json",
  },
];

/**
 * FR-CMS-014: Verify-us trust block — only configured, evidenced fields.
 * `full` (default): page sections e.g. /how-we-build.
 * `compact`: footer-adjacent — denser layout, no map illustration.
 */
export function VerifyUs({
  locale,
  asOf,
  variant = "full",
}: {
  locale: Locale;
  asOf?: Date | string;
  variant?: "full" | "compact";
}) {
  const registration = getPublishableRegistrationNumber(
    commercialPolicy,
    asOf ?? new Date(),
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;
  const github = company.profiles?.github;
  const compact = variant === "compact";

  const title = locale === "vi" ? "Xác minh chúng tôi" : "Verify us";
  const claimsTitle = locale === "vi"
    ? "Cam kết kỹ thuật (CI)"
    : "CI-enforced commitments";
  const howWeBuildHref = `/${locale}/how-we-build`;

  return (
    <aside
      className={`cs-verify-us cs-surface-light${compact ? " cs-verify-us--compact" : ""}`}
      data-verify-us=""
      data-variant={variant}
      aria-labelledby={compact ? "verify-us-title-footer" : "verify-us-title"}
    >
      <h2
        id={compact ? "verify-us-title-footer" : "verify-us-title"}
        className="cs-verify-us-title"
      >
        {title}
      </h2>
      <dl className="cs-verify-us-list">
        <div data-field="legalName">
          <dt>{locale === "vi" ? "Tên pháp lý" : "Legal name"}</dt>
          <dd>{company.legalName}</dd>
        </div>
        <div data-field="founded">
          <dt>{locale === "vi" ? "Thành lập" : "Founded"}</dt>
          <dd>{company.founded}</dd>
        </div>
        <div data-field="duns">
          <dt>DUNS</dt>
          <dd>{company.duns}</dd>
        </div>
        {registration ? (
          <div data-field="registrationNumber">
            <dt>
              {locale === "vi"
                ? "Số đăng ký kinh doanh"
                : "Business registration"}
            </dt>
            <dd>{registration}</dd>
          </div>
        ) : null}
        <div data-field="address">
          <dt>{locale === "vi" ? "Địa chỉ" : "Address"}</dt>
          <dd>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-static-map-link=""
            >
              {!compact && (
                // Static first-party map — no iframe (FR-CMS-014). Compact footer omits image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="cs-verify-map"
                  src="/brand/office-map.svg"
                  alt={
                    locale === "vi"
                      ? `Bản đồ văn phòng: ${company.address}`
                      : `Office map: ${company.address}`
                  }
                  width={320}
                  height={160}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <span className="cs-verify-address-text">{company.address}</span>
            </a>
          </dd>
        </div>
        {github ? (
          <div data-field="repository">
            <dt>{locale === "vi" ? "Kho mã công khai" : "Public repository"}</dt>
            <dd>
              <a href={github} rel="me noopener" target="_blank">
                {github.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {compact ? (
        <details className="cs-verify-us-claims-fold">
          <summary>
            {claimsTitle} · {ENGINEERING_CLAIMS.length}
          </summary>
          <ul className="cs-service-outcomes cs-verify-us-claims" role="list" data-engineering-claims="">
            {ENGINEERING_CLAIMS.map((c) => (
              <li key={c.gate} data-gate={c.gate} data-ci-command={c.ciCommand}>
                {locale === "vi" ? c.vi : c.en}{" "}
                <span className="cs-visually-hidden">({c.ciCommand})</span>
              </li>
            ))}
          </ul>
          <p className="cs-verify-us-more">
            <a href={howWeBuildHref}>
              {locale === "vi" ? "Xem Cách chúng tôi xây" : "See How we build"}
            </a>
          </p>
        </details>
      ) : (
        <>
          <h3 className="cs-verify-us-claims-heading">
            {locale === "vi"
              ? "Cam kết kỹ thuật có thể kiểm chứng trong CI"
              : "Verifiable engineering commitments (CI-enforced)"}
          </h3>
          <ul className="cs-service-outcomes" role="list" data-engineering-claims="">
            {ENGINEERING_CLAIMS.map((c) => (
              <li key={c.gate} data-gate={c.gate} data-ci-command={c.ciCommand}>
                {locale === "vi" ? c.vi : c.en}{" "}
                <span className="cs-visually-hidden">({c.ciCommand})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

export const verifyUsEngineeringGates = ENGINEERING_CLAIMS.map((c) => c.gate);
