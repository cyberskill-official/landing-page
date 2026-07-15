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
      vi: "Vì sao chúng tôi chặn build khi Core Web Vitals tụt",
    },
    summary: {
      en: "How automated performance gating in CI helps us deliver fast web applications without relying on manual checks.",
      vi: "Cách cổng hiệu năng tự động giúp app luôn nhanh mà không phải kiểm tay từng lần.",
    },
    tldr: {
      en: "TL;DR: Continuous Integration must be used as a hard gate. We run Lighthouse on every commit and block merges if LCP > 2.5s or CLS > 0.1 to guarantee performance doesn't regress.",
      vi: "Tóm lại: CI phải là cổng cứng. Chúng tôi chạy Lighthouse tự động và chặn PR nếu LCP > 2.5s hoặc CLS > 0.1 để hiệu năng không tụt.",
    },
    body: {
      en: "Performance is not a design option; it is a core feature. On modern web applications, Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) directly impact user conversion and search engine discoverability. Yet, performance regressions are notoriously easy to slip into code during day-to-day changes. A single unoptimized image, a heavy third-party library, or an unbudgeted layout shift can degrade the experience instantly.\n\nTo prevent this, we configure Lighthouse CI to assert budgets on every single commit. If a pull request causes a mobile LCP to exceed 2.5 seconds or CLS to drop past 0.1, the build fails automatically. This forces us to address performance regressions before they ever reach a staging environment or are seen by real users. It shifts quality control from reactive debugging to proactive engineering.",
      vi: "Hiệu năng không phải trang trí; đó là tính năng. Trên web hiện đại, LCP và CLS ảnh hưởng thẳng đến chuyển đổi và SEO. Dễ lắm để hiệu năng tụt trong ngày thường: một ảnh nặng, một thư viện cồng kềnh, một layout xô lệch là trải nghiệm hỏng.\n\nVì vậy Lighthouse CI chạy trên mỗi commit. Pull request nào đẩy LCP quá 2.5 giây hoặc CLS quá 0.1 sẽ fail build ngay. Đội phải xử lý trước khi code sang môi trường thử hay tới người dùng thật.",
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
      vi: "Không chỉ đẹp: chuẩn WCAG 2.2 AA ngay trong CI",
    },
    summary: {
      en: "A look into how we automate axe-core tests on served routes to guarantee accessibility for every visitor.",
      vi: "Cách chạy axe-core tự động trên route thật để mọi người đều dùng được site.",
    },
    tldr: {
      en: "TL;DR: Accessibility cannot be a post-launch afterthought. We automate axe-core accessibility checks inside headless Chrome in our CI pipeline to ensure WCAG 2.2 AA conformance.",
      vi: "Tóm lại: tiếp cận không phải việc dọn sau khi xong. Chúng tôi quét axe-core trong CI trên Chrome headless để giữ chuẩn WCAG 2.2 AA.",
    },
    body: {
      en: "Accessibility (a11y) is often treated as a compliance checklist applied at the very end of a project. This approach results in clunky keyboard support and broken screen-reader navigation. At CyberSkill, we treat accessibility as an architectural foundation. Every component we build must satisfy WCAG 2.2 AA standards from its initial markup.\n\nTo enforce this, we run axe-core scans against our served routes during integration tests. By automating these checks on a headless Chrome instance in our CI workflow, we catch violations in keyboard focus, contrast levels, and ARIA attributes immediately. If a commit breaks focus order or leaves an interactive element without an accessible label, the gate blocks integration. Accessibility is not assumed; it is verified.",
      vi: "Tiếp cận (a11y) hay bị xếp vào checklist cuối dự án. Kết quả: bàn phím vụng, trình đọc màn hình lỗi. Tại CyberSkill, đây là nền tảng. Mọi thành phần phải đạt WCAG 2.2 AA ngay từ HTML đầu.\n\nChúng tôi quét axe-core trên route thật trong kiểm thử tích hợp, trên Chrome headless trong CI, để bắt lỗi focus, tương phản và ARIA ngay khi commit. Nếu thứ tự focus sai hoặc nút thiếu nhãn tiếp cận, cổng sẽ chặn gộp code.",
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
