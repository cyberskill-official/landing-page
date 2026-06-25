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
    en: "Turn Your Will Into Real",
    vi: "Hiện thực hoá ý chí",
  } satisfies LocalizedString,
};

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
      vi: "Ứng dụng iOS và Android dùng chung mã nguồn khi phù hợp, gốc nền tảng khi cần, gắn phân tích dữ liệu ngay từ đầu.",
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
      vi: "Những hệ thống vận hành doanh nghiệp: công cụ nghiệp vụ, tự động hoá, tích hợp và lớp dữ liệu bên dưới.",
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
    stat: { en: "Web, mobile, internal", vi: "Web, di động, nội bộ" },
    label: { en: "Three focused practices, one accountable team", vi: "Ba mảng chuyên sâu, một đội ngũ chịu trách nhiệm" },
  },
  {
    stat: { en: "Outcome-first", vi: "Ưu tiên kết quả" },
    label: { en: "We measure success in your results, not our hours", vi: "Đo thành công bằng kết quả của bạn, không phải giờ công của chúng tôi" },
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
    title: { en: "An operations platform that retires the spreadsheets", vi: "Nền tảng vận hành thay cho bảng tính" },
    result: { en: "One shared operations view the whole team works from, instead of reconciling files by hand.", vi: "Một màn hình vận hành dùng chung cho cả đội, thay vì đối chiếu tệp bằng tay." },
    tags: ["internal-systems", "web-apps"],
  },
  {
    slug: "member-mobile-app",
    client: "Education",
    title: { en: "A member mobile app with offline-first lessons", vi: "Ứng dụng di động cho học viên, ưu tiên ngoại tuyến" },
    result: { en: "Lessons that work on the move, on the App Store and Google Play, with crash-free sessions tracked from launch.", vi: "Bài học dùng được khi di chuyển, trên App Store và Google Play, theo dõi phiên không lỗi ngay từ ngày ra mắt." },
    tags: ["mobile-apps"],
  },
  {
    slug: "commerce-portal",
    client: "Retail",
    title: { en: "A commerce portal rebuilt for speed", vi: "Cổng thương mại dựng lại để tối ưu tốc độ" },
    result: { en: "A shorter path to checkout, with Core Web Vitals kept as a target measured on every change.", vi: "Luồng thanh toán ngắn hơn, lấy Core Web Vitals làm mục tiêu đo trên mỗi thay đổi." },
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
      en: "A small, senior team owns your project end to end. You always know who is building what, and why.",
      vi: "Một đội ngũ nhỏ, giàu kinh nghiệm chịu trách nhiệm trọn vẹn dự án của bạn. Bạn luôn biết ai đang làm gì và vì sao.",
    },
  },
  {
    title: { en: "Honest about trade-offs", vi: "Minh bạch về đánh đổi" },
    body: {
      en: "We say what a choice costs in plain language, before we build it, so there are no surprises at delivery.",
      vi: "Chúng tôi nói rõ một lựa chọn đánh đổi điều gì bằng ngôn ngữ dễ hiểu, trước khi bắt tay làm, để không có bất ngờ lúc bàn giao.",
    },
  },
  {
    title: { en: "Built to last, measured to prove it", vi: "Xây để bền, đo để chứng minh" },
    body: {
      en: "Maintainable code, CI that fails on regressions, and metrics wired in from day one: stability and speed are numbers you can watch.",
      vi: "Mã nguồn dễ bảo trì, CI tự chặn lỗi hồi quy, và chỉ số gắn vào ngay từ đầu: độ ổn định và tốc độ là những con số bạn quan sát được.",
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

export const scenes: Scene[] = [
  {
    id: "hero",
    kicker: { en: "Meet Lumi", vi: "Gặp Lumi" },
    heading: { en: "Turn your will into real", vi: "Hiện thực hoá ý chí" },
    body: {
      en: "Lumi is the golden genie of CyberSkill. Tell it the thing you wish your software could do, then watch it take shape.",
      vi: "Lumi là vị thần đèn vàng của CyberSkill. Hãy kể điều bạn ước phần mềm của mình làm được, rồi nhìn nó dần thành hình.",
    },
  },
  {
    id: "origin",
    kicker: { en: "The wish", vi: "Điều ước" },
    heading: { en: "It starts with a quiet frustration", vi: "Bắt đầu từ một nỗi bực dọc âm thầm" },
    body: {
      en: "A report that eats every morning. An app that dies the moment the train goes underground. Every project here begins as a wish for that to stop.",
      vi: "Một báo cáo ngốn trọn buổi sáng. Một ứng dụng chết ngay khi tàu chui xuống hầm. Mỗi dự án ở đây bắt đầu như một điều ước cho những điều đó dừng lại.",
    },
  },
  {
    id: "craft",
    kicker: { en: "The craft", vi: "Sự tận tâm" },
    heading: { en: "Lumi gets to work", vi: "Lumi bắt tay vào việc" },
    body: {
      en: "We build the software behind the wish the honest way. Small releases, so you adopt it without a risky switch, and trade-offs we name out loud before they cost you.",
      vi: "Chúng tôi xây phần mềm phía sau điều ước một cách chính trực. Bàn giao theo từng phần nhỏ để bạn tiếp nhận mà không phải chuyển đổi rủi ro, và những đánh đổi được nói rõ trước khi chúng khiến bạn trả giá.",
    },
  },
  {
    id: "proof",
    kicker: { en: "The proof", vi: "Bằng chứng" },
    heading: { en: "The wish, now running in production", vi: "Điều ước, giờ đang chạy thật" },
    body: {
      en: "The morning report becomes one glance at a live screen. The app stays up where the signal does not. We wire the numbers in so you can watch it hold.",
      vi: "Báo cáo buổi sáng trở thành một cái liếc nhìn màn hình theo thời gian thực. Ứng dụng vẫn chạy ở nơi sóng thì không. Chúng tôi gắn các chỉ số vào để bạn theo dõi nó trụ vững.",
    },
  },
  {
    id: "team",
    kicker: { en: "The team", vi: "Đội ngũ" },
    heading: { en: "The genie is really a small team", vi: "Thần đèn thật ra là một đội ngũ nhỏ" },
    body: {
      en: "Behind Lumi is a senior team in Ho Chi Minh City that answers for the work. You always know who is building what, and why.",
      vi: "Phía sau Lumi là một đội ngũ giàu kinh nghiệm tại Thành phố Hồ Chí Minh, chịu trách nhiệm với công việc. Bạn luôn biết ai đang làm gì và vì sao.",
    },
  },
  {
    id: "invite",
    kicker: { en: "The invitation", vi: "Lời mời" },
    heading: { en: "Tell Lumi your wish", vi: "Kể cho Lumi điều ước của bạn" },
    body: {
      en: "Say it in a sentence. We reply within one business day, and we tell you honestly whether we are the team to grant it.",
      vi: "Chỉ cần một câu. Chúng tôi phản hồi trong vòng một ngày làm việc, và nói thật liệu chúng tôi có phải đội ngũ phù hợp để thực hiện điều đó.",
    },
  },
];
