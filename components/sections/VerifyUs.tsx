import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import {
  commercialPolicy,
  getPublishableRegistrationNumber,
} from "@/lib/content/policy";

const ENGINEERING_CLAIMS: { en: string; vi: string; gate: string }[] = [
  {
    en: "Code review on every change",
    vi: "Review mã trên mọi thay đổi",
    gate: "verify",
  },
  {
    en: "CI gates on every push (lint, typecheck, test, build)",
    vi: "Cổng CI trên mọi push (lint, typecheck, test, build)",
    gate: "lint",
  },
  {
    en: "WCAG 2.2 AA accessibility target",
    vi: "Mục tiêu tiếp cận WCAG 2.2 AA",
    gate: "check:a11y:routes",
  },
  {
    en: "Performance budget enforced in CI",
    vi: "Ngân sách hiệu năng được enforce trong CI",
    gate: "budget.json",
  },
  {
    en: "PDPL-aligned data handling (consent + least privilege)",
    vi: "Xử lý dữ liệu theo tinh thần PDPL (đồng ý + quyền tối thiểu)",
    gate: "check:frs",
  },
];

/**
 * FR-CMS-014: Verify-us trust block — only configured, evidenced fields.
 */
export function VerifyUs({
  locale,
  asOf,
}: {
  locale: Locale;
  asOf?: Date | string;
}) {
  const registration = getPublishableRegistrationNumber(
    commercialPolicy,
    asOf ?? new Date(),
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;
  const github = company.profiles?.github;

  const title = locale === "vi" ? "Xác minh chúng tôi" : "Verify us";

  return (
    <aside
      className="cs-verify-us cs-surface-light"
      data-verify-us=""
      aria-labelledby="verify-us-title"
    >
      <h2 id="verify-us-title" style={{ fontSize: "var(--cs-text-xl)" }}>
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
              {/* Static first-party map image — no iframe, no third-party script (FR-CMS-014 §1.1/1.3). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
      <h3 style={{ fontSize: "var(--cs-text-md)", marginTop: "var(--cs-space-md)" }}>
        {locale === "vi"
          ? "Cam kết kỹ thuật có thể kiểm chứng"
          : "Verifiable engineering commitments"}
      </h3>
      <ul className="cs-service-outcomes" role="list" data-engineering-claims="">
        {ENGINEERING_CLAIMS.map((c) => (
          <li key={c.gate} data-gate={c.gate}>
            {locale === "vi" ? c.vi : c.en}{" "}
            <span className="cs-visually-hidden">({c.gate})</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export const verifyUsEngineeringGates = ENGINEERING_CLAIMS.map((c) => c.gate);
