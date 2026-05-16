export function hasWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function saveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  return conn?.saveData === true;
}

export function deviceMemoryGB(): number | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as { deviceMemory?: number }).deviceMemory;
}
