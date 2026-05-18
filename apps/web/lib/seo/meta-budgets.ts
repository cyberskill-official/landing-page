export const TITLE_BUDGET = 60;
export const DESCRIPTION_BUDGET = 158;

export function validateMetadata(title: string | null | undefined, description: string | null | undefined) {
  const errors: string[] = [];
  if ((title?.length ?? 0) > TITLE_BUDGET) {
    errors.push(`Title ${title?.length ?? 0} chars > ${TITLE_BUDGET}`);
  }
  if ((description?.length ?? 0) > DESCRIPTION_BUDGET) {
    errors.push(`Description ${description?.length ?? 0} chars > ${DESCRIPTION_BUDGET}`);
  }

  return { ok: errors.length === 0, errors };
}

export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.7) return `${slice.slice(0, lastSpace)}…`;
  return `${slice}…`;
}
