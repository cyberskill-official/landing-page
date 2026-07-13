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
  {
    q: { en: "What does CyberSkill do?", vi: "CyberSkill làm gì?" },
    a: { en: "We are a software solutions consultancy. We build web applications, mobile applications, and internal software systems.", vi: "Chúng tôi là công ty tư vấn giải pháp phần mềm. Chúng tôi xây dựng ứng dụng web, ứng dụng di động và hệ thống phần mềm nội bộ." },
  },
  {
    q: { en: `Where is CyberSkill based?`, vi: `CyberSkill đặt trụ sở ở đâu?` },
    a: { en: `We are based in ${company.city}, ${company.country}, and work with clients in Vietnam and internationally.`, vi: `Trụ sở của chúng tôi ở ${company.city}, ${company.country}; chúng tôi làm việc với khách hàng trong nước lẫn quốc tế.` },
  },
  {
    q: { en: "How do I start a project?", vi: "Làm sao để bắt đầu một dự án?" },
    a: { en: `Send a short note through the contact form or chat with Lumi. We reply within one business day. You can also email ${company.email}.`, vi: `Gửi một lời nhắn ngắn qua biểu mẫu liên hệ, hoặc trò chuyện với Lumi. Chúng tôi phản hồi trong một ngày làm việc. Bạn cũng có thể email tới ${company.email}.` },
  },
  {
    q: { en: "How fast do you reply?", vi: "Bạn phản hồi nhanh thế nào?" },
    a: { en: "Within one business day. If the request is clear, you will usually hear back from a person, not an autoresponder.", vi: "Trong một ngày làm việc. Nếu yêu cầu đã rõ ràng, người trả lời bạn thường là một người thật, không phải thư tự động." },
  },
  {
    q: { en: "Do you work with international clients?", vi: "Bạn có làm việc với khách hàng quốc tế không?" },
    a: { en: "Yes. We work in English and Vietnamese, and we are used to working across time zones.", vi: "Có. Chúng tôi làm việc bằng cả tiếng Anh và tiếng Việt, và đã quen phối hợp qua nhiều múi giờ." },
  },
];

export type WorkItem = {
  slug: string;
  client: string;
  title: LocalizedString;
  result: LocalizedString;
  tags: string[];
};

// Representative engagement types, written without invented client names,
// logos, or specific metrics. Replace with real, cleared case studies (named
// client + a measured result they have approved) - see
// docs/content/case-study-testimonial-intake.md.
export const work: WorkItem[] = [
  {
    slug: "operations-platform",
    client: "Logistics operations",
    title: { en: "An operations platform that retires the spreadsheets", vi: "Nền tảng vận hành cho bảng tính nghỉ hưu" },
    result: { en: "One shared operations view the whole team works from, instead of reconciling files by hand.", vi: "Cả đội làm việc trên một màn hình vận hành dùng chung, thay vì ngồi đối chiếu từng file bằng tay." },
    tags: ["internal-systems", "web-apps"],
  },
  {
    slug: "member-mobile-app",
    client: "Education",
    title: { en: "A member mobile app with offline-first lessons", vi: "Ứng dụng học viên, học được cả khi mất mạng" },
    result: { en: "Lessons that work on the move, on the App Store and Google Play, with crash-free sessions tracked from launch.", vi: "Bài học chạy mượt trên đường đi, có mặt trên App Store và Google Play, với tỉ lệ phiên không lỗi được theo dõi từ ngày ra mắt." },
    tags: ["mobile-apps"],
  },
  {
    slug: "commerce-portal",
    client: "Retail",
    title: { en: "A commerce portal rebuilt for speed", vi: "Cổng thương mại được dựng lại vì tốc độ" },
    result: { en: "A shorter path to checkout, with Core Web Vitals kept as a target measured on every change.", vi: "Đường đến bước thanh toán ngắn hơn, với Core Web Vitals được giữ làm mục tiêu và đo trên từng thay đổi." },
    tags: ["web-apps"],
  },
];

export type Testimonial = {
  quote: LocalizedString;
  author: string;
  role: LocalizedString;
};

// Real, named, consented client quotes only. Until those are collected (see
// docs/content/case-study-testimonial-intake.md), this stays empty and the
// proof section renders the first-person commitments below instead of invented
// quotes. Do NOT add placeholder or unattributed quotes here - on a live site
// they read as real endorsements.
export const testimonials: Testimonial[] = [];

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
};

// Real, named team members. 2 to 8 people.
export const team: TeamMember[] = [
  {
    id: "stephen",
    name: "Mr. Stephen",
    role: { en: "Founder & Lead Engineer", vi: "Nhà sáng lập & Kỹ sư trưởng" },
    bio: {
      en: "Oversees architecture and directly leads engineering for all projects.",
      vi: "Chịu trách nhiệm kiến trúc và trực tiếp dẫn dắt kỹ thuật cho mọi dự án."
    },
    profileUrl: "https://linkedin.com/in/stephencheng"
  },
  {
    id: "engineer1",
    name: "Senior Engineer",
    role: { en: "Senior Full-Stack Engineer", vi: "Kỹ sư Full-Stack cấp cao" },
    bio: {
      en: "Specializes in scalable web applications and CI/CD pipelines.",
      vi: "Chuyên gia về ứng dụng web mở rộng và quy trình phát hành tự động."
    }
  }
];

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
