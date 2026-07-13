import type { LocalizedString } from "@/lib/i18n/types";

export interface ChangelogEntry {
  date: string; // YYYY-MM
  title: LocalizedString;
  items: LocalizedString[];
  link?: string;
  isShipped: boolean;
}

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07",
    title: {
      en: "Accessibility, Validation & Performance Guarding",
      vi: "Tiếp cận, Xác thực & Ràng buộc hiệu năng"
    },
    isShipped: true,
    items: [
      { en: "Enforced native required and aria-required validation on all contact inputs.", vi: "Bắt buộc xác thực native và aria-required trên mọi ô nhập liệu biểu mẫu liên hệ." },
      { en: "Integrated server-side real-user monitoring (RUM) with sliding window p75 metrics alerting.", vi: "Tích hợp giám sát trải nghiệm người dùng thực (RUM) với cảnh báo p75 theo cửa sổ trượt." },
      { en: "Corrected word spacing inside kinetic headings for search crawlers.", vi: "Khắc phục khoảng cách từ trong tiêu đề động cho trình thu thập thông tin tìm kiếm." }
    ]
  },
  {
    date: "2026-07",
    title: {
      en: "Secure Environment & Case Study Outlines",
      vi: "Môi trường bảo mật & Nghiên cứu tình huống"
    },
    isShipped: true,
    items: [
      { en: "Established fail-closed environment variables validation on API paths.", vi: "Triển khai xác thực biến môi trường theo cơ chế đóng khi phát hiện thiếu cấu hình." },
      { en: "Authored proof-oriented case study layouts supporting NDA and metric fallbacks.", vi: "Xây dựng bố cục nghiên cứu tình huống hỗ trợ chế độ ẩn danh NDA và ẩn chỉ số hiệu quả." }
    ]
  },
  {
    date: "2026-06",
    title: {
      en: "Futuristic Art Direction & Vietnamese Typography",
      vi: "Ngôn ngữ thiết kế tương lai & Việt hóa Typography"
    },
    isShipped: true,
    items: [
      { en: "Shipped dark-theme blueprint grid layouts and conic card borders.", vi: "Bàn giao bố cục khung blueprint tối và đường viền thẻ nón xoay độc đáo." },
      { en: "Integrated Space Grotesk font with comprehensive Vietnamese character sets.", vi: "Tích hợp phông chữ Space Grotesk hỗ trợ đầy đủ bộ ký tự tiếng Việt có dấu." }
    ]
  }
];
