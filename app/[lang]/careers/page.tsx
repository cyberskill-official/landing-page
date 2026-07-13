import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { TalentPoolForm } from "@/components/cta/TalentPoolForm";
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
  const hasNewsletterKey = !!process.env.RESEND_API_KEY;

  const t = locale === "vi"
    ? {
        cultureTitle: "Môi trường và Văn hóa làm việc",
        cultureBody: "Tại CyberSkill, chúng tôi đặt tay nghề và sự tận tâm lên hàng đầu. Đội ngũ của chúng tôi hoàn toàn tinh gọn và chỉ bao gồm các kỹ sư cấp cao (senior+), nơi quyền tự chủ và tinh thần trách nhiệm là tuyệt đối. Chúng tôi làm việc theo mô hình linh hoạt (hybrid), tập trung tại văn phòng Quận 1, TP.HCM cho các buổi thảo luận thiết kế quan trọng, đồng thời duy trì luồng làm việc bất đồng bộ (async-first) để tối đa hóa thời gian tập trung viết code của bạn. Không họp hành vô ích, không báo cáo hình thức – tất cả nỗ lực hướng tới việc bàn giao sản phẩm chất lượng chạy ổn định trên production.",
        processTitle: "Quy trình tuyển dụng chi tiết",
        processBody: "Chúng tôi thiết kế quy trình tuyển dụng minh bạch, nhanh chóng và hướng đến việc đánh giá đúng năng lực kỹ thuật thực tế của bạn:",
        step1: "1. Đánh giá hồ sơ: Chúng tôi tìm kiếm kinh nghiệm thực tiễn qua các dự án thực tế, các repo mã nguồn mở hoặc sản phẩm bạn đã từng xây dựng.",
        step2: "2. Cuộc gọi khám phá (30 phút): Tìm hiểu định hướng công việc của bạn, các kỳ vọng của hai bên và sự tương thích về văn hóa kỹ thuật.",
        step3: "3. Thực hành lập trình cặp (2 giờ): Bạn cùng một kỹ sư trưởng giải quyết một bài toán thực tế (refactor code, tối ưu hiệu năng hoặc viết test) – không có câu hỏi thuật toán mẹo.",
        step4: "4. Trò chuyện đội ngũ (45 phút): Gặp gỡ những thành viên bạn sẽ cùng làm việc hằng ngày để đảm bảo sự gắn kết lâu dài.",
        seniorityTitle: "Ý nghĩa của cấp bậc kỹ thuật tại đây",
        seniorityBody: "Chúng tôi không tuyển vị trí junior hoặc thực tập vì chúng tôi cam kết với khách hàng về một đội ngũ kỹ sư cấp cao đồng hành trực tiếp từ đầu đến cuối. Cấp bậc Senior tại CyberSkill đồng nghĩa với khả năng tự thiết kế giải pháp cho bài toán nghiệp vụ phức tạp, giải trình rõ ràng các đánh đổi công nghệ và hỗ trợ đồng đội. Cấp bậc Staff/Principal Kỹ sư chịu trách nhiệm thiết lập nền tảng kiến trúc hệ thống, xây dựng các cổng kiểm soát CI, duy trì tiêu chuẩn kỹ thuật của studio và trực tiếp chịu trách nhiệm về chất lượng release.",
        toolingTitle: "Công cụ và các cổng kiểm soát bạn sẽ sử dụng",
        toolingBody: "Bạn sẽ làm việc trong một môi trường kỹ thuật hiện đại và được chuẩn hóa cao. Mọi dòng code của bạn trước khi merge đều phải vượt qua hệ thống CI tự động bao gồm: trình biên dịch TypeScript nghiêm ngặt, ESLint kiểm tra cú pháp, bộ kiểm thử Vitest bảo vệ logic nghiệp vụ, công cụ quét axe-core tự động kiểm tra tiếp cận WCAG 2.2 AA trên các route chạy thật, và Lighthouse CI đo lường giới hạn hiệu năng di động (LCP <= 2.5s, CLS <= 0.1).",
        noOpenings: "Hiện tại chúng tôi không có vị trí nào đang mở tuyển. Tuy nhiên, nếu bạn tin rằng tay nghề của mình phù hợp với tiêu chuẩn chất lượng của CyberSkill, hãy gia nhập kho tài năng (talent pool) của chúng tôi. Chúng tôi sẽ ưu tiên liên hệ ngay khi có dự án mới.",
      }
    : {
        cultureTitle: "Engineering Culture & Working Style",
        cultureBody: "At CyberSkill, we prioritize craft and care over corporate churn. We operate as a highly focused, senior-only team where individual autonomy and absolute ownership are default parameters. We work in a hybrid model, centering major architectural alignment discussions at our District 1 office in Ho Chi Minh City, while leveraging asynchronous coordination to protect long blocks of uninterrupted coding time. We skip cosmetic meetings and status reports – our focus is entirely on shipping stable, high-performance systems to production.",
        processTitle: "Our Step-by-Step Recruitment Process",
        processBody: "We keep our hiring process simple, transparent, and focused on evaluating actual software engineering capability rather than rote memorization:",
        step1: "1. Resume & Work Review: We evaluate your practical experience by looking at projects you have shipped, open-source contributions, or real code samples.",
        step2: "2. Technical Discovery Call (30 mins): An informal conversation to align on your career goals, discuss our technical challenges, and ensure cultural fit.",
        step3: "3. Live Practical Pairing (2 hours): You partner with a Lead Engineer to solve a realistic project problem (e.g., refactoring a component or writing unit tests) – no trick puzzles.",
        step4: "4. Final Team Fit (45 mins): A chat with the engineers you will work with daily, ensuring clear mutual alignment.",
        seniorityTitle: "What Technical Seniority Means Here",
        seniorityBody: "We do not hire junior or intern roles because of our quality commitment to clients – senior engineers directly own projects from start to finish. A Senior Engineer at CyberSkill is expected to autonomously translate business requirements into technical solutions, explain trade-offs clearly, and mentor peers. Staff and Principal levels own architectural governance, design the automated CI quality gates, maintain studio-wide standards, and are directly responsible for release quality.",
        toolingTitle: "Our Engineering Stack & Quality Gates",
        toolingBody: "You will develop software in an ecosystem designed to prevent regression and promote quality. Every commit you push must pass automated gates in our CI pipeline: strict TypeScript compilation, ESLint syntax checks, Vitest unit test suites, automated axe-core accessibility scans on served Chrome routes to protect WCAG 2.2 AA targets, and Lighthouse CI metrics assertions preventing LCP > 2.5s or CLS > 0.1.",
        noOpenings: "We currently do not have any open roles. However, if you believe your engineering craft matches the high standards of CyberSkill, please join our talent pool below. We review these submissions first when new project opportunities arise.",
      };

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

        {/* Culture Card (FR-CMS-017 §1.2) */}
        <div className="cs-surface-light cs-prose-card" style={{ maxWidth: "48rem", marginBottom: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.cultureTitle}</h2>
          <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.7", color: "var(--cs-color-text-muted)" }}>{t.cultureBody}</p>
        </div>

        {/* Values Grid */}
        <div className="cs-services-grid" style={{ marginBottom: "var(--cs-space-12)" }}>
          {values[locale].map((v) => (
            <article key={v.title} className="cs-service-card cs-surface-standard">
              <h3 style={{ fontSize: "var(--cs-text-md)", color: "var(--cs-color-primary)", margin: "0 0 var(--cs-space-xs) 0" }}>{v.title}</h3>
              <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>{v.body}</p>
            </article>
          ))}
        </div>

        {/* Seniority Section (FR-CMS-017 §1.2) */}
        <div className="cs-surface-light cs-prose-card" style={{ maxWidth: "48rem", marginBottom: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.seniorityTitle}</h2>
          <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.7", color: "var(--cs-color-text-muted)" }}>{t.seniorityBody}</p>
        </div>

        {/* Tooling/Gates Section (FR-CMS-017 §1.2) */}
        <div className="cs-surface-light cs-prose-card" style={{ maxWidth: "48rem", marginBottom: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.toolingTitle}</h2>
          <p style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.7", color: "var(--cs-color-text-muted)" }}>{t.toolingBody}</p>
        </div>

        {/* Recruitment Process (FR-CMS-017 §1.2) */}
        <div className="cs-surface-light cs-prose-card" style={{ maxWidth: "48rem", marginBottom: "var(--cs-space-12)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{t.processTitle}</h2>
          <p style={{ fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)", marginBottom: "var(--cs-space-md)" }}>{t.processBody}</p>
          <ul className="cs-service-outcomes" role="list" style={{ fontSize: "var(--cs-text-sm)", lineHeight: "1.6" }}>
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
            <li>{t.step4}</li>
          </ul>
        </div>

        {/* Talent Pool & Form (FR-CTA-020) */}
        <div className="cs-contact-form cs-surface-light" style={{ marginTop: "var(--cs-space-12)", maxWidth: "40rem" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
            {locale === "vi" ? "Gia nhập Kho tài năng của CyberSkill" : "Join the Talent Pool"}
          </h2>
          <p style={{ fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)", marginBottom: "var(--cs-space-md)" }}>{t.noOpenings}</p>

          {hasNewsletterKey ? (
            <TalentPoolForm locale={locale} />
          ) : (
            /* Fallback when subscribe service not configured */
            <p style={{ fontSize: "var(--cs-text-sm)", color: "var(--cs-color-text-muted)" }}>
              {locale === "vi"
                ? "Vui lòng liên hệ trực tiếp qua email: hello@cyberskill.vn"
                : "Please reach out directly: hello@cyberskill.vn"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
