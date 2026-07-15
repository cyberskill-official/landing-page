/**
 * SCRIPTED Lumi funnel stages (pre-LLM).
 *
 * Arc: generous/friendly support → basic consult → interest/hype/proof → soft CTA → COLLECT (info capture).
 * Stages are queryable from shipped code; every inventory bubble carries one.
 */

export type FunnelStage =
  | "rapport"
  | "consult"
  | "proof"
  | "interest"
  | "soft_cta"
  | "lead";

/** Ordered OBJECTIVE arc (support → consult → hype → infos). */
export const FUNNEL_STAGE_ORDER: readonly FunnelStage[] = [
  "rapport",
  "consult",
  "proof",
  "interest",
  "soft_cta",
  "lead",
] as const;

export const FUNNEL_STAGE_META: Record<
  FunnelStage,
  { en: string; vi: string; role: string }
> = {
  rapport: {
    en: "Generous open — welcome, browse-safe, like a friendly supporter",
    vi: "Mở đầu hào phóng — chào đón, xem chơi an toàn, như người hỗ trợ thân thiện",
    role: "support",
  },
  consult: {
    en: "Basic consult — educate, name trade-offs, give value before any ask",
    vi: "Tư vấn cơ bản — giáo dục, gọi tên đánh đổi, cho giá trị trước khi hỏi",
    role: "consult",
  },
  proof: {
    en: "Proof & trust — work stories, craft, not black-box agency",
    vi: "Minh chứng & tin cậy — câu chuyện Work, nghề, không agency hộp đen",
    role: "trust",
  },
  interest: {
    en: "Interest / hype — capacity, 7-day promise, vivid outcomes (honest)",
    vi: "Hứng thú / hype — suất, cam kết 7 ngày, kết quả sống động (trung thực)",
    role: "desire",
  },
  soft_cta: {
    en: "Soft CTA — invite wish/call/teardown without forcing the form yet",
    vi: "CTA mềm — mời điều ước/gọi/teardown chưa ép form",
    role: "invite",
  },
  lead: {
    en: "Lead capture — COLLECT handoff (name/email/… for the team)",
    vi: "Thu lead — bàn giao COLLECT (tên/email/… cho đội)",
    role: "collect",
  },
};

/** Stages required to have non-zero bubble counts (OBJECTIVE arc). */
export const REQUIRED_FUNNEL_STAGES: readonly FunnelStage[] = FUNNEL_STAGE_ORDER;

/**
 * Map a primary/hero topic id to its dominant funnel stage.
 * Combinatorial path nodes encode stage in their id (`cx:<stage>:…`).
 */
export function stageForHeroTopic(id: string): FunnelStage {
  if (id.startsWith("cx:")) {
    const part = id.split(":")[1];
    if (
      part === "rapport" ||
      part === "consult" ||
      part === "proof" ||
      part === "interest" ||
      part === "soft_cta" ||
      part === "lead"
    ) {
      return part;
    }
  }

  const leadIds = new Set([
    "wish",
    "mvp_flow",
    "teardown_flow",
    "book_call_flow",
    "contact_flow",
    "partnership_flow",
    "careers_flow",
  ]);
  if (leadIds.has(id)) return "lead";

  const soft = new Set([
    "book_call",
    "teardown",
    "mvp_start",
    "demo_request",
    "contact_human",
  ]);
  if (soft.has(id)) return "soft_cta";

  const interest = new Set([
    "capacity",
    "promise_7day",
    "pricing",
    "timeline",
    "engagement_models",
    "quiz_start",
  ]);
  if (interest.has(id) || id.startsWith("quiz_")) return "interest";

  const proof = new Set([
    "story_hub",
    "myth_agency",
    "metrics",
    "values",
    "saigon",
    "security_privacy",
    "accessibility",
  ]);
  if (proof.has(id) || id.startsWith("story_")) return "proof";

  const consult = new Set([
    "what_we_build",
    "how_we_work",
    "process",
    "first_week",
    "service_web",
    "service_mobile",
    "service_internal",
    "ecommerce",
    "ai_product",
    "redesign",
    "rescue",
    "tech_stack",
    "sla_support",
    "partnership",
    "careers",
  ]);
  if (consult.has(id)) return "consult";

  // rapport default: who_is_lumi, fortune, browse, menu, joke, genie_rules, three_wishes
  return "rapport";
}
