import type { LocalizedString } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { company, siteUrl } from "@/lib/content/site";

// FR-SEO-011 §1.1-1.4: Centralised per-route metadata registry.
// Every indexable route declares a unique (title, description) pair per locale.
// Titles carry commercial intent terms; descriptions include one proof point.
// The brand slogan stays in OG title but is NOT the whole <title>.

export interface RouteMetadata {
  /** Route path without locale prefix, e.g. "/" or "/work" */
  route: string;
  title: LocalizedString;
  description: LocalizedString;
  /** ISO date string for sitemap lastModified (FR-SEO-012 §1.2) */
  lastUpdated: string;
}

// Site launch date as fallback for lastUpdated
const SITE_LAUNCH = "2025-01-15";

export const routeMetadata: RouteMetadata[] = [
  {
    route: "/",
    title: {
      en: "Software Development Company Vietnam | CyberSkill",
      vi: "Công ty phát triển phần mềm Việt Nam | CyberSkill",
    },
    description: {
      en: "CyberSkill is a software company in Ho Chi Minh City. Senior engineers own your project end to end, building web, mobile, and custom systems that last.",
      vi: "CyberSkill là công ty phần mềm tại TP.HCM. Kỹ sư cấp cao chịu trách nhiệm từ đầu đến cuối, xây dựng hệ thống web, di động và phần mềm chất lượng.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/work",
    title: {
      en: "Our Work — Software Projects & Case Studies | CyberSkill",
      vi: "Dự án — Các dự án phần mềm & nghiên cứu tình huống | CyberSkill",
    },
    description: {
      en: "See the web apps, mobile apps, and internal systems CyberSkill has shipped. Each case study shows the problem, approach, and measurable outcome.",
      vi: "Xem các ứng dụng web, ứng dụng di động và hệ thống nội bộ CyberSkill đã bàn giao. Mỗi nghiên cứu tình huống nêu rõ bài toán, cách tiếp cận và kết quả.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/careers",
    title: {
      en: "Careers at CyberSkill — Join a Software Team in Saigon",
      vi: "Tuyển dụng tại CyberSkill — Gia nhập đội ngũ phần mềm tại Sài Gòn",
    },
    description: {
      en: "CyberSkill hires senior engineers in Ho Chi Minh City. Join our small team to build production software with real ownership and zero corporate busywork.",
      vi: "CyberSkill tuyển kỹ sư cấp cao tại TP. Hồ Chí Minh. Gia nhập đội ngũ nhỏ để xây dựng phần mềm thực tế với quyền tự chủ cao và không họp hành vô ích.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/how-we-build",
    title: {
      en: "How We Build Software — Engineering Process | CyberSkill",
      vi: "Cách chúng tôi xây dựng phần mềm — Quy trình kỹ thuật | CyberSkill",
    },
    description: {
      en: "How CyberSkill builds reliable software: small releases, automated quality gates, and performance budgets in CI to prevent regressions on every change.",
      vi: "Cách CyberSkill xây phần mềm tin cậy: phát hành nhỏ, các cổng chất lượng tự động, và budget hiệu năng trong CI giúp chặn lỗi hồi quy trên mỗi thay đổi.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/team",
    title: {
      en: "Our Team — Software Engineers in Ho Chi Minh City | CyberSkill",
      vi: "Đội ngũ — Kỹ sư phần mềm tại TP. Hồ Chí Minh | CyberSkill",
    },
    description: {
      en: "Meet the senior software engineers behind CyberSkill in Saigon. The exact same people partner with you from the first discovery call to production launch.",
      vi: "Gặp gỡ các kỹ sư phần mềm cấp cao tại CyberSkill ở Sài Gòn. Cùng những con người đó đồng hành chặt chẽ với bạn từ cuộc gọi đầu tiên đến khi ra mắt.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/privacy",
    title: {
      en: "Privacy Policy | CyberSkill",
      vi: "Chính sách bảo mật | CyberSkill",
    },
    description: {
      en: "Read the privacy notice for the CyberSkill website. Learn about the cookies we use, the data we collect, and your privacy rights under GDPR and PDPL.",
      vi: "Đọc chính sách bảo mật của trang web CyberSkill. Tìm hiểu về cookie được dùng, dữ liệu thu thập và quyền riêng tư của bạn theo quy định GDPR và PDPL.",
    },
    lastUpdated: SITE_LAUNCH,
  },
  {
    route: "/accessibility",
    title: {
      en: "Accessibility Statement | CyberSkill",
      vi: "Tuyên bố hỗ trợ tiếp cận | CyberSkill",
    },
    description: {
      en: "CyberSkill's commitment to WCAG 2.2 AA accessibility standard. Read about our keyboard navigation, motion gating, screen reader support, and testing.",
      vi: "Cam kết hỗ trợ tiếp cận theo tiêu chuẩn WCAG 2.2 AA của CyberSkill. Tìm hiểu về điều hướng bàn phím, kiểm soát chuyển động và hỗ trợ trình đọc màn hình.",
    },
    lastUpdated: SITE_LAUNCH,
  },
  {
    route: "/cyberos/privacy",
    title: {
      en: "CyberOS App Privacy Policy | CyberSkill",
      vi: "Chính sách bảo mật ứng dụng CyberOS | CyberSkill",
    },
    description: {
      en: "Privacy Policy for the CyberOS application (iOS, Android, web console). Learn what data we collect, why we collect it, and how to request account deletion.",
      vi: "Chính sách bảo mật ứng dụng CyberOS (iOS, Android, web). Tìm hiểu loại dữ liệu thu thập, lý do thu thập và cách thức yêu cầu xóa tài khoản người dùng.",
    },
    lastUpdated: SITE_LAUNCH,
  },
  {
    route: "/cyberos/delete-account",
    title: {
      en: "Request CyberOS Account Deletion | CyberSkill",
      vi: "Yêu cầu xoá tài khoản CyberOS | CyberSkill",
    },
    description: {
      en: "Step-by-step instructions to delete your CyberOS account and remove all personal information and workspace data from our servers. Files are wiped in 30 days.",
      vi: "Hướng dẫn chi tiết cách xóa tài khoản CyberOS và gỡ bỏ toàn bộ thông tin cá nhân cùng dữ liệu không gian làm việc khỏi máy chủ. Dữ liệu xóa sạch sau 30 ngày.",
    },
    lastUpdated: SITE_LAUNCH,
  },
  {
    route: "/cyberos/content-policy",
    title: {
      en: "CyberOS App Content Policy | CyberSkill",
      vi: "Chính sách nội dung ứng dụng CyberOS | CyberSkill",
    },
    description: {
      en: "Content guidelines and policies for uploading files, messages, and attachments to CyberOS workspaces. Prohibits malicious code, spam, and copyright abuse.",
      vi: "Chính sách và nguyên tắc nội dung khi đăng tải tệp, tin nhắn và đính kèm lên CyberOS. Nghiêm cấm mã độc, nội dung rác và xâm phạm bản quyền sở hữu trí tuệ.",
    },
    lastUpdated: SITE_LAUNCH,
  },
  {
    route: "/services/web-apps",
    title: {
      en: "Web Application Development Ho Chi Minh City | CyberSkill",
      vi: "Phát triển ứng dụng web tại TP.HCM | CyberSkill",
    },
    description: {
      en: "Custom web applications, dashboards and portals built by senior engineers in Vietnam. We ship on time and keep Core Web Vitals in the green.",
      vi: "Phát triển ứng dụng web, dashboard và cổng thông tin bởi kỹ sư cấp cao tại Việt Nam. Bàn giao đúng hẹn, tối ưu chỉ số Core Web Vitals ở ngưỡng xanh.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/services/mobile-apps",
    title: {
      en: "Mobile App Development iOS & Android Vietnam | CyberSkill",
      vi: "Phát triển ứng dụng di động iOS Android | CyberSkill",
    },
    description: {
      en: "iOS and Android mobile app development with offline support and crash-free sessions tracked from launch. Built by senior engineers in Saigon.",
      vi: "Phát triển ứng dụng di động iOS & Android hỗ trợ ngoại tuyến, theo dõi phiên không lỗi ngay từ ngày ra mắt. Đội ngũ kỹ sư giàu kinh nghiệm tại Sài Gòn.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/services/internal-systems",
    title: {
      en: "Custom Business Systems & Software Vietnam | CyberSkill",
      vi: "Hệ thống phần mềm doanh nghiệp theo yêu cầu | CyberSkill",
    },
    description: {
      en: "Custom internal software, operations tooling, and integrations that retire spreadsheets. Single source of truth for business data in Vietnam.",
      vi: "Phần mềm nội bộ, công cụ nghiệp vụ và tích hợp giúp loại bỏ bảng tính rời rạc. Một nguồn dữ liệu thống nhất cho doanh nghiệp vận hành tại Việt Nam.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/work/operations-platform",
    title: {
      en: "Logistics Operations Platform Case Study | CyberSkill",
      vi: "Nền tảng vận hành Logistics - Case Study | CyberSkill",
    },
    description: {
      en: "How we replaced a sprawl of spreadsheets with a custom web platform. The operations team works from one live view instead of hand-reconciliation.",
      vi: "Cách chúng tôi thay thế bảng tính rời rạc bằng nền tảng web tự xây. Đội vận hành làm việc trên một màn hình thời gian thực thay vì đối chiếu file tay.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/work/member-mobile-app",
    title: {
      en: "Offline-First Member Mobile App Case Study | CyberSkill",
      vi: "Ứng dụng di động học viên ngoại tuyến - Case Study",
    },
    description: {
      en: "Case study of a member mobile app with offline-first lessons on App Store & Google Play. Crash-free sessions tracked from launch for reliable learning on the move.",
      vi: "Ứng dụng học viên chạy mượt cả khi mất mạng trên App Store và Google Play. Theo dõi phiên không lỗi từ khi ra mắt để đảm bảo việc học luôn ổn định.",
    },
    lastUpdated: "2026-07-12",
  },
  {
    route: "/work/commerce-portal",
    title: {
      en: "High-Performance Commerce Portal Case Study | CyberSkill",
      vi: "Cổng thương mại điện tử tối ưu tốc độ - Case Study",
    },
    description: {
      en: "How we rebuilt a retail commerce portal for speed and simple checkout. Core Web Vitals are kept in the green and measured on every change.",
      vi: "Cách chúng tôi dựng lại cổng thương mại bán lẻ để tối ưu tốc độ và đơn giản hóa thanh toán. Core Web Vitals được giữ ở ngưỡng xanh trên mỗi thay đổi.",
    },
    lastUpdated: "2026-07-12",
  },
];

/** Resolve metadata for a locale + route. Returns title, description, and OG fields. */
export function resolveMetadata(locale: Locale, route: string) {
  const meta = routeMetadata.find((m) => m.route === route);
  const title = meta?.title[locale] ?? `CyberSkill — ${company.slogan[locale]}`;
  const description = meta?.description[locale] ?? company.entity[locale];

  return {
    title,
    description,
    openGraph: {
      title: `${company.shortName} — ${company.slogan[locale]}`,
      description,
      url: `${siteUrl}/${locale}${route === "/" ? "" : route}`,
      siteName: company.shortName,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website" as const,
      images: [
        {
          url: `${siteUrl}/${locale}${route === "/" ? "" : route}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${route === "/" ? "" : route}`,
      languages: {
        en: `${siteUrl}/en${route === "/" ? "" : route}`,
        vi: `${siteUrl}/vi${route === "/" ? "" : route}`,
        "x-default": `${siteUrl}/en${route === "/" ? "" : route}`,
      },
    },
  };
}
