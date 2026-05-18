import type { Metadata } from 'next';
import { buildStandardAlternates } from './seo/hreflang';
import { validateMetadata } from './seo/meta-budgets';
import { buildOpenGraphTwitterMeta, type OgType } from './seo/og-image-helpers';

export const SITE_URL = 'https://cyberskill.world';

export type SupportedLocale = 'en' | 'vi';
export type RouteSearchParams = Promise<{ lang?: string | string[] }>;

export type RouteMetadataOpts = {
  canonical?: string;
  description?: string;
  hreflang?: Partial<Record<'x-default' | SupportedLocale, string>>;
  imageAlt?: string;
  imagePath?: string;
  locale?: SupportedLocale;
  ogType?: OgType;
  title?: string;
};

export function absoluteSiteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function generateRouteMetadata(routePath: string, opts: RouteMetadataOpts = {}): Metadata {
  const budget = validateMetadata(opts.title, opts.description);
  if (!budget.ok && process.env.NODE_ENV !== 'production') {
    console.warn('[SEO metadata budget]', routePath, budget.errors);
  }

  const alternates: NonNullable<Metadata['alternates']> = opts.hreflang
    ? { canonical: absoluteSiteUrl(opts.canonical ?? routePath) }
    : buildStandardAlternates(opts.canonical ?? routePath);

  if (opts.hreflang) {
    alternates.languages = Object.fromEntries(
      Object.entries(opts.hreflang).map(([lang, href]) => [lang, absoluteSiteUrl(href)]),
    ) as NonNullable<Metadata['alternates']>['languages'];
  }

  return {
    title: opts.title,
    description: opts.description,
    alternates,
    ...buildOpenGraphTwitterMeta({
      title: opts.title ?? 'CyberSkill',
      description: opts.description ?? 'Senior-only Vietnamese software solutions consultancy.',
      path: opts.canonical ?? routePath,
      locale: opts.locale ?? 'en',
      imagePath: opts.imagePath,
      imageAlt: opts.imageAlt,
      type: opts.ogType ?? 'website',
    }),
  };
}

export async function resolveRouteLocale(searchParams?: RouteSearchParams): Promise<SupportedLocale> {
  const params = await searchParams;
  const rawLang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  return rawLang === 'vi' ? 'vi' : 'en';
}
