'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import sceneDefs from '../../../../content/narrative/scene-defs.json';
import { localeFromPathname, type Locale } from '@/lib/i18n';
import { getNarrativeLine } from '@/lib/i18n/messages-loader';

type SceneDef = {
  id: string;
  ordinal: number;
  narration_line_ids: string[];
};

export type CurrentNarration = {
  lineId: string;
  sceneId: string;
  sceneNumber: number;
  text: string;
};

const scenes = sceneDefs as SceneDef[];

export function useCurrentNarration(activeScene: number | null | undefined): CurrentNarration | null {
  const pathname = usePathname() ?? '/';
  const locale = localeFromPathname(pathname);

  return useMemo(() => getNarrationForScene(locale, activeScene), [activeScene, locale]);
}

export function getNarrationForScene(
  locale: Locale,
  activeScene: number | null | undefined,
): CurrentNarration | null {
  if (typeof activeScene !== 'number' || !Number.isFinite(activeScene)) return null;

  const scene = scenes.find((candidate) => candidate.ordinal === activeScene);
  const lineId = scene?.narration_line_ids[0];
  if (!scene || !lineId) return null;

  const line = getNarrativeLine(locale, lineId);
  if (!line) return null;

  return {
    lineId,
    sceneId: scene.id,
    sceneNumber: scene.ordinal + 1,
    text: line.text,
  };
}
