/**
 * Keyless Lumi conversation (no LLM required).
 *
 * Discovery chips + keyword free-text + short topic trees keep the lamp
 * interesting when Anthropic is off, rate-limited, or not yet wired. Pure
 * functions — unit-tested in tests/scripted-chat.test.ts.
 */

import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

export type ScriptTopicId =
  | "menu"
  | "what_we_build"
  | "how_we_work"
  | "pricing"
  | "timeline"
  | "teardown"
  | "careers"
  | "who_is_lumi"
  | "saigon"
  | "fortune"
  | "browse"
  | "rescue"
  | "contact_human";

export type ScriptChip = {
  id: ScriptTopicId | "wish" | "teardown_flow" | "more";
  label: string;
};

export type ScriptReply = {
  /** Lumi's spoken line(s). */
  message: string;
  /** Suggested next chips (optional). */
  chips?: ScriptChip[];
  /** Start the default lead wish flow. */
  startWish?: boolean;
  /** Start the teardown lead flow. */
  startTeardown?: boolean;
};

type L = Locale;

function t(locale: L, en: string, vi: string): string {
  return locale === "vi" ? vi : en;
}

/** Opening discovery chips when the visitor is not in a lead form. */
export function getOpeningChips(locale: L): ScriptChip[] {
  return [
    {
      id: "wish",
      label: t(locale, "Leave a wish", "Gửi điều ước"),
    },
    {
      id: "what_we_build",
      label: t(locale, "What can you build?", "Các bạn xây gì?"),
    },
    {
      id: "teardown",
      label: t(locale, "Free 15-point teardown", "Đánh giá 15 điểm miễn phí"),
    },
    {
      id: "fortune",
      label: t(locale, "Rub the lamp", "Xoa đèn ước"),
    },
    {
      id: "how_we_work",
      label: t(locale, "How you work", "Cách các bạn làm việc"),
    },
    {
      id: "who_is_lumi",
      label: t(locale, "Who are you?", "Bạn là ai?"),
    },
  ];
}

function moreMenu(locale: L): ScriptChip[] {
  return [
    { id: "pricing", label: t(locale, "Budget & pricing", "Ngân sách & giá") },
    { id: "timeline", label: t(locale, "Timelines", "Thời gian") },
    { id: "careers", label: t(locale, "Careers", "Tuyển dụng") },
    { id: "saigon", label: t(locale, "Saigon studio", "Studio Sài Gòn") },
    { id: "rescue", label: t(locale, "Rescue a project", "Cứu dự án") },
    { id: "browse", label: t(locale, "Just browsing", "Chỉ xem chơi") },
    { id: "contact_human", label: t(locale, "Talk to a human", "Gặp người thật") },
    { id: "menu", label: t(locale, "Show all topics", "Xem mọi chủ đề") },
  ];
}

function ctaChips(locale: L): ScriptChip[] {
  return [
    { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
    { id: "teardown_flow", label: t(locale, "Request teardown", "Yêu cầu đánh giá") },
    { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
  ];
}

const FORTUNES_EN = [
  "I see a product that ships in small golden releases — users notice within weeks, not quarters.",
  "The lamp whispers: the riskiest part of your idea is hiding in plain sight. Name it first, and the rest softens.",
  "A dashboard that actually gets opened. A flow that stops leaking users. One clear wish is enough to start.",
  "Your next release should feel like a light bulb, not a renovation. We build for that.",
  "Three wishes max for now: clarity, a honest scope, and a team that answers when things break.",
];

const FORTUNES_VI = [
  "Mình thấy một sản phẩm ra mắt bằng các bản nhỏ lấp lánh — người dùng nhận ra trong vài tuần, không phải vài quý.",
  "Đèn thì thầm: phần rủi ro nhất của ý tưởng đang trốn ngay trước mắt. Gọi tên nó trước, phần còn lại sẽ dịu lại.",
  "Một dashboard thật sự được mở. Một luồng không còn rò người dùng. Một điều ước rõ là đủ để bắt đầu.",
  "Bản phát hành tiếp theo nên như bóng đèn bật sáng, không phải đại tu. CyberSkill xây vì điều đó.",
  "Ba điều ước tạm thời: rõ ràng, phạm vi trung thực, và đội ngũ trả lời khi hệ thống trục trặc.",
];

function pickFortune(locale: L): string {
  const pool = locale === "vi" ? FORTUNES_VI : FORTUNES_EN;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0];
}

/** Resolve a chip / topic id into Lumi's reply. */
export function resolveScriptTopic(locale: L, id: string): ScriptReply {
  switch (id) {
    case "menu":
    case "more":
      return {
        message: t(
          locale,
          "Pick a thread — or type freely. I answer even when the big magic (AI) is napping.",
          "Chọn một chủ đề — hoặc gõ tự do. Mình vẫn trả lời khi phép thuật lớn (AI) đang ngủ.",
        ),
        chips: [...getOpeningChips(locale).filter((c) => c.id !== "wish"), ...moreMenu(locale)],
      };

    case "what_we_build":
      return {
        message: t(
          locale,
          `We craft web apps, mobile apps, and internal systems — the software your team actually runs on. Founded ${company.founded} in ${company.city}. What would you like to turn into real?`,
          `Chúng tôi xây web app, mobile app và hệ thống nội bộ — phần mềm đội ngũ bạn thật sự dùng mỗi ngày. Thành lập ${company.founded} tại ${company.city}. Bạn muốn hiện thực hoá điều gì?`,
        ),
        chips: ctaChips(locale),
      };

    case "how_we_work":
      return {
        message: t(
          locale,
          "Small senior team. We name trade-offs out loud, ship reviewable slices, and wire metrics so “done” means users can feel it. No black-box agencies, no mystery timeline.",
          "Đội ngũ senior gọn. Chúng tôi nói rõ đánh đổi, bàn giao từng lát có thể review, và gắn metric để “xong” nghĩa là người dùng cảm nhận được. Không hộp đen, không timeline bí ẩn.",
        ),
        chips: ctaChips(locale),
      };

    case "pricing":
      return {
        message: t(
          locale,
          "No fixed price menu — each project is scoped to its goal. We shape the work, name the risks, then quote honestly. Leave a wish with a rough budget or timeline and a human follows up within one business day.",
          "Không có bảng giá cố định — mỗi dự án được định phạm vi theo mục tiêu. Chúng tôi phác thảo, gọi tên rủi ro, rồi báo giá trung thực. Gửi điều ước kèm ngân sách hoặc timeline ước lượng; người thật phản hồi trong một ngày làm việc.",
        ),
        chips: [
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "timeline", label: t(locale, "Ask about timelines", "Hỏi về thời gian") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "timeline":
      return {
        message: t(
          locale,
          "It depends on scope — but we design for progress in weeks, not only a big bang at the end. Tell us the outcome you need and by when; we reverse-engineer the first useful release.",
          "Phụ thuộc phạm vi — nhưng chúng tôi thiết kế để có tiến độ theo tuần, không chỉ một cú nổ cuối cùng. Hãy nói kết quả bạn cần và hạn chót; chúng tôi suy ra bản phát hành hữu ích đầu tiên.",
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
        chips: [
          { id: "wish", label: t(locale, "Introduce myself", "Tự giới thiệu") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "who_is_lumi":
      return {
        message: t(
          locale,
          "I am Lumi — CyberSkill’s golden genie. I turn clear wishes into working software with the human team behind the lamp. I am playful, not pushy; honest, not hypey. Rub me for a fortune, or leave a real wish for the engineers.",
          "Mình là Lumi — thần đèn vàng của CyberSkill. Mình biến điều ước rõ thành phần mềm chạy thật cùng đội người sau cây đèn. Vui nhưng không ép; thật thà, không thổi phồng. Xoa đèn lấy lời sấm, hoặc gửi điều ước thật cho kỹ sư.",
        ),
        chips: [
          { id: "fortune", label: t(locale, "Rub the lamp", "Xoa đèn ước") },
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "what_we_build", label: t(locale, "What can you build?", "Các bạn xây gì?") },
        ],
      };

    case "saigon":
      return {
        message: t(
          locale,
          `Home base: ${company.address}. Saigon energy, global delivery. Remote-friendly collaboration, replies from real people at ${company.email}.`,
          `Trụ sở: ${company.address}. Năng lượng Sài Gòn, bàn giao toàn cầu. Cộng tác remote thoải mái; người thật trả lời tại ${company.email}.`,
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
          { id: "teardown", label: t(locale, "Free teardown", "Đánh giá miễn phí") },
        ],
      };
    }

    case "browse":
      return {
        message: t(
          locale,
          "Browsing is welcome — the lamp does not bite. Peek at Work and How we build on the page. When a spark lands, I am here: leave a wish or request a free teardown.",
          "Xem chơi cũng được — đèn không cắn. Thử Work và How we build trên trang. Khi lóe ý, mình đây: gửi điều ước hoặc xin đánh giá miễn phí.",
        ),
        chips: ctaChips(locale),
      };

    case "rescue":
      return {
        message: t(
          locale,
          "We take on running systems too — rescue, rebuild, or calm maintenance. Tell us what is breaking and what “stable” would look like; a human will follow up.",
          "Chúng tôi nhận cả hệ thống đang chạy — cứu hộ, làm lại, hoặc bảo trì êm. Hãy nói thứ gì đang vỡ và “ổn định” trông ra sao; người thật sẽ theo.",
        ),
        chips: [
          { id: "wish", label: t(locale, "Describe the mess", "Kể mớ rối") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
      };

    case "contact_human":
      return {
        message: t(
          locale,
          `A person replies within one business day. Email ${company.email} or phone ${company.phone} (${company.phoneContact}). Or leave a wish here — it lands in the same inbox with your chat transcript.`,
          `Người thật phản hồi trong một ngày làm việc. Email ${company.email} hoặc gọi ${company.phone} (${company.phoneContact}). Hoặc gửi điều ước tại đây — cùng hộp thư, kèm transcript chat.`,
        ),
        chips: [
          { id: "wish", label: t(locale, "Leave a wish", "Gửi điều ước") },
          { id: "more", label: t(locale, "Something else…", "Chủ đề khác…") },
        ],
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
          "The lamp crackled — try another topic, or leave a wish for a human.",
          "Đèn lóe — thử chủ đề khác, hoặc gửi điều ước cho người thật.",
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

  const rules: { re: RegExp; id: ScriptTopicId | "wish" }[] = [
    {
      re: /\b(price|pricing|budget|cost|quote|how much|giá|ngân sách|chi phí|báo giá)\b/i,
      id: "pricing",
    },
    {
      re: /\b(timeline|deadline|how long|when can|thời gian|bao lâu|deadline|kịp)\b/i,
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
      re: /\b(who are you|what are you|your name|bạn là ai|mày là ai|lumi)\b/i,
      id: "who_is_lumi",
    },
    {
      re: /\b(saigon|sài gòn|ho chi minh|hcm|vietnam|việt nam|where are you)\b/i,
      id: "saigon",
    },
    {
      re: /\b(rescue|legacy|rewrite|broken|on fire|cứu|hệ thống cũ|sập|lỗi nặng)\b/i,
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
      re: /\b(just browsing|looking around|curious|xem chơi|cho vui|tham khảo)\b/i,
      id: "browse",
    },
    {
      re: /\b(what (do you|can you) build|services|web app|mobile|internal|xây gì|dịch vụ|app di động)\b/i,
      id: "what_we_build",
    },
    {
      re: /\b(how (do )?you work|process|agile|cách (các bạn )?làm|quy trình)\b/i,
      id: "how_we_work",
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
        "That sounds like a wish forming. I can hand it to the team — or answer a quick topic first.",
        "Nghe như một điều ước đang thành hình. Mình có thể chuyển đội ngũ — hoặc trả lời nhanh một chủ đề trước.",
      ),
      chips: [
        { id: "wish", label: t(locale, "Leave this as a wish", "Gửi làm điều ước") },
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
      "The deep magic is resting, but I still know these halls. Tap a topic — or leave a wish and a human replies within one business day.",
      "Phép thuật sâu đang nghỉ, nhưng mình vẫn thuộc hành lang này. Chọn chủ đề — hoặc gửi điều ước; người thật phản hồi trong một ngày làm việc.",
    ),
    chips: getOpeningChips(locale),
  };
}
