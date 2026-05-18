import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { CAPABILITIES } from '@/lib/seo/capabilities-schema';

type CapabilitiesPageProps = {
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/capabilities', {
    title: 'CyberSkill — Capabilities',
    description: 'CyberSkill capabilities across product design, WebGL, software engineering, and delivery operations.',
    hreflang: {
      'x-default': '/capabilities',
      en: '/capabilities',
      vi: '/vi/capabilities',
    },
  });
}

export default async function CapabilitiesPage({ searchParams }: CapabilitiesPageProps) {
  const locale = await resolveRouteLocale(searchParams);

  return (
    <>
      <ServiceJsonLd embedMode="list" />
      <main className="route-page">
        <p className="route-kicker">Capabilities</p>
        <h1>{locale === 'vi' ? 'Nang luc' : 'Capabilities'}</h1>
        <p>
          {locale === 'vi'
            ? 'Noi dung chi tiet se duoc nap tu CMS Sanity.'
            : 'Detailed capability content will be hydrated from the Sanity CMS.'}
        </p>
        <div className="capability-anchor-list" aria-label="Capability anchors">
          {CAPABILITIES.map((capability) => (
            <section key={capability.id} id={capability.id} className="capability-anchor">
              <h2>{capability.name}</h2>
              <p>{capability.description}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
