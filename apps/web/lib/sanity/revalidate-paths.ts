export type SanityWebhookPayload = {
  _id?: string;
  _type?: string;
  i18n_locale?: 'en' | 'vi';
  slug?: {
    current?: string;
  };
};

function withLocalePrefix(path: string, localePrefix: '' | '/vi'): string {
  if (!localePrefix) return path;
  if (path === '/') return localePrefix;
  return `${localePrefix}${path}`;
}

export function pathsForSanityPayload(payload: SanityWebhookPayload): string[] {
  const type = payload._type;
  const slug = payload.slug?.current;
  const localePrefixes: Array<'' | '/vi'> = payload.i18n_locale === 'vi' ? ['', '/vi'] : [''];
  const paths = new Set<string>();

  for (const prefix of localePrefixes) {
    switch (type) {
      case 'case_study':
        paths.add(withLocalePrefix('/', prefix));
        paths.add(withLocalePrefix('/work', prefix));
        if (slug) paths.add(withLocalePrefix(`/work/${slug}`, prefix));
        break;
      case 'testimonial':
        paths.add(withLocalePrefix('/', prefix));
        paths.add(withLocalePrefix('/work', prefix));
        break;
      case 'capability':
        paths.add(withLocalePrefix('/', prefix));
        paths.add(withLocalePrefix('/capabilities', prefix));
        break;
      case 'team_member':
        paths.add(withLocalePrefix('/team', prefix));
        break;
      case 'job':
        paths.add(withLocalePrefix('/', prefix));
        paths.add(withLocalePrefix('/careers', prefix));
        break;
      default:
        paths.add(withLocalePrefix('/', prefix));
    }
  }

  return [...paths];
}
