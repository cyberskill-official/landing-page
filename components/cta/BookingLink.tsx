"use client";

import type { Locale } from "@/lib/i18n/config";
import { emit } from "@/lib/analytics/taxonomy";
import { getBookingUrl } from "@/lib/content/booking";

const LABELS = {
  en: "Book a 30-minute call",
  vi: "Đặt lịch gọi 30 phút",
} as const;

/**
 * FR-CTA-005: env-gated booking action. Renders nothing without NEXT_PUBLIC_BOOKING_URL.
 * Opens in a new tab; emits booking_clicked; never loads a booking script.
 */
export function BookingLink({
  locale,
  location,
  className = "cs-btn cs-btn-secondary",
}: {
  locale: Locale;
  location: string;
  className?: string;
}) {
  const url = getBookingUrl();
  if (!url) return null;

  const label = LABELS[locale];

  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-booking-link=""
      data-booking-location={location}
      onClick={() => emit("booking_clicked", { location })}
    >
      {label}
    </a>
  );
}

export const bookingLabels = LABELS;
