/**
 * Keyless Lumi conversation (SCRIPTED, no LLM required).
 *
 * Purpose: generous/friendly supporter → basic consult → interest/hype → COLLECT
 * (info capture). Discovery chips + multi-step trees + combinatorial corpus
 * paths (`cx:…`) + free-text keywords. Pure functions, unit-tested.
 *
 * Grounding: company, commercialPolicy, services, processSteps, work (SSOT).
 * No invented client metrics. Stages: lib/genie/funnelStages.ts.
 * Bubble inventory: lib/genie/corpus/expand.ts (enumerateScriptedBubbles).
 */

import type { Locale } from "@/lib/i18n/config";
import { company, services, processSteps, work } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";
import {
  FUNNEL_STAGE_ORDER,
  type FunnelStage,
  stageForHeroTopic,
} from "@/lib/genie/funnelStages";
import {
  INTENT_IDS,
  SITUATION_IDS,
  SITUATION_LABEL,
  type IntentId,
  type SituationId,
} from "@/lib/genie/corpus/dimensions";
import {
  COUNTING_RULE,
  combinatorialCellCount,
  encodeCorpusPath,
  expandCombinatorialBubbles,
  expandFortuneBubbles,
  expandHeroBubbles,
  listCorpusPathIds,
  parseCorpusPath,
  resolveCorpusPath,
  summarizeBubbles,
  type BubbleCountReport,
  type ScriptedBubble,
} from "@/lib/genie/corpus/expand";
import { fortunePoolSize, pickFortune } from "@/lib/genie/scriptedChatHero";

export type ScriptChip = {
  /** Topic id, wish/teardown flags, quiz/story step, or cx: corpus path. */
  id: string;
  label: string;
};

export type ScriptReply = {
  message: string;
  chips?: ScriptChip[];
  /** Start default wish (COLLECT info-capture) flow. */
  startWish?: boolean;
  /** Start teardown lead (COLLECT) flow. */
  startTeardown?: boolean;
  /** Start partnership lead (COLLECT) flow. */
  startPartnership?: boolean;
  /** Start careers lead (COLLECT) flow. */
  startCareers?: boolean;
  /** Start contact lead (COLLECT) flow. */
  startContact?: boolean;
  /** Optional seed message when starting a COLLECT flow. */
  seedMessage?: string;
  /** Dominant funnel stage for this reply (when known). */
  stage?: FunnelStage;
};

export {
  fortunePoolSize,
  pickFortune,
  COUNTING_RULE,
  combinatorialCellCount,
  listCorpusPathIds,
  parseCorpusPath,
  type FunnelStage,
  type ScriptedBubble,
  type BubbleCountReport,
};
export { FUNNEL_STAGE_ORDER, stageForHeroTopic, FUNNEL_STAGE_META } from "@/lib/genie/funnelStages";

type L = Locale;

function t(locale: L, en: string, vi: string): string {
  return locale === "vi" ? vi : en;
}

function loc(locale: L, s: { en: string; vi: string }): string {
  return locale === "vi" ? s.vi : s.en;
}

/** Opening discovery chips when the visitor is not in a lead form (rapport → consult). */
export function getOpeningChips(locale: L): ScriptChip[] {
  return [
    { id: "path_hub", label: t(locale, "Guide me", "Dẫn mình một chút") },
    { id: "mvp_start", label: t(locale, "I need an MVP", "Cần làm MVP") },
    { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn làm được gì?") },
    { id: "quiz_start", label: t(locale, "Which model fits?", "Mô hình nào hợp tôi?") },
    { id: "story_hub", label: t(locale, "A story from our work", "Kể một dự án") },
    { id: "teardown", label: t(locale, "Free 15-point teardown", "Đánh giá 15 điểm miễn phí") },
    { id: "how_we_work", label: t(locale, "How you work", "Cách các bạn làm việc") },
    { id: "book_call", label: t(locale, "Book a discovery call", "Đặt cuộc gọi tìm hiểu") },
    { id: "fortune", label: t(locale, "Rub the lamp", "Xoa đèn ước") },
    { id: "who_is_lumi", label: t(locale, "Who are you?", "Bạn là ai?") },
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
  ];
}

function moreMenu(locale: L): ScriptChip[] {
  return [
    // Lead / commercial
    { id: "pricing", label: t(locale, "Budget & pricing", "Ngân sách & giá") },
    { id: "engagement_models", label: t(locale, "Engagement models", "Mô hình hợp tác") },
    { id: "capacity", label: t(locale, "Capacity & slots", "Suất & năng lực") },
    { id: "promise_7day", label: t(locale, "7-day promise", "Cam kết 7 ngày") },
    { id: "timeline", label: t(locale, "Timelines", "Thời gian") },
    { id: "mvp_start", label: t(locale, "MVP / first slice", "MVP / lát đầu") },
    { id: "redesign", label: t(locale, "Redesign or rebuild", "Thiết kế lại / làm lại") },
    { id: "ecommerce", label: t(locale, "E‑commerce", "Thương mại điện tử") },
    { id: "ai_product", label: t(locale, "AI-powered product", "Sản phẩm AI") },
    { id: "book_call", label: t(locale, "Discovery call", "Cuộc gọi tìm hiểu") },
    { id: "demo_request", label: t(locale, "See a demo path", "Xem cách demo") },
    // Process / delivery
    { id: "process", label: t(locale, "How a project runs", "Dự án chạy thế nào") },
    { id: "first_week", label: t(locale, "What week one looks like", "Tuần đầu ra sao") },
    { id: "tech_stack", label: t(locale, "Tech stack", "Công nghệ dùng gì") },
    { id: "sla_support", label: t(locale, "Support & SLA", "Hỗ trợ sau bàn giao") },
    // Practices
    { id: "service_web", label: t(locale, "Web apps", "Ứng dụng web") },
    { id: "service_mobile", label: t(locale, "Mobile apps", "Ứng dụng di động") },
    { id: "service_internal", label: t(locale, "Internal systems", "Hệ thống nội bộ") },
    // Org / trust
    { id: "partnership", label: t(locale, "Partnership / outsource", "Hợp tác / gia công") },
    { id: "careers", label: t(locale, "Careers", "Tuyển dụng") },
    { id: "saigon", label: t(locale, "Saigon studio", "Studio Sài Gòn") },
    { id: "rescue", label: t(locale, "Rescue a project", "Cứu dự án đang kẹt") },
    { id: "security_privacy", label: t(locale, "Security & privacy", "Bảo mật & quyền riêng tư") },
    { id: "accessibility", label: t(locale, "Accessibility", "Tiếp cận cho mọi người") },
    { id: "metrics", label: t(locale, "How you measure done", "Thế nào là xong") },
    { id: "values", label: t(locale, "What you stand for", "Giá trị chúng tôi theo") },
    // Genie flavor
    { id: "three_wishes", label: t(locale, "Three classic wishes", "Ba điều ước cổ điển") },
    { id: "genie_rules", label: t(locale, "Genie house rules", "Nội quy của đèn") },
    { id: "myth_agency", label: t(locale, "Not a black-box agency", "Không phải đội hộp đen") },
    { id: "joke", label: t(locale, "A tiny genie joke", "Một câu đùa nhỏ") },
    { id: "browse", label: t(locale, "Just browsing", "Chỉ xem cho vui") },
    { id: "contact_human", label: t(locale, "Talk to a human", "Gặp người thật") },
    { id: "menu", label: t(locale, "Show all topics", "Xem mọi chủ đề") },
  ];
}

function ctaChips(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "teardown_flow", label: t(locale, "Request teardown", "Xin đánh giá") },
    { id: "book_call", label: t(locale, "Book a call", "Đặt cuộc gọi") },
    { id: "quiz_start", label: t(locale, "Engagement quiz", "Chọn mô hình hợp tác") },
    { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
  ];
}

function softCta(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "book_call", label: t(locale, "Book a call", "Đặt cuộc gọi") },
    { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
  ];
}

function leadCta(locale: L, extra: ScriptChip[] = []): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "book_call", label: t(locale, "Book a discovery call", "Đặt cuộc gọi tìm hiểu") },
    ...extra,
    { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
  ];
}

// Fortunes live in scriptedChatHero (re-exported above).

// --- Path hub: situation → intent → corpus stages (consult→hype→lead) --------

function resolvePathHub(locale: L, id: string): ScriptReply | null {
  if (id === "path_hub") {
    return {
      stage: "rapport",
      message: t(
        locale,
        "I’m here as a warm supporter first, no form until something truly clicks. Who are you walking in as? (This only steers how I consult you.)",
        "Mình sẽ đồng hành trước, chưa vội hỏi thông tin cá nhân. Bạn đang đến với vai trò nào? (Chỉ để mình tư vấn đúng hướng.)",
      ),
      chips: SITUATION_IDS.map((s) => ({
        id: `path_sit_${s}`,
        label: t(locale, SITUATION_LABEL[s].en, SITUATION_LABEL[s].vi).slice(0, 56),
      })).concat([{ id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") }]),
    };
  }

  const sitMatch = /^path_sit_([a-z_]+)$/.exec(id);
  if (sitMatch) {
    const situation = sitMatch[1] as SituationId;
    if (!SITUATION_IDS.includes(situation)) return null;
    return {
      stage: "rapport",
      message: t(
        locale,
        `Got it, ${SITUATION_LABEL[situation].en}. What shall we explore? I’ll give real consult value before asking for any details.`,
        `Rõ rồi, ${SITUATION_LABEL[situation].vi}. Mình đào sâu hướng nào? Tư vấn trước, xin thông tin sau.`,
      ),
      chips: [
        { id: `path_intent_mvp__${situation}`, label: t(locale, "MVP / first slice", "MVP / lát đầu") },
        { id: `path_intent_web__${situation}`, label: t(locale, "Web app", "Ứng dụng web") },
        { id: `path_intent_mobile__${situation}`, label: t(locale, "Mobile", "Di động") },
        { id: `path_intent_internal__${situation}`, label: t(locale, "Internal system", "Hệ thống nội bộ") },
        { id: `path_intent_ecommerce__${situation}`, label: t(locale, "E‑commerce", "Thương mại điện tử") },
        { id: `path_intent_ai__${situation}`, label: t(locale, "AI product", "Sản phẩm AI") },
        { id: `path_intent_rescue__${situation}`, label: t(locale, "Rescue / legacy", "Cứu hộ / legacy") },
        { id: `path_intent_pricing__${situation}`, label: t(locale, "Budget & pricing", "Ngân sách & giá") },
        { id: `path_intent_teardown__${situation}`, label: t(locale, "Free teardown", "Teardown miễn phí") },
        { id: `path_intent_call__${situation}`, label: t(locale, "Discovery call", "Cuộc gọi discovery") },
        { id: "path_hub", label: t(locale, "Back, change role", "Quay lại, đổi vai") },
      ],
    };
  }

  const intentMatch = /^path_intent_([a-z]+)__([a-z_]+)$/.exec(id);
  if (intentMatch) {
    const intent = intentMatch[1] as IntentId;
    const situation = intentMatch[2] as SituationId;
    if (!INTENT_IDS.includes(intent) || !SITUATION_IDS.includes(situation)) return null;
    // Enter combinatorial path at consult stage (value before ask).
    const cx = resolveCorpusPath(
      locale,
      encodeCorpusPath("consult", intent, situation, "generous"),
    );
    if (!cx) return null;
    return {
      message: cx.message,
      chips: cx.chips,
      stage: cx.stage,
      startWish: cx.startWish,
      startTeardown: cx.startTeardown,
      startPartnership: cx.startPartnership,
      startCareers: cx.startCareers,
      startContact: cx.startContact,
      seedMessage: cx.seedMessage,
    };
  }

  return null;
}

// --- Engagement quiz (multi-step, chip-id encoded; no React state needed) ----

/**
 * Multi-step engagement-model quiz.
 * Steps: start → pace → scope → result (uses commercialPolicy SSOT).
 * Chip ids: quiz_start | quiz_pace_* | quiz_scope_*__pace_*
 */
export function resolveEngagementQuiz(locale: L, id: string): ScriptReply | null {
  if (id === "quiz_start") {
    return {
      message: t(
        locale,
        "A two-question lamp quiz, no wrong answers. First: what pace do you need?",
        "Hai câu hỏi nhỏ, không có đáp án sai. Trước hết: bạn cần nhịp làm việc thế nào?",
      ),
      chips: [
        {
          id: "quiz_pace_fast",
          label: t(locale, "Ship a clear outcome soon", "Cần kết quả rõ sớm"),
        },
        {
          id: "quiz_pace_steady",
          label: t(locale, "Ongoing capacity with seniors", "Năng lực senior dài hơi"),
        },
        {
          id: "quiz_pace_explore",
          label: t(locale, "Still shaping the problem", "Vẫn đang định hình bài toán"),
        },
        { id: "engagement_models", label: t(locale, "Just list the models", "Chỉ liệt kê mô hình") },
      ],
    };
  }

  if (id === "quiz_pace_fast" || id === "quiz_pace_steady" || id === "quiz_pace_explore") {
    const pace = id.replace("quiz_pace_", "") as "fast" | "steady" | "explore";
    const ack =
      pace === "fast"
        ? t(
            locale,
            "Speed with a defined outcome, classic fixed-scope energy. Second: how locked is the scope?",
            "Cần kết quả rõ và nhanh. Tiếp theo: phạm vi đã chốt được bao nhiêu?",
          )
        : pace === "steady"
          ? t(
              locale,
              "A dedicated senior rhythm, good for product that keeps moving. Second: how locked is the scope?",
              "Cần đội giàu kinh nghiệm đồng hành dài hơi. Tiếp theo: phạm vi còn thay đổi nhiều không?",
            )
          : t(
              locale,
              "Still exploring, we often start with discovery and a sharp first slice. Second: how locked is the scope?",
              "Vẫn đang làm rõ bài toán. Thường chúng tôi bắt đầu bằng giai đoạn khám phá và một phần đầu sắc. Tiếp theo: phạm vi đã ổn định chưa?",
            );
    return {
      message: ack,
      chips: [
        {
          id: `quiz_scope_locked__${pace}`,
          label: t(locale, "Scope is fairly locked", "Phạm vi khá chốt"),
        },
        {
          id: `quiz_scope_fluid__${pace}`,
          label: t(locale, "Scope will keep evolving", "Phạm vi còn biến"),
        },
        {
          id: `quiz_scope_unsure__${pace}`,
          label: t(locale, "Not sure yet", "Chưa chắc"),
        },
      ],
    };
  }

  const scopeMatch = /^quiz_scope_(locked|fluid|unsure)__(fast|steady|explore)$/.exec(id);
  if (scopeMatch) {
    const scope = scopeMatch[1] as "locked" | "fluid" | "unsure";
    const pace = scopeMatch[2] as "fast" | "steady" | "explore";
    return quizResult(locale, pace, scope);
  }

  return null;
}

function quizResult(
  locale: L,
  pace: "fast" | "steady" | "explore",
  scope: "locked" | "fluid" | "unsure",
): ScriptReply {
  const models = commercialPolicy.engagementModels;
  const dedicated = models[0]!;
  const fixed = models[1]!;

  // Prefer fixed-scope when outcome-soon + locked; dedicated when ongoing/fluid.
  const preferFixed =
    (pace === "fast" && scope !== "fluid") || (scope === "locked" && pace !== "steady");
  const primary = preferFixed ? fixed : dedicated;
  const secondary = preferFixed ? dedicated : fixed;

  const capacityLine = t(
    locale,
    `We take about ${commercialPolicy.capacity.projectsPerQuarter} projects per quarter; next open slot: ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
    `Khoảng ${commercialPolicy.capacity.projectsPerQuarter} dự án mỗi quý; suất mở tiếp: ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
  );

  return {
    message: t(
      locale,
      `The lamp points to **${loc(locale, primary.name)}**, ${loc(locale, primary.range)}; ${loc(locale, primary.timeline)}. Alternative: **${loc(locale, secondary.name)}** (${loc(locale, secondary.range)}). ${capacityLine}\n\nLeave a wish with your context and a human will confirm the fit.`,
      `Đèn chỉ về **${loc(locale, primary.name)}**, ${loc(locale, primary.range)}; ${loc(locale, primary.timeline)}. Phương án khác: **${loc(locale, secondary.name)}** (${loc(locale, secondary.range)}). ${capacityLine}\n\nGửi điều ước kèm ngữ cảnh; người thật sẽ xác nhận độ hợp.`,
    ),
    chips: [
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "engagement_models", label: t(locale, "Compare both models", "So hai mô hình") },
      { id: "quiz_start", label: t(locale, "Retake quiz", "Làm lại quiz") },
      { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
    ],
  };
}

// --- Work story beats (from public work SSOT; no fake metrics) ---------------

export function listWorkStoryIds(): string[] {
  return work.map((w) => `story_${w.slug}`);
}

function resolveWorkStory(locale: L, id: string): ScriptReply | null {
  if (id === "story_hub") {
    return {
      message: t(
        locale,
        "A few public chapters from the Work shelf. Pick one; I will not invent metrics that are not on the page.",
        "Đây là vài dự án công khai trên kệ Work. Bạn chọn một nhé. Mình không bịa số liệu nếu trang không ghi.",
      ),
      chips: [
        ...work.map((w) => {
          const full = loc(locale, w.title);
          // Short chip labels so three rows can show every story without ugly ellipsis
          const short =
            full.length > 42 ? full.slice(0, 40).replace(/\s+\S*$/, "") + "…" : full;
          return { id: `story_${w.slug}`, label: short };
        }),
        { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
      ],
    };
  }

  if (!id.startsWith("story_")) return null;
  const slug = id.slice("story_".length);
  const item = work.find((w) => w.slug === slug);
  if (!item) return null;

  const detailHint = t(
    locale,
    `Open /work/${item.slug} on the site for the full write-up. Want something in that spirit? Leave a wish.`,
    `Mở /work/${item.slug} trên site để đọc đủ. Muốn điều gì cùng tinh thần? Gửi điều ước.`,
  );

  return {
    message: t(
      locale,
      `**${loc(locale, item.title)}**, for ${loc(locale, item.client)}. ${detailHint}`,
      `**${loc(locale, item.title)}**, cho ${loc(locale, item.client)}. ${detailHint}`,
    ),
    chips: [
      { id: "story_hub", label: t(locale, "Another story", "Câu chuyện khác") },
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn làm được gì?") },
      { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
    ],
  };
}

function resolveService(locale: L, id: string): ScriptReply | null {
  const map: Record<string, string> = {
    service_web: "web-apps",
    service_mobile: "mobile-apps",
    service_internal: "internal-systems",
  };
  const serviceId = map[id];
  if (!serviceId) return null;
  const svc = services.find((s) => s.id === serviceId);
  if (!svc) return null;
  const outcomes = svc.outcomes.map((o) => `• ${loc(locale, o)}`).join("\n");
  return {
    message: t(
      locale,
      `**${loc(locale, svc.title)}**, ${loc(locale, svc.summary)}\n${outcomes}`,
      `**${loc(locale, svc.title)}**, ${loc(locale, svc.summary)}\n${outcomes}`,
    ),
    chips: [
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "story_hub", label: t(locale, "Related work stories", "Câu chuyện liên quan") },
      { id: "what_we_build", label: t(locale, "All practices", "Mọi practice") },
      { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
    ],
  };
}

// --- Inventory (for tests + SCRATCH evidence) --------------------------------

/** Stable list of primary hero topic resolvers (not every quiz/corpus step). */
export function listPrimaryTopicIds(): string[] {
  return [
    "path_hub",
    "menu",
    "more",
    "wish",
    "teardown",
    "teardown_flow",
    "mvp_start",
    "mvp_flow",
    "book_call",
    "book_call_flow",
    "demo_request",
    "redesign",
    "ecommerce",
    "ai_product",
    "tech_stack",
    "sla_support",
    "what_we_build",
    "how_we_work",
    "pricing",
    "timeline",
    "careers",
    "careers_flow",
    "who_is_lumi",
    "saigon",
    "fortune",
    "browse",
    "rescue",
    "contact_human",
    "contact_flow",
    "quiz_start",
    "engagement_models",
    "capacity",
    "promise_7day",
    "process",
    "first_week",
    "service_web",
    "service_mobile",
    "service_internal",
    "partnership",
    "partnership_flow",
    "security_privacy",
    "accessibility",
    "metrics",
    "values",
    "three_wishes",
    "genie_rules",
    "myth_agency",
    "joke",
    "story_hub",
    ...listWorkStoryIds(),
  ];
}

/**
 * Catalog for docs / ops. SCRIPTED consult funnel stages + COLLECT lead entries.
 * Pre-LLM chat is entirely SCRIPTED; COLLECT is only the info-capture handoff.
 */
export type ScenarioCategory = {
  id: string;
  label: { en: string; vi: string };
  mode: "scripted" | "collect" | "both";
  /** Funnel stage this category primarily serves. */
  stage: FunnelStage;
  scenarios: Array<{
    id: string;
    label: { en: string; vi: string };
    mode: "scripted" | "collect";
    stage?: FunnelStage;
  }>;
};

export function listScenarioCatalog(): ScenarioCategory[] {
  return [
    {
      id: "stage_rapport",
      label: {
        en: "Rapport (SCRIPTED), generous open, browse-safe",
        vi: "Rapport (SCRIPTED), mở hào phóng, xem chơi an toàn",
      },
      mode: "scripted",
      stage: "rapport",
      scenarios: [
        { id: "path_hub", label: { en: "Guided consult path hub", vi: "Hub lộ trình tư vấn" }, mode: "scripted", stage: "rapport" },
        { id: "opening_set", label: { en: "Opening chip set", vi: "Bộ chip mở đầu" }, mode: "scripted", stage: "rapport" },
        { id: "who_is_lumi", label: { en: "Who are you? (Lumi)", vi: "Bạn là ai? (Lumi)" }, mode: "scripted", stage: "rapport" },
        { id: "browse", label: { en: "Just browsing", vi: "Chỉ xem chơi" }, mode: "scripted", stage: "rapport" },
        { id: "fortune", label: { en: "Rub the lamp / fortune", vi: "Xoa đèn / lời sấm" }, mode: "scripted", stage: "rapport" },
        { id: "menu", label: { en: "Show all topics", vi: "Xem mọi chủ đề" }, mode: "scripted", stage: "rapport" },
      ],
    },
    {
      id: "stage_consult",
      label: {
        en: "Consult (SCRIPTED), basic value before any hard ask",
        vi: "Tư vấn (SCRIPTED), giá trị cơ bản trước khi hỏi cứng",
      },
      mode: "scripted",
      stage: "consult",
      scenarios: [
        { id: "what_we_build", label: { en: "What can you build?", vi: "Các bạn xây gì?" }, mode: "scripted", stage: "consult" },
        { id: "how_we_work", label: { en: "How you work", vi: "Cách các bạn làm việc" }, mode: "scripted", stage: "consult" },
        { id: "process", label: { en: "How a project runs", vi: "Một dự án chạy ra sao" }, mode: "scripted", stage: "consult" },
        { id: "first_week", label: { en: "Week one", vi: "Tuần đầu" }, mode: "scripted", stage: "consult" },
        { id: "mvp_start", label: { en: "I need an MVP", vi: "Cần MVP" }, mode: "scripted", stage: "consult" },
        { id: "service_web", label: { en: "Web apps", vi: "Ứng dụng web" }, mode: "scripted", stage: "consult" },
        { id: "service_mobile", label: { en: "Mobile apps", vi: "Ứng dụng di động" }, mode: "scripted", stage: "consult" },
        { id: "service_internal", label: { en: "Internal systems", vi: "Hệ thống nội bộ" }, mode: "scripted", stage: "consult" },
        { id: "ecommerce", label: { en: "E‑commerce", vi: "Thương mại điện tử" }, mode: "scripted", stage: "consult" },
        { id: "ai_product", label: { en: "AI-powered product", vi: "Sản phẩm AI" }, mode: "scripted", stage: "consult" },
        { id: "redesign", label: { en: "Redesign or rebuild", vi: "Thiết kế lại / làm lại" }, mode: "scripted", stage: "consult" },
        { id: "rescue", label: { en: "Rescue a project", vi: "Cứu dự án" }, mode: "scripted", stage: "consult" },
        { id: "tech_stack", label: { en: "Tech stack", vi: "Tech stack" }, mode: "scripted", stage: "consult" },
        { id: "sla_support", label: { en: "Support & SLA", vi: "Hỗ trợ & SLA" }, mode: "scripted", stage: "consult" },
      ],
    },
    {
      id: "stage_proof",
      label: {
        en: "Proof (SCRIPTED), work stories & trust",
        vi: "Minh chứng (SCRIPTED). Work & tin cậy",
      },
      mode: "scripted",
      stage: "proof",
      scenarios: [
        { id: "story_hub", label: { en: "Work story hub", vi: "Hub câu chuyện Work" }, mode: "scripted", stage: "proof" },
        ...listWorkStoryIds().map((id) => ({
          id,
          label: { en: id.replace("story_", "Work: "), vi: id.replace("story_", "Work: ") },
          mode: "scripted" as const,
          stage: "proof" as FunnelStage,
        })),
        { id: "myth_agency", label: { en: "Not a black-box agency", vi: "Không phải agency hộp đen" }, mode: "scripted", stage: "proof" },
        { id: "metrics", label: { en: "How you measure done", vi: "Đo thế nào là xong" }, mode: "scripted", stage: "proof" },
        { id: "values", label: { en: "What you stand for", vi: "Điều các bạn theo đuổi" }, mode: "scripted", stage: "proof" },
        { id: "saigon", label: { en: "Saigon studio", vi: "Studio Sài Gòn" }, mode: "scripted", stage: "proof" },
        { id: "security_privacy", label: { en: "Security & privacy", vi: "Bảo mật & riêng tư" }, mode: "scripted", stage: "proof" },
        { id: "accessibility", label: { en: "Accessibility", vi: "Khả năng tiếp cận" }, mode: "scripted", stage: "proof" },
      ],
    },
    {
      id: "stage_interest",
      label: {
        en: "Interest / hype (SCRIPTED), capacity, models, promise",
        vi: "Hứng thú / hype (SCRIPTED), suất, mô hình, cam kết",
      },
      mode: "scripted",
      stage: "interest",
      scenarios: [
        { id: "quiz_start", label: { en: "Engagement quiz (multi-step)", vi: "Quiz hợp tác (nhiều bước)" }, mode: "scripted", stage: "interest" },
        { id: "engagement_models", label: { en: "Engagement models", vi: "Mô hình hợp tác" }, mode: "scripted", stage: "interest" },
        { id: "pricing", label: { en: "Budget & pricing", vi: "Ngân sách & giá" }, mode: "scripted", stage: "interest" },
        { id: "capacity", label: { en: "Capacity & slots", vi: "Suất & năng lực" }, mode: "scripted", stage: "interest" },
        { id: "promise_7day", label: { en: "7-day promise", vi: "Cam kết 7 ngày" }, mode: "scripted", stage: "interest" },
        { id: "timeline", label: { en: "Timelines", vi: "Thời gian" }, mode: "scripted", stage: "interest" },
      ],
    },
    {
      id: "stage_soft_cta",
      label: {
        en: "Soft CTA (SCRIPTED), invite without forcing the form",
        vi: "CTA mềm (SCRIPTED), mời chưa ép form",
      },
      mode: "scripted",
      stage: "soft_cta",
      scenarios: [
        { id: "teardown", label: { en: "Free 15-point teardown (intro)", vi: "Teardown 15 điểm (giới thiệu)" }, mode: "scripted", stage: "soft_cta" },
        { id: "book_call", label: { en: "Book a discovery call", vi: "Đặt cuộc gọi discovery" }, mode: "scripted", stage: "soft_cta" },
        { id: "demo_request", label: { en: "See a demo path", vi: "Xem lộ trình demo" }, mode: "scripted", stage: "soft_cta" },
        { id: "contact_human", label: { en: "Talk to a human", vi: "Gặp người thật" }, mode: "scripted", stage: "soft_cta" },
        { id: "partnership", label: { en: "Partnership / outsource", vi: "Hợp tác / outsource" }, mode: "scripted", stage: "soft_cta" },
        { id: "careers", label: { en: "Careers", vi: "Tuyển dụng" }, mode: "scripted", stage: "soft_cta" },
      ],
    },
    {
      id: "stage_lead",
      label: {
        en: "Lead capture (COLLECT), info handoff after value",
        vi: "Thu lead (COLLECT), bàn giao thông tin sau giá trị",
      },
      mode: "collect",
      stage: "lead",
      scenarios: [
        { id: "wish", label: { en: "Leave a wish (default lead)", vi: "Gửi điều ước (lead mặc định)" }, mode: "collect", stage: "lead" },
        { id: "mvp_flow", label: { en: "MVP / first slice wish", vi: "Điều ước MVP / lát đầu" }, mode: "collect", stage: "lead" },
        { id: "teardown_flow", label: { en: "Request free teardown", vi: "Yêu cầu teardown miễn phí" }, mode: "collect", stage: "lead" },
        { id: "book_call_flow", label: { en: "Book discovery call", vi: "Đặt cuộc gọi discovery" }, mode: "collect", stage: "lead" },
        { id: "contact_flow", label: { en: "Human follow-up contact", vi: "Liên hệ người thật" }, mode: "collect", stage: "lead" },
        { id: "partnership_flow", label: { en: "Partnership / outsource lead", vi: "Lead partnership / outsource" }, mode: "collect", stage: "lead" },
        { id: "careers_flow", label: { en: "Careers application lead", vi: "Lead ứng tuyển" }, mode: "collect", stage: "lead" },
      ],
    },
    {
      id: "genie_delight",
      label: { en: "Genie delight (SCRIPTED rapport flavor)", vi: "Vui thần đèn (SCRIPTED rapport)" },
      mode: "scripted",
      stage: "rapport",
      scenarios: [
        { id: "three_wishes", label: { en: "Three classic wishes", vi: "Ba điều ước cổ điển" }, mode: "scripted", stage: "rapport" },
        { id: "genie_rules", label: { en: "Genie house rules", vi: "Nội quy thần đèn" }, mode: "scripted", stage: "rapport" },
        { id: "joke", label: { en: "A tiny genie joke", vi: "Một câu đùa nhỏ" }, mode: "scripted", stage: "rapport" },
      ],
    },
    {
      id: "corpus_systematic",
      label: {
        en: "Systematic corpus (SCRIPTED), situation × intent × stage × tone",
        vi: "Corpus hệ thống (SCRIPTED), vai × ý định × stage × tone",
      },
      mode: "scripted",
      stage: "consult",
      scenarios: [
        {
          id: "cx_enumerate",
          label: {
            en: `Combinatorial cells: ${combinatorialCellCount()} (see enumerateScriptedBubbles)`,
            vi: `Ô tổ hợp: ${combinatorialCellCount()} (xem enumerateScriptedBubbles)`,
          },
          mode: "scripted",
          stage: "consult",
        },
      ],
    },
  ];
}

// --- Main resolver -----------------------------------------------------------

/** Resolve a chip / topic id into Lumi's reply. */
export function resolveScriptTopic(locale: L, id: string): ScriptReply {
  // Combinatorial consult→hype→lead corpus paths
  if (id.startsWith("cx:")) {
    const cx = resolveCorpusPath(locale, id);
    if (cx) {
      return {
        message: cx.message,
        chips: cx.chips,
        stage: cx.stage,
        startWish: cx.startWish,
        startTeardown: cx.startTeardown,
        startPartnership: cx.startPartnership,
        startCareers: cx.startCareers,
        startContact: cx.startContact,
        seedMessage: cx.seedMessage,
      };
    }
  }

  const pathHub = resolvePathHub(locale, id);
  if (pathHub) return pathHub;

  const quiz = resolveEngagementQuiz(locale, id);
  if (quiz) return { ...quiz, stage: quiz.stage ?? "interest" };

  const story = resolveWorkStory(locale, id);
  if (story) return { ...story, stage: story.stage ?? "proof" };

  const service = resolveService(locale, id);
  if (service) return { ...service, stage: service.stage ?? "consult" };

  switch (id) {
    case "menu":
    case "more":
      return {
        stage: "rapport",
        message: t(
          locale,
          "Pick a thread. I’ll guide you like a patient supporter, real advice first, your details only if you choose to leave a wish. Try the guided path, a quick quiz, or a work story.",
          "Hãy chọn một chủ đề. Mình sẽ tư vấn rõ ràng trước; chỉ hỏi thông tin khi bạn muốn gửi điều ước. Bạn có thể thử lộ trình dẫn, quiz nhanh, hoặc một câu chuyện dự án.",
        ),
        chips: [
          ...getOpeningChips(locale).filter((c) => c.id !== "wish"),
          ...moreMenu(locale),
        ],
      };

    case "what_we_build":
      return {
        stage: "consult",
        message: t(
          locale,
          `Under one lamp we hold three practices, ${services.map((s) => loc(locale, s.title)).join(", ")}. Founded ${company.founded} in ${company.city}. Dive into any branch for outcomes, then proof on the Work shelf; leave a wish only when you want a human.`,
          `Dưới một cây đèn, chúng tôi giữ ba mảng, ${services.map((s) => loc(locale, s.title)).join(", ")}. Thành lập ${company.founded} tại ${company.city}. Chọn một nhánh xem outcome, rồi minh chứng trên kệ Work; gửi điều ước khi bạn muốn gặp người thật.`,
        ),
        chips: [
          { id: "service_web", label: t(locale, "Web apps", "Ứng dụng web") },
          { id: "service_mobile", label: t(locale, "Mobile", "Di động") },
          { id: "service_internal", label: t(locale, "Internal systems", "Hệ thống nội bộ") },
          { id: "story_hub", label: t(locale, "Work stories", "Câu chuyện Work") },
          { id: "path_hub", label: t(locale, "Guided path", "Lộ trình dẫn") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "how_we_work":
      return {
        stage: "consult",
        message: t(
          locale,
          "How we work: a small senior team, trade-offs spoken aloud, slices you can review, and metrics so “done” is something users can feel. No black-box agency. No mystery timeline. Next: process, week one, or a quick engagement quiz.",
          "Chúng tôi làm việc với đội gọn, giàu kinh nghiệm. Mọi đánh đổi đều được nói thẳng. Công việc giao theo từng phần bạn xem và góp ý được; “xong” phải là thứ người dùng cảm nhận được. Không hộp đen, không lịch mơ hồ.\n\nBạn muốn xem các bước quy trình, tuần đầu tiên, hay chọn mô hình hợp tác?",
        ),
        chips: [
          { id: "process", label: t(locale, "Process steps", "Các bước quy trình") },
          { id: "first_week", label: t(locale, "Week one", "Tuần đầu tiên") },
          { id: "quiz_start", label: t(locale, "Engagement quiz", "Chọn mô hình hợp tác") },
          { id: "story_hub", label: t(locale, "Work stories", "Câu chuyện dự án") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "process": {
      const lines = processSteps
        .map((p) => `**${p.n}. ${loc(locale, p.title)}**\n${loc(locale, p.body)}`)
        .join("\n\n");
      return {
        stage: "consult",
        message: t(
          locale,
          `How a project usually runs:\n\n${lines}`,
          `Một dự án thường đi qua bốn bước:\n\n${lines}`,
        ),
        chips: ctaChips(locale),
      };
    }

    case "first_week":
      return {
        stage: "consult",
        message: t(
          locale,
          `Week one is discovery: understand the goal and constraints, define success in measurable terms, and surface risks before code. Promise on the site: ${loc(locale, commercialPolicy.ctaPromise)}.`,
          `Tuần đầu dành cho khám phá: nắm mục tiêu và giới hạn, định nghĩa thành công bằng chỉ số rõ, và nêu rủi ro trước khi viết code. Cam kết trên trang: ${loc(locale, commercialPolicy.ctaPromise)}.`,
        ),
        chips: [
          { id: "promise_7day", label: t(locale, "7-day promise", "Cam kết 7 ngày") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "pricing":
      return {
        message: t(
          locale,
          "No fixed à-la-carte menu, each project is scoped to its goal. We shape the work, name the risks, then quote honestly. Published models live under Engagement; leave a wish with rough budget or timeline for a human follow-up within one business day.",
          "Không có bảng giá gọi món cố định. Mỗi dự án được chốt phạm vi theo mục tiêu. Chúng tôi phác thảo, nêu rủi ro, rồi báo giá thẳng thắn. Các mô hình công bố nằm ở mục Hợp tác. Hãy gửi điều ước kèm ngân sách hoặc thời hạn ước lượng; người thật sẽ phản hồi trong một ngày làm việc.",
        ),
        chips: [
          { id: "engagement_models", label: t(locale, "Show model ranges", "Xem dải mô hình") },
          { id: "quiz_start", label: t(locale, "Which fits me?", "Cái nào hợp tôi?") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "engagement_models": {
      const body = commercialPolicy.engagementModels
        .map(
          (m) =>
            `**${loc(locale, m.name)}**, ${loc(locale, m.range)}; ${loc(locale, m.timeline)}`,
        )
        .join("\n");
      const cap = t(
        locale,
        `About ${commercialPolicy.capacity.projectsPerQuarter} projects/quarter; next slot ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
        `Khoảng ${commercialPolicy.capacity.projectsPerQuarter} dự án/quý; suất mở ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
      );
      return {
        message: t(
          locale,
          `Public engagement models:\n${body}\n\n${cap}`,
          `Mô hình hợp tác công khai:\n${body}\n\n${cap}`,
        ),
        chips: [
          { id: "quiz_start", label: t(locale, "Quiz me", "Quiz tôi") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "capacity", label: t(locale, "Capacity", "Năng lực") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };
    }

    case "capacity":
      return {
        message: t(
          locale,
          `We keep concurrent work tight: about ${commercialPolicy.capacity.projectsPerQuarter} projects per quarter so seniors stay on the critical path. Next open slot: ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
          `Chúng tôi giữ tải song song gọn: khoảng ${commercialPolicy.capacity.projectsPerQuarter} dự án mỗi quý để senior ở trên critical path. Suất mở tiếp: ${loc(locale, commercialPolicy.capacity.nextOpenSlot)}.`,
        ),
        chips: ctaChips(locale),
      };

    case "promise_7day":
      return {
        message: t(
          locale,
          `Our published outcome promise: “${loc(locale, commercialPolicy.ctaPromise)}.” That is a production-ready structure or a clear strategy, not a finished product from a blank page. Leave a wish to start the clock with humans.`,
          `Cam kết kết quả công bố: “${loc(locale, commercialPolicy.ctaPromise)}.” Đó là cấu trúc sẵn sàng vận hành hoặc chiến lược rõ, không phải full product từ trang trắng. Gửi điều ước để người thật bấm đồng hồ.`,
        ),
        chips: ctaChips(locale),
      };

    case "timeline":
      return {
        message: t(
          locale,
          "It depends on scope, but we design for progress in weeks, not only a big bang at the end. Fixed-scope work often lands in the 6–12 week band; dedicated teams run in multi-month commitments. Tell us the outcome and by when.",
          "Tùy phạm vi, nhưng chúng tôi thiết kế tiến độ theo tuần, không chỉ chờ một cú nổ cuối. Gói phạm vi cố định thường khoảng 6 đến 12 tuần; đội đồng hành dài hơi theo cam kết nhiều tháng. Bạn muốn đạt kết quả gì, và cần xong trước khi nào?",
        ),
        chips: ctaChips(locale),
      };

    case "teardown":
      return {
        message: t(
          locale,
          "A free 15-point teardown of your site or internal tool, speed, security, accessibility. PDF in about 3 business days. Limited weekly slots. Want me to save one for you?",
          "Đánh giá 15 điểm miễn phí cho site hoặc tool nội bộ, tốc độ, bảo mật, khả năng tiếp cận. PDF khoảng 3 ngày làm việc. Suất mỗi tuần có hạn. Mình giữ một suất cho bạn nhé?",
        ),
        chips: [
          {
            id: "teardown_flow",
            label: t(locale, "Yes, request teardown", "Có, yêu cầu đánh giá"),
          },
          { id: "wish", label: t(locale, "Different wish", "Điều ước khác") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "teardown_flow":
      return {
        message: t(
          locale,
          "Wonderful. I’ll collect a few details for the engineering team.",
          "Tuyệt. Mình sẽ lấy vài thông tin cho đội kỹ sư.",
        ),
        startTeardown: true,
      };

    case "careers":
      return {
        message: t(
          locale,
          `We hire for craft and care, a small senior team in ${company.city}. Browse Careers on this site, or leave a wish with “careers” in the message and introduce yourself.`,
          `Chúng tôi tuyển người có tay nghề và sự chỉn chu, đội senior gọn tại ${company.city}. Xem Careers trên site, hoặc gửi điều ước ghi “tuyển dụng” và tự giới thiệu.`,
        ),
        chips: [
          {
            id: "careers_flow",
            label: t(locale, "Apply via Lumi", "Ứng tuyển qua Lumi"),
          },
          ...softCta(locale),
        ],
      };

    case "who_is_lumi":
      return {
        stage: "rapport",
        message: t(
          locale,
          "I’m Lumi, CyberSkill’s golden genie, and a friendly supporter by design. I walk you through clear advice, real proof, and honest excitement, then only ask for your details when you choose to leave a wish. Playful, never pushy. Rub the lamp for a fortune, take a guided path, or talk shop first.",
          "Mình là Lumi, thần đèn vàng của CyberSkill, cũng là người đứng về phía bạn. Mình tư vấn rõ, đưa minh chứng thật, khích lệ vừa phải, rồi mới hỏi thông tin khi bạn muốn gửi điều ước. Vui vẻ, không ép. Bạn có thể xoa đèn lấy lời sấm, đi lộ trình dẫn, hoặc nói chuyện nghề trước.",
        ),
        chips: [
          { id: "path_hub", label: t(locale, "Guide me", "Dẫn mình") },
          { id: "fortune", label: t(locale, "Rub the lamp", "Xoa đèn ước") },
          { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn làm được gì?") },
          { id: "genie_rules", label: t(locale, "House rules", "Nội quy") },
        ],
      };

    case "saigon":
      return {
        message: t(
          locale,
          `Home base: ${company.address}. Saigon energy, global delivery. Registration ${commercialPolicy.registrationNumber}. Remote-friendly collaboration; real people at ${company.email}.`,
          `Trụ sở: ${company.address}. Năng lượng Sài Gòn, bàn giao toàn cầu. MST ${commercialPolicy.registrationNumber}. Cộng tác remote thoải mái; người thật tại ${company.email}.`,
        ),
        chips: ctaChips(locale),
      };

    case "fortune": {
      const line = pickFortune(locale);
      return {
        message: t(
          locale,
          `*The lamp warm-glows.* ${line}\n\nWant that turned into a scoped project? Leave a wish for the team.`,
          `*Đèn ấm lên.* ${line}\n\nMuốn biến thành dự án có phạm vi? Gửi điều ước cho đội ngũ.`,
        ),
        chips: [
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "fortune", label: t(locale, "Another fortune", "Thêm lời sấm") },
          { id: "three_wishes", label: t(locale, "Three wishes", "Ba điều ước") },
          { id: "teardown", label: t(locale, "Free teardown", "Đánh giá miễn phí") },
        ],
      };
    }

    case "three_wishes":
      return {
        message: t(
          locale,
          "Classic genie law, CyberSkill edition:\n1) One clear outcome beats ten vague hopes.\n2) Trade-offs must be spoken, not hidden.\n3) A human still owns the reply. I am the lamp, not the contract.\n\nWhat is your first wish?",
          "Luật thần đèn bản CyberSkill:\n1) Một kết quả rõ thắng mười hy vọng mơ hồ.\n2) Đánh đổi phải được nói, không giấu.\n3) Người thật vẫn sở hữu phản hồi, mình là đèn, không phải hợp đồng.\n\nĐiều ước đầu của bạn là gì?",
        ),
        chips: [
          { id: "wish", label: t(locale, "State my wish", "Nói điều ước") },
          { id: "fortune", label: t(locale, "Fortune instead", "Lời sấm vậy") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "genie_rules":
      return {
        message: t(
          locale,
          "House rules: no passwords or secrets in chat; I do not invent clients or prices not on the site; playful messages get one warm line then a redirect; frustrated visitors get a human path. Chats may be stored so the team can follow up.",
          "Nội quy: không mật khẩu hay bí mật trong chat; mình không bịa khách hay giá không có trên site; tin nhắn vui được một dòng ấm rồi kéo về chủ đề; khách bực được đường gặp người thật. Chat có thể được lưu để đội theo dõi.",
        ),
        chips: softCta(locale),
      };

    case "browse":
      return {
        message: t(
          locale,
          "Browsing is welcome, the lamp does not bite. Peek at Work, How we build, or take a 30-second engagement quiz. When a spark lands, leave a wish or request a free teardown.",
          "Xem chơi cũng được, đèn không cắn. Thử Work, How we build, hoặc quiz hợp tác 30 giây. Khi lóe ý, gửi điều ước hoặc xin đánh giá miễn phí.",
        ),
        chips: ctaChips(locale),
      };

    case "rescue":
      return {
        message: t(
          locale,
          "We take on running systems too, rescue, rebuild, or calm maintenance. Tell us what is breaking and what “stable” would look like; a human will follow up. Legacy migrations are a public chapter on the Work shelf.",
          "Chúng tôi nhận cả hệ thống đang chạy, cứu hộ, làm lại, hoặc bảo trì êm. Hãy nói thứ gì đang vỡ và “ổn định” trông ra sao; người thật sẽ theo. Di chuyển hệ thống cũ là một chương Work công khai.",
        ),
        chips: [
          { id: "wish", label: t(locale, "Describe the mess", "Kể mớ rối") },
          { id: "story_legacy-migration", label: t(locale, "Legacy migration story", "Chuyện di chuyển legacy") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "partnership":
      return {
        message: t(
          locale,
          `${loc(locale, commercialPolicy.partnershipOffer)}. Audience we serve: ${loc(locale, commercialPolicy.heroAudience)}. Leave a wish with partnership in the note.`,
          `${loc(locale, commercialPolicy.partnershipOffer)}. Đối tượng: ${loc(locale, commercialPolicy.heroAudience)}. Gửi điều ước ghi partnership trong ghi chú.`,
        ),
        chips: [
          {
            id: "partnership_flow",
            label: t(locale, "Start partnership lead", "Bắt đầu lead partnership"),
          },
          ...softCta(locale),
        ],
      };

    case "security_privacy":
      return {
        message: t(
          locale,
          `We do not ask for passwords or payment secrets in chat. Production work follows least privilege, careful integrations, and honest privacy copy on the site (see Privacy). Contact ${company.email} for security-sensitive topics with a human.`,
          `Chúng tôi không hỏi mật khẩu hay bí mật thanh toán trong chat. Việc production theo least privilege, tích hợp cẩn thận, và copy riêng tư trung thực trên site (xem Privacy). Liên hệ ${company.email} cho chủ đề nhạy cảm với người thật.`,
        ),
        chips: softCta(locale),
      };

    case "accessibility":
      return {
        message: t(
          locale,
          "Accessible interfaces are part of craft, keyboard paths, contrast, and honest labels. Free teardowns include accessibility checks alongside speed and security. Want a teardown of your site?",
          "Giao diện tiếp cận được là một phần nghề, bàn phím, tương phản, nhãn trung thực. Đánh giá miễn phí gồm cả a11y cùng tốc độ và bảo mật. Muốn teardown site của bạn?",
        ),
        chips: [
          { id: "teardown", label: t(locale, "Free teardown", "Đánh giá miễn phí") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "metrics":
      return {
        message: t(
          locale,
          "We win when your numbers move. Core Web Vitals, crash-free sessions, hours returned to the team, not when the clock runs out. Define success measures in discovery; wire them in build.",
          "Chúng tôi thắng khi chỉ số của bạn dịch chuyển. Core Web Vitals, phiên không crash, giờ trả lại đội, không phải khi đồng hồ hết. Định nghĩa thước đo lúc discovery; gắn lúc build.",
        ),
        chips: ctaChips(locale),
      };

    case "values":
      return {
        message: t(
          locale,
          "We answer for the work. We stay honest about trade-offs. We build to last and measure to prove it. Slogan: Turn Your Will Into Real / Hiện Thực Hoá Ý Chí.",
          "Chúng tôi chịu trách nhiệm với việc. Thẳng thắn về đánh đổi. Xây để bền, đo để chứng minh. Slogan: Hiện Thực Hoá Ý Chí.",
        ),
        chips: softCta(locale),
      };

    case "myth_agency":
      return {
        message: t(
          locale,
          "We are not a black-box agency: seniors who build also own the outcome; you see trade-offs before code; CI guards regressions. If you want mystery decks and vanishing PMs, we are the wrong lamp.",
          "Chúng tôi không phải agency hộp đen: senior xây cũng sở hữu kết quả; bạn thấy đánh đổi trước code; CI canh hồi quy. Nếu muốn deck thần bí và PM biến mất, sai cây đèn rồi.",
        ),
        chips: ctaChips(locale),
      };

    case "joke":
      return {
        message: t(
          locale,
          "Why did the genie refuse infinite loops? Because even magic needs an exit condition, and a human on-call.\n\n…Alright, back to real wishes.",
          "Vì sao thần đèn từ chối vòng lặp vô hạn? Vì cả phép thuật cũng cần điều kiện thoát, và người on-call.\n\n…Thôi, quay lại điều ước thật.",
        ),
        chips: [
          { id: "fortune", label: t(locale, "Fortune", "Lời sấm") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "contact_human":
      return {
        message: t(
          locale,
          `A person replies within one business day. Email ${company.email} or phone ${company.phone} (${company.phoneContact}). Or leave a wish here, same inbox, with your chat transcript.`,
          `Người thật phản hồi trong một ngày làm việc. Email ${company.email} hoặc gọi ${company.phone} (${company.phoneContact}). Hoặc gửi điều ước tại đây, cùng hộp thư, kèm transcript chat.`,
        ),
        chips: [
          {
            id: "contact_flow",
            label: t(locale, "Leave details for a human", "Để lại thông tin cho người thật"),
          },
          ...softCta(locale),
        ],
      };

    case "contact_flow":
      return {
        message: t(
          locale,
          "Happy to connect you with the team. A few short details and a human will follow up.",
          "Mình sẽ nối bạn với đội. Vài thông tin ngắn; người thật sẽ theo.",
        ),
        startContact: true,
        seedMessage: t(locale, "I would like a human follow-up.", "Tôi muốn người thật liên hệ."),
      };

    case "mvp_start":
      return {
        stage: "consult",
        message: t(
          locale,
          "On MVPs: ship a ruthless, measurable first slice users can feel in weeks, not a kitchen-sink v1. Name one outcome, one constraint, and what “done” looks like. When that spark is clear, we can capture a wish for the engineers or run a quick engagement quiz.",
          "Về MVP: phần đầu phải sắc nét và đo được, để người dùng cảm nhận trong vài tuần, không phải bản v1 nhồi quá nhiều. Hãy nêu một kết quả, một ràng buộc, và “xong” trông như thế nào. Khi đã rõ, mình ghi điều ước cho kỹ sư, hoặc chạy quiz hợp tác nhanh.",
        ),
        chips: [
          { id: encodeCorpusPath("consult", "mvp", "founder", "generous"), label: t(locale, "Guided MVP path", "Lộ trình MVP dẫn") },
          { id: "quiz_start", label: t(locale, "Which engagement fits?", "Mô hình nào hợp?") },
          { id: "promise_7day", label: t(locale, "7-day promise", "Cam kết 7 ngày") },
          {
            id: "mvp_flow",
            label: t(locale, "Ready, start MVP wish", "Sẵn sàng, gửi điều ước MVP"),
          },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "mvp_flow":
      return {
        message: t(
          locale,
          "Let’s capture your MVP wish for the engineers, name, email, and the outcome you want first.",
          "Mình ghi điều ước MVP cho kỹ sư, tên, email, và kết quả bạn muốn trước.",
        ),
        startWish: true,
        seedMessage: t(
          locale,
          "I need an MVP / first product slice.",
          "Tôi cần MVP / lát sản phẩm đầu tiên.",
        ),
      };

    case "book_call":
      return {
        message: t(
          locale,
          "A discovery call is 30 focused minutes with a senior, goals, constraints, and whether we are the right lamp. Leave your details and preferred window; a human books within one business day.",
          "Cuộc gọi discovery là 30 phút tập trung với senior, mục tiêu, ràng buộc, và liệu chúng tôi có đúng đèn. Để lại thông tin và khung giờ; người thật đặt lịch trong một ngày làm việc.",
        ),
        chips: [
          {
            id: "book_call_flow",
            label: t(locale, "Yes, book me in", "Có, đặt lịch cho tôi"),
          },
          { id: "quiz_start", label: t(locale, "Quiz first", "Quiz trước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "book_call_flow":
      return {
        message: t(
          locale,
          "Wonderful. I’ll collect a few details so the team can propose a call slot.",
          "Tuyệt. Mình lấy vài thông tin để đội đề xuất slot gọi.",
        ),
        startContact: true,
        seedMessage: t(
          locale,
          "I would like a discovery call.",
          "Tôi muốn một cuộc gọi discovery.",
        ),
      };

    case "demo_request":
      return {
        message: t(
          locale,
          "We do not run canned product demos, every engagement is custom. What we can show: public Work chapters, a teardown path, or a short call where we sketch your first slice on a whiteboard. Which path?",
          "Chúng tôi không chạy demo sản phẩm đóng gói, mỗi hợp tác là custom. Có thể: chương Work công khai, lộ trình teardown, hoặc cuộc gọi ngắn phác lát đầu trên bảng. Đường nào?",
        ),
        chips: [
          { id: "story_hub", label: t(locale, "Show work stories", "Xem câu chuyện Work") },
          { id: "teardown", label: t(locale, "Free teardown", "Đánh giá miễn phí") },
          { id: "book_call", label: t(locale, "Book a call", "Đặt cuộc gọi") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
        ],
      };

    case "redesign":
      return {
        message: t(
          locale,
          "Redesign or rebuild? We often start with a teardown (speed, security, a11y), then a fixed-scope slice that retires the worst pain, not a full rewrite fantasy. What is breaking for users today?",
          "Thiết kế lại hay làm lại? Thường bắt đầu teardown (tốc độ, bảo mật, a11y), rồi một lát fixed-scope gỡ nỗi đau nặng, không ảo tưởng rewrite toàn bộ. Người dùng đang vướng gì hôm nay?",
        ),
        chips: leadCta(locale, [
          { id: "teardown", label: t(locale, "Free teardown first", "Teardown miễn phí trước") },
          { id: "rescue", label: t(locale, "Rescue path", "Lộ trình cứu hộ") },
        ]),
      };

    case "ecommerce":
      return {
        message: t(
          locale,
          "Commerce wishes love clear checkout, inventory truth, and Core Web Vitals that convert. We build and rescue storefronts and ops tools, not vaporware marketplaces. Leave a wish with your stack or pain point.",
          "Điều ước thương mại thích checkout rõ, tồn kho trung thực, và Core Web Vitals chuyển đổi. Chúng tôi xây và cứu storefront + tool vận hành, không marketplace hơi nước. Gửi điều ước kèm stack hoặc nỗi đau.",
        ),
        chips: leadCta(locale, [
          { id: "service_web", label: t(locale, "Web practice", "Practice web") },
          { id: "story_hub", label: t(locale, "Work stories", "Câu chuyện Work") },
        ]),
      };

    case "ai_product":
      return {
        message: t(
          locale,
          "AI products still need product craft: clear jobs-to-be-done, human review paths, and metrics that are not vanity. We integrate models carefully, no magic without an exit condition and an on-call human. What should the AI do on day one?",
          "Sản phẩm AI vẫn cần nghề product: job rõ, đường review người, metric không ảo. Chúng tôi gắn model cẩn thận, không phép thuật thiếu điều kiện thoát và người on-call. AI nên làm gì ngày đầu?",
        ),
        chips: leadCta(locale, [
          { id: "mvp_start", label: t(locale, "MVP first", "MVP trước") },
          { id: "quiz_start", label: t(locale, "Engagement quiz", "Chọn mô hình hợp tác") },
        ]),
      };

    case "tech_stack":
      return {
        message: t(
          locale,
          "We are stack-pragmatic: modern web (React/Next-class apps), solid APIs, mobile when the store is the surface, and boring reliable data stores. We pick tools that seniors can own in production, not a conference bingo card. Have a stack constraint?",
          "Chúng tôi thực dụng stack: web hiện đại (app kiểu React/Next), API vững, mobile khi store là bề mặt, data store đáng tin. Chọn tool senior vận hành production được, không bingo hội nghị. Bạn có ràng buộc stack?",
        ),
        chips: [
          { id: "what_we_build", label: t(locale, "Practices", "Các practice") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Xem thêm chủ đề…") },
        ],
      };

    case "sla_support":
      return {
        message: t(
          locale,
          "Support is scoped with the engagement, dedicated teams include ongoing senior ownership; fixed-scope work can add a calm maintenance window after ship. We do not vanish after launch. Ask for SLA expectations when you leave a wish.",
          "Hỗ trợ được định trong hợp tác, đội dedicated gồm ownership senior liên tục; fixed-scope có thể thêm cửa sổ bảo trì êm sau ship. Chúng tôi không biến mất sau launch. Nêu kỳ vọng SLA khi gửi điều ước.",
        ),
        chips: leadCta(locale, [
          { id: "engagement_models", label: t(locale, "Engagement models", "Mô hình hợp tác") },
        ]),
      };

    case "partnership_flow":
      return {
        message: t(
          locale,
          "Partnership notes go to the right humans. A few details and we will follow up.",
          "Ghi chú partnership đến đúng người. Vài thông tin và chúng tôi sẽ theo.",
        ),
        startPartnership: true,
        seedMessage: t(
          locale,
          "I am interested in a partnership / outsourcing collaboration.",
          "Tôi quan tâm hợp tác partnership / outsource.",
        ),
      };

    case "careers_flow":
      return {
        message: t(
          locale,
          "Glad you are considering the lamp from the inside. Introduce yourself, we will route to hiring.",
          "Vui vì bạn nghĩ tới đèn từ bên trong. Hãy tự giới thiệu, mình chuyển tuyển dụng.",
        ),
        startCareers: true,
        seedMessage: t(
          locale,
          "I am interested in careers at CyberSkill.",
          "Tôi quan tâm tuyển dụng tại CyberSkill.",
        ),
      };

    case "wish":
      return {
        message: t(
          locale,
          "Let’s seal a wish for the team. I will ask a few short questions.",
          "Để mình niêm phong điều ước cho đội ngũ. Chỉ vài câu hỏi ngắn.",
        ),
        startWish: true,
      };

    default:
      return {
        message: t(
          locale,
          "The lamp crackled, try another topic, the quiz, a work story, or leave a wish for a human.",
          "Đèn lóe, thử chủ đề khác, quiz, câu chuyện Work, hoặc gửi điều ước cho người thật.",
        ),
        chips: getOpeningChips(locale),
      };
  }
}

/**
 * True if haystack contains any needle (case already lowercased).
 * Prefer this for Vietnamese. JS `\b` is ASCII-word based and fails on "giá", "xây gì".
 */
function hasAny(text: string, needles: string[]): boolean {
  return needles.some((n) => text.includes(n));
}

/**
 * Match free-text to a scripted topic (EN + VI keywords). Returns null if
 * nothing confident matches, caller uses offlineFallbackReply (still SCRIPTED).
 *
 * Order matters: specific phrases before broad ones. Process must NOT steal
 * "what can you build" / "I want to build …" (no bare discover|shape|build|support).
 */
export function matchScriptedFreeText(locale: L, raw: string): ScriptReply | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  type Rule = { id: string; test: (t: string) => boolean };
  // EN uses `\b` where tokens are Latin; VI uses substring needles (Unicode-safe).
  const rules: Rule[] = [
    {
      id: "path_hub",
      test: (t) =>
        /\b(guide me|consult path|walk me through|help me choose)\b/i.test(t) ||
        hasAny(t, ["dẫn mình", "lộ trình tư vấn", "hướng dẫn"]),
    },
    {
      id: "mvp_start",
      test: (t) =>
        /\b(mvp|minimum viable|first slice|prototype)\b/i.test(t) ||
        hasAny(t, ["mvp", "lát đầu", "prototype"]),
    },
    {
      id: "book_call",
      test: (t) =>
        /\b(book (a )?call|discovery call|schedule|meeting)\b/i.test(t) ||
        hasAny(t, ["đặt lịch", "cuộc gọi", "discovery"]),
    },
    {
      id: "ai_product",
      test: (t) =>
        /\b(ai|llm|gpt|machine learning|ml product)\b/i.test(t) ||
        hasAny(t, ["trí tuệ", "học máy", "mô hình ai"]),
    },
    {
      id: "ecommerce",
      test: (t) =>
        /\b(e-?commerce|shopify|storefront|checkout|online store)\b/i.test(t) ||
        hasAny(t, ["thương mại", "bán hàng online", "checkout"]),
    },
    {
      id: "redesign",
      test: (t) =>
        /\b(redesign|rebuild|replatform|revamp)\b/i.test(t) ||
        hasAny(t, ["thiết kế lại", "làm lại", "đổi nền"]),
    },
    {
      id: "tech_stack",
      test: (t) =>
        /\b(tech stack|stack|framework|react|next\.?js)\b/i.test(t) ||
        hasAny(t, ["công nghệ", "stack", "framework"]),
    },
    {
      id: "sla_support",
      test: (t) =>
        /\b(sla|support|maintenance|on-?call)\b/i.test(t) ||
        hasAny(t, ["hỗ trợ", "bảo trì", "sla"]),
    },
    {
      id: "demo_request",
      test: (t) =>
        /\b(demo|show me|walkthrough)\b/i.test(t) || hasAny(t, ["demo", "trình diễn"]),
    },
    {
      id: "quiz_start",
      test: (t) =>
        /\b(quiz|which (model|engagement)|engagement (model|fit))\b/i.test(t) ||
        hasAny(t, ["mô hình nào", "hợp tác nào"]),
    },
    {
      id: "engagement_models",
      test: (t) =>
        /\b(engagement model|dedicated (senior )?team|fixed[- ]scope)\b/i.test(t) ||
        hasAny(t, ["mô hình hợp tác", "đội senior", "phạm vi cố định"]),
    },
    {
      id: "capacity",
      test: (t) =>
        /\b(capacity|slots?|how many projects)\b/i.test(t) ||
        hasAny(t, ["năng lực", "suất", "bao nhiêu dự án"]),
    },
    {
      id: "promise_7day",
      test: (t) =>
        /\b(7[- ]?day|seven day)\b/i.test(t) ||
        // "promise" alone is weak; pair with day language or VI
        (/\bpromise\b/i.test(t) && /\b(7|seven|day)\b/i.test(t)) ||
        hasAny(t, ["cam kết 7", "7 ngày"]),
    },
    {
      id: "pricing",
      test: (t) => {
        if (/\b(price|pricing|budget|cost|quote|how much)\b/i.test(t)) return true;
        if (hasAny(t, ["ngân sách", "chi phí", "báo giá"])) return true;
        // "giá" alone is pricing; "giá trị" is values (handled later).
        if (!t.includes("giá")) return false;
        const withoutValues = t.replaceAll("giá trị", " ");
        return withoutValues.includes("giá");
      },
    },
    {
      id: "timeline",
      test: (t) =>
        /\b(timeline|deadline|how long|when can)\b/i.test(t) ||
        hasAny(t, ["thời gian", "bao lâu", "kịp"]),
    },
    {
      id: "teardown",
      test: (t) =>
        /\b(teardown|audit|review my (site|app)|15.?point)\b/i.test(t) ||
        hasAny(t, ["đánh giá", "kiểm tra web"]),
    },
    {
      id: "careers",
      test: (t) =>
        /\b(career|job|hiring|join (the )?team)\b/i.test(t) ||
        hasAny(t, ["tuyển", "việc làm", "ứng tuyển"]),
    },
    {
      id: "who_is_lumi",
      test: (t) =>
        /\b(who are you|what are you|your name|\blumi\b)\b/i.test(t) ||
        hasAny(t, ["bạn là ai", "mày là ai"]),
    },
    {
      id: "saigon",
      test: (t) =>
        /\b(saigon|ho chi minh|\bhcm\b|vietnam|where are you|address)\b/i.test(t) ||
        hasAny(t, ["sài gòn", "việt nam", "địa chỉ"]),
    },
    {
      id: "rescue",
      test: (t) =>
        /\b(rescue|legacy|rewrite|broken|on fire|migration)\b/i.test(t) ||
        hasAny(t, ["cứu", "hệ thống cũ", "sập", "lỗi nặng"]),
    },
    {
      id: "contact_human",
      test: (t) =>
        /\b(human|call me|meeting|talk to (a )?person)\b/i.test(t) ||
        hasAny(t, ["người thật", "gặp", "gọi điện"]),
    },
    {
      id: "fortune",
      test: (t) =>
        /\b(fortune|magic|rub|lamp)\b/i.test(t) || hasAny(t, ["thần đèn", "xoa đèn", "bói"]),
    },
    {
      id: "three_wishes",
      test: (t) =>
        /\b(three wishes|3 wishes)\b/i.test(t) || hasAny(t, ["ba điều ước"]),
    },
    {
      id: "genie_rules",
      test: (t) =>
        /\b(house rules|genie rules|chat rules)\b/i.test(t) ||
        hasAny(t, ["nội quy", "nội quy thần đèn"]),
    },
    {
      id: "joke",
      test: (t) => /\b(joke|funny|haha)\b/i.test(t) || hasAny(t, ["đùa", "cười"]),
    },
    {
      id: "partnership",
      test: (t) =>
        /\b(partner|outsource|agency white.?label)\b/i.test(t) ||
        hasAny(t, ["hợp tác", "ủy thác", "outsource"]),
    },
    {
      id: "security_privacy",
      test: (t) =>
        /\b(security|privacy|gdpr|pdpl|password)\b/i.test(t) ||
        hasAny(t, ["bảo mật", "riêng tư", "mật khẩu"]),
    },
    {
      id: "accessibility",
      test: (t) =>
        /\b(a11y|accessibility|wcag)\b/i.test(t) ||
        hasAny(t, ["khả năng tiếp cận", "tiếp cận"]),
    },
    {
      id: "metrics",
      test: (t) =>
        /\b(metric|kpi|measure|cwv|core web vitals)\b/i.test(t) ||
        hasAny(t, ["đo lường", "chỉ số"]),
    },
    // what_we_build BEFORE process, "what can you build" must not hit process.
    {
      id: "what_we_build",
      test: (t) =>
        /\b(what (do you|can you) build|services)\b/i.test(t) ||
        hasAny(t, ["xây gì", "dịch vụ", "các bạn xây"]),
    },
    // process: only explicit process language, never bare build|discover|shape|support.
    {
      id: "process",
      test: (t) =>
        /\b(process steps|how a project runs|the process)\b/i.test(t) ||
        (/\bprocess\b/i.test(t) && !/\bbuild\b/i.test(t)) ||
        hasAny(t, ["quy trình", "các bước quy trình"]),
    },
    {
      id: "first_week",
      test: (t) =>
        /\b(first week|week one)\b/i.test(t) || hasAny(t, ["tuần đầu", "tuần 1"]),
    },
    {
      id: "story_hub",
      test: (t) =>
        /\b(case study|portfolio|your work|work shelf)\b/i.test(t) ||
        hasAny(t, ["dự án", "câu chuyện", "case study"]),
    },
    {
      id: "service_mobile",
      test: (t) =>
        /\b(mobile app|ios|android)\b/i.test(t) || hasAny(t, ["ứng dụng di động"]),
    },
    {
      id: "service_internal",
      test: (t) =>
        /\b(internal (system|tool)|back.?office|ops platform)\b/i.test(t) ||
        hasAny(t, ["hệ thống nội bộ", "nội bộ"]),
    },
    {
      id: "service_web",
      test: (t) =>
        /\b(web app|website|dashboard|portal)\b/i.test(t) || hasAny(t, ["ứng dụng web"]),
    },
    {
      id: "how_we_work",
      test: (t) =>
        /\b(how (do )?you work)\b/i.test(t) || hasAny(t, ["cách các bạn làm", "cách làm việc"]),
    },
    {
      id: "myth_agency",
      test: (t) =>
        /\b(black.?box|agency myth)\b/i.test(t) || hasAny(t, ["hộp đen"]),
    },
    {
      id: "values",
      test: (t) =>
        /\b(values|what you stand)\b/i.test(t) || hasAny(t, ["giá trị", "đứng về"]),
    },
    {
      id: "browse",
      test: (t) =>
        /\b(just browsing|looking around|curious)\b/i.test(t) ||
        hasAny(t, ["xem chơi", "cho vui", "tham khảo"]),
    },
    {
      id: "browse",
      test: (t) =>
        /^(hello|hi|hey|hola)[\s!.,?]*$/i.test(t.trim()) ||
        hasAny(t, ["xin chào"]) ||
        /^chào[\s!.,?]*$/i.test(t.trim()),
    },
  ];

  for (const rule of rules) {
    if (rule.test(text)) {
      return resolveScriptTopic(locale, rule.id);
    }
  }

  // Soft “I heard a wish”, after specific topics; process no longer steals "build".
  const softIntent =
    text.length >= 12 &&
    (/\b(want|need|build|fix|improve)\b/i.test(text) ||
      hasAny(text, ["muốn", "cần", "xây", "sửa", "cải"]));
  if (softIntent) {
    return {
      message: t(
        locale,
        "That sounds like a wish forming. I can hand it to the team, or run a quick engagement quiz first.",
        "Nghe như một điều ước đang thành hình. Mình có thể chuyển đội ngũ, hoặc chạy quiz hợp tác nhanh trước.",
      ),
      chips: [
        { id: "wish", label: t(locale, "Leave this as a wish", "Gửi làm điều ước") },
        { id: "quiz_start", label: t(locale, "Engagement quiz", "Chọn mô hình hợp tác") },
        { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn làm được gì?") },
        { id: "more", label: t(locale, "Other topics", "Chủ đề khác") },
      ],
    };
  }

  return null;
}

/**
 * Soft fallback when free text did not match a SCRIPTED rule.
 * (All pre-LLM chat is SCRIPTED; this is not “LLM offline” product mode.)
 */
export function offlineFallbackReply(locale: L): ScriptReply {
  return {
    stage: "rapport",
    message: t(
      locale,
      "I didn’t quite catch that, still here for you. Try the guided path, a quick quiz, a work story, or leave a wish when you’re ready.",
      "Mình chưa nắm đúng ý. Bạn thử lộ trình dẫn, quiz nhanh, một câu chuyện dự án, hoặc gửi điều ước khi sẵn sàng nhé.",
    ),
    chips: getOpeningChips(locale),
  };
}

// --- Official bubble inventory (tests + SCRATCH reports share this path) -----

/**
 * Expand full SCRIPTED inventory: combinatorial cells + fortunes + hero topics.
 * Counting rule: see COUNTING_RULE / BubbleCountReport.countingRule.
 */
export function enumerateScriptedBubbles(): ScriptedBubble[] {
  const heroes = listPrimaryTopicIds().map((id) => {
    const en = resolveScriptTopic("en", id);
    const vi = resolveScriptTopic("vi", id);
    const chipIds = new Set([
      ...(en.chips ?? []).map((c) => c.id),
      ...(vi.chips ?? []).map((c) => c.id),
    ]);
    const chips = [...chipIds].map((cid) => {
      const enC = en.chips?.find((c) => c.id === cid);
      const viC = vi.chips?.find((c) => c.id === cid);
      return {
        id: cid,
        labelEn: enC?.label ?? viC?.label ?? cid,
        labelVi: viC?.label ?? enC?.label ?? cid,
      };
    });
    return {
      id,
      messageEn: en.message,
      messageVi: vi.message,
      chips,
    };
  });

  return [
    ...expandCombinatorialBubbles(),
    ...expandFortuneBubbles(),
    ...expandHeroBubbles(heroes),
  ];
}

/** Official count path, same expansion as enumerateScriptedBubbles. */
export function countScriptedBubbles(): BubbleCountReport {
  const bubbles = enumerateScriptedBubbles();
  const report = summarizeBubbles(bubbles);
  report.heroTopicCount = listPrimaryTopicIds().length;
  return report;
}

/** Sample a consult→lead path for evidence (chip ids → messages → COLLECT flags). */
export function sampleConsultToLeadPath(locale: L = "en"): Array<{
  id: string;
  stage?: FunnelStage;
  message: string;
  collect:
    | "wish"
    | "teardown"
    | "partnership"
    | "careers"
    | "contact"
    | null;
}> {
  const steps = [
    "path_hub",
    "path_sit_founder",
    "path_intent_mvp__founder",
    encodeCorpusPath("proof", "mvp", "founder", "generous"),
    encodeCorpusPath("interest", "mvp", "founder", "generous"),
    encodeCorpusPath("soft_cta", "mvp", "founder", "generous"),
    encodeCorpusPath("lead", "mvp", "founder", "generous"),
  ];
  return steps.map((id) => {
    const r = resolveScriptTopic(locale, id);
    let collect: "wish" | "teardown" | "partnership" | "careers" | "contact" | null =
      null;
    if (r.startWish) collect = "wish";
    else if (r.startTeardown) collect = "teardown";
    else if (r.startPartnership) collect = "partnership";
    else if (r.startCareers) collect = "careers";
    else if (r.startContact) collect = "contact";
    return {
      id,
      stage: r.stage ?? stageForHeroTopic(id),
      message: r.message,
      collect,
    };
  });
}
