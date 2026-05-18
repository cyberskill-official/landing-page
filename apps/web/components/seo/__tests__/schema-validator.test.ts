import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { JsonLd } from '../JsonLd';
import { PROFESSIONAL_SERVICE } from '../professional-service';

describe('FR-SEO-001 JSON-LD renderer', () => {
  test('SSR-renders a compact application/ld+json script with valid JSON', () => {
    const markup = renderToStaticMarkup(createElement(JsonLd, { schema: PROFESSIONAL_SERVICE }));

    expect(markup).toContain('type="application/ld+json"');
    expect(markup.length).toBeLessThan(2_048);

    const json = markup
      .replace(/^<script type="application\/ld\+json">/, '')
      .replace(/<\/script>$/, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
    const parsed = JSON.parse(json) as typeof PROFESSIONAL_SERVICE;

    expect(parsed['@type']).toBe('ProfessionalService');
    expect(parsed.identifier.find((item) => item.propertyID === 'DUNS')?.value).toBe('673219568');
  });
});
