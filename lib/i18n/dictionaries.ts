import type { Locale } from "./config";
import { commercialPolicy } from "@/lib/content/policy";

// Chrome / UI strings. Structured content (services, work, scenes) lives in
// lib/content/site.ts as LocalizedString pairs. This file is the UI shell.
// TASK-CTA-015: primary CTA promise is sourced from commercialPolicy (TASK-BIZ-013).

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
  // Decorative keyword marquee (TASK-DS-012). The band itself is aria-hidden;
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
    // One-time mascot hint (TASK-CHAR-030) + the in-chat wish flow (TASK-CHAR-026).
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
    wishContactSeedAck: string;
    wishPartnershipSeedAck: string;
    wishCareersSeedAck: string;
    /** Undo last answer during lead capture (re-fill). */
    wishUndo: string;
    wishUndoAck: string;
    partnershipLumiCta: string;
    careersLumiCta: string;
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
  /** Opt-in banner for session replay (Microsoft Clarity). */
  consentBanner: {
    title: string;
    body: string;
    accept: string;
    decline: string;
    privacyLink: string;
  };
};

const en: Dictionary = {
  nav: {
    services: "Services",
    work: "Work",
    team: "Team",
    careers: "Careers",
    contact: "Contact",
    howWeBuild: "Process",
    notes: "Notes",
    skipToContent: "Skip to content",
  },
  hero: {
    eyebrow: "A Saigon studio that turns will into working software. Since 2020.",
    lead: "Lumi, our golden genie, takes a clear wish and helps the human team turn it into software your people actually run, built to ship, and built to last.",
    // TASK-CTA-015: outcome promise from commercial policy SSOT (not a free-form action label).
    ctaPrimary: commercialPolicy.ctaPromise.en,
    ctaSecondary: "Talk to Lumi",
    scrollHint: "Scroll to follow the wish",
    wishPlaceholder: "Make a wish… a faster checkout, an app, a tool",
    wishCta: "Make a wish",
  },
  sections: {
    valueTitle: "Why teams choose us",
    servicesTitle: "What we build",
    servicesLead: "Three focused practices. One team that answers for the result.",
    workTitle: "Selected work",
    workLead: "The kinds of wishes we are built to grant.",
    proofTitle: "What clients say",
    careersTitle: "Build with us",
    careersLead: "We hire for craft and care, senior, small, and honest about trade-offs.",
    careersCta: "See open roles",
    contactTitle: "Tell us your wish",
    contactLead: "Send a short note. We reply within one business day.",
    processTitle: "How we work",
    processLead: "A simple, honest sequence that keeps you in the loop from first call to last release.",
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
    title: "Lumi · CyberSkill’s golden genie",
    greeting:
      "Hello, I’m Lumi. Think of me as a friendly guide: pick a topic below, and I’ll share plain advice before asking for anything. When a wish is clear, it goes to a real person on the team.",
    placeholder: "Type your wish…",
    send: "Send",
    consent:
      "We may keep this chat so the team can follow up. Please don’t share passwords or secrets.",
    thinking: "Lumi is thinking…",
    unavailable:
      "The lamp is resting for a moment. Try again shortly, or email info@cyberskill.world, we reply within one business day.",
    close: "Close chat",
    resetChat: "New chat",
    hint: "Click or hold me",
    wishCta: "Leave your wish for the team",
    wishAskName: "Lovely. What should I call you?",
    wishAskEmail: "Good to meet you, {name}. Where should the team write back? (work email is perfect)",
    wishAskCompany: "Which company or team is this for? Skip if you’d rather not say.",
    wishAskUrl: "Which site or product should we review? Paste the full URL.",
    wishAskMessage: "Here’s the heart of it, tell me the wish in a sentence or two.",
    wishAskTeardownFocus: "Anything we should zero in on, a page, a flow, a pain? Optional.",
    wishAskConsent: "May the CyberSkill team contact you about this wish?",
    wishAskTeardownConsent: "May we review that site and email you the free 15-point PDF?",
    wishAgree: "Yes, contact me",
    wishSkip: "Skip",
    wishCancel: "Not now",
    wishCancelled: "Of course. The lamp stays warm, come back whenever the wish is ready.",
    wishSending: "Sealing the wish…",
    wishDone: "Your wish is on its way. A real person will reply within one business day.",
    wishDoneTeardown:
      "Your teardown slot is held. Our engineers will review the site and send the 15-point PDF to this inbox within three business days.",
    wishFailed: "The lamp flickered, that didn’t go through. Try once more, or email info@cyberskill.world.",
    wishErrorName: "Just a name so the team knows who to answer.",
    wishErrorEmail: "That email doesn’t look quite right, one more try?",
    wishErrorUrl: "I need a full URL so the team knows what to open.",
    contactLumiCta: "Grant it with Lumi",
    contactFormFallback: "Prefer a classic form?",
    wishSeedAck: "A wish worth granting. I’ll hand it to the team, first, what should I call you?",
    wishTeardownSeedAck:
      "A free 15-point teardown, gladly. I’ll hold a slot. First, what should I call you?",
    wishContactSeedAck: "Happy to connect you with the team. First, what should I call you?",
    wishPartnershipSeedAck:
      "Noted, partnership interest. I’ll route this to our studio leads. First, what should I call you?",
    wishCareersSeedAck:
      "Glad you’re looking our way. I’ll add you to the talent path. First, what should I call you?",
    wishUndo: "Undo last answer",
    wishUndoAck: "No problem, let’s fix your {field}. Type the new value.",
    partnershipLumiCta: "Start partnership with Lumi",
    careersLumiCta: "Join the talent pool with Lumi",
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
  consentBanner: {
    title: "See how people use this site?",
    body: "Anonymous session recordings (Microsoft Clarity) help us fix rough edges. Forms and chat stay masked — nothing loads until you allow.",
    accept: "Allow",
    decline: "No thanks",
    privacyLink: "Privacy",
  },
};

const vi: Dictionary = {
  nav: {
    services: "Dịch vụ",
    work: "Dự án",
    team: "Đội ngũ",
    careers: "Tuyển dụng",
    contact: "Liên hệ",
    howWeBuild: "Quy trình",
    notes: "Góc nhìn",
    skipToContent: "Tới nội dung chính",
  },
  hero: {
    eyebrow: "Studio Sài Gòn. Biến ý chí thành phần mềm chạy thật. Từ năm 2020.",
    lead: "Lumi, thần đèn vàng của CyberSkill, cùng đội ngũ biến điều ước rõ thành phần mềm đội bạn dùng mỗi ngày: bàn giao được, dùng lâu được.",
    // TASK-CTA-015: outcome promise from commercial policy SSOT.
    ctaPrimary: commercialPolicy.ctaPromise.vi,
    ctaSecondary: "Trò chuyện với Lumi",
    scrollHint: "Cuộn xuống để theo hành trình điều ước",
    wishPlaceholder: "Ước một điều… thanh toán nhanh hơn, một ứng dụng, một công cụ",
    wishCta: "Ước điều này",
  },
  sections: {
    valueTitle: "Vì sao các đội chọn chúng tôi",
    servicesTitle: "Chúng tôi xây dựng những gì",
    servicesLead: "Ba mảng chuyên sâu. Một đội chịu trách nhiệm đến kết quả cuối cùng.",
    workTitle: "Dự án tiêu biểu",
    workLead: "Những điều ước chúng tôi sinh ra để thực hiện.",
    proofTitle: "Khách hàng nói gì",
    careersTitle: "Cùng chúng tôi kiến tạo",
    careersLead: "Tuyển người có tay nghề và chỉn chu. Đội gọn, kinh nghiệm, nói thẳng đánh đổi.",
    careersCta: "Xem vị trí đang mở",
    contactTitle: "Kể chúng tôi nghe điều bạn ước",
    contactLead: "Một lời nhắn ngắn là đủ. Chúng tôi phản hồi trong một ngày làm việc.",
    processTitle: "Cách chúng tôi làm việc",
    processLead: "Một trình tự gọn và minh bạch, giúp bạn nắm rõ từ cuộc gọi đầu đến lần bàn giao cuối.",
    faqTitle: "Giải đáp thắc mắc",
    storyTitle: "Hành trình của một điều ước",
    storyLead: "Mỗi dự án một hành trình: từ điều ước rõ đến phần mềm chạy giữa đời thật.",
  },
  marquee: {
    items: ["Ứng dụng web", "Ứng dụng di động", "Hệ thống nội bộ", "Tự động hóa", "Hệ thống thiết kế", "Bền bỉ lâu dài"],
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
    submitting: "Đang gửi…",
    successTitle: "Đã nhận được lời nhắn.",
    successBody: "Cảm ơn bạn. Đội kỹ sư sẽ đọc tin nhắn và phản hồi trong một ngày làm việc qua email info@cyberskill.world. Trong lúc chờ, mời bạn xem các dự án đã bàn giao hoặc theo dõi chúng tôi trên mạng xã hội.",
    trustLine: "Thông tin của bạn được gửi thẳng đến đội ngũ. Chúng tôi không chia sẻ cho bên thứ ba.",
    errorGeneric: "Có lỗi xảy ra. Vui lòng thử lại, hoặc gửi email tới info@cyberskill.world.",
    required: "Vui lòng điền mục này.",
    invalidEmail: "Email chưa hợp lệ.",
    consentRequired: "Vui lòng đồng ý để chúng tôi có thể phản hồi.",
    optional: "không bắt buộc",
  },
  genie: {
    open: "Trò chuyện với Lumi",
    title: "Lumi · thần đèn vàng CyberSkill",
    greeting:
      "Chào bạn, mình là Lumi. Chọn một chủ đề bên dưới nhé. Mình tư vấn trước; chỉ xin thông tin khi bạn muốn gửi điều ước. Điều ước rõ sẽ được chuyển cho người thật trong đội.",
    placeholder: "Viết điều ước của bạn…",
    send: "Gửi",
    consent:
      "Cuộc trò chuyện có thể được lưu để đội theo dõi. Xin đừng gửi mật khẩu hay thông tin nhạy cảm.",
    thinking: "Lumi đang suy nghĩ…",
    unavailable:
      "Lumi đang tạm nghỉ. Bạn thử lại sau, hoặc gửi email tới info@cyberskill.world. Chúng tôi phản hồi trong một ngày làm việc.",
    close: "Đóng trò chuyện",
    resetChat: "Bắt đầu lại",
    hint: "Chạm hoặc giữ để gọi mình",
    wishCta: "Gửi điều ước cho đội ngũ",
    wishAskName: "Rất vui được gặp bạn. Mình nên gọi bạn là gì?",
    wishAskEmail: "Cảm ơn {name}. Đội có thể trả lời qua email nào? (nên dùng email công việc)",
    wishAskCompany: "Điều ước này thuộc về công ty hay nhóm nào? Bỏ qua cũng được.",
    wishAskUrl: "Website hoặc sản phẩm nào cần đánh giá? Hãy dán đầy đủ đường dẫn.",
    wishAskMessage: "Phần quan trọng đây: kể điều ước trong một hai câu thôi.",
    wishAskTeardownFocus: "Có trang, luồng hay vấn đề nào cần tập trung không? Không có cũng được.",
    wishAskConsent: "Đội CyberSkill được phép liên hệ bạn về điều ước này chứ?",
    wishAskTeardownConsent: "Chúng tôi được phép đánh giá site và gửi PDF 15 điểm miễn phí về email chứ?",
    wishAgree: "Đồng ý, hãy liên hệ mình",
    wishSkip: "Bỏ qua",
    wishCancel: "Để sau",
    wishCancelled: "Không sao cả. Khi nào sẵn sàng, bạn quay lại nhé. Đèn vẫn còn ấm.",
    wishSending: "Đang gửi điều ước…",
    wishDone: "Điều ước đã được chuyển đi. Một người thật sẽ phản hồi trong một ngày làm việc.",
    wishDoneTeardown:
      "Suất đánh giá đã được giữ. Kỹ sư sẽ rà site và gửi PDF 15 điểm về hộp thư này trong ba ngày làm việc.",
    wishFailed: "Gửi chưa thành công. Bạn thử lại, hoặc email info@cyberskill.world nhé.",
    wishErrorName: "Cho mình một cái tên để đội biết cần trả lời ai.",
    wishErrorEmail: "Email này có vẻ chưa đúng. Bạn kiểm tra lại giúp mình được không?",
    wishErrorUrl: "Mình cần đường dẫn đầy đủ để đội biết cần mở trang nào.",
    contactLumiCta: "Nhờ Lumi thực hiện",
    contactFormFallback: "Bạn thích dùng biểu mẫu quen thuộc hơn?",
    wishSeedAck: "Điều ước này đáng để làm. Mình sẽ chuyển cho đội. Trước hết, mình nên gọi bạn là gì?",
    wishTeardownSeedAck:
      "Đánh giá 15 điểm miễn phí, sẵn sàng. Mình sẽ giữ suất. Trước hết, mình nên gọi bạn là gì?",
    wishContactSeedAck: "Mình sẽ nối bạn với đội ngũ. Trước hết, mình nên gọi bạn là gì?",
    wishPartnershipSeedAck:
      "Đã ghi nhận nhu cầu hợp tác. Mình chuyển cho phụ trách studio. Trước hết, mình nên gọi bạn là gì?",
    wishCareersSeedAck:
      "Cảm ơn bạn đã quan tâm CyberSkill. Mình sẽ đưa bạn vào danh sách ứng viên. Trước hết, mình nên gọi bạn là gì?",
    wishUndo: "Hoàn tác câu vừa rồi",
    wishUndoAck: "Được. Hãy sửa lại {field} và gõ giá trị mới.",
    partnershipLumiCta: "Bắt đầu hợp tác với Lumi",
    careersLumiCta: "Ứng tuyển qua Lumi",
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
    lead: "Chúng tôi rà website hoặc ứng dụng nội bộ của bạn về tốc độ, bảo mật và khả năng tiếp cận. Bạn nhận PDF 15 điểm, chỉ rõ chỗ đang mất người dùng và hướng xử lý. Miễn phí, gửi trong 3 ngày làm việc.",
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
    capFullBody: "Suất đánh giá miễn phí tuần này đã đầy. Chúng tôi mở lại thứ Hai tới. Trong lúc chờ, bạn vẫn gửi lời nhắn chung qua form liên hệ bên dưới.",
    successTitle: "Đã nhận yêu cầu đánh giá",
    successBody: "Cảm ơn bạn. Suất của bạn đã được giữ. Chúng tôi gửi PDF 15 điểm từ info@cyberskill.world trong 3 ngày làm việc.",
    successNextLabel: "Bước tiếp theo",
    successStep1: "Kỹ sư rà tốc độ, bảo mật và khả năng tiếp cận.",
    successStep2: "Bạn nhận PDF 15 điểm trong hộp thư.",
    successStep3: "Trả lời email báo cáo nếu muốn đào sâu cùng đội ngũ.",
  },
  consentBanner: {
    title: "Xem cách mọi người dùng site?",
    body: "Ghi phiên ẩn danh (Microsoft Clarity) giúp chúng tôi sửa chỗ khó dùng. Biểu mẫu và chat được che — không gì tải cho đến khi bạn cho phép.",
    accept: "Cho phép",
    decline: "Không",
    privacyLink: "Riêng tư",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
