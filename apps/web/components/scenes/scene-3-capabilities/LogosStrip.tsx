import React from 'react';

export const CLIENT_INDUSTRY_LOGOS = [
  'Fintech platform',
  'Healthtech workflow',
  'AI operations team',
  'Design system program',
  'Marketplace product',
  'Internal tools suite',
] as const;

export function LogosStrip() {
  return (
    <ul className="scene-3-capabilities__logos" aria-label="Selected client industries" data-scene-3-logos>
      {CLIENT_INDUSTRY_LOGOS.map((label) => (
        <li key={label}>
          <span aria-hidden="true">{label.slice(0, 2).toUpperCase()}</span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
