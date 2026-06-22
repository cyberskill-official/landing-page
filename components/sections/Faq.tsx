import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

// Visible FAQ. The first three pairs MUST stay in sync with
// components/seo/HomeFaqJsonLd.tsx so the page and the structured data agree.
// The last two pairs are honest extras not (yet) mirrored in the JSON-LD.

const faq: Record<Locale, { q: string; a: string }[]> = {
  en: [
    { q: "What does CyberSkill do?", a: "We are a software solutions consultancy. We build web applications, mobile applications, and internal software systems." },
    { q: "Where is CyberSkill based?", a: `We are based in ${company.city}, ${company.country}, and work with clients in Vietnam and internationally.` },
    { q: "How do I start a project?", a: `Send a short note through the contact form or chat with Lumi. We reply within one business day. You can also email ${company.email}.` },
    { q: "How fast do you reply?", a: "Within one business day. If the request is clear, you will usually hear back from a person, not an autoresponder." },
    { q: "Do you work with international clients?", a: "Yes. We work in English and Vietnamese, and we are used to working across time zones." },
  ],
  vi: [
    { q: "CyberSkill làm gì?", a: "Chúng tôi là công ty tư vấn giải pháp phần mềm. Chúng tôi xây dựng ứng dụng web, ứng dụng di động và hệ thống phần mềm nội bộ." },
    { q: "CyberSkill đặt trụ sở ở đâu?", a: `Chúng tôi đặt tại ${company.city}, ${company.country}, làm việc với khách hàng trong nước và quốc tế.` },
    { q: "Làm sao để bắt đầu một dự án?", a: `Gửi một lời nhắn ngắn qua biểu mẫu liên hệ hoặc trò chuyện với Lumi. Chúng tôi phản hồi trong vòng một ngày làm việc. Bạn cũng có thể gửi email tới ${company.email}.` },
    { q: "Bạn phản hồi nhanh thế nào?", a: "Trong vòng một ngày làm việc. Nếu yêu cầu đã rõ ràng, thường sẽ có người trả lời bạn, không phải thư tự động." },
    { q: "Bạn có làm việc với khách hàng quốc tế không?", a: "Có. Chúng tôi làm việc bằng tiếng Anh và tiếng Việt, và đã quen làm việc qua nhiều múi giờ." },
  ],
};

export function Faq({ locale }: { locale: Locale }) {
  const title = locale === "vi" ? "Giải đáp thắc mắc" : "Questions, answered";
  return (
    <section id="faq" className="cs-section cs-section-alt" aria-labelledby="faq-title">
      <div className="cs-container">
        <h2 id="faq-title">{title}</h2>
        <ul className="cs-faq-list" role="list">
          {faq[locale].map((item) => (
            <li key={item.q} className="cs-faq-item cs-surface-standard">
              <details>
                <summary>
                  <h3>{item.q}</h3>
                </summary>
                <p>{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
