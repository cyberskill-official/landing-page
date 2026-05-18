import enLines from '../../../../content/narrative/lines/en.json';
import viLines from '../../../../content/narrative/lines/vi.json';
import type { Locale } from '../i18n';

export type NarrativeLine = {
  id: string;
  role: string;
  scene_id: string;
  speaker: string;
  text: string;
};

type NarrativeFile = {
  lines: NarrativeLine[];
};

const files: Record<Locale, NarrativeFile> = {
  en: enLines,
  vi: viLines,
};

export function loadNarrativeLines(locale: Locale): NarrativeLine[] {
  return files[locale].lines.filter((line) => line.role !== 'retired');
}

export function getNarrativeLine(locale: Locale, id: string): NarrativeLine | undefined {
  return loadNarrativeLines(locale).find((line) => line.id === id);
}

