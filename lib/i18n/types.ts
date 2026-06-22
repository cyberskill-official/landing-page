import type { Locale } from "./config";

// A string that always carries both languages (Vietnamese-first commitment).
export type LocalizedString = { en: string; vi: string };

export function localize(value: LocalizedString, locale: Locale): string {
  return value[locale];
}
