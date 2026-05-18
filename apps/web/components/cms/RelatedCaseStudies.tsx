import React from 'react';
import type { CaseStudyPageData } from '@/lib/sanity/sanity-fetch';

export function RelatedCaseStudies({ items }: { items: CaseStudyPageData[] }) {
  if (items.length === 0) return null;

  return (
    <section className="case-study-section" aria-labelledby="related-work-title">
      <h2 id="related-work-title">Related work</h2>
      <div className="case-study-related">
        {items.map((item) => (
          <a key={item._id} href={`/work/${item.slug}`}>
            <span>{item.client_name}</span>
            <strong>{item.title}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}
