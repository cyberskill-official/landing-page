import type { Locale } from "./config";

// Chrome / UI strings. Structured content (services, work, scenes) lives in
// lib/content/site.ts as LocalizedString pairs. This file is the UI shell.

export type Dictionary = {
  nav: {
    services: string;
    work: string;
    team: string;
    careers: string;
    contact: string;
    skipToContent: string;
  };
  hero: {
    eyebrow: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollHint: string;
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
  };
  a11y: {
    themeToDark: string;
    themeToLight: string;
    skip3d: string;
    liteLink: string;
    cinematicLink: string;
    lumiThinking: string;
    lumiResponding: string;
    sceneNoscript: string;
  };
  footer: {
    rights: string;
    duns: string;
    privacy: string;
    accessibility: string;
  };
};

const en: Dictionary = {
  nav: {
    services: "Services",
    work: "Work",
    team: "Team",
    careers: "Careers",
    contact: "Contact",
    skipToContent: "Skip to content",
  },
  hero: {
    eyebrow: "Software solutions consultancy, since 2020",
    ctaPrimary: "Start my project",
    ctaSecondary: "Talk to Lumi",
    scrollHint: "Scroll to follow the story",
  },
  sections: {
    valueTitle: "Why teams work with us",
    servicesTitle: "What we build",
    servicesLead: "Three focused practices. One team that answers for the result.",
    workTitle: "Selected work",
    workLead: "Outcomes we can point to.",
    proofTitle: "What clients say",
    careersTitle: "Build with us",
    careersLead: "We hire for craft and care. Senior, small, and honest about trade-offs.",
    careersCta: "See open roles",
    contactTitle: "Tell us your wish",
    contactLead: "Send a short note. We reply within one business day.",
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
    successTitle: "Thank you.",
    successBody: "Your note reached us. We will reply within one business day.",
    errorGeneric: "Something went wrong. Please try again, or email info@cyberskill.world.",
    required: "This field is required.",
    invalidEmail: "Enter a valid email address.",
    consentRequired: "Please agree so we can reply.",
    optional: "optional",
  },
  genie: {
    open: "Talk to Lumi",
    title: "Lumi, the CyberSkill genie",
    greeting: "Hi, I am Lumi. Tell me what you want to build and I will point you the right way.",
    placeholder: "Type your wish...",
    send: "Send",
    consent: "Chats may be logged so our team can follow up. Do not share secrets.",
    thinking: "Lumi is thinking...",
    unavailable: "Lumi is resting right now. Please use the contact form and we will reply within one business day.",
    close: "Close chat",
  },
  a11y: {
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    skip3d: "Skip the 3D scene",
    liteLink: "View the simple version",
    cinematicLink: "Back to the full experience",
    lumiThinking: "Lumi is thinking.",
    lumiResponding: "Lumi is responding.",
    sceneNoscript: "Lumi, an animated golden genie, decorates this page. It is purely visual - all information and actions are available as text and controls on the page.",
  },
  footer: {
    rights: "All rights reserved.",
    duns: "DUNS",
    privacy: "Privacy",
    accessibility: "Accessibility",
  },
};

const vi: Dictionary = {
  nav: {
    services: "Dịch vụ",
    work: "Dự án",
    team: "Đội ngũ",
    careers: "Tuyển dụng",
    contact: "Liên hệ",
    skipToContent: "Tới nội dung chính",
  },
  hero: {
    eyebrow: "Công ty tư vấn giải pháp phần mềm, từ 2020",
    ctaPrimary: "Bắt đầu dự án",
    ctaSecondary: "Trò chuyện với Lumi",
    scrollHint: "Cuộn để theo dõi câu chuyện",
  },
  sections: {
    valueTitle: "Vì sao các đội ngũ chọn chúng tôi",
    servicesTitle: "Chúng tôi xây dựng gì",
    servicesLead: "Ba mảng chuyên sâu. Một đội ngũ chịu trách nhiệm với kết quả.",
    workTitle: "Dự án tiêu biểu",
    workLead: "Những kết quả chúng tôi có thể chỉ ra.",
    proofTitle: "Khách hàng nói gì",
    careersTitle: "Cùng xây dựng với chúng tôi",
    careersLead: "Chúng tôi tuyển vì tay nghề và sự tận tâm. Giàu kinh nghiệm, nhỏ gọn, thẳng thắn về đánh đổi.",
    careersCta: "Xem vị trí đang tuyển",
    contactTitle: "Kể cho chúng tôi điều bạn mong muốn",
    contactLead: "Gửi một lời nhắn ngắn. Chúng tôi phản hồi trong vòng một ngày làm việc.",
  },
  form: {
    name: "Tên của bạn",
    email: "Email công việc",
    company: "Công ty",
    intent: "Điều gì đưa bạn đến đây?",
    intentProject: "Một dự án",
    intentPartnership: "Một quan hệ hợp tác",
    intentCareers: "Một vị trí công việc",
    intentOther: "Việc khác",
    message: "Có điều gì chúng tôi nên biết không?",
    consent: "Tôi đồng ý được liên hệ về yêu cầu của mình.",
    submit: "Gửi",
    submitting: "Đang gửi...",
    successTitle: "Cảm ơn bạn.",
    successBody: "Lời nhắn đã đến với chúng tôi. Chúng tôi sẽ phản hồi trong vòng một ngày làm việc.",
    errorGeneric: "Đã có lỗi xảy ra. Vui lòng thử lại, hoặc gửi email tới info@cyberskill.world.",
    required: "Trường này là bắt buộc.",
    invalidEmail: "Vui lòng nhập email hợp lệ.",
    consentRequired: "Vui lòng đồng ý để chúng tôi có thể phản hồi.",
    optional: "không bắt buộc",
  },
  genie: {
    open: "Trò chuyện với Lumi",
    title: "Lumi, vị thần đèn của CyberSkill",
    greeting: "Chào bạn, mình là Lumi. Hãy kể điều bạn muốn xây dựng, mình sẽ chỉ cho bạn hướng đi phù hợp.",
    placeholder: "Nhập điều bạn mong muốn...",
    send: "Gửi",
    consent: "Cuộc trò chuyện có thể được lưu lại để đội ngũ theo dõi. Đừng chia sẻ thông tin bí mật.",
    thinking: "Lumi đang suy nghĩ...",
    unavailable: "Lumi đang nghỉ. Vui lòng dùng biểu mẫu liên hệ, chúng tôi sẽ phản hồi trong vòng một ngày làm việc.",
    close: "Đóng cửa sổ trò chuyện",
  },
  a11y: {
    themeToDark: "Chuyển sang chế độ tối",
    themeToLight: "Chuyển sang chế độ sáng",
    skip3d: "Bỏ qua cảnh 3D",
    liteLink: "Xem phiên bản đơn giản",
    cinematicLink: "Trở lại trải nghiệm đầy đủ",
    lumiThinking: "Lumi đang suy nghĩ.",
    lumiResponding: "Lumi đang trả lời.",
    sceneNoscript: "Lumi, một thần đèn vàng hoạt họa, chỉ để trang trí cho trang này. Mọi thông tin và thao tác đều có sẵn dưới dạng văn bản và nút điều khiển trên trang.",
  },
  footer: {
    rights: "Bảo lưu mọi quyền.",
    duns: "DUNS",
    privacy: "Quyền riêng tư",
    accessibility: "Khả năng tiếp cận",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, vi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
