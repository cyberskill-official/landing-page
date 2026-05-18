import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata-helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sanity/', '/__draft/', '/api/draft/', '/api/revalidate/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
