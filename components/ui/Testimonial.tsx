import type { Locale } from "@/lib/i18n/config";
import type { Testimonial as TestimonialType } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";

export function Testimonial({
  testimonial,
  locale,
}: {
  testimonial: TestimonialType;
  locale: Locale;
}) {
  const quoteText = localize(testimonial.quote, locale);
  const translationText = testimonial.translation ? localize(testimonial.translation, locale) : undefined;
  const authorRole = localize(testimonial.role, locale);

  return (
    <div className="cs-testimonial cs-surface-standard" style={{
      padding: "var(--cs-space-md) var(--cs-space-lg)",
      borderRadius: "var(--cs-radius-md)",
      border: "1px solid var(--cs-color-border)",
      marginTop: "var(--cs-space-sm)",
      marginBottom: "var(--cs-space-sm)",
      maxWidth: "36rem",
      fontSize: "var(--cs-text-sm)",
      lineHeight: "1.6",
    }}>
      <blockquote style={{ margin: 0, fontStyle: "italic", color: "var(--cs-color-text-primary)" }}>
        “{quoteText}”
      </blockquote>
      {translationText && (
        <p style={{
          margin: "var(--cs-space-xs) 0 0 0",
          fontSize: "var(--cs-text-xs)",
          color: "var(--cs-color-text-muted)",
          fontStyle: "normal"
        }}>
          {translationText}
        </p>
      )}
      <cite style={{
        display: "block",
        marginTop: "var(--cs-space-xs)",
        fontStyle: "normal",
        fontWeight: "bold",
        color: "var(--cs-color-primary)",
      }}>
        — {testimonial.author}, {authorRole} ({testimonial.company})
      </cite>
    </div>
  );
}
