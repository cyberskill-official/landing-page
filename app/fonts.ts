import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";

/**
 * Magical brand typography — Vietnamese-complete.
 *
 * Display: Space Grotesk (geometric, lamp-modern; full VI diacritics).
 * Body: Be Vietnam Pro (warm, highly readable Vietnamese + Latin).
 * Both use display: "swap" + preload to avoid FOIT and layout shift.
 */
export const displayFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--font-display",
});

export const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-body",
});
