import { describe, expect, test } from 'vitest';
import { PROFESSIONAL_SERVICE } from '../professional-service';
import { FOUNDER, buildPersonJsonLd } from '@/lib/seo/founder-schema';

describe('FR-SEO-003 Founder Person JSON-LD', () => {
  test('builds the founder Person block with organization affiliation', () => {
    const block = buildPersonJsonLd();

    expect(block['@type']).toBe('Person');
    expect(block['@id']).toBe('https://cyberskill.world/#founder');
    expect(block.name).toBe('Stephen Cheng');
    expect(block.jobTitle).toBe('Founder & CEO');
    expect(block.affiliation['@id']).toBe(PROFESSIONAL_SERVICE['@id']);
  });

  test('preserves Vietnamese diacritics through JSON serialization', () => {
    const serialized = JSON.stringify(buildPersonJsonLd());
    const parsed = JSON.parse(serialized) as ReturnType<typeof buildPersonJsonLd>;

    expect(parsed.alternateName).toBe('Trịnh Thái Anh');
    expect(serialized).toContain('Trịnh');
    expect(serialized.charCodeAt(serialized.indexOf('ị'))).toBe(7883);
  });

  test('sameAs URLs are absolute HTTPS URLs', () => {
    expect(FOUNDER.sameAs.length).toBeGreaterThan(0);
    for (const url of FOUNDER.sameAs) expect(url).toMatch(/^https:\/\//);
  });
});
