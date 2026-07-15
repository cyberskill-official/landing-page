import { LeadCta } from "@/components/cta/LeadCta";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { work } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/work");
}
const tagTranslations: Record<string, Record<Locale, string>> = {
  "web-apps": { en: "Web apps", vi: "Ứng dụng web" },
  "mobile-apps": { en: "Mobile apps", vi: "Ứng dụng di động" },
  "internal-systems": { en: "Internal systems", vi: "Hệ thống nội bộ" },
};
export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const t = locale === "vi" 
    ? {
        practicesTitle: "Các mảng dịch vụ chuyên sâu",
        practicesLead: "Chúng tôi tập trung vào 3 mảng kỹ thuật cốt lõi để mang lại hiệu quả kinh tế lớn nhất cho doanh nghiệp:",
        webTitle: "1. Ứng dụng Web Hiệu năng cao",
        webBody: "Chúng tôi xây dựng các cổng thông tin, hệ thống thương mại điện tử, và dashboard quản trị sẵn sàng chịu tải lớn. Ứng dụng được tối ưu hóa SEO tối đa, đạt điểm xanh tuyệt đối trên Core Web Vitals, và tích hợp các header bảo mật để bảo vệ thông tin khách hàng. Sử dụng các framework hiện đại như Next.js giúp tăng tốc độ tải trang lần đầu mà không cần phụ thuộc vào JavaScript phía client.",
        mobileTitle: "2. Ứng dụng Di động Đa nền tảng",
        mobileBody: "Ứng dụng iOS và Android sử dụng một mã nguồn duy nhất nhằm tối ưu hóa chi phí đầu tư nhưng vẫn giữ vững hiệu năng bản địa. Chúng tôi thiết kế hệ thống theo nguyên tắc ngoại tuyến trước (offline-first) để đảm bảo trải nghiệm sử dụng không bao giờ bị đứt quãng ngay cả trong điều kiện mạng chập chờn. Các công cụ kiểm tra độ ổn định và báo cáo lỗi tự động (crash reporting) được kích hoạt từ ngày đầu.",
        internalTitle: "3. Hệ thống phần mềm nội bộ & Tự động hóa",
        internalBody: "Thay thế các bảng tính rời rạc bằng một nguồn dữ liệu duy nhất và chuẩn xác. Chúng tôi số hóa các quy trình vận hành phức tạp, xây dựng các công cụ điều phối, quản trị kho bãi và chuỗi cung ứng được may đo riêng cho đặc thù doanh nghiệp của bạn. Việc này giúp giảm thiểu sai sót do thao tác tay và tiết kiệm hàng chục giờ làm việc mỗi tuần cho đội ngũ.",
        lifecycleTitle: "Mô hình hợp tác và Đồng hành",
        lifecycleBody: "Mỗi dự án tại CyberSkill không bắt đầu từ mã nguồn mà bắt đầu từ việc lắng nghe. Chúng tôi cùng bạn khám phá (Discover) những điểm nghẽn thực tế và thiết lập định nghĩa rõ ràng về thành công. Ở giai đoạn định hình (Shape), chúng tôi chỉ ra các đánh đổi công nghệ bằng ngôn ngữ kinh doanh để bạn làm chủ mọi quyết định. Trong suốt quá trình xây dựng (Build), mã nguồn được bàn giao liên tục theo chu kỳ tuần và được bảo vệ bởi pipeline tích hợp liên tục tự động phát hiện lỗi hồi quy. Cuối cùng, chúng tôi hỗ trợ (Support) và bảo trì dài hạn để đảm bảo hệ thống vận hành trơn tru nhất.",
        outcomesTitle: "Dự án tiêu biểu & Kết quả thực tế",
        outcomesLead: "Những điều ước và bài toán thực tế của khách hàng được chúng tôi hiện thực hóa thành các giải pháp đang chạy thật trên môi trường production:",
      }
    : {
        practicesTitle: "Core Practice Areas",
        practicesLead: "We focus on three technical domains where software engineering makes the biggest business impact:",
        webTitle: "1. High-Performance Web Applications",
        webBody: "We build transactional web portals, e-commerce storefronts, and customer dashboards built to scale. Every application is optimized for search crawlers, maintains Core Web Vitals in the green, and enforces strict security headers to protect sensitive user data. Leveraging modern frameworks like Next.js guarantees fast initial load times without sacrificing client-side responsiveness.",
        mobileTitle: "2. Cross-Platform Mobile Applications",
        mobileBody: "We deliver iOS and Android apps using a single codebase to optimize development budgets, whilst maintaining native execution performance. We design all mobile features offline-first, ensuring users enjoy an uninterrupted experience on the move. Comprehensive crash-monitoring and session analytics are embedded directly into the production builds from day one.",
        internalTitle: "3. Internal Business Systems & Automation",
        internalBody: "We retire disjointed spreadsheets by building centralized, single-source-of-truth operational software. Our custom tooling maps exactly to your business logic, automating inventory tracking, dispatch coordination, and administrative reporting. This eliminates manual data entry mistakes and returns dozens of productive hours back to your staff every week.",
        lifecycleTitle: "Our Collaborative Engagement Lifecycle",
        lifecycleBody: "Engineering at CyberSkill does not start with writing code; it starts with listening. We begin by discovering your bottlenecks and defining measurable success criteria. During the shaping phase, we explain technical trade-offs in plain business language so you can make informed decisions. We build in small, weekly increments, backed by continuous integration pipelines that automatically block code regressions. After launch, we support and maintain the system, keeping it optimized so it continues to justify its place in your operations.",
        outcomesTitle: "Featured Projects & Measured Outcomes",
        outcomesLead: "How we turn complex business challenges and software wishes into production systems with verified, approved results:",
      };

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Dự án" : "Work", path: `/${locale}/work` },
          ]}
        />
        <p className="cs-eyebrow">{dict.nav.work}</p>
        <h1>{dict.sections.workTitle}</h1>
        <p className="cs-section-lead">{dict.sections.workLead}</p>

        {/* Practice Areas (TASK-CMS-017 §1.1) */}
        <div style={{ marginTop: "var(--cs-space-12)", maxWidth: "48rem" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.practicesTitle}</h2>
          <p style={{ color: "var(--cs-color-text-muted)", marginBottom: "var(--cs-space-lg)" }}>{t.practicesLead}</p>
          
          <div className="cs-services-grid" style={{ marginBottom: "var(--cs-space-12)" }}>
            <article className="cs-service-card cs-surface-standard">
              <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-color-primary)" }}>{t.webTitle}</h3>
              <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>{t.webBody}</p>
            </article>
            <article className="cs-service-card cs-surface-standard">
              <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-color-primary)" }}>{t.mobileTitle}</h3>
              <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>{t.mobileBody}</p>
            </article>
            <article className="cs-service-card cs-surface-standard">
              <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-color-primary)" }}>{t.internalTitle}</h3>
              <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>{t.internalBody}</p>
            </article>
          </div>
        </div>

        {/* Lifecycle (TASK-CMS-017 §1.1) */}
        <div className="cs-surface-light cs-prose-card" style={{ maxWidth: "48rem", marginBottom: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.lifecycleTitle}</h2>
          <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.7", color: "var(--cs-color-text-muted)" }}>{t.lifecycleBody}</p>
        </div>

        {/* Outcomes List (TASK-CMS-017 §1.1) */}
        <div style={{ marginTop: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.outcomesTitle}</h2>
          <p style={{ color: "var(--cs-color-text-muted)", marginBottom: "var(--cs-space-lg)" }}>{t.outcomesLead}</p>

          <div className="cs-work-grid">
            {work.map((item) => (
              <article key={item.slug} className="cs-work-card cs-surface-light">
                <p className="cs-eyebrow">{localize(item.client, locale)}</p>
                <h3 style={{ fontSize: "var(--cs-text-xl)", margin: "0 0 var(--cs-space-xs) 0" }}>
                  <Link className="cs-stretch" href={`/${locale}/work/${item.slug}`}>
                    {localize(item.title, locale)}
                  </Link>
                </h3>
                <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>{localize(item.result, locale)}</p>
                <ul className="cs-tag-row" role="list" style={{ marginTop: "auto" }}>
                  {item.tags.map((t) => (
                    <li key={t} className="cs-tag">
                      {tagTranslations[t]?.[locale] ?? t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <p className="cs-section-more" style={{ marginTop: "var(--cs-space-12)" }}>
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">{dict.hero.ctaPrimary}</LeadCta>
        </p>
      </div>
    </section>
  );
}
