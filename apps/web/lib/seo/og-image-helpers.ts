import type { Metadata } from 'next';

export const DEFAULT_SITE_URL = 'https://cyberskill.world';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_SIZE = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT } as const;
export const DEFAULT_OG_ALT = 'Lumi, the golden genie of CyberSkill, against a warm Saigon-inspired backdrop';

export type OgLocale = 'en_US' | 'vi_VN';
export type OgType = 'website' | 'article';

type BuildOpenGraphTwitterMetaOptions = {
  title: string;
  description: string;
  path: string;
  locale?: 'en' | 'vi';
  imagePath?: string;
  imageAlt?: string;
  type?: OgType;
  siteUrl?: string;
};

export function absoluteOgUrl(pathOrUrl: string, siteUrl = DEFAULT_SITE_URL): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl.replace(/\/$/, '')}${normalizedPath}`;
}

export function buildOgImageMeta(url: string, alt: string) {
  return {
    url: absoluteOgUrl(url),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
  };
}

export function localeToOgLocale(locale: 'en' | 'vi' = 'en'): OgLocale {
  return locale === 'vi' ? 'vi_VN' : 'en_US';
}

export function defaultOgImagePath(locale: 'en' | 'vi' = 'en'): string {
  return locale === 'vi' ? '/og-vi.jpg' : '/og.jpg';
}

export function buildOpenGraphTwitterMeta({
  title,
  description,
  path,
  locale = 'en',
  imagePath = defaultOgImagePath(locale),
  imageAlt = DEFAULT_OG_ALT,
  type = 'website',
  siteUrl = DEFAULT_SITE_URL,
}: BuildOpenGraphTwitterMetaOptions): Pick<Metadata, 'openGraph' | 'twitter'> {
  const url = absoluteOgUrl(path, siteUrl);
  const image = buildOgImageMeta(absoluteOgUrl(imagePath, siteUrl), imageAlt);

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: 'CyberSkill',
      images: [image],
      locale: localeToOgLocale(locale),
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}
