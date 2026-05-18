import React from 'react';
import type { PortableTextBlock } from '@/lib/sanity/types.generated';

export function CaseStudyBody({ body }: { body: PortableTextBlock[] }) {
  return (
    <div className="case-study-body">
      {body.map((block, index) => {
        const text = block.children?.map((child) => child.text).join(' ') ?? '';
        if (!text) return null;

        if (block.style === 'h2') {
          return <h2 key={index}>{text}</h2>;
        }

        return <p key={index}>{text}</p>;
      })}
    </div>
  );
}
