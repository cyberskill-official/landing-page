import type { LocalizedString } from "@/lib/i18n/types";

export interface NotePost {
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  tldr: LocalizedString;
  body: LocalizedString;
  publishedAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  author: {
    name: string;
    url?: string;
  };
  counterparts: {
    en?: string;
    vi?: string;
  };
  permission: {
    grantedBy: string;
    grantedAt: string;
    reference: string;
  };
  draft?: boolean;
}

export const notes: NotePost[] = [
  {
    slug: "continuous-integration-bar",
    title: {
      en: "Why We Fail Our Builds on Core Web Vitals Regressions",
      vi: "Tại sao chúng tôi tự khóa build khi Core Web Vitals giảm điểm",
    },
    summary: {
      en: "How automated performance gating in CI helps us deliver fast web applications without relying on manual checks.",
      vi: "Cách thức thiết kế cổng hiệu năng tự động giúp đảm bảo ứng dụng luôn nhanh mà không tốn công kiểm thử thủ công.",
    },
    tldr: {
      en: "TL;DR: Continuous Integration must be used as a hard gate. We run Lighthouse on every commit and block merges if LCP > 2.5s or CLS > 0.1 to guarantee performance doesn't regress.",
      vi: "TL;DR: Tích hợp liên tục (CI) phải là cổng kiểm soát nghiêm ngặt. Chúng tôi chạy Lighthouse tự động và chặn PR nếu LCP > 2.5s hoặc CLS > 0.1 để tránh suy giảm hiệu năng.",
    },
    body: {
      en: "Performance is not a design option; it is a core feature. On modern web applications, Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) directly impact user conversion and search engine discoverability. Yet, performance regressions are notoriously easy to slip into code during day-to-day changes. A single unoptimized image, a heavy third-party library, or an unbudgeted layout shift can degrade the experience instantly.\n\nTo prevent this, we configure Lighthouse CI to assert budgets on every single commit. If a pull request causes a mobile LCP to exceed 2.5 seconds or CLS to drop past 0.1, the build fails automatically. This forces us to address performance regressions before they ever reach a staging environment or are seen by real users. It shifts quality control from reactive debugging to proactive engineering.",
      vi: "Hiệu năng không phải là tùy chọn thiết kế; đó là tính năng cốt lõi. Trên các ứng dụng web hiện đại, LCP và CLS ảnh hưởng trực tiếp đến tỷ lệ chuyển đổi và SEO. Tuy nhiên, hiệu năng rất dễ bị giảm sút trong quá trình phát triển thông thường. Một hình ảnh chưa tối ưu, thư viện nặng hoặc bố cục bị dịch chuyển có thể làm hỏng trải nghiệm ngay lập tức.\n\nĐể ngăn chặn điều này, chúng tôi thiết lập Lighthouse CI tự động kiểm tra trên từng commit. Nếu một pull request làm LCP vượt quá 2.5 giây hoặc CLS vượt quá 0.1, build sẽ bị báo lỗi ngay lập tức. Việc này buộc đội ngũ phát triển phải giải quyết vấn đề hiệu năng trước khi mã nguồn được chuyển sang môi trường chạy thử hoặc tới tay người dùng thực tế.",
    },
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-12",
    author: {
      name: "Mr. Stephen",
      url: "https://www.linkedin.com/in/stephencheng",
    },
    counterparts: {
      en: "continuous-integration-bar",
      vi: "continuous-integration-bar",
    },
    permission: {
      grantedBy: "Mr. Stephen",
      grantedAt: "2026-07-11",
      reference: "internal-note-2026-07-11",
    },
  },
  {
    slug: "accessibility-first-design",
    title: {
      en: "Designing Beyond Aesthetics: Standardizing WCAG 2.2 AA in CI",
      vi: "Thiết kế vượt lên trên thẩm mỹ: Tiêu chuẩn hóa WCAG 2.2 AA trong CI",
    },
    summary: {
      en: "A look into how we automate axe-core tests on served routes to guarantee accessibility for every visitor.",
      vi: "Chi tiết cách chạy tự động axe-core trên các route thực tế nhằm đảm bảo khả năng tiếp cận cho mọi người dùng.",
    },
    tldr: {
      en: "TL;DR: Accessibility cannot be a post-launch afterthought. We automate axe-core accessibility checks inside headless Chrome in our CI pipeline to ensure WCAG 2.2 AA conformance.",
      vi: "TL;DR: Khả năng tiếp cận (a11y) không thể là việc làm đối phó sau khi chạy dự án. Chúng tôi tự động hóa việc quét axe-core trong CI trên Chrome headless để bảo đảm tiêu chuẩn WCAG 2.2 AA.",
    },
    body: {
      en: "Accessibility (a11y) is often treated as a compliance checklist applied at the very end of a project. This approach results in clunky keyboard support and broken screen-reader navigation. At CyberSkill, we treat accessibility as an architectural foundation. Every component we build must satisfy WCAG 2.2 AA standards from its initial markup.\n\nTo enforce this, we run axe-core scans against our served routes during integration tests. By automating these checks on a headless Chrome instance in our CI workflow, we catch violations in keyboard focus, contrast levels, and ARIA attributes immediately. If a commit breaks focus order or leaves an interactive element without an accessible label, the gate blocks integration. Accessibility is not assumed; it is verified.",
      vi: "Khả năng tiếp cận (a11y) thường bị đối xử như một danh mục kiểm tra ở giai đoạn cuối cùng của dự án. Cách làm này thường tạo ra điều hướng bàn phím vụng về và trải nghiệm trình đọc màn hình bị lỗi. Tại CyberSkill, chúng tôi coi khả năng tiếp cận là nền tảng kiến trúc. Mọi component được xây dựng phải đáp ứng tiêu chuẩn WCAG 2.2 AA ngay từ những dòng code HTML đầu tiên.\n\nĐể tự động hóa việc này, chúng tôi chạy quét axe-core trên các route thực tế trong các bài kiểm tra tích hợp. Bằng việc thực hiện các kiểm tra này trên Chrome không giao diện (headless) ở workflow CI, chúng tôi phát hiện ngay lập tức các lỗi về tiêu điểm bàn phím, độ tương phản và thuộc tính ARIA.",
    },
    publishedAt: "2026-07-12",
    updatedAt: "2026-07-12",
    author: {
      name: "Mr. Stephen",
      url: "https://www.linkedin.com/in/stephencheng",
    },
    counterparts: {
      en: "accessibility-first-design",
      vi: "accessibility-first-design",
    },
    permission: {
      grantedBy: "Mr. Stephen",
      grantedAt: "2026-07-12",
      reference: "internal-note-2026-07-12",
    },
  },
];
