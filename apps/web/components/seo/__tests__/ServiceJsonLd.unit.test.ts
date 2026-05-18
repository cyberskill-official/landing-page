import { describe, expect, test } from 'vitest';
import { CAPABILITIES, buildItemListJsonLd, buildServiceJsonLd } from '@/lib/seo/capabilities-schema';

describe('FR-SEO-002 Service JSON-LD', () => {
  test('builds six service blocks with provider linkage', () => {
    expect(CAPABILITIES).toHaveLength(6);
    const ids = new Set(CAPABILITIES.map((capability) => capability.id));
    expect(ids.size).toBe(CAPABILITIES.length);

    for (const capability of CAPABILITIES) {
      const block = buildServiceJsonLd(capability);
      expect(block['@type']).toBe('Service');
      expect(block['@id']).toBe(`https://cyberskill.world/capabilities#${capability.id}`);
      expect(block.provider['@id']).toBe('https://cyberskill.world/#organization');
      expect(block.areaServed).toContain('United States');
      expect(block.serviceType).not.toHaveLength(0);
    }
  });

  test('wraps all service blocks in an ItemList for /capabilities', () => {
    const list = buildItemListJsonLd();

    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement).toHaveLength(6);
    expect(list.itemListElement.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
