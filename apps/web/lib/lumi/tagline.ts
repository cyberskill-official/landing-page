import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';
import type { Locale } from '@/lib/i18n';

export const LUMI_TAGLINE_HOVER = viMessages.lumi['lumi-tagline-hover'];

export function getLumiTaglineAriaLabel(locale: Locale) {
  return locale === 'vi'
    ? viMessages.lumi.hover_lumi_for_tagline
    : enMessages.lumi.hover_lumi_for_tagline;
}
