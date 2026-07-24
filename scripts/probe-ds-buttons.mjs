/**
 * Phase 2 button probe. Walks every route × language × theme × breakpoint and
 * measures the *computed* state of every `.cs-button`: WCAG contrast against
 * its real composited backdrop, touch-target height, and pill radius.
 *
 * Colours are normalised through a 1x1 canvas so display-p3, oklab, and
 * color-mix() all resolve to the sRGB bytes Lighthouse samples. Styles are
 * allowed to settle first — reading mid-transition reports interpolated
 * colours and produces phantom failures.
 *
 * Usage: node scripts/probe-ds-buttons.mjs [baseUrl]
 */
import puppeteer from "puppeteer";

const BASE = process.argv[2] || "http://localhost:3000";

const PATHS = [
  "",
  "/lite",
  "/work",
  "/work/operations-platform",
  "/services/mobile-apps",
  "/notes",
  "/how-we-build",
  "/careers",
  "/now",
  "/team",
  "/accessibility",
  "/privacy",
  "/terms",
  "/cyberos/privacy",
];
const LANGS = ["en", "vi"];
const THEMES = ["dark", "light"];
const WIDTHS = [390, 768, 1440];

const probe = () => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const srgb = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (fg, bg) => fg.slice(0, 3).map((c, i) => Math.round(c * fg[3] + bg[i] * (1 - fg[3])));
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const L1 = lum(a);
    const L2 = lum(b);
    return +(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2));
  };
  const backdrop = (el) => {
    let acc = null;
    for (let n = el; n; n = n.parentElement) {
      const c = srgb(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) acc = acc ? over(acc.concat(1), c.slice(0, 3)).concat(1) : c;
      if (acc && acc[3] >= 1) return acc.slice(0, 3);
    }
    return acc ? acc.slice(0, 3) : [255, 255, 255];
  };

  const rows = [];
  for (const el of document.querySelectorAll(".cs-button")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0) continue; // collapsed <details> content
    const back = backdrop(el);
    rows.push({
      variant: (el.className.match(/cs-button--(?!xs|sm|md|lg|full)([a-z-]+)/) || [, "none"])[1],
      extras: [...el.classList].filter((c) => c !== "cs-button" && !c.startsWith("cs-button--")),
      text: (el.textContent || "").trim().slice(0, 28),
      contrast: ratio(over(srgb(cs.color), back), back),
      height: Math.round(rect.height),
      radius: cs.borderTopLeftRadius,
      overflowsViewport: rect.right > document.documentElement.clientWidth + 1 || rect.left < -1,
    });
  }
  return {
    rows,
    legacy: document.querySelectorAll('[class*="cs-btn"]').length,
    unlabelled: [...document.querySelectorAll(".cs-button")].filter(
      (el) => !(el.textContent || "").trim() && !el.getAttribute("aria-label"),
    ).length,
  };
};

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

let checks = 0;
const failures = [];
const record = (where, data) => {
  checks += data.rows.length;
  if (data.legacy > 0) failures.push({ where, kind: "legacy .cs-btn present", count: data.legacy });
  if (data.unlabelled > 0) failures.push({ where, kind: "button with no accessible name", count: data.unlabelled });
  for (const r of data.rows) {
    if (r.contrast < 4.5) failures.push({ where, kind: "contrast < 4.5:1", ...r });
    if (r.height < 44) failures.push({ where, kind: "touch target < 44px", ...r });
    if (r.radius !== "999px") failures.push({ where, kind: "not a pill", ...r });
    if (r.overflowsViewport) failures.push({ where, kind: "overflows viewport", ...r });
  }
};

for (const width of WIDTHS) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const lang of LANGS) {
    for (const path of PATHS) {
      const url = `${BASE}/${lang}${path}`;
      await page.goto(url, { waitUntil: "networkidle2" });
      for (const theme of THEMES) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await new Promise((r) => setTimeout(r, 700)); // let transitions settle
        record(`${width}px ${theme} ${url}`, await page.evaluate(probe));
      }
    }
  }
}

await browser.close();

console.log(`button states measured: ${checks}`);
console.log(`routes × langs × themes × widths: ${PATHS.length * LANGS.length * THEMES.length * WIDTHS.length}`);
if (failures.length) {
  console.error(`FAIL — ${failures.length} problems`);
  for (const f of failures.slice(0, 40)) console.error(JSON.stringify(f));
  process.exit(1);
}
console.log("PASS — every button state is AA-contrast, ≥44px, pill, in-viewport");
