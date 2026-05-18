import React from 'react';

export const TRUST_SIGNALS = [
  'DUNS 673219568',
  'Founded 2020',
  '10 senior engineers',
  '2 active engagements',
  'Time-zone honest',
  'GDPR-ready',
  'NDAs standard',
] as const;

export function TrustSignalsStrip() {
  return (
    <ul className="scene-5-vietnam-global__trust" aria-label="Why us, why Vietnam trust signals" data-scene-5-trust>
      {TRUST_SIGNALS.map((signal) => (
        <li key={signal}>{signal}</li>
      ))}
    </ul>
  );
}
