// Parse a CSS time value ("250ms", "0.5s", "1100ms") to seconds, returning the
// fallback for empty or unparseable input. Pure and DOM-free so it can be
// unit-tested directly (FR-DS-009).
export function parseDurationToSeconds(raw: string | null | undefined, fallbackSeconds: number): number {
  if (!raw) return fallbackSeconds;
  const value = raw.trim();
  if (!value) return fallbackSeconds;
  const ms = value.endsWith("ms")
    ? Number.parseFloat(value)
    : value.endsWith("s")
      ? Number.parseFloat(value) * 1000
      : Number.parseFloat(value);
  return Number.isFinite(ms) && ms > 0 ? ms / 1000 : fallbackSeconds;
}

// Read a motion duration token from :root at runtime so JS-driven animation (the
// Lenis smooth scroll) shares the same duration scale as the CSS transitions
// instead of hardcoding its own (FR-DS-009). SSR-safe: returns the fallback when
// there is no document.
export function readDurationSeconds(varName: string, fallbackSeconds: number): number {
  if (typeof document === "undefined") return fallbackSeconds;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName);
  return parseDurationToSeconds(raw, fallbackSeconds);
}
