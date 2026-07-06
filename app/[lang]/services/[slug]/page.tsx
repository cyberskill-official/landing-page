import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { services, work, company, siteUrl } from "@/lib/content/site";
import { localize, type LocalizedString } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

// One detail page per service (web-apps, mobile-apps, internal-systems), per
// locale. The copy is honest and capability-level: no invented client names,
// logos, or metrics. Titles and descriptions are written for the searches
// buyers actually use, so these pages give the site real entry points from
// organic search without overpromising.

type ServiceDetail = {
  // SEO title/description target real buyer queries (kept natural, not stuffed).
  metaTitle: LocalizedString;
  metaDescription: LocalizedString;
  lead: LocalizedString;
  forWho: LocalizedString;
  whatYouGet: LocalizedString[];
  howWeBuild: LocalizedString[];
  stack: LocalizedString;
};

const details: Record<string, ServiceDetail> = {
  "web-apps": {
    metaTitle: {
      en: "Web application development",
      vi: "Phát triển ứng dụng web",
    },
    metaDescription: {
      en: "CyberSkill builds production web applications - dashboards, customer portals, commerce, and internal platforms - that ship on time, scale, and stay maintainable. A senior team in Ho Chi Minh City, working with clients in Vietnam and abroad.",
      vi: "CyberSkill xây ứng dụng web sẵn sàng vận hành: dashboard, cổng khách hàng, thương mại điện tử và nền tảng nội bộ, giao đúng hẹn, mở rộng tốt và dễ bảo trì. Đội ngũ giàu kinh nghiệm tại TP. Hồ Chí Minh, làm việc với khách hàng trong nước và quốc tế.",
    },
    lead: {
      en: "We design and build web applications that carry real work: dashboards, customer portals, commerce, and the internal platforms a company runs on. They ship on time, hold up as your users grow, and stay readable long after launch.",
      vi: "Chúng tôi thiết kế và xây ứng dụng web gánh được việc thật: dashboard, cổng khách hàng, thương mại điện tử và nền tảng nội bộ mà cả công ty dựa vào. Sản phẩm giao đúng hẹn, đứng vững khi lượng người dùng tăng, và vẫn dễ đọc dễ sửa lâu sau ngày ra mắt.",
    },
    forWho: {
      en: "For teams that have outgrown spreadsheets or an aging site, founders who need a real product rather than a throwaway prototype, and companies that want a platform their own team can keep running.",
      vi: "Dành cho đội ngũ đã vượt quá sức chứa của bảng tính hay một trang web cũ kỹ, cho nhà sáng lập cần một sản phẩm thật thay vì bản mẫu dùng một lần, và cho doanh nghiệp muốn một nền tảng mà chính đội của mình vận hành được.",
    },
    whatYouGet: [
      { en: "A fast, accessible interface with Core Web Vitals kept in the green", vi: "Giao diện nhanh, tiếp cận được, giữ Core Web Vitals ở ngưỡng xanh" },
      { en: "A codebase your team can read, extend, and hire against", vi: "Mã nguồn đội bạn đọc được, mở rộng được, và tuyển người theo được" },
      { en: "Continuous integration that fails on regressions before users see them", vi: "Tích hợp liên tục (CI) tự chặn lỗi hồi quy trước khi người dùng gặp phải" },
      { en: "A handover with documentation, so nothing depends on us staying", vi: "Bàn giao kèm tài liệu, để không việc gì phụ thuộc vào việc chúng tôi ở lại" },
    ],
    howWeBuild: [
      { en: "We map the real workflow with the people who use it, and agree what success looks like before any code is written", vi: "Chúng tôi vẽ lại quy trình thật cùng những người trực tiếp dùng, và thống nhất thế nào là thành công trước khi viết dòng mã nào" },
      { en: "We ship in small increments, so you adopt the product without a risky big-bang switch", vi: "Chúng tôi giao theo từng phần nhỏ, để bạn tiếp nhận sản phẩm mà không phải đánh cược vào một cú chuyển đổi lớn" },
      { en: "We name trade-offs in plain language before they cost you", vi: "Chúng tôi gọi tên mọi đánh đổi bằng lời lẽ dễ hiểu, trước khi bạn phải trả giá" },
      { en: "We wire metrics in from day one, so speed and stability are numbers you can watch", vi: "Chúng tôi gắn chỉ số ngay từ đầu, để tốc độ và độ ổn định là những con số bạn tự quan sát được" },
    ],
    stack: {
      en: "Typical stack: React and Next.js with TypeScript, a SQL or document database sized to the data, and cloud hosting on the platform that suits you. We pick proven, well-supported tools over novelty, and we tell you why.",
      vi: "Công nghệ thường dùng: React và Next.js với TypeScript, cơ sở dữ liệu SQL hoặc document phù hợp với dữ liệu, và hạ tầng đám mây trên nền tảng hợp với bạn. Chúng tôi chọn công cụ đã được kiểm chứng và hỗ trợ tốt thay vì cái mới lạ, và nói rõ vì sao.",
    },
  },
  "mobile-apps": {
    metaTitle: {
      en: "Mobile app development (iOS and Android)",
      vi: "Phát triển ứng dụng di động (iOS và Android)",
    },
    metaDescription: {
      en: "CyberSkill builds iOS and Android apps - one codebase where it fits, native where it counts - with analytics and crash reporting wired in from day one. A senior team in Ho Chi Minh City serving clients in Vietnam and abroad.",
      vi: "CyberSkill xây ứng dụng iOS và Android: dùng chung một mã nguồn khi phù hợp, thuần native khi cần, với phân tích và báo cáo sự cố gắn sẵn từ ngày đầu. Đội ngũ giàu kinh nghiệm tại TP. Hồ Chí Minh, phục vụ khách hàng trong nước và quốc tế.",
    },
    lead: {
      en: "We build mobile apps people rely on when they are away from a desk: on both stores, dependable where the signal is weak, and instrumented so you can see how the app behaves in the real world.",
      vi: "Chúng tôi xây ứng dụng di động mà người ta tin dùng khi rời khỏi bàn làm việc: có mặt trên cả hai store, đáng tin cả nơi sóng yếu, và được đo đạc để bạn thấy ứng dụng vận hành thực tế ra sao.",
    },
    forWho: {
      en: "For products that need to work on the move, teams launching a member or field app, and businesses that want a mobile experience their customers keep on their phones.",
      vi: "Dành cho sản phẩm cần chạy khi di chuyển, cho đội ngũ ra mắt ứng dụng cho hội viên hay nhân sự hiện trường, và cho doanh nghiệp muốn một trải nghiệm di động khách hàng giữ lại trên máy.",
    },
    whatYouGet: [
      { en: "Store-ready builds for the App Store and Google Play, with release pipelines set up", vi: "Bản dựng sẵn sàng lên App Store và Google Play, kèm quy trình phát hành đã dựng" },
      { en: "Offline-friendly behaviour where the connection is unreliable", vi: "Hoạt động tốt khi ngoại tuyến, ở nơi kết nối chập chờn" },
      { en: "Crash-free sessions tracked from launch, so stability is a number, not a guess", vi: "Tỉ lệ phiên không lỗi theo dõi từ ngày ra mắt, để độ ổn định là con số chứ không phải phỏng đoán" },
      { en: "Analytics wired in from day one so the product team can steer with evidence", vi: "Phân tích dữ liệu gắn sẵn từ đầu để đội sản phẩm ra quyết định dựa trên bằng chứng" },
    ],
    howWeBuild: [
      { en: "We decide honestly where one shared codebase fits and where native pays off, and explain the call", vi: "Chúng tôi cân nhắc thẳng thắn chỗ nào dùng chung một mã nguồn là hợp, chỗ nào thuần native mới đáng, và giải thích lựa chọn" },
      { en: "We ship testable builds early, so you feel the app in your hand long before launch", vi: "Chúng tôi giao bản chạy thử sớm, để bạn cầm ứng dụng trên tay từ rất lâu trước ngày ra mắt" },
      { en: "We plan for store review and release from the start, so launch day is not a surprise", vi: "Chúng tôi tính trước khâu duyệt store và phát hành ngay từ đầu, để ngày ra mắt không còn bất ngờ" },
      { en: "We keep the app honest with real-device testing, not just the simulator", vi: "Chúng tôi kiểm thử trên thiết bị thật, không chỉ trên trình giả lập, để giữ ứng dụng trung thực" },
    ],
    stack: {
      en: "Typical stack: React Native or Flutter where one codebase fits, Swift or Kotlin where native counts, plus analytics and crash reporting from day one. We choose per project and tell you the trade-off.",
      vi: "Công nghệ thường dùng: React Native hoặc Flutter khi một mã nguồn là hợp, Swift hoặc Kotlin khi cần thuần native, cùng phân tích và báo cáo sự cố ngay từ đầu. Chúng tôi chọn theo từng dự án và nói rõ đánh đổi.",
    },
  },
  "internal-systems": {
    metaTitle: {
      en: "Custom internal software and business systems",
      vi: "Phần mềm nội bộ và hệ thống doanh nghiệp theo yêu cầu",
    },
    metaDescription: {
      en: "CyberSkill builds the internal systems a company runs on: operations tooling, automation, integrations, and the data layer underneath them. One source of truth instead of scattered spreadsheets. A senior team in Ho Chi Minh City.",
      vi: "CyberSkill xây những hệ thống vận hành cả doanh nghiệp: công cụ nghiệp vụ, tự động hoá, tích hợp và lớp dữ liệu bên dưới. Một nguồn dữ liệu thống nhất thay cho bảng tính rời rạc. Đội ngũ giàu kinh nghiệm tại TP. Hồ Chí Minh.",
    },
    lead: {
      en: "We build the software that runs a company behind the scenes: operations tooling, automation, and the integrations that make separate systems act like one. The result is one source of truth instead of a sprawl of spreadsheets.",
      vi: "Chúng tôi xây phần mềm vận hành doanh nghiệp phía sau hậu trường: công cụ nghiệp vụ, tự động hoá, và những tích hợp khiến các hệ thống rời rạc hoạt động như một. Kết quả là một nguồn dữ liệu thống nhất, thay cho một mớ bảng tính.",
    },
    forWho: {
      en: "For operations teams drowning in manual steps, companies stitching together tools that do not talk to each other, and leaders who want one reliable view of what is actually happening.",
      vi: "Dành cho đội vận hành đang ngập trong thao tác thủ công, cho doanh nghiệp phải chắp vá những công cụ không nói chuyện được với nhau, và cho người quản lý muốn một góc nhìn đáng tin về điều đang thực sự diễn ra.",
    },
    whatYouGet: [
      { en: "Manual work removed, hours given back to the team", vi: "Loại bỏ thao tác thủ công, trả lại thời gian cho đội ngũ" },
      { en: "One source of truth instead of scattered, drifting spreadsheets", vi: "Một nguồn dữ liệu thống nhất thay cho những bảng tính rời rạc, sai lệch dần" },
      { en: "Integrations that let your existing tools work together", vi: "Tích hợp để những công cụ bạn đang có phối hợp được với nhau" },
      { en: "A data layer built to be reported on, not just stored", vi: "Một lớp dữ liệu được xây để báo cáo được, không chỉ để lưu trữ" },
    ],
    howWeBuild: [
      { en: "We start from the workflow that hurts most, so value shows up early rather than at the very end", vi: "Chúng tôi bắt đầu từ quy trình nhức nhối nhất, để giá trị xuất hiện sớm chứ không phải mãi đến cuối" },
      { en: "We automate the steps that are safe to automate, and leave people in the loop where judgement matters", vi: "Chúng tôi tự động hoá những bước an toàn để tự động hoá, và giữ con người trong vòng lặp ở nơi cần phán đoán" },
      { en: "We integrate with what you already run, rather than forcing a rip-and-replace", vi: "Chúng tôi tích hợp với những gì bạn đang dùng, thay vì ép thay mới toàn bộ" },
      { en: "We document the system so your team can operate and extend it without us", vi: "Chúng tôi lập tài liệu cho hệ thống để đội bạn tự vận hành và mở rộng mà không cần chúng tôi" },
    ],
    stack: {
      en: "Typical stack: web dashboards, automation and integration services, and a SQL or document data layer sized to the problem. We favour proven tools and a design your team can maintain.",
      vi: "Công nghệ thường dùng: dashboard web, các dịch vụ tự động hoá và tích hợp, cùng lớp dữ liệu SQL hoặc document phù hợp với bài toán. Chúng tôi ưu tiên công cụ đã kiểm chứng và một thiết kế đội bạn bảo trì được.",
    },
  },
};

export function generateStaticParams() {
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const detail = details[slug];
  const service = services.find((s) => s.id === slug);
  if (!detail || !service) {
    return { title: locale === "vi" ? "Dịch vụ" : "Services" };
  }
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: localize(detail.metaTitle, locale),
    description: localize(detail.metaDescription, locale),
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const service = services.find((s) => s.id === slug);
  const detail = details[slug];
  if (!service || !detail) {
    notFound();
  }

  const base = siteUrl;
  // Related work: engagements tagged with this service, linked for internal
  // discovery (and honest proof that the practice is real).
  const related = work.filter((w) => w.tags.includes(slug));

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localize(detail.metaTitle, locale),
    serviceType: localize(service.title, locale),
    description: localize(detail.metaDescription, locale),
    inLanguage: locale === "vi" ? "vi-VN" : "en",
    url: `${base}/${locale}/services/${slug}`,
    // Resolve to the single Organization node emitted by OrganizationJsonLd.
    provider: { "@type": "Organization", "@id": `${base}/#organization`, name: company.shortName },
    areaServed: [
      { "@type": "Country", name: "Vietnam" },
      { "@type": "AdministrativeArea", name: "Ho Chi Minh City" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${base}/${locale}#contact`,
    },
  };

  const labels =
    locale === "vi"
      ? {
          eyebrow: "Dịch vụ",
          forWho: "Dành cho ai",
          whatYouGet: "Bạn nhận được gì",
          howWeBuild: "Cách chúng tôi xây",
          stack: "Công nghệ",
          related: "Dự án liên quan",
          cta: "Bắt đầu dự án",
          how: "Cách chúng tôi làm việc",
          back: "Xem tất cả dịch vụ",
        }
      : {
          eyebrow: "Service",
          forWho: "Who it is for",
          whatYouGet: "What you get",
          howWeBuild: "How we build it",
          stack: "The stack",
          related: "Related work",
          cta: "Start my project",
          how: "How we build",
          back: "See all services",
        };

  return (
    <section className="cs-section">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: labels.eyebrow, path: `/${locale}#services` },
            { name: localize(service.title, locale), path: `/${locale}/services/${slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />

        <p className="cs-eyebrow">{labels.eyebrow}</p>
        <h1>{localize(service.title, locale)}</h1>
        <p className="cs-section-lead">{localize(detail.lead, locale)}</p>

        <div className="cs-surface-light cs-prose-card" style={{ marginTop: "var(--cs-space-12)", maxWidth: "46rem" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.forWho}</h2>
          <p>{localize(detail.forWho, locale)}</p>

          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.whatYouGet}</h2>
          <ul className="cs-service-outcomes" role="list">
            {detail.whatYouGet.map((o, i) => (
              <li key={i}>{localize(o, locale)}</li>
            ))}
          </ul>

          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.howWeBuild}</h2>
          <ul className="cs-service-outcomes" role="list">
            {detail.howWeBuild.map((o, i) => (
              <li key={i}>{localize(o, locale)}</li>
            ))}
          </ul>

          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.stack}</h2>
          <p>{localize(detail.stack, locale)}</p>
        </div>

        {related.length > 0 ? (
          <div style={{ marginTop: "var(--cs-space-12)" }}>
            <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.related}</h2>
            <ul className="cs-tag-row" role="list">
              {related.map((w) => (
                <li key={w.slug} className="cs-tag">
                  <a href={`/${locale}/work/${w.slug}`}>{localize(w.title, locale)}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {labels.cta}
          </a>
          <a className="cs-btn" href={`/${locale}/how-we-build`}>
            {labels.how}
          </a>
          <a className="cs-btn" href={`/${locale}#services`}>
            {labels.back}
          </a>
        </div>
      </div>
    </section>
  );
}
