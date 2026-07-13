import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

// CyberOS app privacy policy. This is the URL submitted to Google Play and the
// Apple App Store, so it MUST stay accurate against what the app actually
// collects - the Play "Data safety" form is checked against this page, and a
// mismatch is a policy violation, not a typo.
//
// It is deliberately SEPARATE from /[lang]/privacy: that page covers this
// marketing website (contact form, Lumi chat, analytics). CyberOS collects a
// different set (Google identity, workspace messages, attachments, push
// tokens), and one page trying to cover both would be accurate for neither.
//
// It lives on cyberskill.world, not os.cyberskill.world, because the store
// reviewer must be able to read it WITHOUT signing in - the CyberOS console is
// behind Google SSO.

import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/cyberos/privacy");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; updated: string; back: string }> = {
  en: {
    title: "CyberOS Privacy Policy",
    intro: `This policy covers the CyberOS applications - Android, iOS, desktop, and the web console at os.cyberskill.world. It is published by ${company.shortName} and is separate from the privacy notice for this website.`,
    blocks: [
      {
        h: "Who we are",
        body: [
          `${company.legalName}, ${company.address}. DUNS ${company.duns}.`,
          `Contact for any privacy question or request: ${company.email}.`,
        ],
      },
      {
        h: "What CyberOS is, and who controls your data",
        body: [
          "CyberOS is a private workspace application. You can only use it if your organisation holds a CyberOS account and an administrator has granted you access. There is no public sign-up and no public content.",
          "Your organisation is the controller of the content inside its workspace. We process that content on its instructions, as its processor. Your administrator can see workspace content, manage your access, and revoke it.",
        ],
      },
      {
        h: "What we collect",
        body: [
          "Account and profile. When you sign in with Google we receive your name, your email address, and your Google account identifier. We use these to create and identify your account. We never receive or store your Google password.",
          "Workspace content. The messages you send, the files and images you attach, your reactions, your mentions of other people, and which messages you have read.",
          "Device identifiers for notifications. If you allow notifications, we store the push token issued to that device and the platform it runs on (Android, iOS, or web), so we can deliver messages to it. Nothing else is read from your device.",
          "Diagnostics. Server-side error and access logs, kept so we can operate and secure the service.",
        ],
      },
      {
        h: "What we do not collect",
        body: [
          "We do not collect your location. We do not read your contacts, your photo library, your calendar, your SMS, or your call logs. We do not use advertising identifiers.",
          "CyberOS contains no advertising, no third-party ad networks, and no analytics SDKs. We do not sell your data and we do not share it with data brokers.",
        ],
      },
      {
        h: "Why we collect it",
        body: [
          "To create your account and let you sign in. To deliver your messages and files to the people in your workspace. To send the notifications you asked for. To keep the account secure and to operate the service.",
          "We do not use your workspace content to train any AI model.",
        ],
      },
      {
        h: "Who else processes it",
        body: [
          "Google, as the identity provider you sign in with. Vultr, which hosts our servers in Singapore. Supabase, which hosts our managed database. Each processes data only to provide that service to us.",
          "If you use an AI feature inside CyberOS, the text you send to it is passed to the model provider that serves that feature, to generate the reply. Nothing else in your workspace is sent.",
        ],
      },
      {
        h: "Security and retention",
        body: [
          "All traffic between the app and our servers is encrypted in transit with TLS. Access to the production database is restricted to the service accounts that need it.",
          "We keep your account and its content for as long as your organisation keeps its CyberOS account, and then delete it. You can ask us to delete your data sooner at any time.",
        ],
      },
      {
        h: "Your rights",
        body: [
          `You can ask us to give you a copy of your data, correct it, or delete it. Email ${company.email} from the address you sign in with and we will act within 30 days.`,
          "This applies wherever you are. We follow Vietnam's Personal Data Protection law and, for people in the EU and UK, the GDPR.",
        ],
      },
      {
        h: "Deleting your account",
        body: [
          "You can request deletion of your CyberOS account and its data at any time. The steps, and exactly what is deleted and what is retained, are on the account deletion page linked below.",
        ],
      },
      {
        h: "Children",
        body: ["CyberOS is a workplace tool. It is not directed at children and is not intended for anyone under 18."],
      },
      {
        h: "Changes",
        body: [
          "If we change what we collect, we will update this page and change the date below before the change ships. Material changes are announced to workspace administrators.",
        ],
      },
    ],
    updated: "Last updated 11 July 2026.",
    back: "Account deletion",
  },
  vi: {
    title: "Chính sách quyền riêng tư CyberOS",
    intro: `Chính sách này áp dụng cho các ứng dụng CyberOS - Android, iOS, máy tính, và bảng điều khiển web tại os.cyberskill.world. Được ban hành bởi ${company.shortName} và tách biệt với thông báo quyền riêng tư của website này.`,
    blocks: [
      {
        h: "Chúng tôi là ai",
        body: [
          `${company.legalName}, ${company.address}. DUNS ${company.duns}.`,
          `Liên hệ cho mọi câu hỏi hoặc yêu cầu về quyền riêng tư: ${company.email}.`,
        ],
      },
      {
        h: "CyberOS là gì, và ai kiểm soát dữ liệu của bạn",
        body: [
          "CyberOS là ứng dụng không gian làm việc riêng tư. Bạn chỉ có thể dùng nếu tổ chức của bạn có tài khoản CyberOS và quản trị viên đã cấp quyền cho bạn. Không có đăng ký công khai và không có nội dung công khai.",
          "Tổ chức của bạn là bên kiểm soát nội dung trong không gian làm việc của họ. Chúng tôi xử lý nội dung đó theo chỉ dẫn của họ, với vai trò bên xử lý. Quản trị viên có thể xem nội dung, quản lý và thu hồi quyền truy cập của bạn.",
        ],
      },
      {
        h: "Chúng tôi thu thập gì",
        body: [
          "Tài khoản và hồ sơ. Khi bạn đăng nhập bằng Google, chúng tôi nhận tên, địa chỉ email, và mã định danh tài khoản Google của bạn, dùng để tạo và nhận diện tài khoản. Chúng tôi không bao giờ nhận hay lưu mật khẩu Google của bạn.",
          "Nội dung không gian làm việc. Tin nhắn bạn gửi, tệp và hình ảnh bạn đính kèm, biểu tượng cảm xúc, lượt nhắc tên người khác, và các tin nhắn bạn đã đọc.",
          "Mã thiết bị cho thông báo. Nếu bạn cho phép thông báo, chúng tôi lưu mã đẩy (push token) của thiết bị đó và nền tảng của nó (Android, iOS, hoặc web) để gửi tin nhắn tới bạn. Không đọc gì khác từ thiết bị của bạn.",
          "Nhật ký kỹ thuật. Nhật ký lỗi và truy cập phía máy chủ, phục vụ vận hành và bảo mật dịch vụ.",
        ],
      },
      {
        h: "Chúng tôi không thu thập gì",
        body: [
          "Chúng tôi không thu thập vị trí của bạn. Không đọc danh bạ, thư viện ảnh, lịch, tin nhắn SMS, hay nhật ký cuộc gọi. Không dùng mã định danh quảng cáo.",
          "CyberOS không có quảng cáo, không có mạng quảng cáo bên thứ ba, và không có SDK phân tích. Chúng tôi không bán dữ liệu của bạn và không chia sẻ cho môi giới dữ liệu.",
        ],
      },
      {
        h: "Vì sao chúng tôi thu thập",
        body: [
          "Để tạo tài khoản và cho phép bạn đăng nhập. Để chuyển tin nhắn và tệp của bạn tới những người trong không gian làm việc. Để gửi các thông báo bạn đã yêu cầu. Để giữ an toàn cho tài khoản và vận hành dịch vụ.",
          "Chúng tôi không dùng nội dung không gian làm việc của bạn để huấn luyện bất kỳ mô hình AI nào.",
        ],
      },
      {
        h: "Ai khác xử lý dữ liệu",
        body: [
          "Google, với vai trò nhà cung cấp danh tính bạn dùng để đăng nhập. Vultr, nơi đặt máy chủ của chúng tôi tại Singapore. Supabase, nơi vận hành cơ sở dữ liệu. Mỗi bên chỉ xử lý dữ liệu để cung cấp dịch vụ đó cho chúng tôi.",
          "Nếu bạn dùng tính năng AI trong CyberOS, văn bản bạn gửi tới tính năng đó sẽ được chuyển cho nhà cung cấp mô hình để tạo câu trả lời. Không có gì khác trong không gian làm việc được gửi đi.",
        ],
      },
      {
        h: "Bảo mật và lưu trữ",
        body: [
          "Toàn bộ lưu lượng giữa ứng dụng và máy chủ được mã hoá trên đường truyền bằng TLS. Quyền truy cập cơ sở dữ liệu production chỉ dành cho các tài khoản dịch vụ cần thiết.",
          "Chúng tôi giữ tài khoản và nội dung của bạn trong thời gian tổ chức của bạn còn dùng CyberOS, sau đó xoá. Bạn có thể yêu cầu xoá sớm hơn bất cứ lúc nào.",
        ],
      },
      {
        h: "Quyền của bạn",
        body: [
          `Bạn có thể yêu cầu bản sao dữ liệu, yêu cầu sửa, hoặc yêu cầu xoá. Gửi email tới ${company.email} từ địa chỉ bạn dùng để đăng nhập; chúng tôi xử lý trong vòng 30 ngày.`,
          "Điều này áp dụng ở mọi nơi. Chúng tôi tuân thủ Nghị định bảo vệ dữ liệu cá nhân của Việt Nam và, với người ở EU và Anh, tuân thủ GDPR.",
        ],
      },
      {
        h: "Xoá tài khoản",
        body: [
          "Bạn có thể yêu cầu xoá tài khoản CyberOS và dữ liệu của nó bất cứ lúc nào. Các bước, và chính xác những gì bị xoá và những gì được giữ lại, nằm ở trang xoá tài khoản bên dưới.",
        ],
      },
      {
        h: "Trẻ em",
        body: ["CyberOS là công cụ làm việc. Không hướng tới trẻ em và không dành cho người dưới 18 tuổi."],
      },
      {
        h: "Thay đổi",
        body: [
          "Nếu thay đổi những gì thu thập, chúng tôi sẽ cập nhật trang này và đổi ngày bên dưới trước khi thay đổi được phát hành. Thay đổi quan trọng sẽ được thông báo tới quản trị viên.",
        ],
      },
    ],
    updated: "Cập nhật lần cuối ngày 11 tháng 7 năm 2026.",
    back: "Xoá tài khoản",
  },
};

export default async function CyberOsPrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section">
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/cyberos/privacy` },
          ]}
        />
        <h1>{c.title}</h1>
        <p className="cs-section-lead">{c.intro}</p>
        {c.blocks.map((b) => (
          <div key={b.h} className="cs-case-section">
            <h2>{b.h}</h2>
            {b.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
        <p className="cs-footer-meta">{c.updated}</p>
        <p className="cs-section-more">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}/cyberos/delete-account`}>
            {c.back}
          </Link>
        </p>
      </div>
    </section>
  );
}
