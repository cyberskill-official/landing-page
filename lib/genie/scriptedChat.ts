/**
 * Keyless Lumi conversation (no LLM required).
 *
 * Discovery chips + keyword free-text + multi-step trees (engagement quiz,
 * work-story beats) keep the lamp interesting when Anthropic is off. Pure
 * functions — unit-tested in tests/scripted-chat.test.ts.
 *
 * Grounding: company, commercialPolicy, services, processSteps, work (SSOT).
 * No invented client metrics.
 */

import type { Locale } from "@/lib/i18n/config";
import { company, services, processSteps, work } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";

export type ScriptChip = {
  /** Topic id, wish/teardown flags, or quiz/story step id. */
  id: string;
  label: string;
};

export type ScriptReply = {
  message: string;
  chips?: ScriptChip[];
  startWish?: boolean;
  startTeardown?: boolean;
};

type L = Locale;

function t(locale: L, en: string, vi: string): string {
  return locale === "vi" ? vi : en;
}

function loc(locale: L, s: { en: string; vi: string }): string {
  return locale === "vi" ? s.vi : s.en;
}

/** Opening discovery chips when the visitor is not in a lead form. */
export function getOpeningChips(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "quiz_start", label: t(locale, "Which engagement fits?", "Mô hình nào hợp?") },
    { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn xây gì?") },
    { id: "story_hub", label: t(locale, "A story from our work", "Câu chuyện từ dự án") },
    { id: "teardown", label: t(locale, "Free 15-point teardown", "Đánh giá 15 điểm miễn phí") },
    { id: "fortune", label: t(locale, "Rub the lamp", "Xoa đèn ước") },
    { id: "how_we_work", label: t(locale, "How you work", "Cách các bạn làm việc") },
    { id: "who_is_lumi", label: t(locale, "Who are you?", "Bạn là ai?") },
  ];
}

function moreMenu(locale: L): ScriptChip[] {
  return [
    { id: "pricing", label: t(locale, "Budget & pricing", "Ngân sách & giá") },
    { id: "engagement_models", label: t(locale, "Engagement models", "Mô hình hợp tác") },
    { id: "capacity", label: t(locale, "Capacity & slots", "Suất & năng lực") },
    { id: "promise_7day", label: t(locale, "7-day promise", "Cam kết 7 ngày") },
    { id: "timeline", label: t(locale, "Timelines", "Thời gian") },
    { id: "process", label: t(locale, "How a project runs", "Một dự án chạy ra sao") },
    { id: "first_week", label: t(locale, "What week one looks like", "Tuần đầu trông thế nào") },
    { id: "service_web", label: t(locale, "Web apps", "Ứng dụng web") },
    { id: "service_mobile", label: t(locale, "Mobile apps", "Ứng dụng di động") },
    { id: "service_internal", label: t(locale, "Internal systems", "Hệ thống nội bộ") },
    { id: "partnership", label: t(locale, "Partnership / outsource", "Hợp tác / outsource") },
    { id: "careers", label: t(locale, "Careers", "Tuyển dụng") },
    { id: "saigon", label: t(locale, "Saigon studio", "Studio Sài Gòn") },
    { id: "rescue", label: t(locale, "Rescue a project", "Cứu dự án") },
    { id: "security_privacy", label: t(locale, "Security & privacy", "Bảo mật & riêng tư") },
    { id: "accessibility", label: t(locale, "Accessibility", "Khả năng tiếp cận") },
    { id: "metrics", label: t(locale, "How you measure done", "Đo thế nào là xong") },
    { id: "values", label: t(locale, "What you stand for", "Điều các bạn theo đuổi") },
    { id: "three_wishes", label: t(locale, "Three classic wishes", "Ba điều ước cổ điển") },
    { id: "genie_rules", label: t(locale, "Genie house rules", "Nội quy thần đèn") },
    { id: "myth_agency", label: t(locale, "Not a black-box agency", "Không phải agency hộp đen") },
    { id: "joke", label: t(locale, "A tiny genie joke", "Một câu đùa nhỏ") },
    { id: "browse", label: t(locale, "Just browsing", "Chỉ xem chơi") },
    { id: "contact_human", label: t(locale, "Talk to a human", "Gặp người thật") },
    { id: "menu", label: t(locale, "Show all topics", "Xem mọi chủ đề") },
  ];
}

function ctaChips(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "teardown_flow", label: t(locale, "Request teardown", "Yêu cầu đánh giá") },
    { id: "quiz_start", label: t(locale, "Engagement quiz", "Quiz hợp tác") },
    { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
  ];
}

function softCta(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
  ];
}

// --- Fortunes (large pool; pure pick for tests) --------------------------------

const FORTUNES_EN = [
  "I see a product that ships in small golden releases — users notice within weeks, not quarters.",
  "The lamp whispers: the riskiest part of your idea is hiding in plain sight. Name it first, and the rest softens.",
  "A dashboard that actually gets opened. A flow that stops leaking users. One clear wish is enough to start.",
  "Your next release should feel like a light bulb, not a renovation. We build for that.",
  "Three wishes max for now: clarity, an honest scope, and a team that answers when things break.",
  "Spreadsheets are retiring in the distance. An operations platform waves them goodbye.",
  "Offline-first lessons travel farther than perfect Wi‑Fi. Build for the real network.",
  "Speed is a feature. Rebuild the hot path before you polish the chrome.",
  "Legacy systems fear daylight — and a careful cloud migration with shadow runs.",
  "Metrics before mythology: if you cannot measure done, you cannot celebrate it.",
  "Senior engineers who own the slice end to end beat a hallway of hand-offs.",
  "The first week is for truth: goals, constraints, and what must not move.",
  "A fixed scope loves a clear outcome. An ongoing team loves a moving frontier.",
  "Accessibility is not a coat of paint — it is how more people reach the wish.",
  "Privacy is a promise you keep in code, not only in a policy page.",
  "CI that fails on regressions is a guardian genie for every future release.",
  "Timezone-friendly Saigon mornings pair well with global evenings — we overlap on purpose.",
  "Rescue work starts with what is on fire, not with a greenfield fantasy.",
  "Capacity is finite by design: few concurrent projects, deep attention each.",
  "The 7-day promise is a structure or a strategy — not a full product from thin air.",
  "Trade-offs named out loud feel kinder than surprises in month three.",
  "One source of truth beats twelve copy-pasted sheets arguing at midnight.",
  "Mobile wishes want store-ready pipelines, not demos that die on a cable.",
  "Internal tools win when they give hours back to the people who use them daily.",
  "The lamp prefers concrete nouns: checkout, roster, invoice — not 'synergy'.",
];

const FORTUNES_VI = [
  "Mình thấy một sản phẩm ra mắt bằng các bản nhỏ lấp lánh — người dùng nhận ra trong vài tuần, không phải vài quý.",
  "Đèn thì thầm: phần rủi ro nhất của ý tưởng đang trốn ngay trước mắt. Gọi tên nó trước, phần còn lại sẽ dịu lại.",
  "Một dashboard thật sự được mở. Một luồng không còn rò người dùng. Một điều ước rõ là đủ để bắt đầu.",
  "Bản phát hành tiếp theo nên như bóng đèn bật sáng, không phải đại tu. CyberSkill xây vì điều đó.",
  "Ba điều ước tạm thời: rõ ràng, phạm vi trung thực, và đội ngũ trả lời khi hệ thống trục trặc.",
  "Bảng tính đang nghỉ hưu ở phía xa. Một nền tảng vận hành vẫy tay tạm biệt chúng.",
  "Bài học offline-first đi xa hơn Wi‑Fi hoàn hảo. Xây cho mạng thật ngoài đời.",
  "Tốc độ là một tính năng. Sửa đường nóng trước khi đánh bóng chrome.",
  "Hệ thống cũ sợ ánh sáng ban ngày — và một cuộc di chuyển đám mây cẩn thận với chạy song song.",
  "Metric trước thần thoại: không đo được 'xong' thì không ăn mừng được.",
  "Kỹ sư senior sở hữu end-to-end một lát việc thắng một hành lang bàn giao.",
  "Tuần đầu là vì sự thật: mục tiêu, ràng buộc, và thứ không được xê dịch.",
  "Phạm vi cố định yêu một kết quả rõ. Đội ongoing yêu một biên giới đang chuyển.",
  "Khả năng tiếp cận không phải sơn phủ — là cách nhiều người chạm được điều ước.",
  "Riêng tư là lời hứa giữ trong code, không chỉ trên trang chính sách.",
  "CI chặn hồi quy là thần đèn canh gác cho mọi bản sau.",
  "Sáng Sài Gòn thân thiện múi giờ ghép với tối toàn cầu — chúng tôi chồng lịch có chủ đích.",
  "Cứu hộ bắt đầu từ chỗ đang cháy, không phải ảo tưởng greenfield.",
  "Năng lực hữu hạn by design: ít dự án song song, chú ý sâu từng cái.",
  "Cam kết 7 ngày là cấu trúc hoặc chiến lược — không phải full product từ hư không.",
  "Đánh đổi nói to nghe dịu hơn bất ngờ ở tháng ba.",
  "Một nguồn sự thật thắng mười hai sheet copy-paste cãi nhau lúc nửa đêm.",
  "Điều ước mobile muốn pipeline lên store, không phải demo chết trên cáp.",
  "Tool nội bộ thắng khi trả lại giờ cho người dùng hằng ngày.",
  "Đèn thích danh từ cụ thể: checkout, roster, hoá đơn — không phải 'synergy'.",
];

export function fortunePoolSize(locale: L = "en"): number {
  return (locale === "vi" ? FORTUNES_VI : FORTUNES_EN).length;
}

/** Pure fortune pick; pass index for deterministic tests. */
export function pickFortune(locale: L, index?: number): string {
  const pool = locale === "vi" ? FORTUNES_VI : FORTUNES_EN;
  if (typeof index === "number" && Number.isFinite(index)) {
    const i = ((Math.floor(index) % pool.length) + pool.length) % pool.length;
    return pool[i]!;
  }
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0]!;
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
        "A two-question lamp quiz — no wrong answers. First: what pace do you need?",
        "Quiz hai câu của đèn — không có đáp án sai. Trước hết: bạn cần nhịp nào?",
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
            "Speed with a defined outcome — classic fixed-scope energy. Second: how locked is the scope?",
            "Nhanh với kết quả định sẵn — năng lượng fixed-scope. Tiếp: phạm vi chốt được bao nhiêu?",
          )
        : pace === "steady"
          ? t(
              locale,
              "A dedicated senior rhythm — good for product that keeps moving. Second: how locked is the scope?",
              "Nhịp đội senior chuyên biệt — hợp sản phẩm còn chuyển động. Tiếp: phạm vi chốt được bao nhiêu?",
            )
          : t(
              locale,
              "Still exploring — we often start with discovery and a sharp first slice. Second: how locked is the scope?",
              "Vẫn khám phá — thường bắt đầu bằng discovery và một lát đầu sắc. Tiếp: phạm vi chốt được bao nhiêu?",
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
      `The lamp points to **${loc(locale, primary.name)}** — ${loc(locale, primary.range)}; ${loc(locale, primary.timeline)}. Alternative: **${loc(locale, secondary.name)}** (${loc(locale, secondary.range)}). ${capacityLine}\n\nLeave a wish with your context and a human will confirm the fit.`,
      `Đèn chỉ về **${loc(locale, primary.name)}** — ${loc(locale, primary.range)}; ${loc(locale, primary.timeline)}. Phương án khác: **${loc(locale, secondary.name)}** (${loc(locale, secondary.range)}). ${capacityLine}\n\nGửi điều ước kèm ngữ cảnh; người thật sẽ xác nhận độ hợp.`,
    ),
    chips: [
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "engagement_models", label: t(locale, "Compare both models", "So hai mô hình") },
      { id: "quiz_start", label: t(locale, "Retake quiz", "Làm lại quiz") },
      { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
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
        "A few public chapters from the Work shelf — pick one; I will not invent metrics that are not on the page.",
        "Vài chương công khai từ kệ Work — chọn một; mình không bịa metric không có trên trang.",
      ),
      chips: [
        ...work.map((w) => ({
          id: `story_${w.slug}`,
          label: loc(locale, w.title).slice(0, 48) + (loc(locale, w.title).length > 48 ? "…" : ""),
        })),
        { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
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
      `**${loc(locale, item.title)}** — for ${loc(locale, item.client)}. ${detailHint}`,
      `**${loc(locale, item.title)}** — cho ${loc(locale, item.client)}. ${detailHint}`,
    ),
    chips: [
      { id: "story_hub", label: t(locale, "Another story", "Câu chuyện khác") },
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn xây gì?") },
      { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
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
      `**${loc(locale, svc.title)}** — ${loc(locale, svc.summary)}\n${outcomes}`,
      `**${loc(locale, svc.title)}** — ${loc(locale, svc.summary)}\n${outcomes}`,
    ),
    chips: [
      { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
      { id: "story_hub", label: t(locale, "Related work stories", "Câu chuyện liên quan") },
      { id: "what_we_build", label: t(locale, "All practices", "Mọi practice") },
      { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
    ],
  };
}

// --- Inventory (for tests + SCRATCH evidence) --------------------------------

/** Stable list of primary topic resolvers (not every quiz step). */
export function listPrimaryTopicIds(): string[] {
  return [
    "menu",
    "more",
    "wish",
    "teardown",
    "teardown_flow",
    "what_we_build",
    "how_we_work",
    "pricing",
    "timeline",
    "careers",
    "who_is_lumi",
    "saigon",
    "fortune",
    "browse",
    "rescue",
    "contact_human",
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

// --- Main resolver -----------------------------------------------------------

/** Resolve a chip / topic id into Lumi's reply. */
export function resolveScriptTopic(locale: L, id: string): ScriptReply {
  const quiz = resolveEngagementQuiz(locale, id);
  if (quiz) return quiz;

  const story = resolveWorkStory(locale, id);
  if (story) return story;

  const service = resolveService(locale, id);
  if (service) return service;

  switch (id) {
    case "menu":
    case "more":
      return {
        message: t(
          locale,
          "Pick a thread — or type freely. I answer even when the big magic (AI) is napping. Try the engagement quiz or a work story.",
          "Chọn một chủ đề — hoặc gõ tự do. Mình vẫn trả lời khi phép thuật lớn (AI) đang ngủ. Thử quiz hợp tác hoặc câu chuyện dự án.",
        ),
        chips: [
          ...getOpeningChips(locale).filter((c) => c.id !== "wish"),
          ...moreMenu(locale),
        ],
      };

    case "what_we_build":
      return {
        message: t(
          locale,
          `Three practices under one lamp: ${services.map((s) => loc(locale, s.title)).join(", ")}. Founded ${company.founded} in ${company.city}. Dive into one, or leave a wish.`,
          `Ba practice dưới một cây đèn: ${services.map((s) => loc(locale, s.title)).join(", ")}. Thành lập ${company.founded} tại ${company.city}. Đào sâu một nhánh, hoặc gửi điều ước.`,
        ),
        chips: [
          { id: "service_web", label: t(locale, "Web apps", "Ứng dụng web") },
          { id: "service_mobile", label: t(locale, "Mobile", "Di động") },
          { id: "service_internal", label: t(locale, "Internal systems", "Hệ thống nội bộ") },
          { id: "story_hub", label: t(locale, "Work stories", "Câu chuyện Work") },
          ...ctaChips(locale).filter((c) => c.id === "wish" || c.id === "more"),
        ],
      };

    case "how_we_work":
      return {
        message: t(
          locale,
          "Small senior team. We name trade-offs out loud, ship reviewable slices, and wire metrics so “done” means users can feel it. No black-box agencies, no mystery timeline.",
          "Đội ngũ senior gọn. Chúng tôi nói rõ đánh đổi, bàn giao từng lát có thể review, và gắn metric để “xong” nghĩa là người dùng cảm nhận được. Không hộp đen, không timeline bí ẩn.",
        ),
        chips: [
          { id: "process", label: t(locale, "Process steps", "Các bước quy trình") },
          { id: "first_week", label: t(locale, "Week one", "Tuần đầu") },
          { id: "quiz_start", label: t(locale, "Engagement quiz", "Quiz hợp tác") },
          ...ctaChips(locale).filter((c) => c.id !== "quiz_start"),
        ],
      };

    case "process": {
      const lines = processSteps
        .map((p) => `**${p.n} ${loc(locale, p.title)}** — ${loc(locale, p.body)}`)
        .join("\n\n");
      return {
        message: t(
          locale,
          `How a project runs:\n\n${lines}`,
          `Một dự án chạy ra sao:\n\n${lines}`,
        ),
        chips: ctaChips(locale),
      };
    }

    case "first_week":
      return {
        message: t(
          locale,
          `Week one is discovery: understand the goal and constraints, define success in measurable terms, and surface risks before code. Promise on the site: ${loc(locale, commercialPolicy.ctaPromise)}.`,
          `Tuần đầu là khám phá: hiểu mục tiêu và ràng buộc, định nghĩa thành công đo được, lộ rủi ro trước khi code. Cam kết trên site: ${loc(locale, commercialPolicy.ctaPromise)}.`,
        ),
        chips: [
          { id: "promise_7day", label: t(locale, "7-day promise", "Cam kết 7 ngày") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "pricing":
      return {
        message: t(
          locale,
          "No fixed à-la-carte menu — each project is scoped to its goal. We shape the work, name the risks, then quote honestly. Published models live under Engagement; leave a wish with rough budget or timeline for a human follow-up within one business day.",
          "Không có menu gọi món cố định — mỗi dự án định phạm vi theo mục tiêu. Chúng tôi phác thảo, gọi tên rủi ro, rồi báo giá trung thực. Mô hình công bố nằm ở Engagement; gửi điều ước kèm ngân sách/timeline ước lượng để người thật phản hồi trong một ngày làm việc.",
        ),
        chips: [
          { id: "engagement_models", label: t(locale, "Show model ranges", "Xem dải mô hình") },
          { id: "quiz_start", label: t(locale, "Which fits me?", "Cái nào hợp tôi?") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "engagement_models": {
      const body = commercialPolicy.engagementModels
        .map(
          (m) =>
            `**${loc(locale, m.name)}** — ${loc(locale, m.range)}; ${loc(locale, m.timeline)}`,
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
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
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
          `Our published outcome promise: “${loc(locale, commercialPolicy.ctaPromise)}.” That is a production-ready structure or a clear strategy — not a finished product from a blank page. Leave a wish to start the clock with humans.`,
          `Cam kết kết quả công bố: “${loc(locale, commercialPolicy.ctaPromise)}.” Đó là cấu trúc sẵn sàng vận hành hoặc chiến lược rõ — không phải full product từ trang trắng. Gửi điều ước để người thật bấm đồng hồ.`,
        ),
        chips: ctaChips(locale),
      };

    case "timeline":
      return {
        message: t(
          locale,
          "It depends on scope — but we design for progress in weeks, not only a big bang at the end. Fixed-scope work often lands in the 6–12 week band; dedicated teams run in multi-month commitments. Tell us the outcome and by when.",
          "Phụ thuộc phạm vi — nhưng chúng tôi thiết kế tiến độ theo tuần, không chỉ một cú nổ cuối. Fixed-scope thường 6–12 tuần; đội dedicated theo cam kết nhiều tháng. Hãy nói kết quả và hạn chót.",
        ),
        chips: ctaChips(locale),
      };

    case "teardown":
      return {
        message: t(
          locale,
          "A free 15-point teardown of your site or internal tool — speed, security, accessibility — PDF in about 3 business days. Limited weekly slots. Want me to save one for you?",
          "Đánh giá 15 điểm miễn phí cho site hoặc tool nội bộ — tốc độ, bảo mật, khả năng tiếp cận — PDF khoảng 3 ngày làm việc. Suất mỗi tuần có hạn. Mình giữ một suất cho bạn nhé?",
        ),
        chips: [
          {
            id: "teardown_flow",
            label: t(locale, "Yes — request teardown", "Có — yêu cầu đánh giá"),
          },
          { id: "wish", label: t(locale, "Different wish", "Điều ước khác") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "teardown_flow":
      return {
        message: t(
          locale,
          "Wonderful. I will collect a few details for the engineering team.",
          "Tuyệt. Mình sẽ lấy vài thông tin cho đội kỹ sư.",
        ),
        startTeardown: true,
      };

    case "careers":
      return {
        message: t(
          locale,
          `We hire for craft and care — a small senior team in ${company.city}. Browse Careers on this site, or leave a wish with “careers” in the message and introduce yourself.`,
          `Chúng tôi tuyển người có tay nghề và sự chỉn chu — đội senior gọn tại ${company.city}. Xem Careers trên site, hoặc gửi điều ước ghi “tuyển dụng” và tự giới thiệu.`,
        ),
        chips: softCta(locale),
      };

    case "who_is_lumi":
      return {
        message: t(
          locale,
          "I am Lumi — CyberSkill’s golden genie. I turn clear wishes into working software with the human team behind the lamp. I am playful, not pushy; honest, not hypey. Rub me for a fortune, take the engagement quiz, or leave a real wish for the engineers.",
          "Mình là Lumi — thần đèn vàng của CyberSkill. Mình biến điều ước rõ thành phần mềm chạy thật cùng đội người sau cây đèn. Vui nhưng không ép; thật thà, không thổi phồng. Xoa đèn lấy lời sấm, làm quiz hợp tác, hoặc gửi điều ước thật cho kỹ sư.",
        ),
        chips: [
          { id: "fortune", label: t(locale, "Rub the lamp", "Xoa đèn ước") },
          { id: "three_wishes", label: t(locale, "Three wishes", "Ba điều ước") },
          { id: "genie_rules", label: t(locale, "House rules", "Nội quy") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
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
          "Classic genie law, CyberSkill edition:\n1) One clear outcome beats ten vague hopes.\n2) Trade-offs must be spoken, not hidden.\n3) A human still owns the reply — I am the lamp, not the contract.\n\nWhat is your first wish?",
          "Luật thần đèn bản CyberSkill:\n1) Một kết quả rõ thắng mười hy vọng mơ hồ.\n2) Đánh đổi phải được nói, không giấu.\n3) Người thật vẫn sở hữu phản hồi — mình là đèn, không phải hợp đồng.\n\nĐiều ước đầu của bạn là gì?",
        ),
        chips: [
          { id: "wish", label: t(locale, "State my wish", "Nói điều ước") },
          { id: "fortune", label: t(locale, "Fortune instead", "Lời sấm vậy") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
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
          "Browsing is welcome — the lamp does not bite. Peek at Work, How we build, or take a 30-second engagement quiz. When a spark lands, leave a wish or request a free teardown.",
          "Xem chơi cũng được — đèn không cắn. Thử Work, How we build, hoặc quiz hợp tác 30 giây. Khi lóe ý, gửi điều ước hoặc xin đánh giá miễn phí.",
        ),
        chips: ctaChips(locale),
      };

    case "rescue":
      return {
        message: t(
          locale,
          "We take on running systems too — rescue, rebuild, or calm maintenance. Tell us what is breaking and what “stable” would look like; a human will follow up. Legacy migrations are a public chapter on the Work shelf.",
          "Chúng tôi nhận cả hệ thống đang chạy — cứu hộ, làm lại, hoặc bảo trì êm. Hãy nói thứ gì đang vỡ và “ổn định” trông ra sao; người thật sẽ theo. Di chuyển hệ thống cũ là một chương Work công khai.",
        ),
        chips: [
          { id: "wish", label: t(locale, "Describe the mess", "Kể mớ rối") },
          { id: "story_legacy-migration", label: t(locale, "Legacy migration story", "Chuyện di chuyển legacy") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "partnership":
      return {
        message: t(
          locale,
          `${loc(locale, commercialPolicy.partnershipOffer)}. Audience we serve: ${loc(locale, commercialPolicy.heroAudience)}. Leave a wish with partnership in the note.`,
          `${loc(locale, commercialPolicy.partnershipOffer)}. Đối tượng: ${loc(locale, commercialPolicy.heroAudience)}. Gửi điều ước ghi partnership trong ghi chú.`,
        ),
        chips: softCta(locale),
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
          "Accessible interfaces are part of craft — keyboard paths, contrast, and honest labels. Free teardowns include accessibility checks alongside speed and security. Want a teardown of your site?",
          "Giao diện tiếp cận được là một phần nghề — bàn phím, tương phản, nhãn trung thực. Đánh giá miễn phí gồm cả a11y cùng tốc độ và bảo mật. Muốn teardown site của bạn?",
        ),
        chips: [
          { id: "teardown", label: t(locale, "Free teardown", "Đánh giá miễn phí") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "metrics":
      return {
        message: t(
          locale,
          "We win when your numbers move — Core Web Vitals, crash-free sessions, hours returned to the team — not when the clock runs out. Define success measures in discovery; wire them in build.",
          "Chúng tôi thắng khi chỉ số của bạn dịch chuyển — Core Web Vitals, phiên không crash, giờ trả lại đội — không phải khi đồng hồ hết. Định nghĩa thước đo lúc discovery; gắn lúc build.",
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
          "Why did the genie refuse infinite loops? Because even magic needs an exit condition — and a human on-call.\n\n…Alright, back to real wishes.",
          "Vì sao thần đèn từ chối vòng lặp vô hạn? Vì cả phép thuật cũng cần điều kiện thoát — và người on-call.\n\n…Thôi, quay lại điều ước thật.",
        ),
        chips: [
          { id: "fortune", label: t(locale, "Fortune", "Lời sấm") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "contact_human":
      return {
        message: t(
          locale,
          `A person replies within one business day. Email ${company.email} or phone ${company.phone} (${company.phoneContact}). Or leave a wish here — same inbox, with your chat transcript.`,
          `Người thật phản hồi trong một ngày làm việc. Email ${company.email} hoặc gọi ${company.phone} (${company.phoneContact}). Hoặc gửi điều ước tại đây — cùng hộp thư, kèm transcript chat.`,
        ),
        chips: softCta(locale),
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
          "The lamp crackled — try another topic, the quiz, a work story, or leave a wish for a human.",
          "Đèn lóe — thử chủ đề khác, quiz, câu chuyện Work, hoặc gửi điều ước cho người thật.",
        ),
        chips: getOpeningChips(locale),
      };
  }
}

/**
 * Match free-text to a scripted topic (EN + VI keywords). Returns null if
 * nothing confident matches — caller may try the LLM or a soft fallback.
 */
export function matchScriptedFreeText(locale: L, raw: string): ScriptReply | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;

  const rules: { re: RegExp; id: string }[] = [
    {
      re: /\b(quiz|which (model|engagement)|engagement (model|fit)|mô hình nào|hợp tác nào)\b/i,
      id: "quiz_start",
    },
    {
      re: /\b(engagement model|dedicated (senior )?team|fixed[- ]scope|mô hình hợp tác|đội senior|phạm vi cố định)\b/i,
      id: "engagement_models",
    },
    {
      re: /\b(capacity|slots?|how many projects|năng lực|suất|bao nhiêu dự án)\b/i,
      id: "capacity",
    },
    {
      re: /\b(7[- ]?day|seven day|promise|cam kết 7|7 ngày)\b/i,
      id: "promise_7day",
    },
    {
      re: /\b(price|pricing|budget|cost|quote|how much|giá|ngân sách|chi phí|báo giá)\b/i,
      id: "pricing",
    },
    {
      re: /\b(timeline|deadline|how long|when can|thời gian|bao lâu|kịp)\b/i,
      id: "timeline",
    },
    {
      re: /\b(teardown|audit|review my (site|app)|đánh giá|kiểm tra web|15.?point)\b/i,
      id: "teardown",
    },
    {
      re: /\b(career|job|hiring|join (the )?team|tuyển|việc làm|ứng tuyển)\b/i,
      id: "careers",
    },
    {
      re: /\b(who are you|what are you|your name|bạn là ai|mày là ai|\blumi\b)\b/i,
      id: "who_is_lumi",
    },
    {
      re: /\b(saigon|sài gòn|ho chi minh|hcm|vietnam|việt nam|where are you|address|địa chỉ)\b/i,
      id: "saigon",
    },
    {
      re: /\b(rescue|legacy|rewrite|broken|on fire|cứu|hệ thống cũ|sập|lỗi nặng|migration)\b/i,
      id: "rescue",
    },
    {
      re: /\b(human|call me|meeting|talk to (a )?person|người thật|gặp|gọi điện)\b/i,
      id: "contact_human",
    },
    {
      re: /\b(fortune|magic|rub|lamp|thần đèn|xoa đèn|bói)\b/i,
      id: "fortune",
    },
    {
      re: /\b(three wishes|3 wishes|ba điều ước)\b/i,
      id: "three_wishes",
    },
    {
      re: /\b(joke|funny|haha|đùa|cười)\b/i,
      id: "joke",
    },
    {
      re: /\b(partner|outsource|agency white.?label|hợp tác|ủy thác|outsource)\b/i,
      id: "partnership",
    },
    {
      re: /\b(security|privacy|gdpr|pdpl|bảo mật|riêng tư|mật khẩu|password)\b/i,
      id: "security_privacy",
    },
    {
      re: /\b(a11y|accessibility|wcag|khả năng tiếp cận|tiếp cận)\b/i,
      id: "accessibility",
    },
    {
      re: /\b(metric|kpi|measure|cwv|core web vitals|đo lường|chỉ số)\b/i,
      id: "metrics",
    },
    {
      re: /\b(process|discover|shape|build|support|quy trình|khám phá|định hình)\b/i,
      id: "process",
    },
    {
      re: /\b(first week|week one|tuần đầu|tuần 1)\b/i,
      id: "first_week",
    },
    {
      re: /\b(case study|portfolio|your work|dự án|case study|work shelf|câu chuyện)\b/i,
      id: "story_hub",
    },
    {
      re: /\b(mobile app|ios|android|ứng dụng di động)\b/i,
      id: "service_mobile",
    },
    {
      re: /\b(internal (system|tool)|back.?office|ops platform|hệ thống nội bộ|nội bộ)\b/i,
      id: "service_internal",
    },
    {
      re: /\b(web app|website|dashboard|portal|ứng dụng web)\b/i,
      id: "service_web",
    },
    {
      re: /\b(what (do you|can you) build|services|xây gì|dịch vụ)\b/i,
      id: "what_we_build",
    },
    {
      re: /\b(how (do )?you work|cách (các bạn )?làm)\b/i,
      id: "how_we_work",
    },
    {
      re: /\b(black.?box|agency myth|hộp đen)\b/i,
      id: "myth_agency",
    },
    {
      re: /\b(values|what you stand|giá trị|đứng về)\b/i,
      id: "values",
    },
    {
      re: /\b(just browsing|looking around|curious|xem chơi|cho vui|tham khảo)\b/i,
      id: "browse",
    },
    {
      re: /\b(hello|hi\b|hey|xin chào|chào|hola)\b/i,
      id: "browse",
    },
  ];

  for (const rule of rules) {
    if (rule.re.test(text)) {
      return resolveScriptTopic(locale, rule.id);
    }
  }

  // Soft “I heard a wish” — nudge into capture without LLM.
  if (text.length >= 12 && /\b(want|need|build|fix|improve|muốn|cần|xây|sửa|cải)\b/i.test(text)) {
    return {
      message: t(
        locale,
        "That sounds like a wish forming. I can hand it to the team — or run a quick engagement quiz first.",
        "Nghe như một điều ước đang thành hình. Mình có thể chuyển đội ngũ — hoặc chạy quiz hợp tác nhanh trước.",
      ),
      chips: [
        { id: "wish", label: t(locale, "Leave this as a wish", "Gửi làm điều ước") },
        { id: "quiz_start", label: t(locale, "Engagement quiz", "Quiz hợp tác") },
        { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn xây gì?") },
        { id: "more", label: t(locale, "Other topics", "Chủ đề khác") },
      ],
    };
  }

  return null;
}

/** When LLM is down and free text did not match — still charm, still guide. */
export function offlineFallbackReply(locale: L): ScriptReply {
  return {
    message: t(
      locale,
      "The deep magic is resting, but I still know these halls. Try the engagement quiz, a work story, or leave a wish — a human replies within one business day.",
      "Phép thuật sâu đang nghỉ, nhưng mình vẫn thuộc hành lang này. Thử quiz hợp tác, câu chuyện Work, hoặc gửi điều ước — người thật phản hồi trong một ngày làm việc.",
    ),
    chips: getOpeningChips(locale),
  };
}
