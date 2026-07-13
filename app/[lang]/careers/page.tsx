import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LeadForm } from "@/components/cta/LeadForm";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/careers");
}

const values: Record<Locale, { title: string; body: string }[]> = {
  en: [
    { title: "Craft over churn", body: "Small senior team, real ownership, no busywork. We ship things we are proud of." },
    { title: "Honest about trade-offs", body: "We say what is hard and why. Clients and teammates both get the truth." },
    { title: "Grow on real work", body: "You learn by building production software with people who review carefully." },
  ],
  vi: [
    { title: "Tay nghề hơn số lượng", body: "Đội ngũ nhỏ, giàu kinh nghiệm, có quyền tự chủ thật sự, không việc cho có. Chúng tôi tự hào về sản phẩm mình làm." },
    { title: "Thẳng thắn về đánh đổi", body: "Chúng tôi nói rõ điều gì khó và vì sao. Khách hàng và đồng đội đều nhận được sự thật." },
    { title: "Trưởng thành qua việc thật", body: "Bạn học bằng cách xây phần mềm chạy thật, cùng những người review kỹ lưỡng." },
  ],
};

export default async function CareersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <section className="cs-section">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Tuyển dụng" : "Careers", path: `/${locale}/careers` },
          ]}
        />
        <p className="cs-eyebrow">{dict.nav.careers}</p>
        <h1>{dict.sections.careersTitle}</h1>
        <p className="cs-section-lead">{dict.sections.careersLead}</p>

        <div className="cs-services-grid">
          {values[locale].map((v) => (
            <article key={v.title} className="cs-service-card cs-surface-standard">
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{v.title}</h2>
              <p>{v.body}</p>
            </article>
          ))}
        </div>

        <div className="cs-contact-form cs-surface-light" style={{ marginTop: "var(--cs-space-12)", maxWidth: "40rem" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
            {locale === "vi" ? "Gửi hồ sơ hoặc lời giới thiệu" : "Introduce yourself"}
          </h2>
          <LeadForm locale={locale} dict={dict} source="careers" />
          <p className="cs-consent-note">
            {dict.genie.consent}{" "}
            <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
              {dict.footer.privacy}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
