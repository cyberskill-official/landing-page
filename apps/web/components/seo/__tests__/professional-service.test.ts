import { describe, expect, test } from 'vitest';
import { PROFESSIONAL_SERVICE } from '../professional-service';

describe('FR-SEO-001 ProfessionalService schema', () => {
  test('contains the legally controlled entity identifiers', () => {
    expect(PROFESSIONAL_SERVICE['@type']).toBe('ProfessionalService');
    expect(PROFESSIONAL_SERVICE.legalName).toBe(
      'CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY',
    );
    expect(PROFESSIONAL_SERVICE.legalName).toBe(PROFESSIONAL_SERVICE.legalName.toUpperCase());
    expect(PROFESSIONAL_SERVICE.identifier).toContainEqual({
      '@type': 'PropertyValue',
      propertyID: 'DUNS',
      value: '673219568',
    });
  });

  test('preserves founder, address, service regions, and capability facts', () => {
    expect(PROFESSIONAL_SERVICE.founder).toEqual({
      '@type': 'Person',
      name: 'Stephen Cheng',
      alternateName: 'Trịnh Thái Anh',
    });
    expect(PROFESSIONAL_SERVICE.address).toMatchObject({
      '@type': 'PostalAddress',
      addressLocality: 'Ho Chi Minh City',
      addressCountry: 'VN',
    });
    expect(PROFESSIONAL_SERVICE.areaServed).toEqual([
      'United States',
      'Canada',
      'European Union',
      'United Kingdom',
      'Australia',
      'Vietnam',
    ]);
    expect(PROFESSIONAL_SERVICE.knowsAbout).toEqual([
      'React',
      'Three.js',
      'TypeScript',
      'Node.js',
      'AI/RAG systems',
      'Design Systems',
    ]);
  });

  test('uses absolute production URLs and avoids unverified certification claims', () => {
    expect(PROFESSIONAL_SERVICE.url).toBe('https://cyberskill.world');
    expect(PROFESSIONAL_SERVICE.logo).toBe('https://cyberskill.world/logo.svg');
    expect(PROFESSIONAL_SERVICE.image).toBe('https://cyberskill.world/og.jpg');
    expect(JSON.stringify(PROFESSIONAL_SERVICE)).not.toMatch(/ISO 27001|SOC 2|certified/i);
    expect(PROFESSIONAL_SERVICE.sameAs).toEqual([]);
  });
});
