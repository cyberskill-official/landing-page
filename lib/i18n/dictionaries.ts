import type { Locale } from "./config";
import { commercialPolicy } from "@/lib/content/policy";

// Chrome / UI strings. Structured content (services, work, scenes) lives in
// lib/content/site.ts as LocalizedString pairs. This file is the UI shell.
// FR-CTA-015: primary CTA promise is sourced from commercialPolicy (FR-BIZ-013).

export type Dictionary = {
  nav: {
    services: string;
    work: string;
    team: string;
    careers: string;
    contact: string;
    howWeBuild: string;
    notes: string;
    skipToContent: string;
  };
  hero: {
    eyebrow: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
    wishPlaceholder: string;
    wishCta: string;
  };
  sections: {
    valueTitle: string;
    servicesTitle: string;
    servicesLead: string;
    workTitle: string;
    workLead: string;
    proofTitle: string;
    careersTitle: string;
    careersLead: string;
    careersCta: string;
    contactTitle: string;
    contactLead: string;
    processTitle: string;
    processLead: string;
    faqTitle: string;
    storyTitle: string;
    storyLead: string;
  };
  // Decorative keyword marquee (FR-DS-012). The band itself is aria-hidden;
  // these strings only need to read well visually in both locales.
  marquee: {
    items: string[];
  };
  form: {
    name: string;
    email: string;
    company: string;
    intent: string;
    intentProject: string;
    intentPartnership: string;
    intentCareers: string;
    intentOther: string;
    message: string;
    consent: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    trustLine: string;
    errorGeneric: string;
    required: string;
    invalidEmail: string;
    consentRequired: string;
    optional: string;
  };
  genie: {
    open: string;
    title: string;
    greeting: string;
    placeholder: string;
    send: string;
    consent: string;
    thinking: string;
    unavailable: string;
    close: string;
    /** Clear conversation and restart discovery chips. */
    resetChat: string;
    // One-time mascot hint (FR-CHAR-030) + the in-chat wish flow (FR-CHAR-026).
    hint: string;
    wishCta: string;
    wishAskName: string;
    wishAskEmail: string;
    wishAskCompany: string;
    wishAskUrl: string;
    wishAskMessage: string;
    wishAskTeardownFocus: string;
    wishAskConsent: string;
    wishAskTeardownConsent: string;
    wishAgree: string;
    wishSkip: string;
    wishCancel: string;
    wishCancelled: string;
    wishSending: string;
    wishDone: string;
    wishDoneTeardown: string;
    wishFailed: string;
    wishErrorName: string;
    wishErrorEmail: string;
    wishErrorUrl: string;
    contactLumiCta: string;
    contactFormFallback: string;
    wishSeedAck: string;
    wishTeardownSeedAck: string;
  };
  a11y: {
    themeToDark: string;
    themeToLight: string;
    soundOn: string;
    soundOff: string;
    skip3d: string;
    liteLink: string;
    cinematicLink: string;
    lumiThinking: string;
    lumiResponding: string;
    sceneNoscript: string;
    homeLabel: string;
    logoAlt: string;
    primaryNav: string;
    languageLabel: string;
    quickActions: string;
  };
  footer: {
    rights: string;
    duns: string;
    privacy: string;
    accessibility: string;
    terms: string;
  };
  teardown: {
    title: string;
    lead: string;
    nameLabel: string;
    emailLabel: string;
    urlLabel: string;
    messageLabel: string;
    consentLabel: string;
    submitLabel: string;
    lumiCta: string;
    formFallback: string;
    lumiSeed: string;
    capFullTitle: string;
    capFullBody: string;
    successTitle: string;
    successBody: string;
    successNextLabel: string;
    successStep1: string;
    successStep2: string;
    successStep3: string;
  };
};

const en: Dictionary = {
  nav: {
    services: "Services",
    work: "Work",
    team: "Team",
    careers: "Careers",
    contact: "Contact",
    howWeBuild: "How we build",
    notes: "Notes",
    skipToContent: "Skip to content",
  },
  hero: {
    eyebrow: "A small studio in Saigon that turns wishes into working software. Since 2020.",
    lead: "Lumi, our golden genie, turns a clear wish into working software: the kind your team actually runs on, built to ship and to last.",
    // FR-CTA-015: outcome promise from commercial policy SSOT (not a free-form action label).
    ctaPrimary: commercialPolicy.ctaPromise.en,
    ctaSecondary: "Talk to Lumi",
    scrollHint: "Scroll to follow the wish",
    wishPlaceholder: "Make a wish... a faster checkout, an app, a tool",
    wishCta: "Make a wish",
  },
  sections: {
    valueTitle: "Why teams work with us",
    servicesTitle: "What we build",
    servicesLead: "Three focused practices. One team that answers for the result.",
    workTitle: "Selected work",
    workLead: "The kinds of wishes we are built to grant.",
    proofTitle: "What clients say",
    careersTitle: "Build with us",
    careersLead: "We hire for craft and care. Senior, small, and honest about trade-offs.",
    careersCta: "See open roles",
    contactTitle: "Tell us your wish",
    contactLead: "Send a short note. We reply within one business day.",
    processTitle: "How we work",
    processLead: "A simple, honest sequence that keeps you in the loop from the first call to the last release.",
    faqTitle: "Questions, answered",
    storyTitle: "The arc of a wish",
    storyLead: "Every project follows one arc: from a clear wish to software running in the real world.",
  },
  marquee: {
    items: ["Web apps", "Mobile apps", "Internal systems", "Automation", "Design systems", "Built to last"],
  },
  form: {
    name: "Your name",
    email: "Work email",
    company: "Company",
    intent: "What brings you here?",
    intentProject: "A project",
    intentPartnership: "A partnership",
    intentCareers: "A role",
    intentOther: "Something else",
    message: "Anything we should know?",
    consent: "I agree to be contacted about my enquiry.",
    submit: "Send",
    submitting: "Sending...",
    successTitle: "Message received.",
    successBody: "Thank you. Our engineering team will read your message and follow up within one business day from info@cyberskill.world. In the meantime, feel free to explore our past work or follow us on social media.",
    trustLine: "Your details go straight to the team. We never share them.",
    errorGeneric: "Something went wrong. Please try again, or email info@cyberskill.world.",
    required: "This field is required.",
    invalidEmail: "Enter a valid email address.",
    consentRequired: "Please agree so we can reply.",
    optional: "optional",
  },
  genie: {
    open: "Talk to Lumi",
    title: "Lumi, the CyberSkill genie",
    greeting:
      "Hi, I am Lumi. Pick a topic below or type freely — I can help even without deep AI. Clear wishes go to the human team.",
    placeholder: "Type your wish...",
    send: "Send",
    consent:
      "Chats may be stored so our team can follow up. Do not share passwords or secrets.",
    thinking: "Lumi is thinking...",
    unavailable: "Lumi is resting right now. Please use the contact form and we will reply within one business day.",
    close: "Close chat",
    resetChat: "New chat",
    hint: "Click or hold me",
    wishCta: "Leave your wish for the team",
    wishAskName: "Wonderful. What may I call you?",
    wishAskEmail: "Nice to meet you, {name}. Where can the team reply to you? (work email)",
    wishAskCompany: "Which company or team is this for? You can skip this.",
    wishAskUrl: "Which website or product should we review? Paste the full URL.",
    wishAskMessage: "Now the important part: tell me the wish in a sentence or two.",
    wishAskTeardownFocus: "Anything specific we should focus on - a page, flow, or pain? You can skip this.",
    wishAskConsent: "May the CyberSkill team contact you about this wish?",
    wishAskTeardownConsent: "May we review that site and email you the free 15-point PDF report?",
    wishAgree: "Yes, contact me",
    wishSkip: "Skip",
    wishCancel: "Not now",
    wishCancelled: "No worries. The lamp stays warm - come back whenever the wish is ready.",
    wishSending: "Sealing the wish...",
    wishDone: "The wish is on its way to the team. A real person replies within one business day.",
    wishDoneTeardown:
      "Your teardown slot is saved. Our engineers will review the site and email the 15-point PDF to this inbox within 3 business days.",
    wishFailed: "The lamp flickered - the wish did not go through. Try once more, or email info@cyberskill.world.",
    wishErrorName: "Just a name so the team knows who to reply to.",
    wishErrorEmail: "That email does not look right - one more try?",
    wishErrorUrl: "I need a URL so the team knows what to review - full link please.",
    contactLumiCta: "Grant it with Lumi",
    contactFormFallback: "Prefer a classic form?",
    wishSeedAck: "A wish worth granting. Let me hand it to the team - first, what may I call you?",
    wishTeardownSeedAck:
      "A free 15-point teardown - gladly. I will save your slot with the team. First, what may I call you?",
  },
  a11y: {
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    soundOn: "Turn sound on",
    soundOff: "Turn sound off",
    skip3d: "Skip the 3D scene",
    liteLink: "View the simple version",
    cinematicLink: "Back to the full experience",
    lumiThinking: "Lumi is thinking.",
    lumiResponding: "Lumi is responding.",
    sceneNoscript: "Lumi, an animated golden genie, decorates this page. It is purely visual - all information and actions are available as text and controls on the page.",
    homeLabel: "CyberSkill - home",
    logoAlt: "CyberSkill logo",
    primaryNav: "Primary navigation",
    languageLabel: "Language",
    quickActions: "Quick actions",
  },
  footer: {
    rights: "All rights reserved.",
    duns: "DUNS",
    privacy: "Privacy",
    accessibility: "Accessibility",
    terms: "Terms",
  },
  teardown: {
    title: "Get a free 15-point teardown",
    lead: "We will review your website or internal application for speed, security, and accessibility. You get a detailed 15-point PDF report outlining exactly where you are losing users and how to fix it. 100% free, delivered in 3 business days.",
    nameLabel: "Your Name",
    emailLabel: "Work Email",
    urlLabel: "Website or Product URL",
    messageLabel: "What specific page, flow, or issue should we focus on? (optional)",
    consentLabel: "I agree to have my website reviewed and to be contacted.",
    submitLabel: "Request Teardown",
    lumiCta: "Request with Lumi",
    formFallback: "Prefer a classic form?",
    lumiSeed: "I would like a free 15-point teardown of my website or product.",
    capFullTitle: "Weekly slots are full",
    capFullBody: "Our weekly audit slots are currently full. We reopen next Monday! In the meantime, you can still write us a general note below.",
    successTitle: "Teardown requested",
    successBody: "Thank you. Your slot is saved. We email the 15-point PDF from info@cyberskill.world within 3 business days.",
    successNextLabel: "What happens next",
    successStep1: "Engineers review speed, security, and accessibility.",
    successStep2: "You receive a 15-point PDF in your inbox.",
    successStep3: "Reply to the report if you want to dig deeper with the team.",
  },
};

const vi: Dictionary = {
  nav: {
    services: "Dịch vụ",
    work: "Dự án",
    team: "Đội ngũ",
    careers: "Tuyển dụng",
    contact: "Liên hệ",
    howWeBuild: "Cách chúng tôi xây",
    notes: "Góc nhìn",
    skipToContent: "Tới nội dung chính",
  },
  hero: {
    eyebrow: "Một studio nhỏ tại Sài Gòn chuyên biến điều ước thành phần mềm. Từ 2020.",
    lead: "Lumi, vị thần đèn vàng của CyberSkill, biến một điều ước rõ ràng thành phần mềm chạy thật: thứ đội ngũ của bạn dùng mỗi ngày, được xây để bàn giao đúng hẹn và bền bỉ theo thời gian.",
    // FR-CTA-015: outcome promise from commercial policy SSOT.
    ctaPrimary: commercialPolicy.ctaPromise.vi,
    ctaSecondary: "Trò chuyện với Lumi",
    scrollHint: "Cuộn xuống để theo điều ước",
    wishPlaceholder: "Ước một điều... thanh toán nhanh hơn, một ứng dụng, một công cụ",
    wishCta: "Ước điều này",
  },
  sections: {
    valueTitle: "Vì sao các đội ngũ chọn CyberSkill",
    servicesTitle: "Chúng tôi xây dựng gì",
    servicesLead: "Ba mảng chuyên sâu. Một đội ngũ chịu trách nhiệm đến kết quả cuối cùng.",
    workTitle: "Dự án tiêu biểu",
    workLead: "Những điều ước chúng tôi sinh ra để thực hiện.",
    proofTitle: "Khách hàng nói gì",
    careersTitle: "Cùng chúng tôi kiến tạo",
    careersLead: "Chúng tôi tuyển người vì tay nghề và sự tận tâm: đội ngũ tinh gọn, giàu kinh nghiệm, và thẳng thắn với mọi đánh đổi.",
    careersCta: "Xem vị trí đang tuyển",
    contactTitle: "Kể chúng tôi nghe điều bạn ước",
    contactLead: "Chỉ cần một lời nhắn ngắn. Chúng tôi phản hồi trong một ngày làm việc.",
    processTitle: "Cách chúng tôi làm việc",
    processLead: "Một trình tự đơn giản và minh bạch: bạn nắm rõ mọi thứ, từ cuộc gọi đầu tiên đến lần phát hành cuối cùng.",
    faqTitle: "Giải đáp thắc mắc",
    storyTitle: "Hành trình của một điều ước",
    storyLead: "Mỗi dự án đều đi qua một hành trình: từ một điều ước rõ ràng đến phần mềm chạy thật giữa đời thực.",
  },
  marquee: {
    items: ["Ứng dụng web", "Ứng dụng di động", "Hệ thống nội bộ", "Tự động hoá", "Hệ thống thiết kế", "Bền bỉ dài lâu"],
  },
  form: {
    name: "Tên của bạn",
    email: "Email công việc",
    company: "Công ty",
    intent: "Điều gì đưa bạn đến đây?",
    intentProject: "Một dự án",
    intentPartnership: "Cơ hội hợp tác",
    intentCareers: "Cơ hội nghề nghiệp",
    intentOther: "Chuyện khác",
    message: "Bạn muốn chia sẻ thêm điều gì?",
    consent: "Tôi đồng ý được liên hệ về yêu cầu của mình.",
    submit: "Gửi",
    submitting: "Đang gửi...",
    successTitle: "Đã nhận được lời nhắn.",
    successBody: "Cảm ơn bạn. Đội ngũ kỹ sư của chúng tôi sẽ đọc lời nhắn và phản hồi bạn trong một ngày làm việc qua email từ địa chỉ info@cyberskill.world. Trong lúc chờ đợi, mời bạn xem qua các dự án chúng tôi đã bàn giao hoặc theo dõi chúng tôi trên mạng xã hội.",
    trustLine: "Thông tin của bạn được gửi trực tiếp đến đội ngũ. Chúng tôi không bao giờ chia sẻ thông tin này.",
    errorGeneric: "Đã có lỗi xảy ra. Vui lòng thử lại, hoặc gửi email tới info@cyberskill.world.",
    required: "Trường này là bắt buộc.",
    invalidEmail: "Vui lòng nhập email hợp lệ.",
    consentRequired: "Vui lòng đồng ý để chúng tôi có thể phản hồi.",
    optional: "không bắt buộc",
  },
  genie: {
    open: "Trò chuyện với Lumi",
    title: "Lumi, vị thần đèn của CyberSkill",
    greeting:
      "Chào bạn, mình là Lumi. Chọn chủ đề bên dưới hoặc gõ tự do — mình vẫn giúp được khi không bật AI sâu. Điều ước rõ sẽ đến đội ngũ người thật.",
    placeholder: "Gõ điều ước của bạn...",
    send: "Gửi",
    consent:
      "Cuộc trò chuyện có thể được lưu để đội ngũ theo dõi. Xin đừng gửi mật khẩu hay thông tin mật.",
    thinking: "Lumi đang suy nghĩ...",
    unavailable: "Lumi đang tạm nghỉ. Bạn hãy dùng biểu mẫu liên hệ, chúng tôi sẽ phản hồi trong một ngày làm việc.",
    close: "Đóng cửa sổ trò chuyện",
    resetChat: "Chat mới",
    hint: "Chạm hoặc giữ mình nhé",
    wishCta: "Gửi điều ước cho đội ngũ",
    wishAskName: "Tuyệt. Mình nên gọi bạn là gì?",
    wishAskEmail: "Rất vui được gặp bạn, {name}. Đội ngũ có thể phản hồi bạn qua email nào? (email công việc)",
    wishAskCompany: "Điều ước này dành cho công ty hay đội nhóm nào? Bạn có thể bỏ qua.",
    wishAskUrl: "Website hoặc sản phẩm nào cần đánh giá? Dán full URL nhé.",
    wishAskMessage: "Giờ đến phần quan trọng: kể mình nghe điều ước, một hai câu thôi.",
    wishAskTeardownFocus: "Có trang, luồng hoặc vấn đề cụ thể nào cần tập trung không? Bạn có thể bỏ qua.",
    wishAskConsent: "Đội ngũ CyberSkill có thể liên hệ bạn về điều ước này chứ?",
    wishAskTeardownConsent: "Chúng tôi được phép đánh giá site đó và gửi báo cáo PDF 15 điểm miễn phí chứ?",
    wishAgree: "Đồng ý, liên hệ mình",
    wishSkip: "Bỏ qua",
    wishCancel: "Để sau",
    wishCancelled: "Không sao. Cây đèn vẫn ấm - khi nào điều ước sẵn sàng, bạn quay lại nhé.",
    wishSending: "Đang niêm phong điều ước...",
    wishDone: "Điều ước đã lên đường đến đội ngũ. Một người thật sẽ phản hồi bạn trong một ngày làm việc.",
    wishDoneTeardown:
      "Suất đánh giá của bạn đã được giữ. Đội kỹ sư sẽ rà site và gửi PDF 15 điểm về hộp thư này trong 3 ngày làm việc.",
    wishFailed: "Cây đèn chớp tắt - điều ước chưa gửi được. Bạn thử lại lần nữa, hoặc email info@cyberskill.world nhé.",
    wishErrorName: "Cho mình xin một cái tên để đội ngũ biết phản hồi ai nhé.",
    wishErrorEmail: "Email này có vẻ chưa đúng - bạn thử lại nhé?",
    wishErrorUrl: "Mình cần URL để đội ngũ biết đánh giá gì - full link nhé.",
    contactLumiCta: "Nhờ Lumi thực hiện",
    contactFormFallback: "Bạn thích dùng biểu mẫu quen thuộc?",
    wishSeedAck: "Một điều ước đáng để thực hiện. Để mình chuyển đến đội ngũ nhé - trước tiên, mình nên gọi bạn là gì?",
    wishTeardownSeedAck:
      "Đánh giá 15 điểm miễn phí - sẵn sàng. Mình sẽ giữ suất với đội ngũ. Trước hết, mình nên gọi bạn là gì?",
  },
  a11y: {
    themeToDark: "Chuyển sang chế độ tối",
    themeToLight: "Chuyển sang chế độ sáng",
    soundOn: "Bật âm thanh",
    soundOff: "Tắt âm thanh",
    skip3d: "Bỏ qua cảnh 3D",
    liteLink: "Xem phiên bản đơn giản",
    cinematicLink: "Trở lại trải nghiệm đầy đủ",
    lumiThinking: "Lumi đang suy nghĩ.",
    lumiResponding: "Lumi đang trả lời.",
    sceneNoscript: "Lumi, một thần đèn vàng hoạt họa, chỉ để trang trí cho trang này. Mọi thông tin và thao tác đều có sẵn dưới dạng văn bản và nút điều khiển trên trang.",
    homeLabel: "CyberSkill - trang chủ",
    logoAlt: "Logo CyberSkill",
    primaryNav: "Điều hướng chính",
    languageLabel: "Ngôn ngữ",
    quickActions: "Thao tác nhanh",
  },
  footer: {
    rights: "Bảo lưu mọi quyền.",
    duns: "DUNS",
    privacy: "Quyền riêng tư",
    accessibility: "Khả năng tiếp cận",
    terms: "Điều khoản",
  },
  teardown: {
    title: "Nhận đánh giá 15 điểm miễn phí",
    lead: "Chúng tôi sẽ đánh giá trang web hoặc ứng dụng nội bộ của bạn về tốc độ, bảo mật và khả năng tiếp cận. Bạn sẽ nhận được báo cáo PDF 15 điểm chi tiết chỉ ra nơi bạn đang mất người dùng và cách khắc phục. Hoàn toàn miễn phí, bàn giao trong 3 ngày làm việc.",
    nameLabel: "Tên của bạn",
    emailLabel: "Email công việc",
    urlLabel: "Đường dẫn website hoặc sản phẩm",
    messageLabel: "Trang, luồng hoặc vấn đề cụ thể nào cần chúng tôi tập trung đánh giá? (không bắt buộc)",
    consentLabel: "Tôi đồng ý để CyberSkill đánh giá website và liên hệ với tôi.",
    submitLabel: "Yêu cầu đánh giá",
    lumiCta: "Yêu cầu cùng Lumi",
    formFallback: "Thích biểu mẫu cổ điển?",
    lumiSeed: "Tôi muốn nhận đánh giá 15 điểm miễn phí cho website hoặc sản phẩm của mình.",
    capFullTitle: "Các suất tuần này đã đầy",
    capFullBody: "Các suất đánh giá miễn phí tuần này đã đầy. Chúng tôi mở lại vào thứ Hai tới! Trong lúc đó, bạn vẫn có thể gửi lời nhắn chung cho chúng tôi ở biểu mẫu liên hệ bên dưới.",
    successTitle: "Đã nhận yêu cầu đánh giá",
    successBody: "Cảm ơn bạn. Suất của bạn đã được giữ. Chúng tôi gửi PDF 15 điểm từ info@cyberskill.world trong 3 ngày làm việc.",
    successNextLabel: "Bước tiếp theo",
    successStep1: "Kỹ sư rà tốc độ, bảo mật và khả năng tiếp cận.",
    successStep2: "Bạn nhận PDF 15 điểm trong hộp thư.",
    successStep3: "Trả lời email báo cáo nếu muốn đào sâu cùng đội ngũ.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
