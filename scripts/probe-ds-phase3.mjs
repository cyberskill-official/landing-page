/**
 * Phase 3 surface probe. Confirms package field / tag / card contracts are
 * present on the migrated routes across language × theme × breakpoint.
 *
 * Complements scripts/probe-ds-buttons.mjs (Phase 2). Does not invent new
 * contrast claims — presence + class contracts only.
 *
 * Usage: node scripts/probe-ds-phase3.mjs [baseUrl]
 */
import puppeteer from "puppeteer";

const BASE = process.argv[2] || "http://localhost:3000";

const PATHS = [
  { path: "", expect: { field: false, tag: false, card: true } }, // home contact Card aside
  { path: "/work", expect: { field: false, tag: true, card: false } },
  { path: "/work/operations-platform", expect: { field: false, tag: true, card: false } },
  { path: "/services/mobile-apps", expect: { field: false, tag: true, card: false } },
  { path: "/careers", expect: { field: false, tag: false, card: true } },
];
const LANGS = ["en", "vi"];
const THEMES = ["dark", "light"];
const WIDTHS = [390, 1440];

const probe = (expect) => {
  const fields = document.querySelectorAll(".cs-field").length;
  const tags = document.querySelectorAll(".cs-tag").length;
  const cards = document.querySelectorAll(".cs-card").length;
  const legacyFieldWrappers = [...document.querySelectorAll(".cs-field")].filter(
    (el) => el.tagName === "DIV" && !el.classList.contains("cs-check"),
  ).length;
  return {
    fields,
    tags,
    cards,
    legacyFieldWrappers,
    okField: !expect.field || fields > 0,
    okTag: !expect.tag || tags > 0,
    okCard: !expect.card || cards > 0,
  };
};

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

let checks = 0;
const failures = [];

for (const width of WIDTHS) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const lang of LANGS) {
    for (const { path, expect } of PATHS) {
      const url = `${BASE}/${lang}${path}`;
      await page.goto(url, { waitUntil: "networkidle2" });
      for (const theme of THEMES) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await new Promise((r) => setTimeout(r, 400));
        const data = await page.evaluate(probe, expect);
        checks += 1;
        const where = `${width}px ${theme} ${url}`;
        if (!data.okField) failures.push({ where, kind: "expected .cs-field", ...data });
        if (!data.okTag) failures.push({ where, kind: "expected .cs-tag", ...data });
        if (!data.okCard) failures.push({ where, kind: "expected .cs-card", ...data });
        // Package TextField roots are <label class="cs-field">, not bare div wrappers.
        if (data.legacyFieldWrappers > 0) {
          failures.push({ where, kind: "legacy div.cs-field wrappers", ...data });
        }
      }
    }
  }
}

await browser.close();

console.log(`phase3 surface checks: ${checks}`);
console.log(
  `routes × langs × themes × widths: ${PATHS.length * LANGS.length * THEMES.length * WIDTHS.length}`,
);
if (failures.length) {
  console.error(`FAIL — ${failures.length} problems`);
  for (const f of failures.slice(0, 40)) console.error(JSON.stringify(f));
  process.exit(1);
}
console.log("PASS — Phase 3 field/tag/card contracts present on migrated routes");
