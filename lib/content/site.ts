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

  // TASK-SEO-018 §1.1: One canonical entity sentence per locale.
  // This is the SINGLE SOURCE for Organization JSON-LD description, footer
  // tagline, llms files, OG/meta descriptions, and external-profile boilerplate.
  // Edit here → every surface updates automatically.
  entity: {
    en: "CyberSkill is a software company in Ho Chi Minh City, Vietnam, founded in 2020, building web applications, mobile apps, and internal systems for businesses worldwide.",
    vi: "CyberSkill là công ty phần mềm tại TP. Hồ Chí Minh, Việt Nam, thành lập năm 2020. Chúng tôi xây ứng dụng web, ứng dụng di động và hệ thống nội bộ cho doanh nghiệp trong và ngoài nước.",
  } satisfies LocalizedString,

  // TASK-SEO-019: External profile URLs for sameAs and footer social row.
  // Only populated URLs are emitted, never placeholder or aspirational links.
  // Add a URL here when the profile is live; remove to hide it everywhere.
  profiles: {
    linkedin: "https://www.linkedin.com/company/cyberskill-world",
    github: "https://github.com/cyberskill-world",
    // TASK-BIZ-007: operator-confirmed live profiles (2026-07-15)
    facebook: "https://www.facebook.com/cyberskill.world",
    x: "https://x.com/cyberskillworld",
    // zalo: "",   // Add Zalo OA URL when created
    // clutch: "",  // Add Clutch profile URL when claimed (TASK-BIZ-005)
  } as Record<string, string>,

  // TASK-SEO-019: Founder record for Person JSON-LD node.
  founder: {
    name: "Stephen (Mr. Stephen)",
    url: "https://www.linkedin.com/in/stephencheng",
  },

  // TASK-SEO-019: Geo coordinates for the Tan Dinh Ward office address.
  // Verified against: 207A Nguyen Van Thu St, Tan Dinh Ward, District 1, HCMC.
  geo: {
    lat: 10.7909,
    lng: 106.6929,
  },

  // TASK-SEO-019: Opening hours for LocalBusiness JSON-LD.
  openingHours: ["Mo-Fr 09:00-18:00"],

  // TASK-CTA-012: Messaging app contact channels. Config-driven, only set
  // channels are rendered (contact section + footer chip row).
  contacts: {
    // whatsapp: "84906878091", // E.164 without '+', set when OA is live
    // zalo: "https://zalo.me/...", // Set when Zalo OA link is live (TASK-BIZ-007)
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
      vi: "Ứng dụng web sẵn sàng chạy thật, dễ mở rộng và bảo trì: bảng điều khiển, cổng thông tin, thương mại điện tử, nền tảng nội bộ.",
    },
    outcomes: [
      { en: "Faster releases with CI that fails on regressions", vi: "Phát hành nhanh hơn nhờ kiểm thử tự động chặn lỗi cũ quay lại" },
      { en: "Accessible, fast interfaces (Core Web Vitals in the green)", vi: "Giao diện nhanh, dễ dùng cho nhiều người, đạt ngưỡng Core Web Vitals" },
    ],
  },
  {
    id: "mobile-apps",
    title: { en: "Mobile applications", vi: "Ứng dụng di động" },
    summary: {
      en: "iOS and Android apps from one codebase where it fits, native where it counts, with analytics wired in from day one.",
      vi: "Ứng dụng iOS và Android dùng chung mã nguồn khi hợp lý, làm native khi thật sự cần, và gắn đo lường ngay từ ngày đầu.",
    },
    outcomes: [
      { en: "Store-ready builds and release pipelines", vi: "Bản dựng sẵn sàng lên store kèm quy trình phát hành" },
      { en: "Crash-free sessions you can measure", vi: "Tỷ lệ phiên ổn định đo được bằng số" },
    ],
  },
  {
    id: "internal-systems",
    title: { en: "Internal software systems", vi: "Hệ thống phần mềm nội bộ" },
    summary: {
      en: "The systems that run a company: operations tooling, automation, integrations, and the data layer underneath them.",
      vi: "Hệ thống giúp doanh nghiệp chạy hằng ngày: công cụ nghiệp vụ, tự động hóa, tích hợp, và lớp dữ liệu phía dưới.",
    },
    outcomes: [
      { en: "Manual work removed, hours given back to the team", vi: "Bớt việc tay, trả lại giờ cho đội ngũ" },
      { en: "One source of truth instead of scattered spreadsheets", vi: "Một nguồn sự thật thay cho bảng tính rải rác" },
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
    label: { en: "Building software for clients across Vietnam and beyond", vi: "Xây phần mềm cho khách tại Việt Nam và quốc tế" },
  },
  {
    stat: { en: "One senior team", vi: "Một đội ngũ dày dạn" },
    label: {
      en: "Web, mobile, and internal systems, owned end to end by the people who build them",
      vi: "Web, di động và hệ thống nội bộ do chính người xây chịu trách nhiệm đến cùng",
    },
  },
  {
    stat: { en: "Outcome-first", vi: "Ưu tiên kết quả" },
    label: { en: "We win when your numbers move, not when the clock runs.", vi: "Chúng tôi thắng khi chỉ số của bạn tốt lên, không phải khi đồng hồ hết giờ." },
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
      vi: "Trước hết chúng tôi lắng nghe mục tiêu và giới hạn thực tế. Thành công trông ra sao, điều gì không được đụng tới? Làm vậy để công việc nhắm đúng kết quả của bạn, không phải giả định của chúng tôi.",
    },
  },
  {
    n: "02",
    title: { en: "Shape", vi: "Định hình" },
    body: {
      en: "We scope the work, plan the path, and design the parts that carry the most risk first. You see the trade-offs in plain language before any code is written.",
      vi: "Chúng tôi chốt phạm vi, vạch lộ trình, và ưu tiên thiết kế những phần rủi ro cao nhất. Mọi đánh đổi được nói bằng lời dễ hiểu, trước khi viết dòng code đầu tiên.",
    },
  },
  {
    n: "03",
    title: { en: "Build", vi: "Xây dựng" },
    body: {
      en: "We ship in reviewable increments with CI that fails on regressions. Every change is small enough to read, and you can watch the product take shape week by week.",
      vi: "Chúng tôi bàn giao theo từng phần nhỏ đủ để rà soát. Hệ thống kiểm thử tự chặn lỗi cũ quay lại. Bạn thấy sản phẩm lớn dần theo từng tuần, không phải chờ một cú nổ cuối cùng.",
    },
  },
  {
    n: "04",
    title: { en: "Support", vi: "Đồng hành" },
    body: {
      en: "After launch we measure, maintain, and improve. We track what matters, fix what breaks, and keep the software healthy so it keeps earning its place.",
      vi: "Sau khi ra mắt, chúng tôi đo, bảo trì và cải tiến. Theo dõi những chỉ số quan trọng, sửa ngay khi hỏng, giữ phần mềm khỏe để nó tiếp tục xứng đáng với chỗ đứng của mình.",
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
    q: { en: "What does CyberSkill build?", vi: "CyberSkill làm những gì?" },
    a: {
      en: "CyberSkill builds web applications, mobile applications, and internal software systems for businesses. We are a software consultancy based in Ho Chi Minh City, founded in 2020, and we work with clients across Vietnam and internationally.",
      vi: "CyberSkill xây ứng dụng web, ứng dụng di động và hệ thống nội bộ cho doanh nghiệp. Chúng tôi là công ty phần mềm tại TP. Hồ Chí Minh, thành lập năm 2020, làm việc với khách trong nước và quốc tế.",
    },
  },
  {
    q: { en: `Where is CyberSkill based?`, vi: `CyberSkill đặt trụ sở ở đâu?` },
    a: {
      en: `We are based at ${company.address}. Our team works from Ho Chi Minh City and collaborates with clients in Vietnam, Southeast Asia, Europe, and North America.`,
      vi: `Văn phòng tại ${company.address}. Đội ngũ làm việc tại TP. Hồ Chí Minh và hợp tác với khách hàng ở Việt Nam, Đông Nam Á, châu Âu và Bắc Mỹ.`,
    },
  },
  // --- How to start ---
  {
    q: { en: "How do I start a project?", vi: "Bắt đầu dự án như thế nào?" },
    a: {
      en: `Send a short note through the contact form or chat with Lumi, describe the problem you want to solve. We reply within one business day. You can also email ${company.email} directly.`,
      vi: `Gửi lời nhắn qua form liên hệ, hoặc chat với Lumi: nói rõ vấn đề bạn muốn giải. Chúng tôi phản hồi trong một ngày làm việc. Bạn cũng có thể gửi email thẳng tới ${company.email}.`,
    },
  },
  {
    q: { en: "What happens in the first two weeks?", vi: "Hai tuần đầu tiên diễn ra như thế nào?" },
    a: {
      en: "In the first two weeks we run a scoping session to understand your goals and constraints, agree on a backlog of the first increment, confirm the tech stack, and share a written summary of what we will build, what we will not, and why. No code is written until we both agree on the scope.",
      vi: "Hai tuần đầu, chúng tôi ngồi lại để hiểu mục tiêu và giới hạn của bạn, chốt danh mục việc cho phần đầu, thống nhất công nghệ, và gửi bản tóm tắt bằng văn bản: sẽ làm gì, không làm gì, vì sao. Chưa viết code cho đến khi hai bên đồng ý phạm vi.",
    },
  },
  // --- Reply speed & communication ---
  {
    q: { en: "How fast do you reply?", vi: "Bao lâu thì có phản hồi?" },
    a: {
      en: "Within one business day. If the request is clear, you will usually hear back from a person, not an autoresponder. For urgent production issues we aim for same-day acknowledgement.",
      vi: "Trong một ngày làm việc. Khi yêu cầu đã rõ, người trả lời thường là người thật, không phải thư tự động. Sự cố đang chạy production gấp thì chúng tôi cố gắng phản hồi trong ngày.",
    },
  },
  // --- International clients & time zones ---
  {
    q: { en: "Do you work with international clients?", vi: "Có làm việc với khách quốc tế không?" },
    a: {
      en: "We work with international clients across various regions, communicating in English and Vietnamese, and our team is accustomed to asynchronous communication across time zones, EU, APAC, and North America. Key reviews and demos are scheduled to fit your working hours.",
      vi: "Chúng tôi làm việc với khách quốc tế bằng tiếng Anh và tiếng Việt. Đội quen giao tiếp qua nhiều múi giờ (châu Âu, châu Á–Thái Bình Dương, Bắc Mỹ). Buổi review và demo quan trọng được xếp theo giờ làm việc của bạn.",
    },
  },
  {
    q: { en: "What is your time-zone overlap with clients in Europe or North America?", vi: "Múi giờ làm việc của bạn có khớp với khách hàng ở châu Âu hay Bắc Mỹ không?" },
    a: {
      en: "We are UTC+7 (Indochina Time). With Europe (CET/CEST) we share a 2–4 hour morning overlap. With North America we work asynchronously, with a shared window available in the early HCMC morning. We have delivered projects for clients on all continents using this model.",
      vi: "Chúng tôi ở múi giờ UTC+7. Với châu Âu thường có khoảng 2–4 tiếng giao buổi sáng. Với Bắc Mỹ, chủ yếu làm việc không đồng bộ, có khung giờ chung vào sáng sớm tại TP.HCM. Mô hình này đã dùng cho khách hàng trên nhiều châu lục.",
    },
  },
  // --- Team & seniority ---
  {
    q: { en: "Who will be working on my project?", vi: "Ai sẽ làm dự án của tôi?" },
    a: {
      en: "Senior engineers own the work from the first call to production. We do not staff junior-heavy teams and bill at senior rates. You will know exactly who is building what and why, the same people stay with the project, not a revolving team.",
      vi: "Kỹ sư giàu kinh nghiệm nhận việc từ cuộc gọi đầu đến khi sản phẩm chạy thật. Chúng tôi không dựng đội junior đông để tính giá senior. Bạn biết rõ ai làm phần nào, vì sao, và cùng những người đó suốt dự án, không xoay vòng.",
    },
  },
  {
    q: { en: "What is the English level of your team?", vi: "Trình độ tiếng Anh của đội ngũ ra sao?" },
    a: {
      en: "Our team communicates comfortably in English, meetings, code reviews, documentation, and written handoffs are all in English with international clients. We also work fully in Vietnamese for local clients.",
      vi: "Đội giao tiếp tiếng Anh thoải mái: họp, rà code, tài liệu và bàn giao bằng văn bản với khách quốc tế. Với khách trong nước, chúng tôi làm việc hoàn toàn bằng tiếng Việt.",
    },
  },
  // --- Preferred stacks ---
  {
    q: { en: "What tech stacks do you work with?", vi: "Các bạn dùng công nghệ gì?" },
    a: {
      en: "Our preferred stack is TypeScript/Node.js for the backend, React and Next.js for web frontends, Flutter for mobile, and PostgreSQL or a document store for data. We favour proven, maintainable tools over novelty. For internal systems we also work with Python and Go when they fit the problem better.",
      vi: "Chúng tôi thường dùng TypeScript/Node.js cho backend, React và Next.js cho web, Flutter cho di động, PostgreSQL hoặc kho tài liệu cho dữ liệu. Ưu tiên công cụ đã kiểm chứng, dễ bảo trì hơn mốt ngắn hạn. Hệ thống nội bộ có thể dùng Python hoặc Go nếu hợp bài toán hơn.",
    },
  },
  // --- Maintenance & handover ---
  {
    q: { en: "Do you offer maintenance and support after launch?", vi: "Sau khi ra mắt có hỗ trợ không?" },
    a: {
      en: "We offer ongoing maintenance and support engagements after launch, fixing bugs, keeping dependencies current, and adding features as the product evolves. We can also hand the system over cleanly to your in-house team with full documentation and an onboarding session.",
      vi: "Sau bàn giao, chúng tôi có gói bảo trì và hỗ trợ liên tục: sửa lỗi, cập nhật thư viện, bổ sung tính năng khi sản phẩm lớn thêm. Cũng có thể bàn giao gọn cho đội nội bộ của bạn kèm tài liệu đầy đủ và buổi hướng dẫn.",
    },
  },
  {
    q: { en: "Can you take over an existing codebase?", vi: "Có nhận dự án đã có code sẵn không?" },
    a: {
      en: "We routinely take over and remediate existing code bases, we start with a structured technical assessment (what works, what is fragile, what is missing), agree on a remediation and feature roadmap, then work alongside or replace the previous arrangement. We have a standard intake process for this.",
      vi: "Chúng tôi thường xuyên nhận codebase đang chạy. Bước đầu là đánh giá kỹ thuật có cấu trúc: cái gì ổn, cái gì mong manh, cái gì còn thiếu. Sau đó thống nhất lộ trình sửa và phát triển, rồi làm song song hoặc thay thế cách làm cũ. Có quy trình tiếp nhận chuẩn cho việc này.",
    },
  },
  // --- IP, NDAs & contracts ---
  {
    q: { en: "Who owns the intellectual property at the end of a project?", vi: "Ai sở hữu sản phẩm trí tuệ sau khi dự án kết thúc?" },
    a: {
      en: "You own all intellectual property at the end of the project. On final payment, all code, design assets, and documentation we create for your project transfer to you with no restrictions. We retain no licence to use your proprietary work.",
      vi: "Bạn sở hữu toàn bộ tài sản trí tuệ khi dự án kết thúc. Sau thanh toán cuối, toàn bộ code, thiết kế và tài liệu tạo cho dự án của bạn chuyển về bạn, không ràng buộc. Chúng tôi không giữ quyền dùng lại phần việc độc quyền của bạn.",
    },
  },
  {
    q: { en: "Can you sign an NDA?", vi: "Có ký NDA không?" },
    a: {
      en: "We sign mutual NDAs as standard before any detailed technical discussion. Our template is available on request; we are equally comfortable signing yours.",
      vi: "Chúng tôi ký NDA hai chiều như việc làm chuẩn trước khi bàn sâu kỹ thuật. Có mẫu sẵn nếu bạn cần; cũng sẵn sàng ký mẫu của bạn.",
    },
  },
  // --- Timelines ---
  {
    q: { en: "What is a typical project timeline?", vi: "Một dự án thường mất bao lâu?" },
    a: {
      en: "A focused MVP or first increment typically takes 6–12 weeks from scoping to a production-ready release, depending on scope and complexity. We work in short iterations so you see progress every 1–2 weeks, not just at the end.",
      vi: "Một MVP gọn hoặc phần đầu thường mất khoảng 6 đến 12 tuần, từ chốt phạm vi đến bản sẵn sàng vận hành, tùy quy mô. Chúng tôi làm theo chu kỳ ngắn để bạn thấy tiến độ mỗi 1–2 tuần, không phải chỉ thấy ở cuối.",
    },
  },
  // --- Engagement models (TASK-CTA-017) ---
  {
    q: {
      en: "What engagement models and starting ranges do you offer?",
      vi: "Có những mô hình hợp tác và mức bắt đầu nào?",
    },
    a: {
      en: "We publish the models we actually offer, Dedicated Senior Team and Fixed-Scope Delivery, with owner-approved starting ranges and timelines on the homepage engagement section (/#engagement). Ranges are commercial commitments reviewed quarterly.",
      vi: "Chúng tôi công bố đúng những mô hình đang cung cấp: Đội kỹ sư giàu kinh nghiệm chuyên biệt, và Bàn giao theo phạm vi cố định, kèm khoảng giá và thời gian đã được duyệt trên trang chủ (/#engagement). Các mức này là cam kết thương mại, rà soát theo quý.",
    },
  },
  // --- Privacy & data ---
  {
    q: { en: "How does your AI chat (Lumi) handle my data?", vi: "Lumi xử lý dữ liệu chat thế nào?" },
    a: {
      en: "Messages you send to Lumi are forwarded to Anthropic's API to generate a reply. This is a cross-border transfer (Vietnam → US) disclosed before your first message. We do not use your chat messages for training data, we do not sell them, and they are retained only as long as needed to support the conversation and follow-up. Please do not share confidential credentials or sensitive personal data in the chat.",
      vi: "Tin nhắn gửi cho Lumi được chuyển qua API của Anthropic để tạo phản hồi. Đây là chuyển dữ liệu qua biên giới (Việt Nam → Mỹ), được nêu rõ trước tin nhắn đầu. Chúng tôi không dùng chat của bạn để huấn luyện mô hình, không bán dữ liệu, và chỉ giữ trong thời gian cần để hỗ trợ trao đổi và theo dõi. Xin đừng gửi mật khẩu hay dữ liệu cá nhân nhạy cảm trong chat.",
    },
  },
  {
    q: { en: "Does your site use cookies or tracking?", vi: "Site có dùng cookie hay theo dõi không?" },
    a: {
      en: "No third-party cookies and no cross-site tracking. We collect anonymous, first-party usage events (page views and button clicks) to understand how the site is used. Your theme and language preferences are stored locally in your browser only, never on our servers.",
      vi: "Không cookie bên thứ ba, không theo dõi chéo site. Chúng tôi thu sự kiện ẩn danh nội bộ (xem trang, bấm nút) để hiểu cách site được dùng. Giao diện và ngôn ngữ chỉ lưu trong trình duyệt của bạn, không lên máy chủ chúng tôi.",
    },
  },
];


export type WorkItem = {
  slug: string;
  client: LocalizedString;
  title: LocalizedString;
  result: LocalizedString;
  tags: string[];
  /** TASK-BIZ-006: permission ledger id in lib/content/permissions.ts */
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
    title: { en: "An operations platform that retires the spreadsheets", vi: "Nền tảng vận hành thay cho bảng tính" },
    result: { en: "One shared operations view the whole team works from, instead of reconciling files by hand.", vi: "Cả đội làm việc trên một màn hình chung, thay vì ngồi đối chiếu file bằng tay." },
    tags: ["internal-systems", "web-apps"],
    permissionId: "client-logistics-ops-2026",
  },
  {
    slug: "member-mobile-app",
    client: { en: "EduSpark Vietnam", vi: "EduSpark Việt Nam" },
    title: { en: "A member mobile app with offline-first lessons", vi: "Ứng dụng học viên dùng được cả khi mất mạng" },
    result: { en: "Lessons that work on the move, on the App Store and Google Play, with crash-free sessions tracked from launch.", vi: "Bài học chạy được khi di chuyển, có trên App Store và Google Play, tỷ lệ phiên ổn định được theo dõi từ ngày ra mắt." },
    tags: ["mobile-apps"],
    permissionId: "client-eduspark-2026",
  },
  {
    slug: "commerce-portal",
    client: { en: "Linn Decor", vi: "Linn Decor (bán lẻ)" },
    title: { en: "A commerce portal rebuilt for speed", vi: "Cổng bán hàng dựng lại để nhanh hơn" },
    result: { en: "A shorter path to checkout, with Core Web Vitals kept as a target measured on every change.", vi: "Đường tới thanh toán ngắn hơn; Core Web Vitals là mục tiêu và được đo trên mỗi thay đổi." },
    tags: ["web-apps"],
    permissionId: "client-linn-decor-2026",
  },
  {
    slug: "legacy-migration",
    client: { en: "Healthcare", vi: "Y tế" },
    title: { en: "A legacy system migration to the cloud", vi: "Chuyển hệ thống cũ lên đám mây" },
    result: { en: "Transitioned to modern cloud architecture without operational downtime.", vi: "Chuyển sang kiến trúc đám mây hiện đại mà không dừng vận hành." },
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
  /** TASK-BIZ-006: permission ledger id */
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
      vi: "Học viên cần học khi di chuyển, cả nơi sóng chập chờn. Chỉ trang web thì khó ổn định và khó dùng khi mất mạng.",
    },
    approach: {
      en: "We built a member app for both stores with offline-first lessons, and wired analytics in from day one so the product team could see how the app behaved in the wild.",
      vi: "Chúng tôi xây app học viên trên cả hai store, bài học ưu tiên ngoại tuyến, gắn đo lường từ đầu để đội sản phẩm thấy app chạy ngoài đời ra sao.",
    },
    outcome: {
      en: "The app shipped to both stores on schedule, with crash-free sessions tracked from launch so stability was a number the team could watch, not a guess.",
      vi: "App lên cả hai store đúng hẹn. Phiên ổn định được theo dõi từ ngày ra mắt, nên độ ổn định là số đo được, không phải đoán.",
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
      vi: "Cửa hàng online cũ tải chậm, thanh toán rối, âm thầm làm mất khách và đơn. Ưu tiên: nhanh hơn và đường mua gọn hơn.",
    },
    approach: {
      en: "We rebuilt the portal for speed, trimmed the checkout to the steps that matter, and kept performance honest with Core Web Vitals as a target we measured on every change.",
      vi: "Dựng lại cổng bán hàng để nhanh hơn, rút thanh toán còn bước cần thiết, lấy Core Web Vitals làm mục tiêu đo trên mỗi thay đổi.",
    },
    outcome: {
      en: "Core Web Vitals came into the green and the checkout path got noticeably simpler, giving shoppers a faster, calmer route from product to purchase.",
      vi: "Core Web Vitals đạt ngưỡng, thanh toán gọn hơn. Người mua đi từ sản phẩm đến thanh toán nhanh và nhẹ hơn.",
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
      vi: "Khách chạy dịch vụ y tế quan trọng trên hệ thống cũ: bảo trì đắt, bảo mật yếu, khó mở rộng khi người dùng tăng.",
    },
    approach: {
      en: "We re-architected the monolithic applications into containerized microservices and automated infrastructure provisioning using Terraform. Zero downtime was maintained by phasing migration.",
      vi: "Tách ứng dụng nguyên khối thành microservices đóng container, tự động hóa hạ tầng bằng Terraform. Di chuyển chia pha để không dừng vận hành.",
    },
    outcome: {
      en: "The applications transitioned successfully to modern cloud architecture. Operation teams gained a secure, scalable system that requires minimal manual intervention.",
      vi: "Ứng dụng chuyển sang đám mây hiện đại thành công. Đội vận hành có hệ thống an toàn hơn, dễ mở, bớt can thiệp tay.",
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
  rating?: number; // TASK-SEO-015: Optional star rating (e.g., 5)
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
  vi: "Đội ngũ logistics, giáo dục và bán lẻ đang chạy trên phần mềm chúng tôi xây.",
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
      vi: "Kỹ sư giàu kinh nghiệm nhận trọn dự án từ đầu đến cuối. Bạn luôn biết ai làm phần nào, và vì sao.",
    },
  },
  {
    title: { en: "Honest about trade-offs", vi: "Thẳng thắn về đánh đổi" },
    body: {
      en: "We say what a choice costs in plain language, before we build it, so there are no surprises at delivery.",
      vi: "Mỗi lựa chọn đánh đổi điều gì, chúng tôi nói rõ bằng lời dễ hiểu trước khi xây, để lúc bàn giao không còn bất ngờ.",
    },
  },
  {
    title: { en: "Built to last, measured to prove it", vi: "Xây để bền, đo để chứng minh" },
    body: {
      en: "Maintainable code, CI that fails on regressions, and metrics wired in from day one: stability and speed are numbers you can watch.",
      vi: "Mã dễ bảo trì, kiểm thử tự động chặn lỗi cũ quay lại, chỉ số gắn từ ngày đầu: độ ổn định và tốc độ là số bạn tự theo dõi được.",
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
  /** Optional employee-voice quote (TASK-CMS-006 §1.2) */
  quote?: LocalizedString;
  /**
   * TASK-BIZ-006 / TASK-CMS-006: must reference teamConsents id.
   * Members without consent must not appear in this array.
   */
  consentId: string;
};

/**
 * Named team members with recorded consent only (TASK-BIZ-006 §1.4).
 * Placeholder / role-only entries are forbidden, remove rather than invent.
 * 0 members → honest empty state on /team (TASK-WEB-012).
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

/** TASK-CMS-006: company story + culture (not third-party proof). */
export const aboutStory: {
  title: LocalizedString;
  body: LocalizedString;
} = {
  title: {
    en: "A software company in Ho Chi Minh City since 2020",
    vi: "Công ty phần mềm tại TP. Hồ Chí Minh từ năm 2020",
  },
  body: {
    en: "CyberSkill builds web applications, mobile apps, and internal systems for businesses worldwide. We are a registered company in Tan Dinh Ward, Ho Chi Minh City. Our slogan is simple: Turn Your Will Into Real, clear wishes, honest engineering, software that ships and lasts.",
    vi: "CyberSkill xây ứng dụng web, ứng dụng di động và hệ thống nội bộ cho doanh nghiệp. Công ty đã đăng ký tại phường Tân Định, TP. Hồ Chí Minh. Slogan gọn: Hiện Thực Hoá Ý Chí. Điều ước rõ, kỹ thuật trung thực, phần mềm bàn giao đúng hẹn và dùng lâu được.",
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
      en: "Senior engineers own the work end to end, you always know who is building what, and why.",
      vi: "Kỹ sư giàu kinh nghiệm chịu trách nhiệm trọn dự án. Bạn luôn biết ai làm phần nào, và vì sao.",
    },
    {
      en: "Small, reviewable increments with CI that fails on regressions before they reach users.",
      vi: "Bàn giao từng phần nhỏ, có rà soát, kiểm thử tự động chặn lỗi cũ trước khi tới người dùng.",
    },
    {
      en: "We name trade-offs in plain language before they cost you.",
      vi: "Mọi đánh đổi được nói bằng lời dễ hiểu trước khi bạn phải trả giá.",
    },
    {
      en: "English and Vietnamese, reply within one business day.",
      vi: "Làm việc bằng tiếng Anh và tiếng Việt. Phản hồi trong một ngày làm việc.",
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
      vi: "Lumi là thần đèn vàng của CyberSkill. Kể điều bạn muốn phần mềm làm được, rồi nhìn nó dần thành hình.",
    },
  },
  {
    id: "origin",
    kicker: { en: "The wish", vi: "Điều ước" },
    heading: { en: "It starts with a quiet frustration", vi: "Mọi thứ bắt đầu từ một nỗi khó chịu âm ỉ" },
    body: {
      en: "A report that eats every morning. An app that dies the moment the train goes underground. Every project here begins as a wish for that to stop.",
      vi: "Bản báo cáo nuốt trọn buổi sáng. Ứng dụng tắt ngúm khi tàu vào hầm. Mỗi dự án ở đây bắt đầu bằng một điều ước: mong những chuyện đó chấm dứt.",
    },
  },
  {
    id: "craft",
    kicker: { en: "The craft", vi: "Tay nghề" },
    heading: { en: "Lumi gets to work", vi: "Lumi bắt tay vào việc" },
    body: {
      en: "We build the software behind the wish the honest way. Small releases, so you adopt it without a risky switch, and trade-offs we name out loud before they cost you.",
      vi: "Chúng tôi xây phần mềm phía sau điều ước một cách tử tế. Bàn giao từng phần nhỏ để bạn tiếp nhận dần, không phải đánh cược một cú chuyển đổi lớn. Mọi đánh đổi được nói trước khi bạn phải trả giá.",
    },
  },
  {
    id: "proof",
    kicker: { en: "The proof", vi: "Bằng chứng" },
    heading: { en: "The wish, now running in production", vi: "Điều ước, giờ đang chạy thật" },
    body: {
      en: "The morning report becomes one glance at a live screen. The app stays up where the signal does not. We wire the numbers in so you can watch it hold.",
      vi: "Báo cáo mỗi sáng gói trong một cái liếc màn hình. Ứng dụng vẫn chạy nơi sóng yếu. Chúng tôi gắn chỉ số để bạn tự thấy hệ thống đứng vững.",
    },
  },
  {
    id: "team",
    kicker: { en: "The company", vi: "Công ty" },
    heading: { en: "A software company in Saigon", vi: "Một công ty phần mềm tại Sài Gòn" },
    body: {
      en: "CyberSkill is a registered software company in Ho Chi Minh City. Senior engineers own the work end to end, so you always know who is building what, and why, and the same people stay with you from the first call to production.",
      vi: "CyberSkill là công ty phần mềm đã đăng ký tại TP. Hồ Chí Minh. Kỹ sư giàu kinh nghiệm chịu trách nhiệm đến cùng, nên bạn biết ai làm phần nào và vì sao. Cùng những người đó từ cuộc gọi đầu đến khi sản phẩm chạy thật.",
    },
  },
  {
    id: "invite",
    kicker: { en: "The invitation", vi: "Lời mời" },
    heading: { en: "Tell Lumi your wish", vi: "Kể cho Lumi điều ước của bạn" },
    body: {
      en: "Say it in a sentence. We reply within one business day, and we tell you honestly whether we are the team to grant it.",
      vi: "Chỉ cần một câu. Chúng tôi phản hồi trong một ngày làm việc, và nói thẳng: có phải đội phù hợp để thực hiện điều ước đó hay không.",
    },
  },
];

export { serviceDetails } from "./services";

