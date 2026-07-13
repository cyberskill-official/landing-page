import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

// The CyberOS acceptable-use / content policy. Required by Google Play: an app carrying
// user-generated content must declare user-to-user communication in the content rating, which puts
// it under Play's UGC policy - and that policy requires an in-app report path, an in-app block, AND
// a published content policy the app links to. This is the published policy.
//
// It is linked from the app in two places (FR-CHAT-269 §1 #19): Settings, and the report dialog
// itself, where it is most useful - the moment someone is deciding whether what they are looking at
// crosses a line.
//
// Deliberately short. A content policy nobody reads is a compliance artefact, not a rule.

import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/cyberos/content-policy");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; updated: string; back: string }> = {
  en: {
    title: "CyberOS Content Policy",
    intro: `CyberOS is a private workspace for your colleagues. This page says what is not allowed in it, how to report something, and what happens after you do. It applies to every message, file, and image anyone sends.`,
    blocks: [
      {
        h: "What is not allowed",
        body: [
          "Harassment. Targeting a colleague with abuse, intimidation, or repeated unwanted contact, including by direct message.",
          "Hate. Attacking or demeaning anyone on the basis of race, ethnicity, national origin, religion, disability, sex, gender identity, sexual orientation, age, or serious illness.",
          "Sexual content. Sexually explicit material, and any sexual content involving a minor - which we report to the authorities without exception.",
          "Violence. Threats of violence, incitement to violence, or content that glorifies it.",
          "Illegal content. Anything unlawful under Vietnamese law or the law where the sender is, including malware, stolen credentials, and material that infringes someone else's rights.",
          "Spam. Bulk unsolicited messaging, and messaging that exists to advertise rather than to work.",
        ],
      },
      {
        h: "A note on self-harm",
        body: [
          "If someone posts something suggesting they may hurt themselves, report it. It is not a policy violation and nobody is in trouble. It is the report we treat as most urgent, and the reason the report form has a category for it.",
        ],
      },
      {
        h: "How to report",
        body: [
          "In CyberOS, open the message's menu and choose Report, or open a person's profile and choose Report. Pick the reason that fits and add anything the reviewer should know.",
          "Reporting is private. The person you report is not told that you reported them, and they never see your name against a report.",
          "You can also block someone. Blocking stops you seeing their messages and stops their messages reaching you - no notifications, no push, nothing. They are not told, and they see no error when they write to you. Blocking and reporting are independent: do either, or both.",
        ],
      },
      {
        h: "What happens next",
        body: [
          "Reports go to an administrator in your own organisation - not to CyberSkill. Your organisation owns its workspace and its content, and its administrators decide what happens in it. They see the reported message and who reported it. They do not see the rest of your private conversation.",
          "An administrator can dismiss the report, delete the message, or remove the person from that channel. Every one of those decisions is written to an audit record that cannot be quietly edited.",
        ],
      },
      {
        h: "If the problem is the administrator",
        body: [
          `If the person you need to report is the one who reviews reports, that is not a chat problem and this page cannot solve it. Contact us at ${company.email} and we will tell you honestly what we can and cannot do - which, because your organisation controls its own workspace, is less than you might hope.`,
        ],
      },
      {
        h: "Changes",
        body: [
          "If we change this policy we will update this page and change the date below. Material changes are announced to workspace administrators.",
        ],
      },
    ],
    updated: "Last updated 11 July 2026.",
    back: "CyberOS privacy policy",
  },
  vi: {
    title: "Qui tắc nội dung CyberOS",
    intro: `CyberOS là không gian làm việc riêng tư dành cho đồng nghiệp của bạn. Trang này nêu rõ điều gì không được phép, cách báo cáo, và điều gì xảy ra sau đó. Áp dụng cho mọi tin nhắn, tệp và hình ảnh mà bất kỳ ai gửi đi.`,
    blocks: [
      {
        h: "Điều gì không được phép",
        body: [
          "Quấy rối. Nhắm vào một đồng nghiệp bằng lời lẽ xúc phạm, đe doạ, hoặc liên hệ lặp đi lặp lại khi họ không muốn, kể cả qua tin nhắn riêng.",
          "Thù ghét. Tấn công hoặc hạ thấp bất kỳ ai dựa trên chủng tộc, sắc tộc, nguồn gốc quốc gia, tôn giáo, khuyết tật, giới tính, bản dạng giới, xu hướng tính dục, tuổi tác, hoặc bệnh hiểm nghèo.",
          "Nội dung tình dục. Nội dung khiêu dâm, và mọi nội dung tình dục liên quan tới trẻ vị thành niên - chúng tôi báo cho cơ quan chức năng, không có ngoại lệ.",
          "Bạo lực. Đe doạ bạo lực, kích động bạo lực, hoặc nội dung tôn vinh bạo lực.",
          "Nội dung bất hợp pháp. Bất cứ điều gì trái pháp luật Việt Nam hoặc luật nơi người gửi đang ở, bao gồm mã độc, thông tin đăng nhập bị đánh cắp, và nội dung xâm phạm quyền của người khác.",
          "Thư rác. Gửi tin hàng loạt không được yêu cầu, và tin nhắn tồn tại để quảng cáo chứ không phải để làm việc.",
        ],
      },
      {
        h: "Về hành vi tự làm hại bản thân",
        body: [
          "Nếu ai đó đăng nội dung cho thấy họ có thể tự làm hại mình, hãy báo cáo. Đó không phải vi phạm và không ai bị phạt. Đó là báo cáo chúng tôi coi là khẩn cấp nhất, và là lý do biểu mẫu báo cáo có riêng một mục cho việc này.",
        ],
      },
      {
        h: "Cách báo cáo",
        body: [
          "Trong CyberOS, mở menu của tin nhắn và chọn Báo cáo, hoặc mở hồ sơ của một người và chọn Báo cáo. Chọn lý do phù hợp và bổ sung những gì người xét duyệt cần biết.",
          "Báo cáo là riêng tư. Người bị báo cáo không được thông báo, và không bao giờ thấy tên bạn gắn với một báo cáo.",
          "Bạn cũng có thể chặn một người. Chặn khiến bạn không còn thấy tin nhắn của họ và tin nhắn của họ không đến được bạn - không thông báo, không đẩy, không gì cả. Họ không được báo, và không thấy lỗi khi nhắn cho bạn. Chặn và báo cáo là độc lập: bạn có thể làm một, hoặc cả hai.",
        ],
      },
      {
        h: "Điều gì xảy ra sau đó",
        body: [
          "Báo cáo được gửi tới quản trị viên trong chính tổ chức của bạn - không phải tới CyberSkill. Tổ chức của bạn sở hữu không gian làm việc và nội dung trong đó, và quản trị viên của họ quyết định điều gì xảy ra. Họ thấy tin nhắn bị báo cáo và ai đã báo cáo. Họ không thấy phần còn lại của cuộc trò chuyện riêng tư của bạn.",
          "Quản trị viên có thể bỏ qua báo cáo, xoá tin nhắn, hoặc gỡ người đó khỏi kênh. Mỗi quyết định đều được ghi vào bản ghi kiểm toán không thể sửa đổi âm thầm.",
        ],
      },
      {
        h: "Nếu vấn đề nằm ở chính quản trị viên",
        body: [
          `Nếu người bạn cần báo cáo lại chính là người xét duyệt báo cáo, đó không phải vấn đề của phần mềm chat và trang này không giải quyết được. Hãy liên hệ ${company.email} và chúng tôi sẽ nói thật với bạn những gì chúng tôi có thể và không thể làm - và vì tổ chức của bạn kiểm soát không gian làm việc của họ, điều đó ít hơn bạn mong đợi.`,
        ],
      },
      {
        h: "Thay đổi",
        body: [
          "Nếu thay đổi qui tắc này, chúng tôi sẽ cập nhật trang này và đổi ngày bên dưới. Thay đổi quan trọng sẽ được thông báo tới quản trị viên.",
        ],
      },
    ],
    updated: "Cập nhật lần cuối ngày 11 tháng 7 năm 2026.",
    back: "Chính sách quyền riêng tư CyberOS",
  },
};

export default async function CyberOsContentPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section">
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/cyberos/content-policy` },
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
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}/cyberos/privacy`}>
            {c.back}
          </Link>
        </p>
      </div>
    </section>
  );
}
