/**
 * Systematic dimensions for combinatorial SCRIPTED bubbles.
 * Every combo is purposeful: situation × intent × stage × tone × locale.
 */

export type IntentId =
  | "mvp"
  | "web"
  | "mobile"
  | "internal"
  | "ecommerce"
  | "ai"
  | "redesign"
  | "rescue"
  | "pricing"
  | "timeline"
  | "engagement"
  | "teardown"
  | "call"
  | "partnership"
  | "careers"
  | "security"
  | "a11y"
  | "stack"
  | "support"
  | "demo";

export type SituationId =
  | "founder"
  | "product_mgr"
  | "cto"
  | "ops_lead"
  | "agency"
  | "nontech"
  | "series_a"
  | "legacy"
  | "curious"
  | "partner_seek";

/** Tone variants for systematic copy diversity (not random filler). */
export type ToneId = "generous" | "crisp" | "playful";

export const INTENT_IDS: readonly IntentId[] = [
  "mvp",
  "web",
  "mobile",
  "internal",
  "ecommerce",
  "ai",
  "redesign",
  "rescue",
  "pricing",
  "timeline",
  "engagement",
  "teardown",
  "call",
  "partnership",
  "careers",
  "security",
  "a11y",
  "stack",
  "support",
  "demo",
] as const;

export const SITUATION_IDS: readonly SituationId[] = [
  "founder",
  "product_mgr",
  "cto",
  "ops_lead",
  "agency",
  "nontech",
  "series_a",
  "legacy",
  "curious",
  "partner_seek",
] as const;

export const TONE_IDS: readonly ToneId[] = ["generous", "crisp", "playful"] as const;

export const INTENT_LABEL: Record<IntentId, { en: string; vi: string }> = {
  mvp: { en: "an MVP / first slice", vi: "MVP / lát đầu" },
  web: { en: "a web app or portal", vi: "ứng dụng web hoặc portal" },
  mobile: { en: "a mobile app", vi: "ứng dụng di động" },
  internal: { en: "an internal system", vi: "hệ thống nội bộ" },
  ecommerce: { en: "commerce / checkout", vi: "thương mại / checkout" },
  ai: { en: "an AI-powered product", vi: "sản phẩm AI" },
  redesign: { en: "a redesign or rebuild", vi: "thiết kế lại / làm lại" },
  rescue: { en: "rescuing a troubled project", vi: "cứu một dự án rối" },
  pricing: { en: "budget & pricing fit", vi: "ngân sách & giá" },
  timeline: { en: "timelines & pace", vi: "thời gian & nhịp" },
  engagement: { en: "which engagement model fits", vi: "mô hình hợp tác nào hợp" },
  teardown: { en: "a free 15-point teardown", vi: "đánh giá 15 điểm miễn phí" },
  call: { en: "a discovery call", vi: "cuộc gọi discovery" },
  partnership: { en: "partnership / outsourcing", vi: "hợp tác / outsource" },
  careers: { en: "joining the team", vi: "gia nhập đội" },
  security: { en: "security & privacy", vi: "bảo mật & riêng tư" },
  a11y: { en: "accessibility", vi: "khả năng tiếp cận" },
  stack: { en: "tech stack choices", vi: "lựa chọn tech stack" },
  support: { en: "support & SLA", vi: "hỗ trợ & SLA" },
  demo: { en: "seeing how we work", vi: "xem cách chúng tôi làm" },
};

export const SITUATION_LABEL: Record<SituationId, { en: string; vi: string }> = {
  founder: { en: "as a founder shipping under pressure", vi: "founder đang chạy deadline" },
  product_mgr: { en: "as a product manager shaping scope", vi: "PM đang chốt phạm vi" },
  cto: { en: "as a technical leader guarding quality", vi: "lead kỹ thuật giữ chất lượng" },
  ops_lead: { en: "as an ops lead tired of spreadsheet chaos", vi: "ops mệt vì mớ spreadsheet" },
  agency: { en: "as an agency needing a senior build partner", vi: "agency cần partner senior" },
  nontech: { en: "as a business owner without an engineering team", vi: "chủ DN chưa có đội dev" },
  series_a: { en: "as a growing company past the first release", vi: "công ty đã qua bản đầu" },
  legacy: { en: "while carrying a legacy system that still runs", vi: "đang ôm hệ thống cũ còn chạy" },
  curious: { en: "while still exploring options", vi: "vẫn đang xem các lựa chọn" },
  partner_seek: { en: "while evaluating long-term partners", vi: "đang cân partner dài hạn" },
};

/** Intent → hero topic for COLLECT / consult handoff chips. */
export const INTENT_TO_HERO: Record<IntentId, string> = {
  mvp: "mvp_start",
  web: "service_web",
  mobile: "service_mobile",
  internal: "service_internal",
  ecommerce: "ecommerce",
  ai: "ai_product",
  redesign: "redesign",
  rescue: "rescue",
  pricing: "pricing",
  timeline: "timeline",
  engagement: "quiz_start",
  teardown: "teardown",
  call: "book_call",
  partnership: "partnership",
  careers: "careers",
  security: "security_privacy",
  a11y: "accessibility",
  stack: "tech_stack",
  support: "sla_support",
  demo: "demo_request",
};

/** Lead-entry hero for each intent (soft_cta → lead). */
export const INTENT_TO_LEAD: Record<IntentId, string> = {
  mvp: "mvp_flow",
  web: "wish",
  mobile: "wish",
  internal: "wish",
  ecommerce: "wish",
  ai: "mvp_flow",
  redesign: "teardown_flow",
  rescue: "wish",
  pricing: "wish",
  timeline: "book_call_flow",
  engagement: "wish",
  teardown: "teardown_flow",
  call: "book_call_flow",
  partnership: "partnership_flow",
  careers: "careers_flow",
  security: "contact_flow",
  a11y: "teardown_flow",
  stack: "wish",
  support: "wish",
  demo: "book_call_flow",
};
