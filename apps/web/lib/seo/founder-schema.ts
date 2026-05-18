import { PROFESSIONAL_SERVICE } from '@/components/seo/professional-service';

export type FounderSchema = {
  name: string;
  alternateName: string;
  jobTitle: string;
  url: string;
  imageUrl?: string;
  sameAs: string[];
};

export const FOUNDER: FounderSchema = {
  name: 'Stephen Cheng',
  alternateName: 'Trịnh Thái Anh',
  jobTitle: 'Founder & CEO',
  url: 'https://cyberskill.world/#founder',
  sameAs: ['https://github.com/zintaen'],
};

export function buildPersonJsonLd(
  founder: FounderSchema = FOUNDER,
  orgId = PROFESSIONAL_SERVICE['@id'],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': founder.url,
    name: founder.name,
    alternateName: founder.alternateName,
    jobTitle: founder.jobTitle,
    url: founder.url,
    ...(founder.imageUrl ? { image: founder.imageUrl } : {}),
    affiliation: {
      '@type': 'Organization',
      '@id': orgId,
      name: 'CyberSkill',
    },
    sameAs: founder.sameAs,
  };
}
