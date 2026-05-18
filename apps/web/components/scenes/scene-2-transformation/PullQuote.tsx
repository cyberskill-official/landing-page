'use client';

import React from 'react';

export type PullQuoteProps = {
  visible?: boolean;
};

export const SCENE_2_PULL_QUOTE = {
  attribution: 'CyberSkill delivery principle',
  cite: '/work/sample',
  text: 'The sketch is only useful once it survives contact with shipping.',
};

export function getPullQuoteOpacity(sceneProgress: number) {
  return sceneProgress >= 0.4 && sceneProgress <= 0.85 ? 1 : 0;
}

export function PullQuote({ visible = true }: PullQuoteProps) {
  return (
    <blockquote
      className="scene-2-transformation__quote"
      cite={SCENE_2_PULL_QUOTE.cite}
      data-scene-2-pullquote
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p>{SCENE_2_PULL_QUOTE.text}</p>
      <footer>{SCENE_2_PULL_QUOTE.attribution}</footer>
    </blockquote>
  );
}
