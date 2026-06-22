import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

const faq: Record<Locale, { q: string; a: string }[]> = {
  en: [
    { q: "What does CyberSkill do?", a: "We are a software solutions consultancy. We build web applications, mobile applications, and internal software systems." },
    { q: "Where is CyberSkill based?", a: `We are based in ${company.city}, ${company.country}, and work with clients in Vietnam and internationally.` },
    { q: "How do I start a project?", a: `Send a short note through the contact form or chat with Lumi. We reply within one business day. You can also email ${company.email}.` },
  ],
  vi: [
    { q: "CyberSkill làm gì?", a: "Chúng tôi là công ty tư vấn giải pháp phần mềm. Chúng tôi xây dựng ứng dụng web, ứng dụng di động và hệ thống phần mềm nội bộ." },
    { q: "CyberSkill đặt trụ sở ở đâu?", a: `Chúng tôi đặt tại ${company.city}, ${company.country}, làm việc với khách hàng trong nước và quốc tế.` },
    { q: "Làm sao để bắt đầu một dự án?", a: `Gửi một lời nhắn ngắn qua biểu mẫu liên hệ hoặc trò chuyện với Lumi. Chúng tôi phản hồi trong vòng một ngày làm việc. Bạn cũng có thể gửi email tới ${company.email}.` },
  ],
};

export function HomeFaqJsonLd({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq[locale].map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
