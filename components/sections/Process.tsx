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
    lead: "Một trình tự đơn giản và minh bạch: bạn nắm rõ mọi thứ, từ cuộc gọi đầu tiên đến lần phát hành cuối cùng.",
    steps: [
      {
        n: "01",
        title: "Khám phá",
        body: "Chúng tôi bắt đầu bằng việc hiểu mục tiêu và các ràng buộc: thành công trông như thế nào, điều gì không thể xê dịch - để công việc nhắm thẳng vào kết quả của bạn, không phải giả định của chúng tôi.",
      },
      {
        n: "02",
        title: "Định hình",
        body: "Chúng tôi khoanh phạm vi, vạch lộ trình, và thiết kế trước những phần nhiều rủi ro nhất. Bạn thấy rõ các đánh đổi bằng lời lẽ dễ hiểu, trước khi dòng mã đầu tiên được viết.",
      },
      {
        n: "03",
        title: "Xây dựng",
        body: "Chúng tôi bàn giao theo từng phần nhỏ đủ để đọc và review kỹ, với CI tự chặn lỗi hồi quy. Bạn nhìn sản phẩm thành hình theo từng tuần.",
      },
      {
        n: "04",
        title: "Đồng hành",
        body: "Sau khi ra mắt, chúng tôi đo lường, bảo trì và cải tiến: theo dõi điều quan trọng, sửa ngay thứ hỏng, giữ phần mềm luôn khoẻ để nó tiếp tục xứng đáng với chỗ đứng của mình.",
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
