"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

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
      <Icon name={theme === "light" ? "moon" : "sun"} size="sm" />
    </button>
  );
}
