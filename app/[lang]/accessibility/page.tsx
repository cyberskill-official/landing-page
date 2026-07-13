import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/accessibility");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; reviewed: string }> = {
  en: {
    title: "Accessibility",
    intro:
      "CyberSkill wants this site to be usable by everyone. We aim to meet WCAG 2.2 level AA, and we treat any gap as something to fix.",
    blocks: [
      {
        h: "What we have done",
        body: [
          "Semantic HTML with clear landmarks and headings, and a skip link to the main content.",
          "Keyboard operation throughout, with a visible focus indicator.",
          "Bilingual content in English and Vietnamese, each with the correct language attribute and its own URL.",
          "Colour contrast aimed at the AA floor, labelled form fields, and accessible names on icon-only controls.",
          "A text-first version of the story at the simplified view, so nothing depends on the animation.",
        ],
      },
      {
        h: "Motion and the 3D scene",
        body: [
          "The golden Lumi scene and subtle motion are decorative enhancement. The page is fully usable without them, and the 3D scene runs on capable desktops only.",
          "Some motion currently plays regardless of the operating-system reduced-motion setting; we are adding a clearer in-page motion control. For now, a simplified, text-first view is available.",
        ],
      },
      {
        h: "Tell us about a problem",
        body: [
          `If something is hard to use, email ${company.email} and we will help. We aim to reply within one business day.`,
        ],
      },
    ],
    reviewed: "Last reviewed 22 June 2026.",
  },
  vi: {
    title: "Khả năng tiếp cận",
    intro:
      "CyberSkill mong muốn mọi người đều dùng được trang này. Chúng tôi hướng tới chuẩn WCAG 2.2 mức AA, và xem mọi thiếu sót là điều cần sửa.",
    blocks: [
      {
        h: "Những gì chúng tôi đã làm",
        body: [
          "HTML ngữ nghĩa với vùng mốc và tiêu đề rõ ràng, kèm liên kết bỏ qua để tới nội dung chính.",
          "Thao tác hoàn toàn bằng bàn phím, với chỉ báo tiêu điểm rõ ràng.",
          "Nội dung song ngữ Anh và Việt, mỗi ngôn ngữ có thuộc tính ngôn ngữ đúng và đường dẫn riêng.",
          "Độ tương phản màu hướng tới ngưỡng AA, các trường biểu mẫu có nhãn, và tên tiếp cận cho các nút chỉ có biểu tượng.",
          "Một phiên bản ưu tiên văn bản cho câu chuyện ở chế độ đơn giản, để không gì phụ thuộc vào hoạt ảnh.",
        ],
      },
      {
        h: "Chuyển động và cảnh 3D",
        body: [
          "Cảnh thần đèn Lumi và các chuyển động nhẹ chỉ là phần nâng cao mang tính trang trí. Trang vẫn dùng được đầy đủ khi không có chúng, và cảnh 3D chỉ chạy trên máy tính để bàn đủ năng lực.",
          "Hiện một số chuyển động vẫn chạy bất kể thiết lập giảm chuyển động của hệ điều hành; chúng tôi đang bổ sung một nút điều khiển chuyển động rõ ràng hơn. Trước mắt đã có phiên bản đơn giản, ưu tiên văn bản.",
        ],
      },
      {
        h: "Báo cho chúng tôi một vấn đề",
        body: [
          `Nếu có gì khó dùng, hãy gửi email tới ${company.email} và chúng tôi sẽ hỗ trợ. Chúng tôi cố gắng phản hồi trong vòng một ngày làm việc.`,
        ],
      },
    ],
    reviewed: "Cập nhật lần cuối ngày 22 tháng 6 năm 2026.",
  },
};

export default async function AccessibilityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section">
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/accessibility` },
          ]}
        />
        <h1>{c.title}</h1>
        <p className="cs-section-lead">{c.intro}</p>
        {c.blocks.map((b) => (
          <div key={b.h} className="cs-case-section">
            <h2>{b.h}</h2>
            {b.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
        <p>
          <Link href={`/${locale}/lite`}>
            {locale === "vi"
              ? "Mở phiên bản đơn giản, ưu tiên văn bản"
              : "Open the simplified, text-first view"}
          </Link>
        </p>
        <p className="cs-footer-meta">{c.reviewed}</p>
        <p className="cs-section-more">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}`}>
            {locale === "vi" ? "Về trang chủ" : "Back home"}
          </Link>
        </p>
      </div>
    </section>
  );
}
