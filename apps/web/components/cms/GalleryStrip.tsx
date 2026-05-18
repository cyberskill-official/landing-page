import React from 'react';
import type { CaseStudyImage } from '@/lib/sanity/sanity-fetch';

export function GalleryStrip({ images }: { images: CaseStudyImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="case-study-section" aria-labelledby="gallery-title">
      <h2 id="gallery-title">Gallery</h2>
      <div className="case-study-gallery">
        {images.map((image) => (
          <img key={image.url} src={image.url} alt={image.alt} />
        ))}
      </div>
    </section>
  );
}
