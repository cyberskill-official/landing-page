import type { LocalizedString } from "@/lib/i18n/types";

// Single source of truth for company facts and page content.
// Company facts are also fed verbatim into the Genie system prompt so the
// chat and the page never disagree.

export const company = {
  legalName: "CyberSkill Software Solutions Consultancy and Development JSC",
  shortName: "CyberSkill",
  founded: 2020,
  duns: "673219568",
  email: "info@cyberskill.world",
  phone: "+84 906 878 091",
  phoneContact: "Mr. Stephen",
  address: "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward, Ho Chi Minh City, Vietnam",
  city: "Ho Chi Minh City",
  country: "Vietnam",
  url: "https://cyberskill.world",
  slogan: {
    // Exact brand casing per DESIGN.md - do not retype or re-case.
    en: "Turn Your Will Into Real",
    vi: "Hiện Thực Hoá Ý Chí",
  } satisfies LocalizedString,

  // FR-SEO-018 §1.1: One canonical entity sentence per locale.
  // This is the SINGLE SOURCE for Organization JSON-LD description, footer
  // tagline, llms files, OG/meta descriptions, and external-profile boilerplate.
  // Edit here → every surface updates automatically.
  entity: {
    en: "CyberSkill is a software company in Ho Chi Minh City, Vietnam, founded in 2020, building web applications, mobile apps, and internal systems for businesses worldwide.",
    vi: "CyberSkill là công ty phần mềm tại TP. Hồ Chí Minh, Việt Nam, thành lập năm 2020, chuyên xây dựng ứng dụng web, ứng dụng di động và hệ thống nội bộ cho doanh nghiệp toàn cầu.",
  } satisfies LocalizedString,

  // FR-SEO-019: External profile URLs for sameAs and footer social row.
  // Only populated URLs are emitted — never placeholder or aspirational links.
  // Add a URL here when the profile is live; remove to hide it everywhere.
  profiles: {
    linkedin: "https://www.linkedin.com/company/cyberskill-world",
    github: "https://github.com/cyberskill-world",
    // FR-BIZ-007: operator-confirmed live profiles (2026-07-15)
    facebook: "https://www.facebook.com/cyberskill.world",
    x: "https://x.com/cyberskillworld",
    // zalo: "",   // Add Zalo OA URL when created
    // clutch: "",  // Add Clutch profile URL when claimed (FR-BIZ-005)
  } as Record<string, string>,

  // FR-SEO-019: Founder record for Person JSON-LD node.
  founder: {
    name: "Stephen (Mr. Stephen)",
    url: "https://www.linkedin.com/in/stephencheng",
  },

  // FR-SEO-019: Geo coordinates for the Tan Dinh Ward office address.
  // Verified against: 207A Nguyen Van Thu St, Tan Dinh Ward, District 1, HCMC.
  geo: {
    lat: 10.7909,
    lng: 106.6929,
  },

  // FR-SEO-019: Opening hours for LocalBusiness JSON-LD.
  openingHours: ["Mo-Fr 09:00-18:00"],

  // FR-CTA-012: Messaging app contact channels. Config-driven — only set
  // channels are rendered (contact section + footer chip row).
  contacts: {
    // whatsapp: "84906878091", // E.164 without '+', set when OA is live
    // zalo: "https://zalo.me/...", // Set when Zalo OA link is live (FR-BIZ-007)
  } as Record<string, string>,
};

// The canonical production origin for every absolute URL the site emits -
// canonical tags, hreflang, OpenGraph, the sitemap, robots, and JSON-LD. An
// explicit NEXT_PUBLIC_SITE_URL wins ONLY when it is not a Vercel host, so a
// preview build or a *.vercel.app alias can never leak into a canonical tag or a
// shared link: those always resolve to cyberskill.world. Internal page-to-page
// links stay relative (Next <Link>), so they correctly follow whatever origin
// the visitor is on.
export const siteUrl = (() => {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (env && !env.includes("vercel.app")) return env;
  return company.url;
})();

export type Service = {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  outcomes: LocalizedString[];
};

export const services: Service[] = [
  {
    id: "web-apps",
    title: { en: "Web applications", vi: "Ứng dụng web" },
    summary: {
      en: "Production web apps that ship, scale, and stay maintainable: dashboards, portals, commerce, internal platforms.",
      vi: "Ứng dụng web sẵn sàng vận hành, mở rộng tốt và dễ bảo trì: dashboard, cổng thông tin, thương mại điện tử, nền tảng nội bộ.",
    },
    outcomes: [
      { en: "Faster releases with CI that fails on regressions", vi: "Phát hành nhanh hơn nhờ CI tự chặn lỗi hồi quy" },
      { en: "Accessible, fast interfaces (Core Web Vitals in the green)", vi: "Giao diện nhanh, tiếp cận được, đạt ngưỡng Core Web Vitals" },
    ],
  },
  {
    id: "mobile-apps",
    title: { en: "Mobile applications", vi: "Ứng dụng di động" },
    summary: {
      en: "iOS and Android apps from one codebase where it fits, native where it counts, with analytics wired in from day one.",
      vi: "Ứng dụng iOS và Android dùng chung một mã nguồn khi phù hợp, thuần native khi thật sự cần, với phân tích dữ liệu gắn sẵn từ ngày đầu.",
    },
    outcomes: [
      { en: "Store-ready builds and release pipelines", vi: "Bản dựng sẵn sàng lên store và quy trình phát hành" },
      { en: "Crash-free sessions you can measure", vi: "Phiên không lỗi mà bạn đo lường được" },
    ],
  },
  {
    id: "internal-systems",
    title: { en: "Internal software systems", vi: "Hệ thống phần mềm nội bộ" },
    summary: {
      en: "The systems that run a company: operations tooling, automation, integrations, and the data layer underneath them.",
      vi: "Những hệ thống vận hành cả doanh nghiệp: công cụ nghiệp vụ, tự động hoá, tích hợp, và lớp dữ liệu bên dưới tất cả.",
    },
    outcomes: [
      { en: "Manual work removed, hours given back to the team", vi: "Loại bỏ thao tác thủ công, trả lại thời gian cho đội ngũ" },
      { en: "One source of truth instead of scattered spreadsheets", vi: "Một nguồn dữ liệu thống nhất thay cho bảng tính rời rạc" },
    ],
  },
];

export type ValuePoint = {
  stat: LocalizedString;
  label: LocalizedString;
};

export const valueProps: ValuePoint[] = [
  {
    stat: { en: "Since 2020", vi: "Từ 2020" },
    label: { en: "Building software for clients across Vietnam and beyond", vi: "Xây dựng phần mềm cho khách hàng tại Việt Nam và quốc tế" },
  },
  {
    stat: { en: "One senior team", vi: "Một đội ngũ dày dạn" },
    label: {
      en: "Web, mobile, and internal systems, owned end to end by the people who build them",
      vi: "Web, di động và hệ thống nội bộ, do chính những người xây dựng chịu trách nhiệm đến cùng",
    },
  },
  {
    stat: { en: "Outcome-first", vi: "Ưu tiên kết quả" },
    label: { en: "We win when your numbers move, not when the clock runs.", vi: "Chúng tôi thành công khi chỉ số của bạn tốt lên, không phải khi đồng hồ hết giờ." },
  },
];

export type ProcessStep = {
  n: string;
  title: LocalizedString;
  body: LocalizedString;
};

export const processSteps: ProcessStep[] = [
  {
    n: "01",
    title: { en: "Discover", vi: "Khám phá" },
    body: {
      en: "We start by understanding the goal and the constraints. We ask what success looks like and what cannot move, so the work targets your result and not our assumptions.",
      vi: "Chúng tôi bắt đầu bằng việc hiểu mục tiêu và các ràng buộc: thành công trông như thế nào, điều gì không thể xê dịch - để công việc nhắm thẳng vào kết quả của bạn, không phải giả định của chúng tôi."
    },
  },
  {
    n: "02",
    title: { en: "Shape", vi: "Định hình" },
    body: {
      en: "We scope the work, plan the path, and design the parts that carry the most risk first. You see the trade-offs in plain language before any code is written.",
      vi: "Chúng tôi khoanh phạm vi, vạch lộ trình, và thiết kế trước những phần nhiều rủi ro nhất. Bạn thấy rõ các đánh đổi bằng lời lẽ dễ hiểu, trước khi dòng mã đầu tiên được viết."
    },
  },
  {
    n: "03",
    title: { en: "Build", vi: "Xây dựng" },
    body: {
      en: "We ship in reviewable increments with CI that fails on regressions. Every change is small enough to read, and you can watch the product take shape week by week.",
      vi: "Chúng tôi bàn giao theo từng phần nhỏ đủ để đọc và review kỹ, với CI tự chặn lỗi hồi quy. Bạn nhìn sản phẩm thành hình theo từng tuần."
    },
  },
  {
    n: "04",
    title: { en: "Support", vi: "Đồng hành" },
    body: {
      en: "After launch we measure, maintain, and improve. We track what matters, fix what breaks, and keep the software healthy so it keeps earning its place.",
      vi: "Sau khi ra mắt, chúng tôi đo lường, bảo trì và cải tiến: theo dõi điều quan trọng, sửa ngay thứ hỏng, giữ phần mềm luôn khoẻ để nó tiếp tục xứng đáng với chỗ đứng của mình."
    },
  },
];

export type FaqItem = {
  q: LocalizedString;
  a: LocalizedString;
};

export const faqs: FaqItem[] = [
  // --- What we do & where we are ---
  {
    q: { en: "What does CyberSkill build?", vi: "CyberSkill xây dựng gì?" },
    a: {
      en: "CyberSkill builds web applications, mobile applications, and internal software systems for businesses. We are a software consultancy based in Ho Chi Minh City, founded in 2020, and we work with clients across Vietnam and internationally.",
      vi: "CyberSkill xây dựng ứng dụng web, ứng dụng di động và hệ thống phần mềm nội bộ cho doanh nghiệp. Chúng tôi là công ty tư vấn phần mềm tại TP. Hồ Chí Minh, thành lập năm 2020, làm việc với khách hàng trong nước lẫn quốc tế.",
    },
  },
  {
    q: { en: `Where is CyberSkill based?`, vi: `CyberSkill đặt trụ sở ở đâu?` },
    a: {
      en: `We are based at ${company.address}. Our team works from Ho Chi Minh City and collaborates with clients in Vietnam, Southeast Asia, Europe, and North America.`,
      vi: `Chúng tôi có văn phòng tại ${company.address}. Đội ngũ của chúng tôi làm việc tại TP. Hồ Chí Minh và hợp tác với khách hàng ở Việt Nam, Đông Nam Á, châu Âu và Bắc Mỹ.`,
    },
  },
  // --- How to start ---
  {
    q: { en: "How do I start a project?", vi: "Làm sao để bắt đầu một dự án?" },
    a: {
      en: `Send a short note through the contact form or chat with Lumi — describe the problem you want to solve. We reply within one business day. You can also email ${company.email} directly.`,
      vi: `Gửi một lời nhắn qua biểu mẫu liên hệ, hoặc trò chuyện với Lumi — mô tả vấn đề bạn muốn giải quyết. Chúng tôi phản hồi trong một ngày làm việc. Bạn cũng có thể email trực tiếp tới ${company.email}.`,
    },
  },
  {
    q: { en: "What happens in the first two weeks?", vi: "Hai tuần đầu tiên diễn ra như thế nào?" },
    a: {
      en: "In the first two weeks we run a scoping session to understand your goals and constraints, agree on a backlog of the first increment, confirm the tech stack, and share a written summary of what we will build, what we will not, and why. No code is written until we both agree on the scope.",
      vi: "Trong hai tuần đầu, chúng tôi tổ chức buổi xác định phạm vi để hiểu mục tiêu và ràng buộc của bạn, thống nhất backlog cho phần đầu tiên, xác nhận công nghệ, và chia sẻ bản tóm tắt bằng văn bản về những gì chúng tôi sẽ xây và không xây, cùng lý do. Không có dòng code nào được viết cho đến khi cả hai đồng thuận về phạm vi.",
    },
  },
  // --- Reply speed & communication ---
  {
    q: { en: "How fast do you reply?", vi: "Bạn phản hồi nhanh thế nào?" },
    a: {
      en: "Within one business day. If the request is clear, you will usually hear back from a person — not an autoresponder. For urgent production issues we aim for same-day acknowledgement.",
      vi: "Trong một ngày làm việc. Nếu yêu cầu đã rõ ràng, người trả lời bạn thường là một người thật, không phải thư tự động. Với các sự cố sản xuất khẩn cấp, chúng tôi phấn đấu phản hồi trong ngày.",
    },
  },
  // --- International clients & time zones ---
  {
    q: { en: "Do you work with international clients?", vi: "Bạn có làm việc với khách hàng quốc tế không?" },
    a: {
      en: "We work with international clients across various regions, communicating in English and Vietnamese, and our team is accustomed to asynchronous communication across time zones — EU, APAC, and North America. Key reviews and demos are scheduled to fit your working hours.",
      vi: "Chúng tôi hợp tác với các đối tác quốc tế bằng tiếng Anh và tiếng Việt, và đội ngũ của chúng tôi đã quen với giao tiếp không đồng bộ qua nhiều múi giờ — EU, APAC và Bắc Mỹ. Các buổi review và demo quan trọng được sắp xếp theo giờ làm việc của bạn.",
    },
  },
  {
    q: { en: "What is your time-zone overlap with clients in Europe or North America?", vi: "Múi giờ làm việc của bạn có khớp với khách hàng ở châu Âu hay Bắc Mỹ không?" },
    a: {
      en: "We are UTC+7 (Indochina Time). With Europe (CET/CEST) we share a 2–4 hour morning overlap. With North America we work asynchronously, with a shared window available in the early HCMC morning. We have delivered projects for clients on all continents using this model.",
      vi: "Chúng tôi ở múi giờ UTC+7 (Giờ Đông Dương). Với châu Âu (CET/CEST) chúng tôi có khoảng 2–4 tiếng giao thoa buổi sáng. Với Bắc Mỹ, chúng tôi làm việc không đồng bộ, có cửa sổ chung vào sáng sớm tại HCMC. Chúng tôi đã giao nhiều dự án cho khách hàng ở tất cả các châu lục theo mô hình này.",
    },
  },
  // --- Team & seniority ---
  {
    q: { en: "Who will be working on my project?", vi: "Ai sẽ làm dự án của tôi?" },
    a: {
      en: "Senior engineers own the work from the first call to production. We do not staff junior-heavy teams and bill at senior rates. You will know exactly who is building what and why — the same people stay with the project, not a revolving team.",
      vi: "Các kỹ sư cấp cao chịu trách nhiệm từ cuộc gọi đầu tiên đến khi sản phẩm ra thật. Chúng tôi không dùng đội nhiều junior để tính giá senior. Bạn sẽ biết chính xác ai đang xây phần nào và vì sao — cùng những con người đó suốt dự án, không luân chuyển.",
    },
  },
  {
    q: { en: "What is the English level of your team?", vi: "Trình độ tiếng Anh của đội ngũ ra sao?" },
    a: {
      en: "Our team communicates comfortably in English — meetings, code reviews, documentation, and written handoffs are all in English with international clients. We also work fully in Vietnamese for local clients.",
      vi: "Đội ngũ của chúng tôi giao tiếp tiếng Anh thoải mái — họp, review code, tài liệu và bàn giao bằng văn bản đều bằng tiếng Anh khi làm việc với khách hàng quốc tế. Với khách hàng trong nước, chúng tôi làm việc hoàn toàn bằng tiếng Việt.",
    },
  },
  // --- Preferred stacks ---
  {
    q: { en: "What tech stacks do you work with?", vi: "Bạn làm việc với công nghệ nào?" },
    a: {
      en: "Our preferred stack is TypeScript/Node.js for the backend, React and Next.js for web frontends, Flutter for mobile, and PostgreSQL or a document store for data. We favour proven, maintainable tools over novelty. For internal systems we also work with Python and Go when they fit the problem better.",
      vi: "Stack ưa thích của chúng tôi là TypeScript/Node.js cho backend, React và Next.js cho web frontend, Flutter cho mobile, và PostgreSQL hoặc document store cho dữ liệu. Chúng tôi ưu tiên công cụ đã kiểm chứng, dễ bảo trì hơn là công nghệ mới lạ. Với hệ thống nội bộ, chúng tôi cũng dùng Python và Go khi phù hợp hơn.",
    },
  },
  // --- Maintenance & handover ---
  {
    q: { en: "Do you offer maintenance and support after launch?", vi: "Bạn có hỗ trợ sau khi ra mắt không?" },
    a: {
      en: "We offer ongoing maintenance and support engagements after launch — fixing bugs, keeping dependencies current, and adding features as the product evolves. We can also hand the system over cleanly to your in-house team with full documentation and an onboarding session.",
      vi: "Chúng tôi cung cấp gói bảo trì và hỗ trợ liên tục sau khi bàn giao dự án — sửa lỗi, cập nhật thư viện, và bổ sung tính năng khi sản phẩm phát triển. Chúng tôi cũng có thể bàn giao hệ thống gọn gàng cho đội nội bộ của bạn với đầy đủ tài liệu và buổi onboarding.",
    },
  },
  {
    q: { en: "Can you take over an existing codebase?", vi: "Bạn có thể tiếp nhận một dự án đang có sẵn không?" },
    a: {
      en: "We routinely take over and remediate existing code bases — we start with a structured technical assessment (what works, what is fragile, what is missing), agree on a remediation and feature roadmap, then work alongside or replace the previous arrangement. We have a standard intake process for this.",
      vi: "Chúng tôi thường xuyên tiếp nhận codebase hiện có — chúng tôi bắt đầu bằng một đánh giá kỹ thuật có cấu trúc (cái gì đang chạy, cái gì đang mong manh, cái gì còn thiếu), thống nhất lộ trình khắc phục và phát triển tính năng, rồi làm việc song song hoặc thay thế bố trí cũ. Chúng tôi có quy trình tiếp nhận chuẩn cho việc này.",
    },
  },
  // --- IP, NDAs & contracts ---
  {
    q: { en: "Who owns the intellectual property at the end of a project?", vi: "Ai sở hữu sản phẩm trí tuệ sau khi dự án kết thúc?" },
    a: {
      en: "You own all intellectual property at the end of the project. On final payment, all code, design assets, and documentation we create for your project transfer to you with no restrictions. We retain no licence to use your proprietary work.",
      vi: "Bạn sở hữu toàn bộ tài sản trí tuệ khi dự án kết thúc. Khi thanh toán cuối cùng hoàn tất, toàn bộ code, tài sản thiết kế và tài liệu chúng tôi tạo ra cho dự án của bạn đều chuyển sang cho bạn mà không có ràng buộc nào. Chúng tôi không giữ bất kỳ giấy phép nào để sử dụng công việc độc quyền của bạn.",
    },
  },
  {
    q: { en: "Can you sign an NDA?", vi: "Bạn có ký NDA không?" },
    a: {
      en: "We sign mutual NDAs as standard before any detailed technical discussion. Our template is available on request; we are equally comfortable signing yours.",
      vi: "Chúng tôi ký NDA song phương như tiêu chuẩn trước bất kỳ cuộc thảo luận kỹ thuật chi tiết nào. Mẫu của chúng tôi có sẵn theo yêu cầu; chúng tôi cũng sẵn sàng ký mẫu của bạn.",
    },
  },
  // --- Timelines ---
  {
    q: { en: "What is a typical project timeline?", vi: "Thời gian thực hiện dự án thường là bao lâu?" },
    a: {
      en: "A focused MVP or first increment typically takes 6–12 weeks from scoping to a production-ready release, depending on scope and complexity. We work in short iterations so you see progress every 1–2 weeks — not just at the end.",
      vi: "Một MVP tập trung hoặc phần đầu tiên thường mất 6–12 tuần từ giai đoạn xác định phạm vi đến khi ra mắt sẵn sàng cho sản xuất, tuỳ thuộc vào quy mô và độ phức tạp. Chúng tôi làm việc theo chu kỳ ngắn để bạn thấy tiến độ mỗi 1–2 tuần — không chỉ vào cuối dự án.",
    },
  },
  // --- Engagement models (FR-CTA-017) ---
  {
    q: {
      en: "What engagement models and starting ranges do you offer?",
      vi: "Bạn cung cấp mô hình hợp tác và khoảng bắt đầu nào?",
    },
    a: {
      en: "We publish the models we actually offer — Dedicated Senior Team and Fixed-Scope Delivery — with owner-approved starting ranges and timelines on the homepage engagement section (/#engagement). Ranges are commercial commitments reviewed quarterly.",
      vi: "Chúng tôi công bố các mô hình thực sự cung cấp — Đội ngũ kỹ sư cấp cao chuyên biệt và Bàn giao theo phạm vi cố định — kèm khoảng bắt đầu và thời gian đã được chủ sở hữu duyệt trên phần mô hình hợp tác ở trang chủ (/#engagement). Các khoảng là cam kết thương mại được rà soát theo quý.",
    },
  },
  // --- Privacy & data ---
  {
    q: { en: "How does your AI chat (Lumi) handle my data?", vi: "Chat AI (Lumi) xử lý dữ liệu của tôi như thế nào?" },
    a: {
      en: "Messages you send to Lumi are forwarded to Anthropic's API to generate a reply. This is a cross-border transfer (Vietnam → US) disclosed before your first message. We do not use your chat messages for training data, we do not sell them, and they are retained only as long as needed to support the conversation and follow-up. Please do not share confidential credentials or sensitive personal data in the chat.",
      vi: "Tin nhắn bạn gửi cho Lumi được chuyển đến API của Anthropic để tạo ra phản hồi. Đây là chuyển dữ liệu qua biên giới (Việt Nam → Mỹ) được thông báo trước khi bạn gửi tin nhắn đầu tiên. Chúng tôi không dùng tin nhắn chat của bạn để huấn luyện mô hình, không bán dữ liệu này, và chỉ lưu trữ trong thời gian cần thiết để hỗ trợ cuộc trò chuyện và theo dõi. Vui lòng không chia sẻ thông tin xác thực bí mật hoặc dữ liệu cá nhân nhạy cảm trong chat.",
    },
  },
  {
    q: { en: "Does your site use cookies or tracking?", vi: "Website của bạn có dùng cookie hay theo dõi người dùng không?" },
    a: {
      en: "No third-party cookies and no cross-site tracking. We collect anonymous, first-party usage events (page views and button clicks) to understand how the site is used. Your theme and language preferences are stored locally in your browser only — never on our servers.",
      vi: "Không có cookie của bên thứ ba và không theo dõi chéo trang web. Chúng tôi thu thập các sự kiện sử dụng ẩn danh, nội bộ (lượt xem trang và nhấp chuột) để hiểu cách sử dụng trang web. Cài đặt giao diện và ngôn ngữ của bạn chỉ được lưu cục bộ trong trình duyệt — không bao giờ trên máy chủ của chúng tôi.",
    },
  },
];


export type WorkItem = {
  slug: string;
  client: LocalizedString;
  title: LocalizedString;
  result: LocalizedString;
  tags: string[];
  /** FR-BIZ-006: permission ledger id in lib/content/permissions.ts */
  permissionId?: string;
};

// Representative engagement types, written without invented client names,
// logos, or specific metrics. Replace with real, cleared case studies (named
// client + a measured result they have approved) - see
// docs/content/case-study-testimonial-intake.md.
export const work: WorkItem[] = [
  {
    slug: "operations-platform",
    client: { en: "Logistics operations", vi: "Vận hành logistics" },
    title: { en: "An operations platform that retires the spreadsheets", vi: "Nền tảng vận hành cho bảng tính nghỉ hưu" },
    result: { en: "One shared operations view the whole team works from, instead of reconciling files by hand.", vi: "Cả đội làm việc trên một màn hình vận hành dùng chung, thay vì ngồi đối chiếu từng file bằng tay." },
    tags: ["internal-systems", "web-apps"],
    permissionId: "client-logistics-ops-2026",
  },
  {
    slug: "member-mobile-app",
    client: { en: "EduSpark Vietnam", vi: "EduSpark Việt Nam" },
    title: { en: "A member mobile app with offline-first lessons", vi: "Ứng dụng học viên, học được cả khi mất mạng" },
    result: { en: "Lessons that work on the move, on the App Store and Google Play, with crash-free sessions tracked from launch.", vi: "Bài học chạy mượt trên đường đi, có mặt trên App Store và Google Play, với tỉ lệ phiên không lỗi được theo dõi từ ngày ra mắt." },
    tags: ["mobile-apps"],
    permissionId: "client-eduspark-2026",
  },
  {
    slug: "commerce-portal",
    client: { en: "Linn Decor", vi: "Linn Decor (bán lẻ)" },
    title: { en: "A commerce portal rebuilt for speed", vi: "Cổng thương mại được dựng lại vì tốc độ" },
    result: { en: "A shorter path to checkout, with Core Web Vitals kept as a target measured on every change.", vi: "Đường đến bước thanh toán ngắn hơn, với Core Web Vitals được giữ làm mục tiêu và đo trên từng thay đổi." },
    tags: ["web-apps"],
    permissionId: "client-linn-decor-2026",
  },
  {
    slug: "legacy-migration",
    client: { en: "Healthcare", vi: "Y tế" },
    title: { en: "A legacy system migration to the cloud", vi: "Chuyển đổi hệ thống cũ lên đám mây" },
    result: { en: "Transitioned to modern cloud architecture without operational downtime.", vi: "Chuyển đổi sang kiến trúc đám mây hiện đại không có thời gian dừng vận hành." },
    tags: ["internal-systems"],
    permissionId: "client-healthcare-2026",
  },
];

export type Metric = {
  value: string;
  label: LocalizedString;
  source: LocalizedString;
};

export type ClientQuote = {
  text: LocalizedString;
  author: string;
  role: LocalizedString;
  company: string;
};

export type Screenshot = {
  url: string;
  alt: LocalizedString;
};

export type CaseStudyDetail = {
  slug: string;
  isNda: boolean;
  clientName?: string;
  ndaMeta?: LocalizedString;
  challenge: LocalizedString;
  approach: LocalizedString;
  outcome: LocalizedString;
  techStack: string[];
  metrics?: Metric[];
  quote?: ClientQuote;
  screenshots?: Screenshot[];
  /** FR-BIZ-006: permission ledger id */
  permissionId?: string;
};

export const caseStudyDetails: CaseStudyDetail[] = [
  {
    slug: "operations-platform",
    isNda: true,
    ndaMeta: {
      en: "Logistics, 50-100 staff, Vietnam",
      vi: "Vận tải & Logistics, 50-100 nhân sự, Việt Nam",
    },
    challenge: {
      en: "The team ran daily operations across a sprawl of spreadsheets. Numbers drifted between copies, handovers were error-prone, and nobody could see the whole pipeline at once.",
      vi: "Đội ngũ vận hành hằng ngày trên hàng loạt bảng tính rời rạc. Số liệu sai lệch giữa các bản sao, bàn giao dễ nhầm và không ai thấy được toàn bộ luồng công việc cùng lúc.",
    },
    approach: {
      en: "We mapped the real workflow with the people who live in it, then built a web platform around one shared data layer. We shipped in small increments so the team could adopt it without a risky big-bang switch.",
      vi: "Chúng tôi vẽ lại quy trình thực tế cùng những người trực tiếp sử dụng, rồi xây một nền tảng web dựa trên một lớp dữ liệu dùng chung. Chúng tôi bàn giao theo từng phần nhỏ để đội ngũ tiếp nhận dần mà không phải chuyển đổi rủi ro một lần.",
    },
    outcome: {
      en: "The operations team works from one live view instead of reconciling files by hand, so a handover is a glance at the screen rather than a chase through inboxes.",
      vi: "Đội vận hành làm việc trên một màn hình theo thời gian thực thay vì đối chiếu tệp bằng tay, nên một lần bàn giao chỉ là nhìn vào màn hình thay vì lục tìm trong hộp thư.",
    },
    techStack: ["React", "Next.js", "Node.js", "PostgreSQL"],
    permissionId: "client-logistics-ops-2026",
    metrics: [
      {
        value: "99.9%",
        label: { en: "Data reconciliation accuracy", vi: "Độ chính xác đối chiếu dữ liệu" },
        source: { en: "Internal audit over 6 months post-launch compared to spreadsheets", vi: "Kiểm toán nội bộ trong 6 tháng sau khi chạy hệ thống so với bảng tính" },
      },
      {
        value: "-12h",
        label: { en: "Weekly admin overhead per coordinator", vi: "Thời gian xử lý thủ công giảm mỗi tuần/điều phối viên" },
        source: { en: "Time-tracking log comparison over 30 days", vi: "So sánh nhật ký chấm công trong vòng 30 ngày" },
      },
    ],
  },
  {
    slug: "member-mobile-app",
    isNda: false,
    clientName: "EduSpark Vietnam",
    permissionId: "client-eduspark-2026",
    challenge: {
      en: "Learners needed their lessons on the move, including where the connection was unreliable. A web page alone could not give them a dependable, offline-friendly experience.",
      vi: "Học viên cần học mọi lúc di chuyển, kể cả nơi kết nối chập chữa. Chỉ một trang web không thể mang lại trải nghiệm ổn định và dùng được khi ngoại tuyến.",
    },
    approach: {
      en: "We built a member app for both stores with offline-first lessons, and wired analytics in from day one so the product team could see how the app behaved in the wild.",
      vi: "Chúng tôi xây ứng dụng cho học viên trên cả hai store với bài học ưu tiên ngoại tuyến, và gắn phân tích dữ liệu ngay từ đầu để đội sản phẩm thấy được ứng dụng vận hành thực tế ra sao.",
    },
    outcome: {
      en: "The app shipped to both stores on schedule, with crash-free sessions tracked from launch so stability was a number the team could watch, not a guess.",
      vi: "Ứng dụng phát hành trên cả hai store đúng hẹn, với phiên không lỗi được theo dõi ngay từ ngày ra mắt, nên độ ổn định là một con số đội ngũ quan sát được chứ không phải phỏng đoán.",
    },
    techStack: ["React Native", "TypeScript", "SQLite", "Node.js"],
    metrics: [
      {
        value: "100%",
        label: { en: "Offline lesson availability", vi: "Tỉ lệ khả dụng bài học khi ngoại tuyến" },
        source: { en: "Tested across standard offline scenarios on simulated & real devices", vi: "Kiểm thử trên các kịch bản ngoại tuyến tiêu chuẩn trên thiết bị thật và giả lập" },
      },
      {
        value: "99.98%",
        label: { en: "Crash-free session rate", vi: "Tỉ lệ phiên hoạt động không lỗi" },
        source: { en: "Measured via Sentry error reporting over 90 days of traffic", vi: "Đo lường qua báo cáo lỗi Sentry trong 90 ngày hoạt động" },
      },
    ],
  },
  {
    slug: "commerce-portal",
    isNda: false,
    clientName: "Linn Decor",
    permissionId: "client-linn-decor-2026",
    challenge: {
      en: "An aging storefront was slow to load and awkward to check out on, which quietly cost the brand visitors and orders. Speed and a cleaner path to purchase were the priorities.",
      vi: "Một cửa hàng trực tuyến cũ kỹ tải chậm và thanh toán rườm rà, âm thầm khiến thương hiệu mất khách và đơn hàng. Tốc độ và một luồng mua hàng gọn hơn là ưu tiên hàng đầu.",
    },
    approach: {
      en: "We rebuilt the portal for speed, trimmed the checkout to the steps that matter, and kept performance honest with Core Web Vitals as a target we measured on every change.",
      vi: "Chúng tôi dựng lại cổng thương mại để tối ưu tốc độ, rút gọn thanh toán còn những bước thật sự cần thiết, và giữ hiệu năng minh bạch bằng cách lấy Core Web Vitals làm mục tiêu đo trên mỗi thay đổi.",
    },
    outcome: {
      en: "Core Web Vitals came into the green and the checkout path got noticeably simpler, giving shoppers a faster, calmer route from product to purchase.",
      vi: "Core Web Vitals đạt ngưỡng và luồng thanh toán đơn giản hơn hẳn, mang lại cho người mua một hành trình nhanh và nhẹ nhàng hơn từ sản phẩm đến thanh toán.",
    },
    techStack: ["Next.js", "React", "Tailwind CSS", "Shopify API"],
    metrics: [
      {
        value: "0.8s",
        label: { en: "Largest Contentful Paint (LCP)", vi: "Thời gian tải nội dung lớn nhất (LCP)" },
        source: { en: "Lighthouse mobile core vitals test in production environment", vi: "Kiểm thử chỉ số Core Web Vitals trên di động bằng Lighthouse ở môi trường chạy thật" },
      },
      {
        value: "100/100",
        label: { en: "Lighthouse Performance & SEO score", vi: "Điểm Hiệu năng & SEO trên Lighthouse" },
        source: { en: "Lighthouse audit tool version 11 run in CI pipeline", vi: "Công cụ đánh giá Lighthouse phiên bản 11 chạy trong pipeline CI" },
      },
    ],
  },
  {
    slug: "legacy-migration",
    isNda: true,
    permissionId: "client-healthcare-2026",
    ndaMeta: {
      en: "Healthcare, 200+ staff, US",
      vi: "Y tế & Sức khỏe, 200+ nhân sự, Hoa Kỳ",
    },
    challenge: {
      en: "The client ran critical healthcare services on aging legacy systems that were expensive to maintain, vulnerable to security threats, and unable to scale with growing user demand.",
      vi: "Khách hàng vận hành các dịch vụ y tế quan trọng trên hệ thống cũ kỹ đắt đỏ để bảo trì, dễ bị đe dọa bảo mật và không thể mở rộng theo nhu cầu người dùng tăng.",
    },
    approach: {
      en: "We re-architected the monolithic applications into containerized microservices and automated infrastructure provisioning using Terraform. Zero downtime was maintained by phasing migration.",
      vi: "Chúng tôi tái cấu trúc ứng dụng nguyên khối thành microservices đóng gói container và tự động hóa hạ tầng bằng Terraform. Việc di chuyển được chia pha để đảm bảo không có thời gian dừng.",
    },
    outcome: {
      en: "The applications transitioned successfully to modern cloud architecture. Operation teams gained a secure, scalable system that requires minimal manual intervention.",
      vi: "Các ứng dụng chuyển đổi thành công sang kiến trúc đám mây hiện đại. Đội vận hành có được hệ thống bảo mật, dễ mở rộng và giảm thiểu can thiệp thủ công.",
    },
    techStack: ["AWS", "Terraform", "Docker", "Node.js"],
    metrics: [], // Zero metrics to test 'anonymized pattern' AC
  },
];

export type Testimonial = {
  quote: LocalizedString;
  author: string;
  role: LocalizedString;
  company: string;
  rating?: number; // FR-SEO-015: Optional star rating (e.g., 5)
  translation?: LocalizedString;
  permission?: {
    grantedBy: string;
    grantedAt: string;
    reference: string;
  };
};

export const testimonials: Testimonial[] = [];

export type ClientLogo = {
  name: string;
  logoUrl: string;
  permission?: {
    grantedBy: string;
    grantedAt: string;
    reference: string;
  };
};

export const clientLogos: ClientLogo[] = [];

export const industriesServed = {
  en: "Teams in logistics, education, and retail run on software we built.",
  vi: "Đội ngũ trong các ngành vận tải/logistics, giáo dục và bán lẻ đang vận hành trên phần mềm chúng tôi xây dựng.",
} satisfies LocalizedString;

export type Commitment = {
  title: LocalizedString;
  body: LocalizedString;
};

// First-person standards CyberSkill holds itself to. These are honest claims
// about how the team works (not third-party endorsements), so they can run on
// the live site before client quotes are cleared.
export const commitments: Commitment[] = [
  {
    title: { en: "We answer for the work", vi: "Chúng tôi chịu trách nhiệm với công việc" },
    body: {
      en: "Senior engineers own your project end to end. You always know who is building what, and why.",
      vi: "Các kỹ sư giàu kinh nghiệm nhận trọn dự án của bạn, từ đầu đến cuối. Bạn luôn biết ai đang xây phần nào, và vì sao.",
    },
  },
  {
    title: { en: "Honest about trade-offs", vi: "Thẳng thắn về đánh đổi" },
    body: {
      en: "We say what a choice costs in plain language, before we build it, so there are no surprises at delivery.",
      vi: "Mỗi lựa chọn phải đánh đổi điều gì, chúng tôi nói rõ bằng lời lẽ dễ hiểu, trước khi bắt tay xây - để lúc bàn giao không còn bất ngờ nào.",
    },
  },
  {
    title: { en: "Built to last, measured to prove it", vi: "Xây để bền, đo để chứng minh" },
    body: {
      en: "Maintainable code, CI that fails on regressions, and metrics wired in from day one: stability and speed are numbers you can watch.",
      vi: "Mã nguồn dễ bảo trì, CI tự chặn lỗi hồi quy, chỉ số gắn sẵn từ ngày đầu: độ ổn định và tốc độ là những con số bạn tự nhìn thấy được.",
    },
  },
];

// The seven-beat story the scroll experience tells (and the /lite storyboard
// mirrors). Each scene has a DOM-text equivalent so the narrative is readable
// without WebGL.
export type Scene = {
  id: string;
  kicker: LocalizedString;
  heading: LocalizedString;
  body: LocalizedString;
};

export type TeamMember = {
  id: string;
  name: string;
  role: LocalizedString;
  bio: LocalizedString;
  photoUrl?: string; // Optional if withheld
  profileUrl?: string;
  /** Optional employee-voice quote (FR-CMS-006 §1.2) */
  quote?: LocalizedString;
  /**
   * FR-BIZ-006 / FR-CMS-006: must reference teamConsents id.
   * Members without consent must not appear in this array.
   */
  consentId: string;
};

/**
 * Named team members with recorded consent only (FR-BIZ-006 §1.4).
 * Placeholder / role-only entries are forbidden — remove rather than invent.
 * 0 members → honest empty state on /team (FR-WEB-012).
 */
export const team: TeamMember[] = [
  {
    id: "stephen",
    name: "Mr. Stephen",
    role: { en: "Founder & Lead Engineer", vi: "Nhà sáng lập & Kỹ sư trưởng" },
    bio: {
      en: "Oversees architecture and directly leads engineering for all projects.",
      vi: "Chịu trách nhiệm kiến trúc và trực tiếp dẫn dắt kỹ thuật cho mọi dự án.",
    },
    profileUrl: "https://www.linkedin.com/in/stephencheng",
    consentId: "team-stephen-2026",
  },
];

/** FR-CMS-006: company story + culture (not third-party proof). */
export const aboutStory: {
  title: LocalizedString;
  body: LocalizedString;
} = {
  title: {
    en: "A software company in Ho Chi Minh City since 2020",
    vi: "Công ty phần mềm tại TP. Hồ Chí Minh từ năm 2020",
  },
  body: {
    en: "CyberSkill builds web applications, mobile apps, and internal systems for businesses worldwide. We are a registered company in Tan Dinh Ward, Ho Chi Minh City. Our slogan is simple: Turn Your Will Into Real — clear wishes, honest engineering, software that ships and lasts.",
    vi: "CyberSkill xây dựng ứng dụng web, ứng dụng di động và hệ thống nội bộ cho doanh nghiệp toàn cầu. Chúng tôi là công ty đã đăng ký tại phường Tân Định, TP. Hồ Chí Minh. Slogan của chúng tôi đơn giản: Hiện Thực Hoá Ý Chí — điều ước rõ ràng, kỹ thuật trung thực, phần mềm bàn giao đúng hẹn và bền.",
  },
};

export const aboutCulture: {
  title: LocalizedString;
  points: LocalizedString[];
} = {
  title: {
    en: "How we work",
    vi: "Cách chúng tôi làm việc",
  },
  points: [
    {
      en: "Senior engineers own the work end to end — you always know who is building what, and why.",
      vi: "Kỹ sư cấp cao chịu trách nhiệm trọn dự án — bạn luôn biết ai đang xây phần nào, và vì sao.",
    },
    {
      en: "Small, reviewable increments with CI that fails on regressions before they reach users.",
      vi: "Bàn giao theo từng phần nhỏ, có review, với CI chặn hồi quy trước khi tới tay người dùng.",
    },
    {
      en: "We name trade-offs in plain language before they cost you.",
      vi: "Chúng tôi gọi tên mọi đánh đổi bằng lời lẽ dễ hiểu trước khi bạn phải trả giá.",
    },
    {
      en: "English and Vietnamese, reply within one business day.",
      vi: "Làm việc bằng tiếng Anh và tiếng Việt, phản hồi trong một ngày làm việc.",
    },
  ],
};

export const scenes: Scene[] = [
  {
    id: "hero",
    kicker: { en: "Meet Lumi", vi: "Gặp Lumi" },
    heading: { en: "Turn Your Will Into Real", vi: "Hiện Thực Hoá Ý Chí" },
    body: {
      en: "Lumi is the golden genie of CyberSkill. Tell it the thing you wish your software could do, then watch it take shape.",
      vi: "Lumi là vị thần đèn vàng của CyberSkill. Hãy kể điều bạn ước phần mềm của mình làm được, rồi nhìn nó dần thành hình.",
    },
  },
  {
    id: "origin",
    kicker: { en: "The wish", vi: "Điều ước" },
    heading: { en: "It starts with a quiet frustration", vi: "Mọi thứ bắt đầu từ một nỗi khó chịu âm ỉ" },
    body: {
      en: "A report that eats every morning. An app that dies the moment the train goes underground. Every project here begins as a wish for that to stop.",
      vi: "Một bản báo cáo nuốt trọn mỗi buổi sáng. Một ứng dụng tắt ngúm ngay khi tàu chui vào hầm. Mỗi dự án ở đây đều bắt đầu bằng một điều ước: mong những chuyện đó chấm dứt.",
    },
  },
  {
    id: "craft",
    kicker: { en: "The craft", vi: "Tay nghề" },
    heading: { en: "Lumi gets to work", vi: "Lumi bắt tay vào việc" },
    body: {
      en: "We build the software behind the wish the honest way. Small releases, so you adopt it without a risky switch, and trade-offs we name out loud before they cost you.",
      vi: "Chúng tôi xây phần mềm phía sau điều ước một cách tử tế: bàn giao theo từng phần nhỏ để bạn tiếp nhận mà không phải đánh cược vào một cú chuyển đổi lớn, và mọi đánh đổi đều được gọi tên trước khi bạn phải trả giá.",
    },
  },
  {
    id: "proof",
    kicker: { en: "The proof", vi: "Bằng chứng" },
    heading: { en: "The wish, now running in production", vi: "Điều ước, giờ đang chạy thật" },
    body: {
      en: "The morning report becomes one glance at a live screen. The app stays up where the signal does not. We wire the numbers in so you can watch it hold.",
      vi: "Bản báo cáo mỗi sáng gói lại trong một cái liếc màn hình trực tiếp. Ứng dụng vẫn chạy ở nơi sóng không với tới. Chúng tôi gắn sẵn chỉ số để bạn tự thấy nó đứng vững.",
    },
  },
  {
    id: "team",
    kicker: { en: "The company", vi: "Công ty" },
    heading: { en: "A software company in Saigon", vi: "Một công ty phần mềm tại Sài Gòn" },
    body: {
      en: "CyberSkill is a registered software company in Ho Chi Minh City. Senior engineers own the work end to end, so you always know who is building what, and why, and the same people stay with you from the first call to production.",
      vi: "CyberSkill là công ty phần mềm đã đăng ký tại TP. Hồ Chí Minh. Các kỹ sư giàu kinh nghiệm chịu trách nhiệm đến cùng với sản phẩm, nên bạn luôn biết ai đang xây phần nào và vì sao, và vẫn là những con người đó đồng hành từ cuộc gọi đầu tiên đến khi sản phẩm chạy thật.",
    },
  },
  {
    id: "invite",
    kicker: { en: "The invitation", vi: "Lời mời" },
    heading: { en: "Tell Lumi your wish", vi: "Kể cho Lumi điều ước của bạn" },
    body: {
      en: "Say it in a sentence. We reply within one business day, and we tell you honestly whether we are the team to grant it.",
      vi: "Chỉ cần một câu. Chúng tôi phản hồi trong một ngày làm việc, và nói thật với bạn: chúng tôi có phải là đội ngũ phù hợp để thực hiện điều ước đó hay không.",
    },
  },
];

export { serviceDetails } from "./services";

