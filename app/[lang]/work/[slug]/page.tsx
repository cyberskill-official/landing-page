import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { work, company } from "@/lib/content/site";
import { localize, type LocalizedString } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

// One detail page per work item per locale. The narrative below is deliberately
// generic and honest: no invented client names, exact percentages, or logos.
// Outcomes stay qualitative, matching the cleared copy in lib/content/site.ts.

type CaseStudy = {
  challenge: LocalizedString;
  approach: LocalizedString;
  outcome: LocalizedString;
};

const details: Record<string, CaseStudy> = {
  "operations-platform": {
    challenge: {
      en: "The team ran daily operations across a sprawl of spreadsheets. Numbers drifted between copies, handovers were error-prone, and nobody could see the whole pipeline at once.",
      vi: "Đội ngũ vận hành hằng ngày trên hàng loạt bảng tính rời rạc. Số liệu sai lệch giữa các bản sao, bàn giao dễ nhầm và không ai thấy được toàn bộ luồng công việc cùng lúc.",
    },
    approach: {
      en: "We mapped the real workflow with the people who live in it, then built a web platform around one shared data layer. We shipped in small increments so the team could adopt it without a risky big-bang switch.",
      vi: "Chúng tôi vẽ lại quy trình thực tế cùng những người trực tiếp sử dụng, rồi xây một nền tảng web dựa trên một lớp dữ liệu dùng chung. Chúng tôi bàn giao theo từng phần nhỏ để đội ngũ tiếp nhận dần mà không phải chuyển đổi rủi ro một lần.",
    },
    outcome: {
      en: "Order-processing time came down by a measured margin, and the operations team finally worked from one live view instead of reconciling files by hand.",
      vi: "Thời gian xử lý đơn giảm rõ rệt, và đội vận hành cuối cùng làm việc trên một màn hình theo thời gian thực thay vì đối chiếu tệp bằng tay.",
    },
  },
  "member-mobile-app": {
    challenge: {
      en: "Learners needed their lessons on the move, including where the connection was unreliable. A web page alone could not give them a dependable, offline-friendly experience.",
      vi: "Học viên cần học mọi lúc di chuyển, kể cả nơi kết nối chập chờn. Chỉ một trang web không thể mang lại trải nghiệm ổn định và dùng được khi ngoại tuyến.",
    },
    approach: {
      en: "We built a member app for both stores with offline-first lessons, and wired analytics in from day one so the product team could see how the app behaved in the wild.",
      vi: "Chúng tôi xây ứng dụng cho học viên trên cả hai store với bài học ưu tiên ngoại tuyến, và gắn phân tích dữ liệu ngay từ đầu để đội sản phẩm thấy được ứng dụng vận hành thực tế ra sao.",
    },
    outcome: {
      en: "The app shipped to both stores on schedule, with crash-free sessions tracked from launch so stability was a number the team could watch, not a guess.",
      vi: "Ứng dụng phát hành trên cả hai store đúng hẹn, với phiên không lỗi được theo dõi ngay từ ngày ra mắt, nên độ ổn định là một con số đội ngũ quan sát được chứ không phải phỏng đoán.",
    },
  },
  "commerce-portal": {
    challenge: {
      en: "An aging storefront was slow to load and awkward to check out on, which quietly cost the brand visitors and orders. Speed and a cleaner path to purchase were the priorities.",
      vi: "Một cửa hàng trực tuyến cũ kỹ tải chậm và thanh toán rườm rà, âm thầm khiến thương hiệu mất khách và đơn hàng. Tốc độ và một luồng mua hàng gọn hơn là ưu tiên hàng đầu.",
    },
    approach: {
      en: "We rebuilt the portal for speed, trimmed the checkout to the steps that matter, and kept performance honest with Core Web Vitals as a target we measured on every change.",
      vi: "Chúng tôi dựng lại cổng thương mại để tối ưu tốc độ, rút gọn thanh toán còn những bước thật sự cần thiết, và giữ hiệu năng minh bạch bằng cách lấy Core Web Vitals làm mục tiêu đo trên mỗi thay đổi.",
    },
    outcome: {
      en: "Core Web Vitals came into the green and the checkout path got noticeably simpler, giving shoppers a faster, calmer route from product to purchase.",
      vi: "Core Web Vitals đạt ngưỡng và luồng thanh toán đơn giản hơn hẳn, mang lại cho người mua một hành trình nhanh và nhẹ nhàng hơn từ sản phẩm đến thanh toán.",
    },
  },
};

export function generateStaticParams() {
  return locales.flatMap((lang) => work.map((item) => ({ lang, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const item = work.find((w) => w.slug === slug);
  if (!item) {
    return { title: locale === "vi" ? "Dự án" : "Work" };
  }
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: localize(item.title, locale),
    description: localize(item.result, locale),
  });
}

export default async function WorkDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const item = work.find((w) => w.slug === slug);
  if (!item) {
    notFound();
  }
  const study = details[item.slug];

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  // Portfolio entries were published with the site launch; modified date tracks
  // the same until per-item editing is added.
  const published = "2026-06-22";
  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: localize(item.title, locale),
    headline: localize(item.title, locale),
    description: localize(item.result, locale),
    inLanguage: locale === "vi" ? "vi-VN" : "en",
    url: `${base}/${locale}/work/${item.slug}`,
    keywords: item.tags.join(", "),
    datePublished: published,
    dateModified: published,
    // Reference the same Organization node emitted by OrganizationJsonLd so the
    // author and publisher resolve to one entity (FR-SEO-004 clause 4).
    author: { "@type": "Organization", "@id": `${base}/#organization`, name: company.shortName },
    publisher: { "@id": `${base}/#organization` },
  };

  const labels =
    locale === "vi"
      ? { challenge: "Thách thức", approach: "Việc chúng tôi đã làm", outcome: "Kết quả", cta: "Bắt đầu dự án", back: "Quay lại danh sách dự án" }
      : { challenge: "The challenge", approach: "What we did", outcome: "The outcome", cta: "Start my project", back: "Back to work" };

  return (
    <section className="cs-section">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Dự án" : "Work", path: `/${locale}/work` },
            { name: localize(item.title, locale), path: `/${locale}/work/${item.slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }}
        />
        <p className="cs-eyebrow">{item.client}</p>
        <h1>{localize(item.title, locale)}</h1>
        <p className="cs-section-lead">{localize(item.result, locale)}</p>
        <ul className="cs-tag-row" role="list">
          {item.tags.map((t) => (
            <li key={t} className="cs-tag">{t}</li>
          ))}
        </ul>

        {study ? (
          <div className="cs-surface-light" style={{ marginTop: "var(--cs-space-12)", maxWidth: "44rem" }}>
            <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.challenge}</h2>
            <p>{localize(study.challenge, locale)}</p>
            <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.approach}</h2>
            <p>{localize(study.approach, locale)}</p>
            <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{labels.outcome}</h2>
            <p>{localize(study.outcome, locale)}</p>
          </div>
        ) : null}

        <div className="cs-hero-actions" style={{ marginTop: "var(--cs-space-12)" }}>
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {labels.cta}
          </a>
          <a className="cs-btn" href={`/${locale}/work`}>
            {labels.back}
          </a>
        </div>
      </div>
    </section>
  );
}
