import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/privacy");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; updated: string }> = {
  en: {
    title: "Privacy",
    intro: `This explains what ${company.shortName} collects on this site, why, and how to reach us. We keep it short and we do not sell your data.`,
    blocks: [
      {
        h: "Who we are",
        body: [`${company.legalName}, ${company.address}. DUNS ${company.duns}. Contact: ${company.email}.`],
      },
      {
        h: "What we collect",
        body: [
          "Contact form: your name, work email, optional company, your message, the enquiry type, and your consent.",
          "Lumi chat: the messages you send and Lumi's replies. Please do not share secrets or sensitive data in chat.",
          "Usage analytics: anonymous, first-party events such as page views and button clicks. No cookies and no cross-site tracking.",
        ],
      },
      {
        h: "Consent and Tracking Tags",
        body: [
          "No third-party tracking, marketing pixels, or analytics cookies are loaded by default. The site is cookieless-first.",
          "Any optional tags (such as Google Analytics 4) will only load if you explicitly grant consent through our consent options. They are deferred until interaction and strictly opt-in.",
        ],
      },
      {
        h: "Why we collect it",
        body: ["To reply to your enquiry, follow up about your project, and improve the site. We ask for your consent before you submit the form."],
      },
      {
        h: "Who processes it",
        body: [
          "Chat messages are sent to our AI provider (Anthropic, LLC in the United States) to generate replies. This constitutes a cross-border data transfer, which we disclose at the point of use before you start the chat. The site hosting is provided by Vercel. If you ask us to, we may add your details to our customer records. We do not sell your data.",
        ],
      },
      {
        h: "Retention and your rights",
        body: [
          `We keep enquiry and chat records only as long as needed to follow up and for our records. You can ask us to access, correct, or delete your data at any time by emailing ${company.email}.`,
          "Your theme and language preferences are stored locally in your browser only, not on our servers.",
        ],
      },
    ],
    updated: "Last updated 13 July 2026.",
  },
  vi: {
    title: "Quyền riêng tư",
    intro: `Trang này giải thích ${company.shortName} thu thập gì trên website, vì sao, và cách liên hệ với chúng tôi. Chúng tôi giữ ngắn gọn và không bán dữ liệu của bạn.`,
    blocks: [
      {
        h: "Chúng tôi là ai",
        body: [`${company.legalName}, ${company.address}. DUNS ${company.duns}. Liên hệ: ${company.email}.`],
      },
      {
        h: "Chúng tôi thu thập gì",
        body: [
          "Biểu mẫu liên hệ: tên, email công việc, công ty (không bắt buộc), lời nhắn, loại yêu cầu, và sự đồng ý của bạn.",
          "Trò chuyện với Lumi: các tin nhắn bạn gửi và câu trả lời của Lumi. Vui lòng không chia sẻ thông tin bí mật hay nhạy cảm trong khung chat.",
          "Phân tích sử dụng: các sự kiện ẩn danh, thuộc bên thứ nhất như lượt xem trang và lượt nhấn nút. Không dùng cookie và không theo dõi xuyên trang.",
        ],
      },
      {
        h: "Đồng ý và Thẻ theo dõi",
        body: [
          "Không có trình theo dõi của bên thứ ba, pixel tiếp thị, hoặc cookie phân tích nào được tải theo mặc định. Website này ưu tiên không sử dụng cookie.",
          "Bất kỳ thẻ tùy chọn nào (như Google Analytics 4) sẽ chỉ tải nếu bạn đồng ý rõ ràng thông qua tùy chọn đồng ý của chúng tôi. Chúng tôi trì hoãn tải cho đến khi có tương tác và hoàn toàn dựa trên sự chọn lựa tự nguyện.",
        ],
      },
      {
        h: "Vì sao chúng tôi thu thập",
        body: ["Để phản hồi yêu cầu, theo dõi dự án của bạn, và cải thiện website. Chúng tôi xin sự đồng ý của bạn trước khi bạn gửi biểu mẫu."],
      },
      {
        h: "Ai xử lý dữ liệu",
        body: [
          "Tin nhắn trò chuyện được gửi tới nhà cung cấp AI của chúng tôi (Anthropic, LLC tại Hoa Kỳ) để tạo câu trả lời. Đây là hoạt động chuyển dữ liệu qua biên giới, được chúng tôi thông báo rõ tại điểm sử dụng trước khi bạn bắt đầu trò chuyện. Website được lưu trữ trên Vercel. Nếu bạn yêu cầu, chúng tôi có thể thêm thông tin của bạn vào hồ sơ khách hàng. Chúng tôi không bán dữ liệu của bạn.",
        ],
      },
      {
        h: "Lưu trữ và quyền của bạn",
        body: [
          `Chúng tôi chỉ giữ hồ sơ yêu cầu và trò chuyện trong thời gian cần thiết để theo dõi và lưu trữ. Bạn có thể yêu cầu xem, sửa hoặc xoá dữ liệu của mình bất cứ lúc nào bằng cách gửi email tới ${company.email}.`,
          "Tuỳ chọn giao diện và ngôn ngữ chỉ được lưu trong trình duyệt của bạn, không lưu trên máy chủ của chúng tôi.",
        ],
      },
    ],
    updated: "Cập nhật lần cuối ngày 13 tháng 7 năm 2026.",
  },
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/privacy` },
          ]}
        />
        <h1>{c.title}</h1>
        <p className="cs-section-lead">{c.intro}</p>
        <p className="cs-privacy-entity">{company.entity[locale]}</p>
        {c.blocks.map((b) => (
          <div key={b.h} className="cs-case-section">
            <h2>{b.h}</h2>
            {b.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
        <p className="cs-footer-meta">{c.updated}</p>
        <p className="cs-section-more">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}`}>
            {locale === "vi" ? "Về trang chủ" : "Back home"}
          </Link>
        </p>
      </div>
    </section>
  );
}
