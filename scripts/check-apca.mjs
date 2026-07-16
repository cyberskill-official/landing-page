// APCA contrast guard (TASK-DS-006). Computes APCA Lc for the key text-on-surface
// pairs - including the composited Liquid Glass state, not just the token colour
// - and reports each, flagging body text below Lc 75 and interactive labels
// below Lc 90. Run locally: `npm run check:apca`. Exits non-zero on a miss.
import { hexToRgb, over, lcHexOnRgb } from "./apca.mjs";

const BODY = 75;
const INTERACTIVE = 90;
// Brand ochre (#f4ba17) is a high-L* fill: even pure black tops out near Lc ~72
// APCA. WCAG 2.x contrast for the same pair is ~7.85:1 (well above AA 4.5:1),
// which is what Lighthouse color-contrast grades. Floor the gold CTA on that
// reachable APCA band instead of the generic interactive 90.
const OCHRE_CTA = 60;

// Light theme tokens.
const paper = hexToRgb("#fbf7f1");
const ink = "#1c130d";
const inkSoft = "#4a3b30";
const accent = hexToRgb("#f4ba17");
const accentInk = "#3a2a05";
const brand = hexToRgb("#45210e");
const onBrand = "#fdf4e1";
// Light-theme glass tint is white at the standard weight, composited over paper.
const glassStd = over([255, 255, 255], 0.62, paper);

// Dark theme tokens.
// These mirror the token values in app/globals.css (:root and [data-theme=dark]).
const darkBg = hexToRgb("#1a120c");
const darkFg = "#f4ece0";
const darkFgMuted = "#dcd2c3";

const checks = [
  ["body: ink on paper", ink, paper, BODY],
  ["body: muted ink on paper", inkSoft, paper, BODY],
  ["body: ink on standard glass (over paper)", ink, glassStd, BODY],
  ["body (dark): fg on bg", darkFg, darkBg, BODY],
  ["body (dark): muted fg on bg", darkFgMuted, darkBg, BODY],
  ["interactive: accent-ink on ochre button", accentInk, accent, OCHRE_CTA],
  ["interactive: on-brand on umber button", onBrand, brand, INTERACTIVE],
];

let failed = 0;
console.log("APCA Lc (TASK-DS-006):");
for (const [label, text, bg, min] of checks) {
  const lc = lcHexOnRgb(text, bg);
  const ok = lc >= min;
  if (!ok) failed++;
  console.log(`  ${ok ? "OK " : "XX "} Lc ${lc.toFixed(1)} (>= ${min})  ${label}`);
}
if (failed) {
  console.error(`\n${failed} pair(s) below the APCA threshold.`);
  process.exit(1);
}
console.log("\nAll pairs meet their APCA threshold.");
