import type { Locale } from "@/lib/i18n/config";
import type { FunnelStage } from "@/lib/genie/funnelStages";
import {
  INTENT_LABEL,
  SITUATION_LABEL,
  type IntentId,
  type SituationId,
  type ToneId,
} from "@/lib/genie/corpus/dimensions";

function loc(locale: Locale, s: { en: string; vi: string }): string {
  return locale === "vi" ? s.vi : s.en;
}

type Fill = { intent: IntentId; situation: SituationId; tone: ToneId };

/**
 * Stage-specific message templates (3 tones each).
 * Slots: {intent}, {situation}, filled from dimensions.
 * Copy is consult-first; lead stage never invents metrics.
 */
const EN: Record<FunnelStage, Record<ToneId, string>> = {
  rapport: {
    generous:
      "Welcome, you are safe here. No hard sell on entry. {situation}, I am happy to walk {intent} with you like a patient supporter, then only ask for details if something clicks.",
    crisp:
      "Hi. Browsing is fine. {situation}, tell me if {intent} is the thread you care about, chips only until you choose a wish.",
    playful:
      "The lamp is warm and the pressure is off. {situation}, we can nibble on {intent} or just rub for a fortune first.",
  },
  consult: {
    generous:
      "Here is a basic consult on {intent}, {situation}: start with one measurable outcome, name what must not move, and shrink the first slice until a senior can own it end to end. That is how CyberSkill scopes real work, not a kitchen-sink v1.",
    crisp:
      "Consult on {intent} ({situation}): define done in a number users feel, list constraints, pick a first shippable slice, then choose fixed-scope or dedicated seniors. We publish ranges under Engagement; quotes follow discovery.",
    playful:
      "Genie consult mode for {intent}, {situation}: three wishes worth of truth, (1) the outcome, (2) the constraint, (3) the smallest slice that still counts. Magic after honesty.",
  },
  proof: {
    generous:
      "Trust comes before a contract. For {intent}, {situation}, peek at public Work chapters and our process: seniors who build also own outcomes; trade-offs spoken early; no black-box agency myth. We do not invent client metrics that are not on the site.",
    crisp:
      "Proof path for {intent} ({situation}): Work shelf for craft samples, How we build for process, teardown for a free 15-point read on your surface. Metrics only when they exist in public SSOT.",
    playful:
      "The lamp refuses fake trophies. For {intent}, {situation}, I only point at chapters on the Work shelf and craft you can verify, then we can hype what is real.",
  },
  interest: {
    generous:
      "If {intent} is heating up for you {situation}: we keep concurrent projects few on purpose so seniors stay on the critical path, and our 7-day promise is a production-ready structure or a clear strategy, not a full product from thin air. That scarcity is published capacity, not a fake timer.",
    crisp:
      "Interest check, {intent}, {situation}: limited quarterly slots, honest model ranges, progress in weeks. If the fit is sharp, the next step is a short discovery call or a wish with constraints.",
    playful:
      "Hype, but honest: {intent} under {situation} can feel golden when the first slice lands fast. Rub the 7-day promise carefully, structure or strategy, not infinite loops.",
  },
  soft_cta: {
    generous:
      "Whenever you are ready for {intent} ({situation}), leave a wish or book a discovery call, still optional. I will only collect a few infos so a human can follow up within one business day.",
    crisp:
      "Soft invite for {intent}, {situation}: wish · teardown · call. No form until you tap. Typing unlocks on the lead steps that need it.",
    playful:
      "The lamp holds out a velvet cushion for {intent}, {situation}: wish, free teardown, or a 30-minute senior call. Your move, chips only until then.",
  },
  lead: {
    generous:
      "Wonderful, let us capture your details for {intent}, {situation}, so the CyberSkill team can reply with care. A few short questions; you can skip optional fields.",
    crisp:
      "Lead capture for {intent} ({situation}): name, email, and context next. Humans own the follow-up.",
    playful:
      "Seal the wish for {intent}, {situation}. Name and email keep the magic routed to real engineers, not to the void.",
  },
};

const VI: Record<FunnelStage, Record<ToneId, string>> = {
  rapport: {
    generous:
      "Chào bạn. Nơi này thoải mái, không ép buộc. {situation}, mình sẵn sàng đồng hành cùng {intent}. Chỉ hỏi thông tin khi thật sự có nhu cầu.",
    crisp:
      "Xin chào. Xem chơi cũng được. {situation}, nếu {intent} là điều bạn quan tâm, hãy chọn chủ đề đó. Bạn chỉ cần để lại thông tin khi muốn gửi điều ước.",
    playful:
      "Đèn vẫn ấm, không áp lực. {situation}, bạn có thể tìm hiểu {intent} trước, hoặc xoa đèn lấy một lời sấm.",
  },
  consult: {
    generous:
      "Tư vấn ngắn gọn về {intent}, {situation}: bắt đầu bằng một kết quả đo được, gọi tên thứ không được xê dịch, và thu nhỏ phần đầu đến mức một senior có thể chịu trách nhiệm trọn vẹn. CyberSkill định phạm vi theo cách đó, không nhồi mọi thứ vào bản v1.",
    crisp:
      "Về {intent} ({situation}): định nghĩa “xong” bằng chỉ số người dùng có thể cảm nhận, liệt kê ràng buộc, chọn lát ship được, rồi fixed-scope hoặc đội senior. Dải mô hình nằm ở Engagement; báo giá sau discovery.",
    playful:
      "Tư vấn theo tinh thần thần đèn cho {intent}, {situation}: ba điều ước của sự thật, (1) kết quả, (2) ràng buộc, (3) lát nhỏ nhất vẫn tính. Sự trung thực đến trước, phép thuật đến sau.",
  },
  proof: {
    generous:
      "Tin cậy trước hợp đồng. Với {intent}, {situation}, xem chương Work công khai và quy trình: senior xây cũng sở hữu kết quả; đánh đổi nói sớm; không myth agency hộp đen. Mình không bịa metric không có trên site.",
    crisp:
      "Minh chứng cho {intent} ({situation}): kệ Work, How we build, teardown 15 điểm miễn phí. Metric chỉ khi có trong nguồn công khai.",
    playful:
      "Đèn không nhận minh chứng giả. Với {intent}, {situation}, mình chỉ chỉ sang chương Work và những gì kiểm chứng được, rồi mới nói về phần thú vị.",
  },
  interest: {
    generous:
      "Nếu {intent} đang nóng với bạn {situation}: chúng tôi giữ ít dự án song song để senior ở critical path, và cam kết 7 ngày là cấu trúc sẵn sàng vận hành hoặc chiến lược rõ, không phải sản phẩm hoàn chỉnh từ con số không. Sự khan hiếm đến từ năng lực công bố, không phải đồng hồ đếm ngược giả.",
    crisp:
      "Hứng thú, {intent}, {situation}: suất quý hữu hạn, dải mô hình trung thực, tiến độ theo tuần. Nếu hợp, bước tiếp là cuộc gọi discovery hoặc điều ước kèm ràng buộc.",
    playful:
      "Hứng khởi nhưng trung thực: {intent} dưới {situation} có thể lấp lánh khi lát đầu về nhanh. Cam kết 7 ngày cần hiểu đúng: cấu trúc hoặc chiến lược, không phải vòng lặp vô hạn.",
  },
  soft_cta: {
    generous:
      "Khi sẵn sàng với {intent} ({situation}), gửi điều ước hoặc đặt cuộc gọi discovery, vẫn do bạn quyết. Mình chỉ thu vài thông tin để người thật phản hồi trong một ngày làm việc.",
    crisp:
      "Gợi ý nhẹ cho {intent}, {situation}: gửi điều ước, đánh giá miễn phí, hoặc đặt cuộc gọi. Chưa mở form cho đến khi bạn chọn.",
    playful:
      "Đèn mở cửa cho {intent}, {situation}: gửi điều ước, đánh giá miễn phí, hoặc gọi 30 phút với senior. Lượt của bạn.",
  },
  lead: {
    generous:
      "Tuyệt. Mình ghi vài thông tin cho {intent}, {situation}, để đội CyberSkill phản hồi chu đáo. Chỉ vài câu ngắn; phần tùy chọn có thể bỏ qua.",
    crisp:
      "Ghi nhận cho {intent} ({situation}): tên, email và ngữ cảnh. Người thật sẽ phản hồi.",
    playful:
      "Niêm phong điều ước cho {intent}, {situation}. Tên và email giúp chuyển đến kỹ sư thật, không rơi vào hư không.",
  },
};

export function renderCorpusMessage(
  locale: Locale,
  stage: FunnelStage,
  fill: Fill,
): string {
  const table = locale === "vi" ? VI : EN;
  const raw = table[stage][fill.tone];
  return raw
    .replaceAll("{intent}", loc(locale, INTENT_LABEL[fill.intent]))
    .replaceAll("{situation}", loc(locale, SITUATION_LABEL[fill.situation]));
}

/** Chip labels that advance the funnel for a given stage (purposeful next steps). */
export function corpusNextChipLabels(
  locale: Locale,
  stage: FunnelStage,
): { idSuffix: string; en: string; vi: string }[] {
  switch (stage) {
    case "rapport":
      return [
        { idSuffix: "to_consult", en: "Give me a basic consult", vi: "Tư vấn cơ bản" },
        { idSuffix: "to_proof", en: "Show proof / work", vi: "Xem minh chứng" },
        { idSuffix: "hero", en: "Related topic", vi: "Chủ đề liên quan" },
      ];
    case "consult":
      return [
        { idSuffix: "to_proof", en: "What proof do you have?", vi: "Minh chứng gì?" },
        { idSuffix: "to_interest", en: "What makes this exciting?", vi: "Điều gì thú vị?" },
        { idSuffix: "hero", en: "Deeper on this topic", vi: "Đào sâu chủ đề" },
      ];
    case "proof":
      return [
        { idSuffix: "to_interest", en: "Capacity & promise", vi: "Suất & cam kết" },
        { idSuffix: "to_soft", en: "How do we start?", vi: "Bắt đầu thế nào?" },
        { idSuffix: "stories", en: "Work stories", vi: "Câu chuyện Work" },
      ];
    case "interest":
      return [
        { idSuffix: "to_soft", en: "I am interested", vi: "Tôi quan tâm" },
        { idSuffix: "to_lead", en: "Leave my details", vi: "Để lại thông tin" },
        { idSuffix: "quiz", en: "Engagement quiz", vi: "Quiz hợp tác" },
      ];
    case "soft_cta":
      return [
        { idSuffix: "to_lead", en: "Yes, take my infos", vi: "Có, lấy thông tin" },
        { idSuffix: "hero", en: "One more consult beat", vi: "Thêm một nhịp tư vấn" },
        { idSuffix: "menu", en: "Something else…", vi: "Chủ đề khác…" },
      ];
    case "lead":
      return [
        { idSuffix: "collect", en: "Continue lead form", vi: "Tiếp form lead" },
      ];
  }
}
