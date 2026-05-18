import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';
import type { Locale } from '@/lib/i18n';

type MessageTree = {
  forms?: {
    validation?: Record<string, string>;
  };
};

const catalogs: Record<Locale, MessageTree> = {
  en: enMessages,
  vi: viMessages,
};

export function resolveValidationMessage(message: unknown, locale: Locale = 'en') {
  if (typeof message !== 'string') return '';
  if (!message.startsWith('validation:')) return message;

  const key = message.slice('validation:'.length);
  return catalogs[locale].forms?.validation?.[key] ?? catalogs.en.forms?.validation?.[key] ?? key;
}

export function currentDocumentLocale(): Locale {
  if (typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('vi')) {
    return 'vi';
  }
  return 'en';
}
