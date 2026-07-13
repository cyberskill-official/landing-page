/**
 * FR-CTA-011: Auto-acknowledgement email templates for leads.
 *
 * Plain text only — no tracking pixel, no HTML.
 * Templates are localised (EN and VN in the same module).
 *
 * Invariants:
 * - This is a transactional acknowledgement, not a marketing email.
 *   The visitor was not asked for consent to marketing communications.
 * - The booking link is included only when configured (LEAD_BOOKING_URL).
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
}

/**
 * Generate the localised acknowledgement email for a lead.
 */
export function buildAckEmail({ name, locale, bookingUrl }: AckTemplateData): AckEmail {
  if (locale === "vi") return buildViEmail({ name, bookingUrl });
  return buildEnEmail({ name, bookingUrl });
}

function buildEnEmail({ name, bookingUrl }: Omit<AckTemplateData, "locale">): AckEmail {
  const lines = [
    `Hi ${name},`,
    ``,
    `Thanks for reaching out. We've received your message and will get back to you within one business day.`,
    ``,
    `If you'd like to move faster, you can reply to this email or contact us directly:`,
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

  return {
    subject: `We received your message, ${name} — ${company.shortName}`,
    text: lines.join("\n"),
  };
}

function buildViEmail({ name, bookingUrl }: Omit<AckTemplateData, "locale">): AckEmail {
  const lines = [
    `Xin chào ${name},`,
    ``,
    `Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng một ngày làm việc.`,
    ``,
    `Nếu bạn muốn trao đổi nhanh hơn, bạn có thể trả lời email này hoặc liên hệ trực tiếp:`,
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

  return {
    subject: `Chúng tôi đã nhận được tin nhắn của bạn, ${name} — ${company.shortName}`,
    text: lines.join("\n"),
  };
}
