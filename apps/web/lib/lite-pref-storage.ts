export const LITE_PREF_KEY = 'cyberskill_lite_pref';
export type LitePref = '1' | '0';

function storage(): Storage | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function getLitePref(): LitePref | null {
  try {
    const value = storage()?.getItem(LITE_PREF_KEY);
    return value === '1' || value === '0' ? value : null;
  } catch {
    return null;
  }
}

export function setLitePref(value: LitePref): void {
  try {
    storage()?.setItem(LITE_PREF_KEY, value);
  } catch {
    // Preference persistence is best-effort; private-mode storage can throw.
  }
}

export function clearLitePref(): void {
  try {
    storage()?.removeItem(LITE_PREF_KEY);
  } catch {
    // Preference persistence is best-effort; private-mode storage can throw.
  }
}
