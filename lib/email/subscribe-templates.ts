// Bilingual double opt-in confirmation email templates for CyberSkill newsletter.
// FR-CTA-014 §1.3: Contains the named promise: "one email a month: what we shipped, one lesson, one teardown".

export interface SubscribeEmailData {
  confirmUrl: string;
  unsubscribeUrl: string;
}

export function buildConfirmEmail(locale: "en" | "vi", data: SubscribeEmailData) {
  if (locale === "vi") {
    return {
      subject: "Xác nhận đăng ký nhận bản tin CyberSkill",
      text: `Chào bạn,

Cảm ơn bạn đã quan tâm đến bản tin của CyberSkill. 

Chúng tôi cam kết thực hiện đúng lời hứa: mỗi tháng chỉ gửi một email duy nhất bao gồm: những gì chúng tôi đã bàn giao, một bài học kinh nghiệm, và một phân tích chi tiết.

Để xác nhận đăng ký nhận bản tin, vui lòng nhấn vào liên kết dưới đây (liên kết sẽ hết hạn sau 24 giờ):
${data.confirmUrl}

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Bạn sẽ không bị đăng ký và không nhận bất kỳ email nào khác từ chúng tôi.

Để hủy đăng ký bất cứ lúc nào, bạn có thể nhấn vào liên kết này:
${data.unsubscribeUrl}

Trân trọng,
Đội ngũ CyberSkill
https://cyberskill.vn
`,
    };
  }

  return {
    subject: "Confirm your CyberSkill newsletter subscription",
    text: `Hello,

Thank you for your interest in the CyberSkill newsletter.

We stand by our core promise: one email a month, containing: what we shipped, one lesson, and one teardown.

To confirm your subscription, please click the link below (this link expires in 24 hours):
${data.confirmUrl}

If you did not request this subscription, please ignore this email. You will not be subscribed and will not receive any further emails.

To unsubscribe at any time, you can click this link:
${data.unsubscribeUrl}

Best regards,
The CyberSkill Team
https://cyberskill.vn
`,
  };
}
