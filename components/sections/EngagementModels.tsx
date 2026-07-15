import type { Locale } from "@/lib/i18n/config";
import {
  commercialPolicy,
  getPublishableEngagementModels,
} from "@/lib/content/policy";
import { localize, type LocalizedString } from "@/lib/i18n/types";
import { LeadCta } from "@/components/cta/LeadCta";

/** Non-price descriptive copy keyed by model English name (SSOT for ranges is policy). */
const modelCopy: Record<
  string,
  { fits: LocalizedString; what: LocalizedString }
> = {
  "Dedicated Senior Team": {
    what: {
      en: "A senior engineering pod embedded with your product leadership.",
      vi: "Một đội kỹ sư cấp cao gắn với lãnh đạo sản phẩm của bạn.",
    },
    fits: {
      en: "Best for continuous product delivery and roadmap ownership.",
      vi: "Phù hợp khi cần giao liên tục và đồng sở hữu lộ trình sản phẩm.",
    },
  },
  "Fixed-Scope Delivery": {
    what: {
      en: "A defined outcome delivered end-to-end against an agreed scope.",
      vi: "Một kết quả xác định, bàn giao trọn gói theo phạm vi đã thống nhất.",
    },
    fits: {
      en: "Best for a clear project with known boundaries and success criteria.",
      vi: "Phù hợp dự án có ranh giới và tiêu chí thành công rõ ràng.",
    },
  },
};

/**
 * TASK-CTA-017: Engagement models and price signals from commercial policy SSOT.
 * Owner approved two models (not three archetypes in the draft task prose).
 */
export function EngagementModels({ locale }: { locale: Locale }) {
  const models = getPublishableEngagementModels();
  if (!models || models.length === 0) return null;

  const title =
    locale === "vi" ? "Mô hình hợp tác" : "Engagement models";
  const lead =
    locale === "vi"
      ? "Hai cách làm việc chúng tôi thực sự cung cấp — khoảng bắt đầu và thời gian điển hình từ chính sách thương mại đã duyệt."
      : "Two ways we actually work — starting ranges and typical timelines from the approved commercial policy.";
  const ctaLabel =
    locale === "vi" ? "Trao đổi về mô hình này" : "Talk about this model";

  return (
    <section
      id="engagement"
      className="cs-section cs-section-alt"
      aria-labelledby="engagement-title"
      data-engagement-models=""
    >
      <div className="cs-container">
        <h2 id="engagement-title" className="cs-kt-h">
          {title}
        </h2>
        <p className="cs-section-lead">{lead}</p>
        <div className="cs-services-grid">
          {models.map((m) => {
            const key = m.name.en;
            const copy = modelCopy[key];
            return (
              <article
                key={key}
                className="cs-service-card cs-surface-standard"
                data-engagement-model={key}
              >
                <h3>{localize(m.name, locale)}</h3>
                <p data-field="what">
                  {copy ? localize(copy.what, locale) : localize(m.name, locale)}
                </p>
                <p data-field="fits">
                  {copy
                    ? localize(copy.fits, locale)
                    : locale === "vi"
                      ? "Phù hợp đội ngũ cần năng lực kỹ sư cấp cao."
                      : "Fits teams that need senior engineering capacity."}
                </p>
                <p data-field="range">
                  <strong>{localize(m.range, locale)}</strong>
                </p>
                <p data-field="timeline">{localize(m.timeline, locale)}</p>
                <LeadCta className="cs-btn cs-btn-secondary" flow="contact" showSparkle={false}>
                  {ctaLabel}
                </LeadCta>
              </article>
            );
          })}
        </div>
        <p className="cs-section-lead" style={{ marginTop: "var(--cs-space-md)" }}>
          <a href={`/${locale}#faq`}>
            {locale === "vi" ? "Xem thêm trong FAQ" : "See also the FAQ"}
          </a>
        </p>
      </div>
    </section>
  );
}

// Re-export policy decided-on for tests that check review date presence.
export const engagementPolicyDecidedOn = commercialPolicy.decidedOn;
