import React from 'react';
import { JsonLd } from './JsonLd';

export function ArticleJsonLd({
  datePublished,
  description,
  image,
  title,
}: {
  datePublished: string;
  description: string;
  image: string;
  title: string;
}) {
  return (
    <JsonLd
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        image,
        datePublished,
        author: [{ '@type': 'Organization', name: 'CyberSkill' }],
        publisher: {
          '@type': 'Organization',
          name: 'CyberSkill',
          logo: {
            '@type': 'ImageObject',
            url: 'https://cyberskill.world/storyboard/scene-0-hero.svg',
          },
        },
        description,
      }}
    />
  );
}
