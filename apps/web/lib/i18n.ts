export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const localeStorageKey = 'cyberskill_locale';
export const localeHeaderName = 'x-cyberskill-locale';

export function normalizeLocale(value: unknown): Locale {
  return value === 'vi' ? 'vi' : 'en';
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : 'en';
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/vi') return '/';
  return pathname.replace(/^\/vi(?=\/)/, '') || '/';
}

export function buildLocalePath(pathname: string, targetLocale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (targetLocale === 'vi') {
    return stripped === '/' ? '/vi' : `/vi${stripped}`;
  }
  return stripped;
}

export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const preferred = header
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .find((part) => part.startsWith('vi') || part.startsWith('en'));

  if (!preferred) return null;
  return preferred.startsWith('vi') ? 'vi' : 'en';
}

export function persistLocalePreference(locale: Locale, storage: Pick<Storage, 'setItem'> | undefined) {
  if (!storage) return;
  try {
    storage.setItem(localeStorageKey, locale);
  } catch {
    // Locale persistence is a convenience, never a rendering dependency.
  }
}

