import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/config";

// Pick the best supported locale for a bare "/" visit from the Accept-Language
// header (TASK-WEB-004). Pure and dependency-free so it can be unit-tested and run
// in middleware. Parses the weighted language list, sorts by q, and returns the
// first entry whose primary subtag matches a supported locale; falls back to the
// default locale when nothing matches or the header is missing/empty.
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag === "*") return defaultLocale;
    const primary = tag.split("-")[0];
    if (isLocale(primary) && locales.includes(primary)) return primary;
  }
  return defaultLocale;
}
