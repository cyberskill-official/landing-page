import { describe, expect, test } from 'vitest';
import robots from '../../../app/robots';
import sitemap from '../../../app/sitemap';

describe('FR-SEO-006 sitemap and robots', () => {
  test('lists public static routes, locale variants, and case studies', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://cyberskill.world/');
    expect(urls).toContain('https://cyberskill.world/vi/');
    expect(urls).toContain('https://cyberskill.world/capabilities');
    expect(urls).toContain('https://cyberskill.world/vi/capabilities');
    expect(urls).toContain('https://cyberskill.world/work/sample');
    expect(urls).toContain('https://cyberskill.world/vi/work/sample');
  });

  test('adds hreflang alternates and crawler hints', () => {
    const entries = sitemap();
    const home = entries.find((entry) => entry.url === 'https://cyberskill.world/');
    const work = entries.find((entry) => entry.url === 'https://cyberskill.world/work/sample');

    expect(home?.alternates?.languages).toMatchObject({
      en: 'https://cyberskill.world/',
      vi: 'https://cyberskill.world/vi/',
    });
    expect(work?.alternates?.languages).toMatchObject({
      en: 'https://cyberskill.world/work/sample',
      vi: 'https://cyberskill.world/vi/work/sample',
    });
    expect(home?.changeFrequency).toBe('weekly');
    expect(home?.priority).toBe(1);
  });

  test('disallows non-public routes in robots.txt metadata', () => {
    const rules = robots().rules;
    const primaryRule = Array.isArray(rules) ? rules[0] : rules;

    expect(primaryRule).toBeDefined();
    if (!primaryRule) throw new Error('missing robots rule');
    expect(primaryRule.allow).toBe('/');
    expect(primaryRule.disallow).toEqual(expect.arrayContaining(['/api/', '/sanity/', '/__draft/']));
    expect(robots().sitemap).toBe('https://cyberskill.world/sitemap.xml');
  });
});
