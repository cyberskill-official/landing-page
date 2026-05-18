import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next/headers', () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const pageModule = await import('../page');
const readingTime = await import('@/lib/util/reading-time');

describe('FR-CMS-006 /work/[slug]', () => {
  test('generates static params from published case-study slugs', async () => {
    await expect(pageModule.generateStaticParams()).resolves.toEqual(
      expect.arrayContaining([{ slug: 'sample' }]),
    );
  });

  test('generates article metadata with social previews and alternates', async () => {
    const metadata = await pageModule.generateMetadata({
      params: Promise.resolve({ slug: 'sample' }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe('Design System Acceleration | CyberSkill');
    expect((metadata.openGraph as { type?: string })?.type).toBe('article');
    expect((metadata.twitter as { card?: string })?.card).toBe('summary_large_image');
    expect(metadata.alternates?.languages).toMatchObject({
      en: 'https://cyberskill.world/work/sample',
      vi: 'https://cyberskill.world/vi/work/sample',
    });
  });

  test('server-renders semantic article content and Article JSON-LD', async () => {
    const element = await pageModule.default({
      params: Promise.resolve({ slug: 'sample' }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('<article');
    expect(html).toContain('id="case-study-title"');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('Back to all work');
    expect(html).toContain('Last updated');
    expect(html).toContain('Related work');
  });

  test('computes a minimum one-minute reading time from portable text', () => {
    expect(readingTime.computeReadingTime([])).toBe(1);
    expect(readingTime.computeReadingTime([
      { _type: 'block', children: [{ _type: 'span', text: 'one two three' }] },
    ])).toBe(1);
  });
});
