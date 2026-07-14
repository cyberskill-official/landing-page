import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/terms");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; updated: string }> = {
  en: {
    title: "Terms of Service",
    intro: `These terms govern your use of the ${company.shortName} website. By accessing this site, you agree to these terms.`,
    blocks: [
      {
        h: "1. Contracting Entity",
        body: [
          `These terms are between you and ${company.legalName}, a software company based at ${company.address}.`,
          `Registration detail: DUNS number ${company.duns}. For any legal or operational enquiry, contact us at ${company.email}.`,
        ],
      },
      {
        h: "2. Website Usage",
        body: [
          "You agree to use this site only for lawful purposes, such as researching our services, reading our case studies, subscribing to our newsletter, or contacting our team.",
          "You must not attempt to disrupt site operations, inject malicious code, or scrape content without prior permission.",
        ],
      },
      {
        h: "3. Intellectual Property",
        body: [
          "All content on this site—including text, layout designs, case studies, graphics, and our interactive mascot Lumi—is the exclusive intellectual property of CyberSkill.",
          "You are granted a limited license to view and share links to this site. You may not reproduce, copy, or distribute our design tokens, shaders, code, or brand assets without our written consent.",
        ],
      },
      {
        h: "4. Lumi Chat Agent & Data Transfers",
        body: [
          "Our interactive assistant, Lumi, uses large language models to help you learn about CyberSkill. By interacting with Lumi, you acknowledge and agree that your messages are processed by our AI provider (Anthropic, LLC in the United States).",
          "This constitutes a cross-border data transfer to the United States. Please do not input sensitive personal data, secrets, or proprietary business details in the chat window, as transcripts are saved for quality audit purposes.",
        ],
      },
      {
        h: "5. Limitation of Liability",
        body: [
          "This website and the Lumi assistant are provided 'as is' without warranties of any kind. CyberSkill does not guarantee uninterrupted operation or that all information is free from minor errors.",
          "In no event shall CyberSkill or its team be liable for any indirect, incidental, or consequential damages arising from your use or inability to use this website.",
        ],
      },
      {
        h: "6. Governing Law",
        body: [
          "These terms are governed by and construed in accordance with the laws of the Socialist Republic of Vietnam.",
          "Any dispute arising from these terms or your use of the website shall be resolved exclusively in the competent courts of Ho Chi Minh City.",
        ],
      },
    ],
    updated: "Last updated 14 July 2026.",
  },
  vi: {
    title: "Điều khoản dịch vụ",
    intro: `Các điều khoản này điều chỉnh việc bạn sử dụng website của ${company.shortName}. Bằng cách truy cập trang này, bạn đồng ý với các điều khoản.`,
    blocks: [
      {
        h: "1. Đơn vị hợp đồng",
        body: [
          `Các điều khoản này là thoả thuận giữa bạn và ${company.legalName}, một doanh nghiệp phần mềm tại địa chỉ ${company.address}.`,
          `Thông tin đăng ký: mã DUNS ${company.duns}. Mọi yêu cầu pháp lý hoặc vận hành, vui lòng liên hệ ${company.email}.`,
        ],
      },
      {
        h: "2. Sử dụng website",
        body: [
          "Bạn đồng ý chỉ sử dụng website này cho các mục đích hợp pháp, như tìm hiểu dịch vụ, xem các dự án nghiên cứu tình huống, đăng ký nhận tin tức, hoặc liên hệ với chúng tôi.",
          "Bạn không được cố ý làm gián đoạn hoạt động của trang web, tải lên mã độc hoặc khai thác dữ liệu mà không có sự cho phép trước.",
        ],
      },
      {
        h: "3. Sở hữu trí tuệ",
        body: [
          "Toàn bộ nội dung trên trang này—bao gồm văn bản, thiết kế bố cục, nghiên cứu dự án, đồ họa và linh vật hoạt họa Lumi—là tài sản sở hữu trí tuệ độc quyền của CyberSkill.",
          "Bạn được cấp quyền hạn chế để xem và chia sẻ liên kết tới trang này. Bạn không được tái bản, sao chép hoặc phân phối các token thiết kế, mã shader, code nguồn hoặc tài sản thương hiệu mà không có sự đồng ý bằng văn bản của chúng tôi.",
        ],
      },
      {
        h: "4. Trò chuyện với Lumi & Chuyển dữ liệu",
        body: [
          "Trợ lý ảo Lumi sử dụng các mô hình ngôn ngữ lớn để hỗ trợ bạn tìm hiểu về CyberSkill. Khi trò chuyện với Lumi, bạn xác nhận và đồng ý rằng tin nhắn của bạn sẽ được xử lý bởi đối tác AI của chúng tôi (Anthropic, LLC tại Hoa Kỳ).",
          "Đây là hoạt động chuyển dữ liệu qua biên giới sang Hoa Kỳ. Vui lòng không nhập dữ liệu cá nhân nhạy cảm, thông tin bí mật hoặc bí mật kinh doanh vào khung chat, do nội dung trò chuyện được lưu lại để kiểm tra chất lượng.",
        ],
      },
      {
        h: "5. Giới hạn trách nhiệm",
        body: [
          "Website này và trợ lý ảo Lumi được cung cấp trên cơ sở 'nguyên trạng' mà không có bất kỳ sự đảm bảo nào. CyberSkill không cam kết hoạt động không gián đoạn hoặc không có lỗi nhỏ.",
          "Trong mọi trường hợp, CyberSkill hoặc đội ngũ của chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng website này.",
        ],
      },
      {
        h: "6. Luật điều chỉnh",
        body: [
          "Các điều khoản này được điều chỉnh và giải thích theo pháp luật của Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
          "Mọi tranh chấp phát sinh từ các điều khoản này hoặc việc sử dụng website sẽ được giải quyết duy nhất tại các tòa án có thẩm quyền tại Thành phố Hồ Chí Minh.",
        ],
      },
    ],
    updated: "Cập nhật lần cuối ngày 14 tháng 7 năm 2026.",
  },
};

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/terms` },
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
            {locale === "vi" ? "Quay lại trang chủ" : "Back home"}
          </Link>
        </p>
      </div>
    </section>
  );
}
