"use client";

import type { Locale } from "@/lib/i18n/config";
import { emit } from "@/lib/analytics/taxonomy";

const HREF = {
  en: "/downloads/cyberskill-profile-en.pdf",
  vi: "/downloads/cyberskill-profile-vi.pdf",
} as const;

const LABELS = {
  en: "Download company profile (PDF)",
  vi: "Tải hồ sơ công ty (PDF)",
} as const;

/**
 * FR-CTA-016: link to locale profile PDF; emits cta_clicked on download.
 */
export function ProfileDownloadLink({
  locale,
  location,
  className = "cs-btn cs-btn-secondary",
}: {
  locale: Locale;
  location: string;
  className?: string;
}) {
  const href = HREF[locale];
  const label = LABELS[locale];
  return (
    <a
      className={className}
      href={href}
      download
      data-profile-pdf=""
      data-profile-locale={locale}
      onClick={() => emit("cta_clicked", { location, label })}
    >
      {label}
    </a>
  );
}

export const profilePdfHrefs = HREF;
export const profilePdfLabels = LABELS;
