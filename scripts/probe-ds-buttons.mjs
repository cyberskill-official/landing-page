/**
 * Phase 2 button probe. Walks every route × language × theme × breakpoint and
 * measures the *computed* state of every `.cs-button`: WCAG contrast against
 * an alpha-correct composite of solid `background-color` layers, touch-target
 * height, and pill radius.
 *
 * Backdrop math preserves each layer’s alpha (Porter-Duff source-over) and
 * flattens onto opaque white — see `scripts/wcag-contrast.mjs` (unit-tested).
 * The in-page copies below must stay in sync with that module. Gradients /
 * background-images are not sampled; when present on a still-translucent stack
 * the row is flagged `backdropApproximate` so the AA claim is not oversold.
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
  "/cyberos/content-policy",
];
const LANGS = ["en", "vi"];
const THEMES = ["dark", "light"];
const WIDTHS = [390, 768, 1440];

/** In-page probe. Compositing helpers mirror scripts/wcag-contrast.mjs. */
const probe = () => {
  const overRgba = (fg, bg) => {
    const fa = fg[3];
    const ba = bg[3];
    const a = fa + ba * (1 - fa);
    if (a <= 0) return [0, 0, 0, 0];
    return [
      Math.round((fg[0] * fa + bg[0] * ba * (1 - fa)) / a),
      Math.round((fg[1] * fa + bg[1] * ba * (1 - fa)) / a),
      Math.round((fg[2] * fa + bg[2] * ba * (1 - fa)) / a),
      a,
    ];
  };
  const flattenOpaque = (rgba, fallbackRgb = [255, 255, 255]) => {
    if (rgba[3] >= 1) return rgba.slice(0, 3);
    return overRgba(rgba, [...fallbackRgb, 1]).slice(0, 3);
  };
  const compositeSolidLayers = (layersNearToFar, fallbackRgb = [255, 255, 255]) => {
    let acc = [0, 0, 0, 0];
    for (const layer of layersNearToFar) {
      if (layer[3] > 0) acc = overRgba(acc, layer);
      if (acc[3] >= 1) break;
    }
    return flattenOpaque(acc, fallbackRgb);
  };
  const relativeLuminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrastRatio = (a, b) => {
    const L1 = relativeLuminance(a);
    const L2 = relativeLuminance(b);
    return +(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2));
  };

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
  const backdrop = (el) => {
    const layers = [];
    let sawImage = false;
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") sawImage = true;
      const c = srgb(cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      let acc = [0, 0, 0, 0];
      for (const layer of layers) {
        acc = overRgba(acc, layer);
        if (acc[3] >= 1) {
          // Opaque solid stack — images behind it cannot show through.
          return { rgb: acc.slice(0, 3), approximate: false };
        }
      }
    }
    return {
      rgb: compositeSolidLayers(layers),
      approximate: sawImage,
    };
  };

  const rows = [];
  for (const el of document.querySelectorAll(".cs-button")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0) continue; // collapsed <details> content
    const { rgb: back, approximate } = backdrop(el);
    const fg = flattenOpaque(overRgba(srgb(cs.color), [...back, 1]), back);
    rows.push({
      variant: (el.className.match(/cs-button--(?!xs|sm|md|lg|full)([a-z-]+)/) || [, "none"])[1],
      extras: [...el.classList].filter((c) => c !== "cs-button" && !c.startsWith("cs-button--")),
      text: (el.textContent || "").trim().slice(0, 28),
      contrast: contrastRatio(fg, back),
      height: Math.round(rect.height),
      radius: cs.borderTopLeftRadius,
      overflowsViewport: rect.right > document.documentElement.clientWidth + 1 || rect.left < -1,
      backdropApproximate: approximate,
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
    if (r.backdropApproximate) {
      console.warn(JSON.stringify({ where, kind: "backdrop uses gradient/image; solid-layer AA only", ...r }));
    }
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
console.log(`PATHS.length: ${PATHS.length}`);
if (failures.length) {
  console.error(`FAIL — ${failures.length} problems`);
  for (const f of failures.slice(0, 40)) console.error(JSON.stringify(f));
  process.exit(1);
}
console.log("PASS — every button state is AA-contrast (solid-layer composite), ≥44px, pill, in-viewport");
