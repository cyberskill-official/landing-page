import React from 'react';
import type { CaseStudyImage } from '@/lib/sanity/sanity-fetch';

export function CaseStudyHero({
  clientName,
  heroImage,
  summary,
  title,
}: {
  clientName: string;
  heroImage: CaseStudyImage;
  summary: string;
  title: string;
}) {
  return (
    <header className="case-study-hero">
      <p className="route-kicker">{clientName}</p>
      <h1 id="case-study-title">{title}</h1>
      <p>{summary}</p>
      <img src={heroImage.url} alt={heroImage.alt} className="case-study-hero__image" />
    </header>
  );
}
