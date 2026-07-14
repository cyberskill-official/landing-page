import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  commercialPolicy,
  getPublishableCapacity,
  getPublishablePartnershipOffer,
} from "@/lib/content/policy";
import { localize } from "@/lib/i18n/types";
import { LeadForm } from "@/components/cta/LeadForm";

/**
 * FR-CMS-019: Partnership offer for agencies and studios abroad.
 * Offer copy from commercial policy SSOT; enquiries use intent=partnership.
 */
export function Partnership({
  locale,
  dict,
  hasNewsletter,
}: {
  locale: Locale;
  dict: Dictionary;
  hasNewsletter?: boolean;
}) {
  const offer = getPublishablePartnershipOffer();
  if (!offer) return null;

  // FR-CMS-019: capacity bullet from commercial policy capacity SSOT (not a
  // rehash of the partnership offer string). Omitted when capacity is stale.
  const capacity = getPublishableCapacity();
  const capacityLine = capacity
    ? locale === "vi"
      ? `Năng lực đối tác: tối đa ${capacity.projectsPerQuarter} dự án mới mỗi quý; suất mở tiếp theo ${localize(capacity.nextOpenSlot, locale)} (chính sách thương mại ${commercialPolicy.decidedOn}).`
      : `Partner capacity: at most ${capacity.projectsPerQuarter} new projects per quarter; next open slot ${localize(capacity.nextOpenSlot, locale)} (commercial policy ${commercialPolicy.decidedOn}).`
    : null;

  const title =
    locale === "vi"
      ? "Hợp tác với agency & studio"
      : "Partnership for agencies & studios";

  const whiteLabel =
    locale === "vi"
      ? "White-label hoặc co-brand: chúng tôi làm việc dưới thương hiệu của bạn khi cần, với NDA và IP thuộc về khách hàng cuối theo hợp đồng."
      : "White-label or co-brand: we work under your brand when needed, with NDA and IP assigned to the end client per contract.";

  const timezone =
    locale === "vi"
      ? "Múi giờ: chồng lấn với châu Á – châu Âu (GMT+7). Giao tiếp trực tiếp với kỹ sư cấp cao tại TP.HCM."
      : "Timezone: overlap with Asia–Europe (GMT+7). Direct communication with senior engineers in Ho Chi Minh City.";

  const howToStart =
    locale === "vi"
      ? "Bắt đầu: gửi yêu cầu hợp tác bên dưới (intent partnership). Chúng tôi phản hồi trong một ngày làm việc."
      : "How to start: send a partnership enquiry below. We reply within one business day.";

  return (
    <section
      id="partnership"
      className="cs-section"
      aria-labelledby="partnership-title"
      data-partnership-section=""
    >
      <div className="cs-container">
        <h2 id="partnership-title" className="cs-kt-h">
          {title}
        </h2>
        <p className="cs-section-lead" data-field="offer">
          {localize(offer, locale)}
        </p>
        <ul className="cs-service-outcomes" role="list">
          {capacityLine ? (
            <li data-field="capacity">{capacityLine}</li>
          ) : null}
          <li data-field="whiteLabel">{whiteLabel}</li>
          <li data-field="timezone">{timezone}</li>
          <li data-field="ndaIp">
            {locale === "vi"
              ? "NDA tiêu chuẩn; IP và mã nguồn thuộc khách hàng theo hợp đồng."
              : "Standard NDA; IP and source code assigned per contract to the client."}
          </li>
          <li data-field="howToStart">{howToStart}</li>
        </ul>
        <div
          className="cs-contact-form cs-surface-light"
          style={{ marginTop: "var(--cs-space-lg)", maxWidth: "32rem" }}
        >
          <LeadForm
            locale={locale}
            dict={dict}
            source="partnership"
            defaultIntent="partnership"
            hasNewsletter={hasNewsletter}
          />
        </div>
        <p className="cs-consent-note" style={{ marginTop: "var(--cs-space-sm)" }}>
          {dict.genie.consent}
        </p>
        <p hidden data-policy-decided-on={commercialPolicy.decidedOn} />
      </div>
    </section>
  );
}
