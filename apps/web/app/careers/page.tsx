import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';

type CareersPageProps = {
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/careers', {
    title: 'CyberSkill — Careers',
    description: 'Open senior roles at CyberSkill.',
    hreflang: {
      'x-default': '/careers',
      en: '/careers',
      vi: '/vi/careers',
    },
  });
}

export default async function CareersPage({ searchParams }: CareersPageProps) {
  const locale = await resolveRouteLocale(searchParams);

  return (
    <main className="route-page">
      <p className="route-kicker">Careers</p>
      <h1>{locale === 'vi' ? 'Tuyen dung' : 'Careers'}</h1>
      <p>
        {locale === 'vi'
          ? 'Danh sach viec lam se duoc dong bo tu CMS va ATS.'
          : 'Open jobs will be synchronized from the CMS and ATS.'}
      </p>
    </main>
  );
}
