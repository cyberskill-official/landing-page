import type { MetadataRoute } from 'next';
import { getPublishedCaseStudySlugs } from '@/lib/case-studies';
import { SITE_URL, absoluteSiteUrl } from '@/lib/metadata-helpers';

const lastModified = new Date('2026-05-17T00:00:00.000Z');

function entry(
  path: string,
  {
    changeFrequency,
    priority,
  }: {
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
    priority: number;
  },
): MetadataRoute.Sitemap[number] {
  const viPath = path === '/' ? '/vi/' : `/vi${path}`;
  return {
    url: absoluteSiteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: absoluteSiteUrl(path),
        vi: absoluteSiteUrl(viPath),
        'x-default': absoluteSiteUrl(path),
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry('/', { changeFrequency: 'weekly', priority: 1 }),
    entry('/work', { changeFrequency: 'weekly', priority: 0.9 }),
    entry('/capabilities', { changeFrequency: 'monthly', priority: 0.8 }),
    entry('/team', { changeFrequency: 'monthly', priority: 0.7 }),
    entry('/careers', { changeFrequency: 'weekly', priority: 0.7 }),
    entry('/lite', { changeFrequency: 'monthly', priority: 0.6 }),
    entry('/accessibility', { changeFrequency: 'monthly', priority: 0.5 }),
  ];

  const localizedStaticRoutes = staticRoutes.flatMap((route) => {
    const vi = route.alternates?.languages?.vi;
    return vi && vi !== route.url
      ? [
          route,
          {
            ...route,
            url: vi,
          },
        ]
      : [route];
  });

  const workRoutes = getPublishedCaseStudySlugs().flatMap((slug) => {
    const enPath = `/work/${slug}`;
    const viPath = `/vi/work/${slug}`;
    const alternates = {
      languages: {
        en: absoluteSiteUrl(enPath),
        vi: absoluteSiteUrl(viPath),
        'x-default': absoluteSiteUrl(enPath),
      },
    };

    return [
      {
        url: absoluteSiteUrl(enPath),
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates,
      },
      {
        url: absoluteSiteUrl(viPath),
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates,
      },
    ];
  });

  return [...localizedStaticRoutes, ...workRoutes];
}

export const dynamic = 'force-static';
export const metadataBase = new URL(SITE_URL);
