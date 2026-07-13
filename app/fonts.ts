import { Space_Grotesk } from "next/font/google";

/**
 * FR-PERF-005: Centralised font loading strategy.
 *
 * Self-hosted display font (Space Grotesk) subset to Latin + Vietnamese ranges.
 * Declares display: "swap" and preload: true so it is preloaded on initial fetch.
 * Uses size-adjust metric matching (automatic in next/font) to eliminate layout shift.
 */
export const displayFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--font-display",
});
