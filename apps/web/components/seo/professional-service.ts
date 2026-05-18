export interface ProfessionalServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'ProfessionalService';
  '@id': string;
  name: string;
  legalName: string;
  alternateName: string[];
  slogan: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  foundingDate: string;
  founder: { '@type': 'Person'; name: string; alternateName: string };
  email: string;
  address: { '@type': 'PostalAddress'; streetAddress: string; addressLocality: string; addressCountry: string };
  identifier: Array<{ '@type': 'PropertyValue'; propertyID: string; value: string }>;
  areaServed: string[];
  knowsAbout: string[];
  sameAs: string[];
}

export const PROFESSIONAL_SERVICE: ProfessionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://cyberskill.world/#organization',
  name: 'CyberSkill',
  legalName: 'CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY',
  alternateName: ['CyberSkill', 'CyberSkill JSC'],
  slogan: 'Turn Your Will Into Real',
  url: 'https://cyberskill.world',
  logo: 'https://cyberskill.world/logo.svg',
  image: 'https://cyberskill.world/og.jpg',
  description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
  foundingDate: '2020',
  founder: { '@type': 'Person', name: 'Stephen Cheng', alternateName: 'Trịnh Thái Anh' },
  email: 'info@cyberskill.world',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward',
    addressLocality: 'Ho Chi Minh City',
    addressCountry: 'VN',
  },
  identifier: [{ '@type': 'PropertyValue', propertyID: 'DUNS', value: '673219568' }],
  areaServed: ['United States', 'Canada', 'European Union', 'United Kingdom', 'Australia', 'Vietnam'],
  knowsAbout: ['React', 'Three.js', 'TypeScript', 'Node.js', 'AI/RAG systems', 'Design Systems'],
  sameAs: [],
};
