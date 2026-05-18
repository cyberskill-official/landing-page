import { PROFESSIONAL_SERVICE } from '@/components/seo/professional-service';

export type CapabilitySchema = {
  id: string;
  name: string;
  serviceType: string;
  description: string;
};

export const CAPABILITIES: CapabilitySchema[] = [
  {
    id: 'react',
    name: 'React Development',
    serviceType: 'Web Application Development',
    description: 'React 19, Next.js 15, server components, and full-stack React applications.',
  },
  {
    id: 'threejs',
    name: 'Three.js / R3F',
    serviceType: '3D Web Development',
    description: 'Three.js, React Three Fiber, WebGL2, and cinematic 3D web experiences.',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    serviceType: 'Typed Development',
    description: 'Strict TypeScript, type-driven design, and maintainable product engineering.',
  },
  {
    id: 'nodejs',
    name: 'Node.js Backend',
    serviceType: 'Backend Development',
    description: 'Node.js, edge runtime, serverless functions, and backend-for-frontend patterns.',
  },
  {
    id: 'ai-rag',
    name: 'AI / RAG Integration',
    serviceType: 'AI Integration',
    description: 'LLM integration, RAG pipelines, vector search, and agent workflows.',
  },
  {
    id: 'design-systems',
    name: 'Design Systems',
    serviceType: 'UI Architecture',
    description: 'Token-driven design systems, component libraries, accessibility, and multi-theme UI.',
  },
];

export function buildServiceJsonLd(capability: CapabilitySchema, siteUrl = PROFESSIONAL_SERVICE.url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/capabilities#${capability.id}`,
    name: capability.name,
    serviceType: capability.serviceType,
    description: capability.description,
    url: `${siteUrl}/capabilities#${capability.id}`,
    areaServed: PROFESSIONAL_SERVICE.areaServed,
    provider: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
    },
  };
}

export function buildItemListJsonLd(siteUrl = PROFESSIONAL_SERVICE.url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CyberSkill capabilities',
    url: `${siteUrl}/capabilities`,
    itemListElement: CAPABILITIES.map((capability, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: buildServiceJsonLd(capability, siteUrl),
    })),
  };
}
