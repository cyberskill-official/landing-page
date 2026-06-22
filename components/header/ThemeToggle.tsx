"use client";

import { useEffect, useState } from "react";

const KEY = "cs-theme";
type Theme = "light" | "dark";

// Flips data-theme on <html> and persists it. The no-flash inline script in the
// root layout sets the initial theme before paint, so this only handles toggling.
export function ThemeToggle({ toDark, toLight }: { toDark: string; toLight: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // ignore storage failures (private mode)
    }
  }, [theme]);

  if (!theme) return null;
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className="cs-theme-toggle"
      aria-label={theme === "light" ? toDark : toLight}
      title={theme === "light" ? toDark : toLight}
      onClick={() => setTheme(next)}
    >
      {theme === "light" ? (
        // moon
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // sun
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      )}
    </button>
  );
}
