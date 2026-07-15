/**
 * Fortune pool + pure pick, split so corpus expand can import without
 * circular dependency on the full scriptedChat resolvers.
 */

import type { Locale } from "@/lib/i18n/config";

const FORTUNES_EN = [
  "I see a product that ships in small golden releases, users notice within weeks, not quarters.",
  "The lamp whispers: the riskiest part of your idea is hiding in plain sight. Name it first, and the rest softens.",
  "A dashboard that actually gets opened. A flow that stops leaking users. One clear wish is enough to start.",
  "Your next release should feel like a light bulb, not a renovation. We build for that.",
  "Three wishes max for now: clarity, an honest scope, and a team that answers when things break.",
  "Spreadsheets are retiring in the distance. An operations platform waves them goodbye.",
  "Offline-first lessons travel farther than perfect Wi‑Fi. Build for the real network.",
  "Speed is a feature. Rebuild the hot path before you polish the chrome.",
  "Legacy systems fear daylight, and a careful cloud migration with shadow runs.",
  "Metrics before mythology: if you cannot measure done, you cannot celebrate it.",
  "Senior engineers who own the slice end to end beat a hallway of hand-offs.",
  "The first week is for truth: goals, constraints, and what must not move.",
  "A fixed scope loves a clear outcome. An ongoing team loves a moving frontier.",
  "Accessibility is not a coat of paint, it is how more people reach the wish.",
  "Privacy is a promise you keep in code, not only in a policy page.",
  "CI that fails on regressions is a guardian genie for every future release.",
  "Timezone-friendly Saigon mornings pair well with global evenings, we overlap on purpose.",
  "Rescue work starts with what is on fire, not with a greenfield fantasy.",
  "Capacity is finite by design: few concurrent projects, deep attention each.",
  "The 7-day promise is a structure or a strategy, not a full product from thin air.",
  "Trade-offs named out loud feel kinder than surprises in month three.",
  "One source of truth beats twelve copy-pasted sheets arguing at midnight.",
  "Mobile wishes want store-ready pipelines, not demos that die on a cable.",
  "Internal tools win when they give hours back to the people who use them daily.",
  "The lamp prefers concrete nouns: checkout, roster, invoice, not 'synergy'.",
  "Consult first, ask for contact second, a supporter genie, not a pushy funnel bot.",
  "Hype without proof is smoke. Proof without a next step is a museum. We prefer both.",
  "Your first chip commitment is free; the form only appears when the wish is warm.",
  "Founders who name the scary constraint early get kinder quotes.",
  "CTOs who demand exit conditions for AI features sleep better.",
  "Ops leads who retire one spreadsheet a quarter compound like interest.",
  "Agencies that white-label seniors keep clients; black boxes lose them.",
  "A curious visitor who leaves with one clear question is already winning.",
  "Series-A teams need boring reliability more than another pitch deck theme.",
  "Legacy keepers: shadow-run before cutover, the genie insists.",
  "Partnership seekers: capacity is the first honesty test.",
  "If you only remember one law: one clear outcome beats ten vague hopes.",
  "Saigon craft + global delivery is not a slogan when the standup overlaps.",
  "Leave a wish when the spark is real; browse forever when it is not.",
  "The form is short because respect is part of the product.",
];

const FORTUNES_VI = [
  "Mình thấy một sản phẩm ra mắt bằng các bản nhỏ lấp lánh, người dùng nhận ra trong vài tuần, không phải vài quý.",
  "Đèn thì thầm: phần rủi ro nhất của ý tưởng đang trốn ngay trước mắt. Gọi tên nó trước, phần còn lại sẽ dịu lại.",
  "Một dashboard thật sự được mở. Một luồng không còn rò người dùng. Một điều ước rõ là đủ để bắt đầu.",
  "Bản phát hành tiếp theo nên như bóng đèn bật sáng, không phải đại tu. CyberSkill xây vì điều đó.",
  "Ba điều ước tạm thời: rõ ràng, phạm vi trung thực, và đội ngũ trả lời khi hệ thống trục trặc.",
  "Bảng tính đang nghỉ hưu ở phía xa. Một nền tảng vận hành vẫy tay tạm biệt chúng.",
  "Bài học offline-first đi xa hơn Wi‑Fi hoàn hảo. Xây cho mạng thật ngoài đời.",
  "Tốc độ là một tính năng. Sửa đường nóng trước khi đánh bóng chrome.",
  "Hệ thống cũ sợ ánh sáng ban ngày, và một cuộc di chuyển đám mây cẩn thận với chạy song song.",
  "Metric trước thần thoại: không đo được 'xong' thì không ăn mừng được.",
  "Kỹ sư senior sở hữu end-to-end một lát việc thắng một hành lang bàn giao.",
  "Tuần đầu là vì sự thật: mục tiêu, ràng buộc, và thứ không được xê dịch.",
  "Phạm vi cố định yêu một kết quả rõ. Đội ongoing yêu một biên giới đang chuyển.",
  "Khả năng tiếp cận không phải sơn phủ, là cách nhiều người chạm được điều ước.",
  "Riêng tư là lời hứa giữ trong code, không chỉ trên trang chính sách.",
  "CI chặn hồi quy là thần đèn canh gác cho mọi bản sau.",
  "Sáng Sài Gòn thân thiện múi giờ ghép với tối toàn cầu, chúng tôi chồng lịch có chủ đích.",
  "Cứu hộ bắt đầu từ chỗ đang cháy, không phải ảo tưởng greenfield.",
  "Năng lực hữu hạn by design: ít dự án song song, chú ý sâu từng cái.",
  "Cam kết 7 ngày là cấu trúc hoặc chiến lược, không phải full product từ hư không.",
  "Đánh đổi nói to nghe dịu hơn bất ngờ ở tháng ba.",
  "Một nguồn sự thật thắng mười hai sheet copy-paste cãi nhau lúc nửa đêm.",
  "Điều ước mobile muốn pipeline lên store, không phải demo chết trên cáp.",
  "Tool nội bộ thắng khi trả lại giờ cho người dùng hằng ngày.",
  "Đèn thích danh từ cụ thể: checkout, roster, hoá đơn, không phải 'synergy'.",
  "Tư vấn trước, xin liên hệ sau, thần đèn hỗ trợ, không phải bot ép phễu.",
  "Hype không minh chứng là khói. Minh chứng không bước tiếp là bảo tàng. Ta thích cả hai.",
  "Cam kết chip đầu miễn phí; form chỉ hiện khi điều ước đã ấm.",
  "Founder gọi tên ràng buộc đáng sợ sớm sẽ nhận báo giá dịu hơn.",
  "CTO đòi điều kiện thoát cho tính năng AI ngủ ngon hơn.",
  "Ops lead nghỉ hưu một spreadsheet mỗi quý lãi kép như lãi suất.",
  "Agency gắn mác white-label senior giữ khách; hộp đen mất khách.",
  "Khách tò mò rời đi với một câu hỏi rõ đã là thắng.",
  "Đội Series-A cần độ tin cậy nhàm chán hơn một theme deck nữa.",
  "Người giữ legacy: chạy song song trước cutover, đèn nhất quyết.",
  "Người tìm partner: năng lực là bài kiểm trung thực đầu tiên.",
  "Chỉ nhớ một luật: một kết quả rõ thắng mười hy vọng mơ hồ.",
  "Nghề Sài Gòn + bàn giao toàn cầu không phải slogan khi standup chồng lịch.",
  "Gửi điều ước khi tia lửa thật; xem chơi mãi khi chưa có.",
  "Form ngắn vì sự tôn trọng cũng là một phần sản phẩm.",
];

export function fortunePoolSize(locale: Locale = "en"): number {
  return (locale === "vi" ? FORTUNES_VI : FORTUNES_EN).length;
}

/** Pure fortune pick; pass index for deterministic tests. */
export function pickFortune(locale: Locale, index?: number): string {
  const pool = locale === "vi" ? FORTUNES_VI : FORTUNES_EN;
  if (typeof index === "number" && Number.isFinite(index)) {
    const i = ((Math.floor(index) % pool.length) + pool.length) % pool.length;
    return pool[i]!;
  }
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0]!;
}
