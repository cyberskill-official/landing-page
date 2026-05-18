import { describe, expect, test } from 'vitest';
import { generateRouteMetadata } from '@/lib/metadata-helpers';
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  absoluteOgUrl,
  buildOgImageMeta,
  buildOpenGraphTwitterMeta,
  defaultOgImagePath,
} from '@/lib/seo/og-image-helpers';

function twitterImages(metadata: ReturnType<typeof buildOpenGraphTwitterMeta>) {
  return Array.isArray(metadata.twitter?.images) ? metadata.twitter.images : [metadata.twitter?.images];
}

describe('FR-SEO-004 OpenGraph metadata', () => {
  test('builds absolute 1200x630 OG image metadata with alt text', () => {
    const meta = buildOgImageMeta('/og.jpg', 'Lumi golden genie');

    expect(meta).toMatchObject({
      url: 'https://cyberskill.world/og.jpg',
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: 'Lumi golden genie',
    });
    expect(absoluteOgUrl('https://cdn.example.test/og.jpg')).toBe('https://cdn.example.test/og.jpg');
  });

  test('uses localized default images and OpenGraph locales', () => {
    expect(defaultOgImagePath('en')).toBe('/og.jpg');
    expect(defaultOgImagePath('vi')).toBe('/og-vi.jpg');

    const metadata = buildOpenGraphTwitterMeta({
      title: 'CyberSkill',
      description: 'Senior software from Vietnam.',
      path: '/vi',
      locale: 'vi',
    });

    expect(metadata.openGraph).toMatchObject({
      locale: 'vi_VN',
      type: 'website',
    });
    expect(String(twitterImages(metadata)[0])).toBe('https://cyberskill.world/og-vi.jpg');
  });

  test('generateRouteMetadata includes OG and Twitter cards on public routes', () => {
    const metadata = generateRouteMetadata('/work', {
      title: 'Work | CyberSkill',
      description: 'Selected CyberSkill work.',
      locale: 'en',
    });

    expect(metadata.openGraph).toMatchObject({
      url: 'https://cyberskill.world/work',
      type: 'website',
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
    });
  });
});
