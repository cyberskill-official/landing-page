/**
 * TASK-CTA-011: Auto-acknowledgement email templates for leads.
 *
 * HTML + plain-text. Transactional only (not marketing).
 * Visual system mirrors site brand: umber + ochre gold.
 */

import { company } from "@/lib/content/site";

export interface AckTemplateData {
  name: string;
  locale: "en" | "vi";
  bookingUrl?: string;
}

export interface AckEmail {
  subject: string;
  text: string;
  html: string;
}

const BRAND = {
  umber: "#45210e",
  ochre: "#f4ba17",
  ink: "#1c130d",
  muted: "#5c4a3a",
  paper: "#fbf6ee",
  line: "#e8dcc8",
};

/**
 * Generate the localised acknowledgement email for a lead.
 */
export function buildAckEmail({ name, locale, bookingUrl }: AckTemplateData): AckEmail {
  if (locale === "vi") return buildViEmail({ name, bookingUrl });
  return buildEnEmail({ name, bookingUrl });
}

function shellHtml(opts: {
  preheader: string;
  title: string;
  greeting: string;
  bodyHtml: string;
  footerNote: string;
}): string {
  const logoUrl = `${company.url.replace(/\/$/, "")}/brand/logo.svg`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(opts.title)}</title>
<!-- preheader -->
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(opts.preheader)}</span>
</head>
<body style="margin:0;padding:0;background:${BRAND.paper};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ink};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.paper};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.umber} 0%,#6b3a18 55%,${BRAND.umber} 100%);padding:22px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${logoUrl}" width="36" height="36" alt="" style="display:block;border:0;" />
                  </td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-weight:700;font-size:18px;color:${BRAND.ochre};letter-spacing:0.02em;">
                      ${escapeHtml(company.shortName)}
                    </div>
                    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;color:rgba(255,236,180,0.85);margin-top:2px;">
                      Turn Your Will Into Real
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,transparent,${BRAND.ochre},transparent);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.ink};">
              <p style="margin:0 0 16px;font-size:18px;font-weight:600;">${escapeHtml(opts.greeting)}</p>
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;line-height:1.5;color:${BRAND.muted};border-top:1px solid ${BRAND.line};">
              <p style="margin:16px 0 0;">${opts.footerNote}</p>
              <p style="margin:12px 0 0;">
                <a href="${escapeHtml(company.url)}" style="color:${BRAND.umber};text-decoration:underline;">${escapeHtml(company.url.replace(/^https?:\/\//, ""))}</a>
                · ${escapeHtml(company.email)}
                · ${escapeHtml(company.phone)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<p style="margin:24px 0 8px;">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.ochre};color:${BRAND.ink};font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px;">
    ${escapeHtml(label)}
  </a>
</p>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEnEmail({ name, bookingUrl }: Omit<AckTemplateData, "locale">): AckEmail {
  const lines = [
    `Hi ${name},`,
    ``,
    `Thanks for reaching out through Lumi. We've received your message and will get back to you within one business day.`,
    ``,
    `If you'd like to move faster, reply to this email or contact us directly:`,
    `  Email: ${company.email}`,
    `  Phone: ${company.phone} (${company.phoneContact})`,
  ];

  if (bookingUrl) {
    lines.push(``, `You can also book a 30-minute intro call here: ${bookingUrl}`);
  }

  lines.push(
    ``,
    `Looking forward to learning more about your project.`,
    ``,
    `Best,`,
    `The ${company.shortName} Team`,
    `${company.url}`,
  );

  const bodyHtml = `
    <p style="margin:0 0 14px;">Thanks for reaching out through <strong style="color:${BRAND.umber};">Lumi</strong>. We've received your message and will get back to you within <strong>one business day</strong>.</p>
    <p style="margin:0 0 14px;">If you'd like to move faster, reply to this email or contact us directly:</p>
    <ul style="margin:0 0 14px;padding-left:18px;color:${BRAND.muted};">
      <li>Email: <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND.umber};">${escapeHtml(company.email)}</a></li>
      <li>Phone: ${escapeHtml(company.phone)} (${escapeHtml(company.phoneContact)})</li>
    </ul>
    ${bookingUrl ? ctaButton(bookingUrl, "Book a 30-minute intro call") : ""}
    <p style="margin:18px 0 0;">Looking forward to learning more about your project.</p>
    <p style="margin:18px 0 0;">Best,<br/><strong>The ${escapeHtml(company.shortName)} Team</strong></p>
  `;

  return {
    subject: `We received your message, ${name} — ${company.shortName}`,
    text: lines.join("\n"),
    html: shellHtml({
      preheader: `Thanks ${name} — we received your message and will reply within one business day.`,
      title: `Message received — ${company.shortName}`,
      greeting: `Hi ${name},`,
      bodyHtml,
      footerNote: `This is a transactional acknowledgement for your enquiry — not a marketing list.`,
    }),
  };
}

function buildViEmail({ name, bookingUrl }: Omit<AckTemplateData, "locale">): AckEmail {
  const lines = [
    `Xin chào ${name},`,
    ``,
    `Cảm ơn bạn đã liên hệ qua Lumi. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng một ngày làm việc.`,
    ``,
    `Nếu bạn muốn trao đổi nhanh hơn, hãy trả lời email này hoặc liên hệ trực tiếp:`,
    `  Email: ${company.email}`,
    `  Điện thoại: ${company.phone} (${company.phoneContact})`,
  ];

  if (bookingUrl) {
    lines.push(``, `Bạn cũng có thể đặt lịch cuộc gọi 30 phút tại đây: ${bookingUrl}`);
  }

  lines.push(
    ``,
    `Chúng tôi rất mong được tìm hiểu thêm về dự án của bạn.`,
    ``,
    `Trân trọng,`,
    `Đội ngũ ${company.shortName}`,
    `${company.url}`,
  );

  const bodyHtml = `
    <p style="margin:0 0 14px;">Cảm ơn bạn đã liên hệ qua <strong style="color:${BRAND.umber};">Lumi</strong>. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi trong vòng <strong>một ngày làm việc</strong>.</p>
    <p style="margin:0 0 14px;">Nếu bạn muốn trao đổi nhanh hơn, hãy trả lời email này hoặc liên hệ trực tiếp:</p>
    <ul style="margin:0 0 14px;padding-left:18px;color:${BRAND.muted};">
      <li>Email: <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND.umber};">${escapeHtml(company.email)}</a></li>
      <li>Điện thoại: ${escapeHtml(company.phone)} (${escapeHtml(company.phoneContact)})</li>
    </ul>
    ${bookingUrl ? ctaButton(bookingUrl, "Đặt lịch gọi 30 phút") : ""}
    <p style="margin:18px 0 0;">Chúng tôi rất mong được tìm hiểu thêm về dự án của bạn.</p>
    <p style="margin:18px 0 0;">Trân trọng,<br/><strong>Đội ngũ ${escapeHtml(company.shortName)}</strong></p>
  `;

  return {
    subject: `Chúng tôi đã nhận được tin nhắn của bạn, ${name} — ${company.shortName}`,
    text: lines.join("\n"),
    html: shellHtml({
      preheader: `Cảm ơn ${name} — chúng tôi đã nhận tin nhắn và sẽ phản hồi trong một ngày làm việc.`,
      title: `Đã nhận tin nhắn — ${company.shortName}`,
      greeting: `Xin chào ${name},`,
      bodyHtml,
      footerNote: `Đây là email xác nhận giao dịch cho yêu cầu của bạn — không phải danh sách marketing.`,
    }),
  };
}
