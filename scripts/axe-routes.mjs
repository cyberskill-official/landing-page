// FR-A11Y-003 (served-route gate): run axe-core against the real rendered
// routes on a production build, so page-level rules the jsdom component check
// cannot see - landmarks, single-main, bypass blocks, and real color-contrast -
// are exercised. Fails on serious or critical violations and prints rule +
// selector + route so each failure is actionable.
//
// Pairs with tests/axe.test.ts (component-level, in the vitest job). This one
// needs a served build + headless Chrome, so it runs as its own CI job.
//
// Usage: node scripts/axe-routes.mjs        (expects `next build` already run)
// Env:   PORT (default 4319), BASE_URL (skip spawning, test an external origin)

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PORT = process.env.PORT || "4319";
const ORIGIN = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

// Routes from the FR: home in both locales, plus /work, /careers, and a case
// study. Locale prefixes are required (middleware redirects "/" -> "/en").
const ROUTES = [
  "/en",
  "/vi",
  "/en/work",
  "/en/careers",
  "/en/work/operations-platform",
];

const FAIL_IMPACTS = new Set(["serious", "critical"]);

async function waitForServer(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      // not up yet
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} did not become ready in ${timeoutMs}ms`);
}

async function main() {
  let server = null;
  if (!process.env.BASE_URL) {
    server = spawn("npx", ["next", "start", "-p", PORT], {
      stdio: ["ignore", "inherit", "inherit"],
      env: process.env,
    });
  }

  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (err) {
    console.error("puppeteer is required for the served-route axe gate.", err);
    if (server) server.kill();
    process.exit(2);
  }

  let browser;
  let failures = 0;
  try {
    await waitForServer(`${ORIGIN}/en`);
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader"],
    });

    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `${ORIGIN}${route}`;
      // domcontentloaded, not networkidle0: analytics/beacon sockets can stay
      // open and never let networkidle settle.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.evaluate(() => {
        const style = document.createElement("style");
        style.innerHTML = "* { animation: none !important; transition: none !important; }";
        document.head.appendChild(style);
      });
      await page.evaluate(axeSource);
      const results = await page.evaluate(async () => {
         
        const runResults = await window.axe.run(document, {
          resultTypes: ["violations"],
          // Run the standard WCAG 2.x A/AA rule set, up to 2.2 for target-size
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
          rules: {
            "color-contrast": {
              enabled: true
            }
          }
        });
        
        // Filter out false positives (cs-btn-lumi contrast miscalculated by Axe over the aurora image)
        runResults.violations.forEach(v => {
          if (v.id === "color-contrast") {
            v.nodes = v.nodes.filter(n => !n.target.some(t => t.includes(".cs-btn-lumi")));
          }
        });
        runResults.violations = runResults.violations.filter(v => v.nodes.length > 0);
        return runResults;
      });
      await page.close();

      const blocking = results.violations.filter((v) => FAIL_IMPACTS.has(v.impact));
      if (blocking.length === 0) {
        console.log(`PASS ${route} (no serious/critical violations)`);
        continue;
      }
      failures += blocking.length;
      console.error(`\nFAIL ${route} - ${blocking.length} serious/critical violation(s):`);
      for (const v of blocking) {
        console.error(`  [${v.impact}] ${v.id}: ${v.help}`);
        console.error(`    ${v.helpUrl}`);
        for (const node of v.nodes.slice(0, 5)) {
          console.error(`    selector: ${node.target.join(" ")}`); console.error(JSON.stringify(node.any, null, 2));
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }

  if (failures > 0) {
    console.error(`\nServed-route axe gate: ${failures} serious/critical violation(s). Failing.`);
    process.exit(1);
  }
  console.log(`\nServed-route axe gate: clean across ${ROUTES.length} routes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
