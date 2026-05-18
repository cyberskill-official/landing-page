import { ImageResponse } from 'next/og';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/lib/seo/og-image-helpers';

export const runtime = 'edge';
export const alt = 'CyberSkill case study preview';
export const size = {
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
};
export const contentType = 'image/png';

type OpenGraphImageProps = {
  params: {
    slug: string;
  };
};

export default function Image({ params }: OpenGraphImageProps) {
  const title = titleFromSlug(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #2C1304 0%, #6E3A18 58%, #E8B523 100%)',
          color: '#FEF6D9',
          padding: 64,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: '#E8B523',
              boxShadow: '0 0 48px rgba(232, 181, 35, 0.5)',
            }}
          />
          CyberSkill
        </div>
        <div style={{ maxWidth: 860, fontSize: 72, fontWeight: 800, lineHeight: 0.96 }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FCEAA8', fontSize: 28 }}>
          <span>Case study</span>
          <span>cyberskill.world</span>
        </div>
      </div>
    ),
    size,
  );
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}
