import type { Metadata } from 'next';

const SITE_URL = 'https://cyberskill.world';

type HreflangOptions = {
  path: string;
  vietnameseSlug?: string;
};

function cleanPath(path: string): string {
  if (!path || path === '/') return '/';
  return `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function absolute(path: string): string {
  const normalized = cleanPath(path);
  return normalized === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}

export function buildAlternates({
  path,
  vietnameseSlug,
}: HreflangOptions): NonNullable<Metadata['alternates']> {
  const enPath = cleanPath(path);
  const viPath = vietnameseSlug
    ? enPath.replace(/\/work\/[^/]+$/, `/work/${vietnameseSlug}`)
    : enPath;
  const viPrefixed = viPath === '/' ? '/vi' : `/vi${viPath}`;

  return {
    canonical: absolute(enPath),
    languages: {
      en: absolute(enPath),
      vi: absolute(viPrefixed),
      'x-default': absolute(enPath),
    },
  };
}

export function buildStandardAlternates(path: string): NonNullable<Metadata['alternates']> {
  return buildAlternates({ path });
}

