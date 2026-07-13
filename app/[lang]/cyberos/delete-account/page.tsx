import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

// Account + data deletion page for CyberOS. Google Play REQUIRES a publicly
// reachable URL (no sign-in) that names the developer and the app, explains how
// to request deletion of the account and its data, and states plainly what is
// deleted, what is retained, and for how long. This is that URL. It is also
// what the App Store's "account deletion" requirement points at.
//
// Everything promised here has to be operable, so the steps map 1:1 to the
// runbook at cyberos/docs/deploy/data-deletion-runbook.md. If the data model
// changes, BOTH move together - a promise here that the runbook cannot execute
// is a compliance failure, not a wording problem.

import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/cyberos/delete-account");
}

type Block = { h: string; body: string[] };
const content: Record<Locale, { title: string; intro: string; blocks: Block[]; updated: string; back: string }> = {
  en: {
    title: "Delete your CyberOS account",
    intro: `CyberOS is published by ${company.legalName}. This page explains how to have your CyberOS account and its data deleted, and exactly what that removes.`,
    blocks: [
      {
        h: "How to request deletion",
        body: [
          `Email ${company.email} from the address you sign in to CyberOS with, using the subject line "CyberOS account deletion". Tell us your workspace name. We do not need anything else - we verify you by the address you write from.`,
          "Or ask your workspace administrator to remove you. An administrator can revoke your access immediately, and can raise the deletion request with us on your behalf.",
          "We confirm by email when the deletion is done. We complete requests within 30 days, and normally within a few working days.",
        ],
      },
      {
        h: "What we delete",
        body: [
          "Your account record: your name, your email address, your handle, and the link between your CyberOS account and your Google account.",
          "Your direct messages, and any files or images you attached to them.",
          "Your reactions, your mentions, your read markers, and your notification settings.",
          "The push notification tokens for every device you signed in on, so no device can receive anything further.",
        ],
      },
      {
        h: "What is retained, and why",
        body: [
          "Messages and files you posted in a shared channel stay in that channel. They are part of your organisation's business record, and removing one side of a conversation would leave the rest unreadable for your colleagues. Your name is removed from them, so they are no longer attributable to you.",
          "Your organisation's administrator can ask us to delete those shared-channel messages too. Because the content belongs to the organisation and not to us, that request has to come from them.",
          "Server logs that record the request may persist for up to 90 days for security and abuse investigation, then rotate out.",
          "We keep nothing else. There is no backup copy retained beyond our normal rolling backups, which age out within 30 days.",
        ],
      },
      {
        h: "Deleting the whole workspace",
        body: [
          `If your organisation is closing its CyberOS account, an administrator should email ${company.email}. We delete the entire workspace - every account, channel, message, and file in it - and confirm when it is gone.`,
        ],
      },
      {
        h: "Questions",
        body: [
          `Anything unclear, or you want a copy of your data before it is deleted: email ${company.email} and we will answer.`,
        ],
      },
    ],
    updated: "Last updated 11 July 2026.",
    back: "CyberOS privacy policy",
  },
  vi: {
    title: "Xoá tài khoản CyberOS",
    intro: `CyberOS được phát hành bởi ${company.legalName}. Trang này giải thích cách yêu cầu xoá tài khoản CyberOS và dữ liệu của bạn, và chính xác những gì sẽ bị xoá.`,
    blocks: [
      {
        h: "Cách yêu cầu xoá",
        body: [
          `Gửi email tới ${company.email} từ chính địa chỉ bạn dùng để đăng nhập CyberOS, với tiêu đề "CyberOS account deletion". Cho chúng tôi biết tên không gian làm việc của bạn. Không cần gì thêm - chúng tôi xác minh bạn qua địa chỉ email bạn gửi.`,
          "Hoặc yêu cầu quản trị viên không gian làm việc gỡ bạn ra. Quản trị viên có thể thu hồi quyền truy cập ngay lập tức, và có thể gửi yêu cầu xoá tới chúng tôi thay bạn.",
          "Chúng tôi xác nhận qua email khi đã xoá xong. Chúng tôi hoàn tất trong vòng 30 ngày, và thường chỉ trong vài ngày làm việc.",
        ],
      },
      {
        h: "Chúng tôi xoá gì",
        body: [
          "Hồ sơ tài khoản của bạn: tên, địa chỉ email, tên định danh, và liên kết giữa tài khoản CyberOS với tài khoản Google của bạn.",
          "Tin nhắn riêng của bạn, cùng mọi tệp và hình ảnh bạn đã đính kèm trong đó.",
          "Biểu tượng cảm xúc, lượt nhắc tên, dấu đã đọc, và tuỳ chọn thông báo của bạn.",
          "Mã đẩy thông báo của mọi thiết bị bạn đã đăng nhập, để không thiết bị nào nhận thêm bất cứ thứ gì.",
        ],
      },
      {
        h: "Những gì được giữ lại, và vì sao",
        body: [
          "Tin nhắn và tệp bạn đã đăng trong kênh chung sẽ ở lại kênh đó. Chúng là một phần hồ sơ công việc của tổ chức bạn, và xoá một phía của cuộc trò chuyện sẽ khiến phần còn lại không còn đọc được với đồng nghiệp. Tên của bạn được gỡ khỏi chúng, nên chúng không còn gắn với bạn.",
          "Quản trị viên của tổ chức có thể yêu cầu chúng tôi xoá cả những tin nhắn trong kênh chung đó. Vì nội dung thuộc về tổ chức chứ không thuộc về chúng tôi, yêu cầu đó phải đến từ họ.",
          "Nhật ký máy chủ ghi nhận yêu cầu có thể tồn tại tối đa 90 ngày để phục vụ điều tra bảo mật và lạm dụng, sau đó tự xoá.",
          "Chúng tôi không giữ gì khác. Không có bản sao lưu nào ngoài các bản sao lưu luân phiên thông thường, và chúng hết hạn trong vòng 30 ngày.",
        ],
      },
      {
        h: "Xoá toàn bộ không gian làm việc",
        body: [
          `Nếu tổ chức của bạn đóng tài khoản CyberOS, quản trị viên hãy gửi email tới ${company.email}. Chúng tôi sẽ xoá toàn bộ không gian làm việc - mọi tài khoản, kênh, tin nhắn, và tệp trong đó - và xác nhận khi hoàn tất.`,
        ],
      },
      {
        h: "Câu hỏi",
        body: [
          `Nếu còn điều gì chưa rõ, hoặc bạn muốn nhận bản sao dữ liệu trước khi xoá: gửi email tới ${company.email} và chúng tôi sẽ trả lời.`,
        ],
      },
    ],
    updated: "Cập nhật lần cuối ngày 11 tháng 7 năm 2026.",
    back: "Chính sách quyền riêng tư CyberOS",
  },
};

export default async function CyberOsDeleteAccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const c = content[locale];
  return (
    <section className="cs-section">
      <div className="cs-container cs-prose">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: c.title, path: `/${locale}/cyberos/delete-account` },
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
