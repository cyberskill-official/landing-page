import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { LocalizedString } from "@/lib/i18n/types";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

// A plain-spoken "how we build" page: the method, the quality bar we hold
// ourselves to, how we handle a client's data, and how an engagement runs.
// Everything here is an honest first-person claim about how the team works
// (the same footing as the commitments on the home page), so it can run live
// before any client quote is cleared. It also answers the questions enterprise
// and partner buyers ask before they trust a vendor.

type Block = { title: LocalizedString; points: LocalizedString[] };

const method: Block = {
  title: { en: "The method", vi: "Quy trình" },
  points: [
    { en: "Discover: we start by understanding the goal and the constraints, and ask what success looks like, so the work targets your result and not our assumptions.", vi: "Khám phá: chúng tôi bắt đầu bằng việc hiểu mục tiêu và ràng buộc, và hỏi thế nào là thành công, để công việc nhắm tới kết quả của bạn chứ không phải giả định của chúng tôi." },
    { en: "Shape: we scope the work, plan the path, and design the parts that carry the most risk first. You see the trade-offs in plain language before any code is written.", vi: "Định hình: chúng tôi xác định phạm vi, vạch lộ trình, và thiết kế trước những phần rủi ro nhất. Bạn thấy các đánh đổi bằng lời lẽ dễ hiểu trước khi viết dòng mã nào." },
    { en: "Build: we ship in reviewable increments with CI that fails on regressions. Every change is small enough to read, and you watch the product take shape week by week.", vi: "Xây dựng: chúng tôi giao theo từng phần đủ nhỏ để review, với CI tự chặn lỗi hồi quy. Mỗi thay đổi đủ nhỏ để đọc, và bạn nhìn sản phẩm thành hình theo từng tuần." },
    { en: "Support: after launch we measure, maintain, and improve. We track what matters, fix what breaks, and keep the software healthy so it keeps earning its place.", vi: "Đồng hành: sau khi ra mắt, chúng tôi đo lường, bảo trì và cải thiện. Chúng tôi theo dõi điều quan trọng, sửa chỗ hỏng, và giữ phần mềm khoẻ mạnh để nó tiếp tục xứng đáng." },
  ],
};

const blocks: Block[] = [
  {
    title: { en: "The quality bar we hold ourselves to", vi: "Tiêu chuẩn chất lượng chúng tôi tự đặt ra" },
    points: [
      { en: "Continuous integration that fails on regressions before they reach users", vi: "Tích hợp liên tục tự chặn lỗi hồi quy trước khi tới tay người dùng" },
      { en: "Code review on every change, so no single person is the only one who understands a part", vi: "Review mã trên mọi thay đổi, để không phần nào chỉ một người hiểu" },
      { en: "Automated tests where they earn their keep, not for a vanity number", vi: "Kiểm thử tự động ở nơi nó thật sự xứng đáng, không phải để làm đẹp con số" },
      { en: "Core Web Vitals kept in the green, and accessibility checked rather than assumed", vi: "Giữ Core Web Vitals ở ngưỡng xanh, và kiểm tra khả năng tiếp cận thay vì mặc định" },
    ],
  },
  {
    title: { en: "How we handle your data", vi: "Cách chúng tôi xử lý dữ liệu của bạn" },
    points: [
      { en: "Least-privilege access: we take only the access a task needs, and hand it back cleanly at the end", vi: "Quyền tối thiểu: chúng tôi chỉ nhận đúng quyền một việc cần, và trả lại gọn gàng khi kết thúc" },
      { en: "Secrets stay out of the browser and out of version control, never shipped to the client", vi: "Bí mật nằm ngoài trình duyệt và ngoài hệ quản lý mã nguồn, không bao giờ gửi xuống phía client" },
      { en: "We work in your environment or a clearly scoped one we agree on together", vi: "Chúng tôi làm việc trong môi trường của bạn, hoặc một môi trường có phạm vi rõ ràng do hai bên thống nhất" },
      { en: "A clean handover at the end: code, documentation, and access are yours to keep", vi: "Bàn giao sạch sẽ khi kết thúc: mã nguồn, tài liệu và quyền truy cập đều thuộc về bạn" },
    ],
  },
  {
    title: { en: "How working together runs", vi: "Cách hai bên làm việc cùng nhau" },
    points: [
      { en: "A small, senior team owns your project end to end. You always know who is building what, and why.", vi: "Một đội ngũ nhỏ và giàu kinh nghiệm nhận trọn dự án của bạn, từ đầu đến cuối. Bạn luôn biết ai đang xây phần nào, và vì sao." },
      { en: "We ship in small increments, so you adopt the work without a risky big-bang switch.", vi: "Chúng tôi giao theo từng phần nhỏ, để bạn tiếp nhận mà không phải đánh cược vào một cú chuyển đổi lớn." },
      { en: "We name trade-offs out loud before they cost you, so there are no surprises at delivery.", vi: "Chúng tôi gọi tên mọi đánh đổi trước khi bạn phải trả giá, để lúc bàn giao không còn bất ngờ." },
      { en: "We work in English and Vietnamese, and reply within one business day.", vi: "Chúng tôi làm việc bằng tiếng Anh và tiếng Việt, và phản hồi trong một ngày làm việc." },
    ],
  },
];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return pageMetadata({
    locale,
    path: "/how-we-build",
    title: locale === "vi" ? "Cách chúng tôi xây" : "How we build",
    description:
      locale === "vi"
        ? "Cách CyberSkill làm việc: quy trình từ cuộc gọi đầu đến bản phát hành cuối, tiêu chuẩn chất lượng, cách xử lý dữ liệu, và cách hai bên phối hợp. Minh bạch để bạn tin tưởng trước khi bắt đầu."
        : "How CyberSkill works: the method from first call to last release, the quality bar we hold ourselves to, how we handle your data, and how an engagement runs. The context enterprise and partner buyers want before they commit.",
  });
}

export default async function HowWeBuildPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const t =
    locale === "vi"
      ? {
          eyebrow: "Cách chúng tôi xây",
          title: "Cách chúng tôi xây phần mềm",
          lead: "Một chuỗi bước đơn giản và tử tế, từ cuộc gọi đầu tiên đến bản phát hành cuối cùng, cùng những tiêu chuẩn chúng tôi tự giữ trên suốt chặng đường.",
          cta: "Bắt đầu dự án",
          back: "Về trang chủ",
        }
      : {
          eyebrow: "How we build",
          title: "How we build software",
          lead: "A simple, honest sequence from the first call to the last release, and the standards we hold ourselves to along the way.",
          cta: "Start my project",
          back: "Back home",
        };

  return (
    <section className="cs-section">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: t.eyebrow, path: `/${locale}/how-we-build` },
          ]}
        />
        <p className="cs-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="cs-section-lead">{t.lead}</p>

        <div className="cs-surface-light" style={{ marginTop: "var(--cs-space-12)", maxWidth: "48rem" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{localize(method.title, locale)}</h2>
          <ul className="cs-service-outcomes" role="list">
            {method.points.map((p, i) => (
              <li key={i}>{localize(p, locale)}</li>
            ))}
          </ul>
        </div>

        <div className="cs-services-grid" style={{ marginTop: "var(--cs-space-12)" }}>
          {blocks.map((b) => (
            <article key={localize(b.title, "en")} className="cs-service-card cs-surface-standard">
              <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{localize(b.title, locale)}</h2>
              <ul className="cs-service-outcomes" role="list">
                {b.points.map((p, i) => (
                  <li key={i}>{localize(p, locale)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {t.cta}
          </a>
          <a className="cs-btn" href={`/${locale}`}>
            {t.back}
          </a>
        </div>
      </div>
    </section>
  );
}
