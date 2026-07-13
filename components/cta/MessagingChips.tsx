"use client";

/**
 * FR-CTA-012: Config-driven messaging app contact chips.
 *
 * Renders Zalo and WhatsApp one-tap contact links driven by company.contacts
 * config. Only configured channels are rendered. An unconfigured channel
 * produces no markup (§1.2).
 *
 * Each chip emits a cta_clicked analytics event with location and label (§1.3).
 *
 * Accessible names are provided per locale in both EN and VN (§protected).
 */

import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";
import { emit } from "@/lib/analytics/taxonomy";

interface Props {
  locale: Locale;
  location: string; // e.g. "contact-section", "footer"
}

interface ChipDef {
  key: string;
  href: string;
  label: Record<Locale, string>;
}

function buildChips(locale: Locale): ChipDef[] {
  const chips: ChipDef[] = [];
  const contacts = company.contacts ?? {};

  if (contacts.whatsapp) {
    // E.164 without '+' — validated via the config (see site.ts comment)
    const number = contacts.whatsapp.replace(/\D/g, "");
    chips.push({
      key: "whatsapp",
      href: `https://wa.me/${number}`,
      label: { en: "Chat on WhatsApp", vi: "Nhắn tin qua WhatsApp" },
    });
  }

  if (contacts.zalo) {
    // Zalo: deep-link if available, otherwise fall back to the web profile URL
    chips.push({
      key: "zalo",
      href: contacts.zalo,
      label: { en: "Chat on Zalo", vi: "Nhắn tin qua Zalo" },
    });
  }

  return chips;
}

export function MessagingChips({ locale, location }: Props) {
  const chips = buildChips(locale);
  if (chips.length === 0) return null;

  return (
    <nav
      className="cs-messaging-chips"
      aria-label={locale === "vi" ? "Kênh liên hệ nhanh" : "Quick contact channels"}
    >
      {chips.map((chip) => (
        <a
          key={chip.key}
          href={chip.href}
          rel="noopener noreferrer"
          target="_blank"
          aria-label={chip.label[locale]}
          className={`cs-chip cs-chip--${chip.key}`}
          onClick={() =>
            emit("cta_clicked", { location, label: chip.label[locale] })
          }
        >
          <span aria-hidden="true" className="cs-chip-icon">
            {chip.key === "whatsapp" ? "💬" : "💬"}
          </span>
          <span className="cs-chip-label">{chip.label[locale]}</span>
        </a>
      ))}
    </nav>
  );
}
