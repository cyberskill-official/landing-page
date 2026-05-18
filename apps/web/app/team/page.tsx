import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';

type TeamPageProps = {
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/team', {
    title: 'CyberSkill — Team',
    description: 'CyberSkill senior Vietnamese remote team profile.',
    hreflang: {
      'x-default': '/team',
      en: '/team',
      vi: '/vi/team',
    },
  });
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const locale = await resolveRouteLocale(searchParams);

  return (
    <main className="route-page">
      <p className="route-kicker">Team</p>
      <h1>{locale === 'vi' ? 'Doi ngu' : 'Team'}</h1>
      <p>
        {locale === 'vi'
          ? 'Ho so doi ngu cong khai se tuan thu nguyen tac rieng tu mac dinh.'
          : 'Public team profiles will follow privacy-by-default CMS rules.'}
      </p>
    </main>
  );
}
