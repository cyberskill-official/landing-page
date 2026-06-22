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

// Representative portfolio entries. Replace with real, cleared case studies.
export const work: WorkItem[] = [
  {
    slug: "operations-platform",
    client: "Logistics operator",
    title: { en: "Operations platform that retired the spreadsheets", vi: "Nền tảng vận hành thay thế hoàn toàn bảng tính" },
    result: { en: "Cut order-processing time by a measured margin and gave the ops team one live view.", vi: "Giảm rõ rệt thời gian xử lý đơn và cho đội vận hành một màn hình theo thời gian thực." },
    tags: ["internal-systems", "web-apps"],
  },
  {
    slug: "member-mobile-app",
    client: "Education provider",
    title: { en: "Member mobile app with offline-first lessons", vi: "Ứng dụng di động cho học viên, hỗ trợ học ngoại tuyến" },
    result: { en: "Shipped to both stores with crash-free sessions tracked from launch.", vi: "Phát hành trên cả hai store, theo dõi phiên không lỗi ngay từ ngày ra mắt." },
    tags: ["mobile-apps"],
  },
  {
    slug: "commerce-portal",
    client: "Retail brand",
    title: { en: "Commerce portal rebuilt for speed", vi: "Cổng thương mại được dựng lại để tối ưu tốc độ" },
    result: { en: "Brought Core Web Vitals into the green and simplified the checkout path.", vi: "Đưa Core Web Vitals về ngưỡng đạt và rút gọn luồng thanh toán." },
    tags: ["web-apps"],
  },
];

export type Testimonial = {
  quote: LocalizedString;
  author: string;
  role: LocalizedString;
};

export const testimonials: Testimonial[] = [
  {
    quote: {
      en: "They treated our deadline as theirs. The build was honest about trade-offs and shipped on time.",
      vi: "Họ coi hạn chót của chúng tôi như của chính mình. Quá trình làm việc minh bạch về đánh đổi và bàn giao đúng hẹn.",
    },
    author: "Client reference",
    role: { en: "Operations lead", vi: "Trưởng bộ phận vận hành" },
  },
  {
    quote: {
      en: "Clear communication, no jargon, and software our team actually uses every day.",
      vi: "Trao đổi rõ ràng, không thuật ngữ rối rắm, và phần mềm mà đội ngũ chúng tôi dùng mỗi ngày.",
    },
    author: "Client reference",
    role: { en: "Founder", vi: "Nhà sáng lập" },
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
      en: "Lumi, the golden genie of CyberSkill, turns a clear intention into working software.",
      vi: "Lumi, vị thần đèn vàng của CyberSkill, biến một ý chí rõ ràng thành phần mềm vận hành được.",
    },
  },
  {
    id: "origin",
    kicker: { en: "The wish", vi: "Điều ước" },
    heading: { en: "It starts with what you want to be true", vi: "Bắt đầu từ điều bạn muốn thành hiện thực" },
    body: {
      en: "Every project begins as a wish: a faster process, a product, a system that finally fits.",
      vi: "Mỗi dự án bắt đầu như một điều ước: một quy trình nhanh hơn, một sản phẩm, một hệ thống thật sự vừa vặn.",
    },
  },
  {
    id: "craft",
    kicker: { en: "The craft", vi: "Sự tận tâm" },
    heading: { en: "We build it honestly", vi: "Chúng tôi xây dựng một cách chính trực" },
    body: {
      en: "Web, mobile, and internal systems, made to ship and stay maintainable.",
      vi: "Web, di động và hệ thống nội bộ, được làm để bàn giao và dễ bảo trì lâu dài.",
    },
  },
  {
    id: "proof",
    kicker: { en: "The proof", vi: "Bằng chứng" },
    heading: { en: "Outcomes you can measure", vi: "Kết quả có thể đo lường" },
    body: {
      en: "Time saved, sessions that do not crash, vitals in the green.",
      vi: "Thời gian tiết kiệm, phiên không lỗi, chỉ số đạt ngưỡng.",
    },
  },
  {
    id: "team",
    kicker: { en: "The team", vi: "Đội ngũ" },
    heading: { en: "A team that answers for the work", vi: "Một đội ngũ chịu trách nhiệm với công việc" },
    body: {
      en: "Small, senior, and accountable, based in Ho Chi Minh City.",
      vi: "Nhỏ gọn, giàu kinh nghiệm và có trách nhiệm, đặt tại Thành phố Hồ Chí Minh.",
    },
  },
  {
    id: "invite",
    kicker: { en: "The invitation", vi: "Lời mời" },
    heading: { en: "Tell Lumi your wish", vi: "Kể cho Lumi điều ước của bạn" },
    body: {
      en: "Start a conversation. We reply within one business day.",
      vi: "Bắt đầu một cuộc trò chuyện. Chúng tôi phản hồi trong vòng một ngày làm việc.",
    },
  },
];
