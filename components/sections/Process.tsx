import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Reveal } from "@/components/motion/Reveal";

// How-we-work surface. Bilingual copy lives inline (Record<Locale, ...>) the
// same way Careers does it; this section does not read the shared dictionary.

type Step = { n: string; title: string; body: string };

const content: Record<Locale, { title: string; lead: string; steps: Step[] }> = {
  en: {
    title: "How we work",
    lead: "A simple, honest sequence that keeps you in the loop from the first call to the last release.",
    steps: [
      {
        n: "01",
        title: "Discover",
        body: "We start by understanding the goal and the constraints. We ask what success looks like and what cannot move, so the work targets your result and not our assumptions.",
      },
      {
        n: "02",
        title: "Shape",
        body: "We scope the work, plan the path, and design the parts that carry the most risk first. You see the trade-offs in plain language before any code is written.",
      },
      {
        n: "03",
        title: "Build",
        body: "We ship in reviewable increments with CI that fails on regressions. Every change is small enough to read, and you can watch the product take shape week by week.",
      },
      {
        n: "04",
        title: "Support",
        body: "After launch we measure, maintain, and improve. We track what matters, fix what breaks, and keep the software healthy so it keeps earning its place.",
      },
    ],
  },
  vi: {
    title: "Cách chúng tôi làm việc",
    lead: "Một trình tự đơn giản và minh bạch, giữ bạn nắm rõ mọi thứ từ buổi gọi đầu tiên đến lần phát hành cuối cùng.",
    steps: [
      {
        n: "01",
        title: "Khám phá",
        body: "Chúng tôi bắt đầu bằng việc hiểu mục tiêu và các ràng buộc. Chúng tôi hỏi thành công trông như thế nào và điều gì không thể thay đổi, để công việc hướng tới kết quả của bạn chứ không phải giả định của chúng tôi.",
      },
      {
        n: "02",
        title: "Định hình",
        body: "Chúng tôi xác định phạm vi, vạch lộ trình và thiết kế trước những phần chứa nhiều rủi ro nhất. Bạn thấy rõ các đánh đổi bằng ngôn ngữ dễ hiểu trước khi viết bất kỳ dòng mã nào.",
      },
      {
        n: "03",
        title: "Xây dựng",
        body: "Chúng tôi bàn giao theo từng phần nhỏ có thể review, với CI tự chặn lỗi hồi quy. Mỗi thay đổi đủ nhỏ để đọc được, và bạn thấy sản phẩm thành hình theo từng tuần.",
      },
      {
        n: "04",
        title: "Đồng hành",
        body: "Sau khi ra mắt, chúng tôi đo lường, bảo trì và cải thiện. Chúng tôi theo dõi điều quan trọng, sửa những gì hỏng và giữ cho phần mềm khoẻ mạnh để tiếp tục phát huy giá trị.",
      },
    ],
  },
};

export function Process({ locale }: { locale: Locale; dict: Dictionary }) {
  const c = content[locale];
  return (
    <section id="process" className="cs-section" aria-labelledby="process-title">
      <div className="cs-container">
        <h2 id="process-title" data-mask-reveal="">{c.title}</h2>
        <p className="cs-section-lead" data-mask-reveal="">{c.lead}</p>
        <div className="cs-services-grid">
          {c.steps.map((step, i) => (
            <Reveal as="article" key={step.n} className="cs-service-card cs-surface-standard" delayMs={i * 80}>
              <p className="cs-eyebrow">{step.n}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
