import type { LocalizedString } from "@/lib/i18n/types";

/**
 * TASK-CTA-015 §1.4: previous CTA primary strings kept for one-commit rollback.
 * Current live promise is commercialPolicy.ctaPromise (via dictionaries).
 */
export const previousCtaPrimary: LocalizedString = {
  en: "Start my project",
  vi: "Bắt đầu dự án",
};

export const ctaCopyHistory: {
  supersededAt: string;
  primary: LocalizedString;
  note: string;
}[] = [
  {
    supersededAt: "2026-07-14",
    primary: previousCtaPrimary,
    note: "Replaced by owner-approved outcome promise (TASK-BIZ-013 / TASK-CTA-015)",
  },
];
