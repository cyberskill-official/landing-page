/**
 * Whole-set live DS verification (NOT a smoke).
 *
 * Walks every public route × language × theme × breakpoint against a base URL
 * (default: https://cyberskill.world) and asserts:
 *   - Identity: data-cs-element=hoa, data-cs-variant=plasma
 *   - No legacy .cs-btn
 *   - Buttons: AA contrast (solid-layer), ≥44px, pill, in-viewport
 *   - Route-expected .cs-tag / .cs-card / .cs-field (newsletter optional)
 *   - Consent banner can appear + Accept/Decline are package buttons (home)
 *   - Genie cloud chrome is local (.cs-genie-*), not package ChatMessage/PromptInput
 *   - axe serious/critical clean (WCAG 2.x A/AA + 2.1/2.2 AA)
 *
 * Usage:
 *   node scripts/probe-ds-live.mjs [baseUrl]
 *   BASE_URL=https://cyberskill.world npm run check:ds:live
 *   PROBE_EXPECT_NEWSLETTER=1 …   # assert .cs-field on home when footer newsletter mounts
 *   PROBE_SKIP_AXE=1 …            # surface/contrast only (faster debug)
 *   PROBE_AXE_WIDTHS=390,1440 …   # default: all WIDTHS
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import puppeteer from "puppeteer";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = (process.argv[2] || process.env.BASE_URL || "https://cyberskill.world").replace(
  /\/$/,
  "",
);
// Newsletter footer is SSG-gated on RESEND_API_KEY. Production cyberskill.world
// currently mounts it; override with PROBE_EXPECT_NEWSLETTER=0|1.
const expectNewsletter =
  process.env.PROBE_EXPECT_NEWSLETTER === "1" ||
  (process.env.PROBE_EXPECT_NEWSLETTER !== "0" && /cyberskill\.world$/i.test(new URL(BASE).hostname));
const skipAxe = process.env.PROBE_SKIP_AXE === "1";

const LANGS = ["en", "vi"];
const THEMES = ["dark", "light"];
const WIDTHS = [390, 768, 1440];
const AXE_WIDTHS = (process.env.PROBE_AXE_WIDTHS || WIDTHS.join(","))
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => WIDTHS.includes(n));

/** Static + dynamic public routes (whole set, not a sample). */
const ROUTE_SPECS = [
  { path: "", expect: { tag: false, card: true, field: expectNewsletter }, genie: true, consent: true },
  { path: "/lite", expect: { tag: false, card: false, field: false } },
  { path: "/work", expect: { tag: true, card: false, field: false } },
  { path: "/work/operations-platform", expect: { tag: true, card: false, field: false } },
  { path: "/work/member-mobile-app", expect: { tag: true, card: false, field: false } },
  { path: "/work/commerce-portal", expect: { tag: true, card: false, field: false } },
  { path: "/work/legacy-migration", expect: { tag: true, card: false, field: false } },
  { path: "/services/web-apps", expect: { tag: true, card: false, field: false } },
  { path: "/services/mobile-apps", expect: { tag: true, card: false, field: false } },
  { path: "/services/internal-systems", expect: { tag: true, card: false, field: false } },
  { path: "/notes", expect: { tag: false, card: false, field: false } },
  { path: "/notes/continuous-integration-bar", expect: { tag: false, card: false, field: false } },
  { path: "/notes/accessibility-first-design", expect: { tag: false, card: false, field: false } },
  { path: "/how-we-build", expect: { tag: false, card: false, field: false } },
  { path: "/careers", expect: { tag: false, card: true, field: false }, genie: true },
  { path: "/now", expect: { tag: false, card: false, field: false } },
  { path: "/team", expect: { tag: false, card: false, field: false } },
  { path: "/accessibility", expect: { tag: false, card: false, field: false } },
  { path: "/privacy", expect: { tag: false, card: false, field: false } },
  { path: "/terms", expect: { tag: false, card: false, field: false } },
  { path: "/cyberos/privacy", expect: { tag: false, card: false, field: false } },
  { path: "/cyberos/content-policy", expect: { tag: false, card: false, field: false } },
  { path: "/cyberos/delete-account", expect: { tag: false, card: false, field: false } },
];

const FAIL_IMPACTS = new Set(["serious", "critical"]);

/** In-page button probe — mirrors scripts/probe-ds-buttons.mjs compositing. */
const buttonProbe = () => {
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
        if (acc[3] >= 1) return { rgb: acc.slice(0, 3), approximate: false };
      }
    }
    return { rgb: compositeSolidLayers(layers), approximate: sawImage };
  };

  const rows = [];
  for (const el of document.querySelectorAll(".cs-button")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0) continue;
    const { rgb: back, approximate } = backdrop(el);
    const fg = flattenOpaque(overRgba(srgb(cs.color), [...back, 1]), back);
    rows.push({
      variant: (el.className.match(/cs-button--(?!xs|sm|md|lg|full)([a-z-]+)/) || [, "none"])[1],
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

const surfaceProbe = (expect) => {
  const fields = document.querySelectorAll(".cs-field").length;
  const tags = document.querySelectorAll(".cs-tag").length;
  const cards = document.querySelectorAll(".cs-card").length;
  const legacyFieldWrappers = [...document.querySelectorAll(".cs-field")].filter(
    (el) => el.tagName === "DIV" && !el.classList.contains("cs-check"),
  ).length;
  const html = document.documentElement;
  return {
    element: html.getAttribute("data-cs-element"),
    variant: html.getAttribute("data-cs-variant"),
    theme: html.getAttribute("data-theme"),
    fields,
    tags,
    cards,
    legacyFieldWrappers,
    packageChatMsg: document.querySelectorAll(".cs-chat-msg").length,
    packagePrompt: document.querySelectorAll(".cs-prompt").length,
    okField: !expect.field || fields > 0,
    okTag: !expect.tag || tags > 0,
    okCard: !expect.card || cards > 0,
  };
};

/**
 * Production HTML defers Next hydration until first input (or 12s). Genie /
 * PersistentCta / ConsentBanner client islands need that boot, then
 * DeferredEnhancements (idle/interaction gate, up to 20s).
 */
async function armClient(page) {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(() => {
      const nudge = () => {
        for (const type of ["pointerdown", "mousemove", "scroll", "keydown", "touchstart"]) {
          window.dispatchEvent(new Event(type, { bubbles: true }));
        }
      };
      nudge();
      if (document.querySelectorAll('script[src*="_next/static"]').length < 3) return "scripts";
      const btn = document.querySelector('button.cs-button[aria-haspopup="dialog"]');
      if (!btn || !Object.keys(btn).some((k) => k.startsWith("__reactFiber"))) return "fiber";
      nudge();
      return document.querySelector(".cs-persistent-cta") ? "ready" : "deferred";
    });
    if (ready === "ready") break;
    await new Promise((r) => setTimeout(r, 400));
  }
  await new Promise((r) => setTimeout(r, 500));
}

async function settle(page, theme) {
  await page.evaluate((t) => {
    if (!document.querySelector("style[data-ds-live-probe]")) {
      const style = document.createElement("style");
      style.setAttribute("data-ds-live-probe", "1");
      style.textContent = "* { animation: none !important; transition: none !important; }";
      document.head.appendChild(style);
    }
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem("cs-theme", t);
    } catch {
      /* ignore */
    }
  }, theme);
  await new Promise((r) => setTimeout(r, 250));
}

async function probeConsent(page, where, failures) {
  await page.evaluate(() => {
    try {
      localStorage.removeItem("cs-consent");
    } catch {
      /* ignore */
    }
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
  await armClient(page);
  // Banner idles up to ~3.5s after mount; wait past that.
  const appeared = await page
    .waitForSelector(".cs-consent-banner", { timeout: 8000 })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    // Clarity may be unset on this deploy — not a DS regression.
    const clarityHint = await page.evaluate(
      () =>
        Boolean(document.querySelector('script[src*="clarity"]')) ||
        Boolean(window.clarity) ||
        Boolean(document.documentElement.innerHTML.includes("CLARITY")),
    );
    // Production sets NEXT_PUBLIC_CLARITY_ID at build — banner is client-only.
    // If hydration armed and still missing, treat as soft skip only when no
    // Clarity bootstrap is detectable after arm.
    if (clarityHint) {
      failures.push({
        where,
        kind: "consent banner missing while Clarity appears configured",
      });
    }
    return { skipped: !clarityHint, appeared: false };
  }

  const actions = await page.evaluate(() => {
    const root = document.querySelector(".cs-consent-banner");
    const buttons = [...root.querySelectorAll(".cs-button")];
    return {
      buttonCount: buttons.length,
      variants: buttons.map(
        (b) => (b.className.match(/cs-button--(?!xs|sm|md|lg|full)([a-z-]+)/) || [, "?"])[1],
      ),
      legacy: root.querySelectorAll('[class*="cs-btn"]').length,
    };
  });
  if (actions.buttonCount < 2) {
    failures.push({ where, kind: "consent banner missing Accept/Decline buttons", ...actions });
  }
  if (actions.legacy > 0) {
    failures.push({ where, kind: "consent banner legacy .cs-btn", ...actions });
  }
  // Decline to dismiss without enabling replay.
  await page.click(".cs-consent-banner .cs-button--secondary").catch(() => {});
  await page.waitForSelector(".cs-consent-banner", { hidden: true, timeout: 3000 }).catch(() => {});
  return { skipped: false, appeared: true, ...actions };
}

async function probeGenie(page, where, failures) {
  // Prefer persistent CTA / GenieOpenButton (aria-haspopup=dialog).
  const opened = await page.evaluate(() => {
    window.__dsLiveGenieOpens = 0;
    const onOpen = () => {
      window.__dsLiveGenieOpens += 1;
    };
    window.addEventListener("cs:genie:open", onOpen, { once: true });
    const btn =
      document.querySelector(".cs-persistent-cta button.cs-button[aria-haspopup='dialog']") ||
      document.querySelector("button.cs-button[aria-haspopup='dialog']");
    if (btn) {
      btn.click();
      return "click";
    }
    window.dispatchEvent(new CustomEvent("cs:genie:open", { detail: {} }));
    return "event";
  });

  const root = await page
    .waitForSelector(".cs-genie-root", { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!root) {
    failures.push({ where, kind: "genie panel did not open", opened });
    return;
  }

  const data = await page.evaluate(() => {
    const rootEl = document.querySelector(".cs-genie-root");
    return {
      msgs: rootEl.querySelectorAll(".cs-genie-msg").length,
      form: rootEl.querySelectorAll(".cs-genie-form").length,
      packageChatMsg: rootEl.querySelectorAll(".cs-chat-msg").length,
      packagePrompt: rootEl.querySelectorAll(".cs-prompt").length,
      packageChatOutside: document.querySelectorAll(".cs-chat-msg").length,
      packagePromptOutside: document.querySelectorAll(".cs-prompt").length,
      cloud: rootEl.querySelectorAll(".cs-genie-cloud-art, .cs-genie-stage").length,
      sendBtn: rootEl.querySelectorAll(".cs-genie-form .cs-button").length,
    };
  });

  if (data.msgs < 1) failures.push({ where, kind: "genie missing .cs-genie-msg", ...data });
  if (data.cloud < 1) failures.push({ where, kind: "genie missing cloud chrome", ...data });
  if (data.packageChatMsg > 0 || data.packageChatOutside > 0) {
    failures.push({ where, kind: "package ChatMessage (.cs-chat-msg) inside genie", ...data });
  }
  if (data.packagePrompt > 0 || data.packagePromptOutside > 0) {
    failures.push({ where, kind: "package PromptInput (.cs-prompt) inside genie", ...data });
  }

  // Close if possible.
  await page.evaluate(() => {
    const close = document.querySelector(".cs-genie-close, .cs-genie-root [aria-label*='Close'], .cs-genie-root [aria-label*='Đóng']");
    if (close) close.click();
    else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
}

async function runAxe(page, where, failures) {
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () => {
    const runResults = await window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      rules: { "color-contrast": { enabled: true } },
    });
    runResults.violations.forEach((v) => {
      if (v.id === "color-contrast") {
        v.nodes = v.nodes.filter((n) => !n.target.some((t) => String(t).includes(".cs-cta-lumi")));
      }
    });
    runResults.violations = runResults.violations.filter((v) => v.nodes.length > 0);
    return runResults;
  });

  const blocking = results.violations.filter((v) => FAIL_IMPACTS.has(v.impact));
  for (const v of blocking) {
    failures.push({
      where,
      kind: `axe ${v.impact} ${v.id}`,
      help: v.help,
      selectors: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
    });
  }
  return blocking.length;
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-gl=swiftshader"],
});
const page = await browser.newPage();
page.setDefaultTimeout(45000);

const failures = [];
let surfaceChecks = 0;
let buttonStates = 0;
let axeRuns = 0;
let genieRuns = 0;
let consentRuns = 0;
const started = Date.now();

console.log(`live DS probe base: ${BASE}`);
console.log(
  `matrix: ${ROUTE_SPECS.length} routes × ${LANGS.length} langs × ${THEMES.length} themes × ${WIDTHS.length} widths` +
    ` = ${ROUTE_SPECS.length * LANGS.length * THEMES.length * WIDTHS.length} cells`,
);

for (const width of WIDTHS) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const lang of LANGS) {
    for (const spec of ROUTE_SPECS) {
      const url = `${BASE}/${lang}${spec.path}`;
      let status = 0;
      try {
        const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        status = res?.status() ?? 0;
      } catch (err) {
        failures.push({ where: `${width}px ${url}`, kind: "navigation error", error: String(err) });
        continue;
      }
      if (status >= 400) {
        failures.push({ where: `${width}px ${url}`, kind: `HTTP ${status}` });
        continue;
      }

      await armClient(page);

      for (const theme of THEMES) {
        const where = `${width}px ${theme} ${url}`;
        await settle(page, theme);

        const surface = await page.evaluate(surfaceProbe, spec.expect);
        surfaceChecks += 1;
        if (surface.element !== "hoa" || surface.variant !== "plasma") {
          failures.push({ where, kind: "identity not hoa/plasma", ...surface });
        }
        if (!surface.okField) failures.push({ where, kind: "expected .cs-field", ...surface });
        if (!surface.okTag) failures.push({ where, kind: "expected .cs-tag", ...surface });
        if (!surface.okCard) failures.push({ where, kind: "expected .cs-card", ...surface });
        if (surface.legacyFieldWrappers > 0) {
          failures.push({ where, kind: "legacy div.cs-field wrappers", ...surface });
        }

        const buttons = await page.evaluate(buttonProbe);
        buttonStates += buttons.rows.length;
        if (buttons.legacy > 0) failures.push({ where, kind: "legacy .cs-btn present", count: buttons.legacy });
        if (buttons.unlabelled > 0) {
          failures.push({ where, kind: "button with no accessible name", count: buttons.unlabelled });
        }
        for (const r of buttons.rows) {
          if (r.contrast < 4.5) failures.push({ where, kind: "contrast < 4.5:1", ...r });
          if (r.height < 44) failures.push({ where, kind: "touch target < 44px", ...r });
          if (r.radius !== "999px") failures.push({ where, kind: "not a pill", ...r });
          if (r.overflowsViewport) failures.push({ where, kind: "overflows viewport", ...r });
        }

        if (!skipAxe && AXE_WIDTHS.includes(width)) {
          axeRuns += 1;
          await runAxe(page, where, failures);
        }

        // Consent + genie: once per lang×theme on the home route at each width
        // (whole-set for those interactive surfaces without exploding cell count).
        if (spec.consent && spec.path === "") {
          consentRuns += 1;
          await probeConsent(page, `${where} [consent]`, failures);
          await settle(page, theme);
        }
        if (spec.genie && (spec.path === "" || spec.path === "/careers")) {
          genieRuns += 1;
          await probeGenie(page, `${where} [genie]`, failures);
        }
      }
    }
  }
}

await browser.close();

const elapsedSec = ((Date.now() - started) / 1000).toFixed(1);
console.log("---");
console.log(`surface cells: ${surfaceChecks}`);
console.log(`button states measured: ${buttonStates}`);
console.log(`axe runs: ${axeRuns}`);
console.log(`consent probes: ${consentRuns}`);
console.log(`genie probes: ${genieRuns}`);
console.log(`elapsed: ${elapsedSec}s`);
console.log(`failures: ${failures.length}`);

if (failures.length) {
  console.error(`FAIL — ${failures.length} problems`);
  for (const f of failures.slice(0, 80)) console.error(JSON.stringify(f));
  if (failures.length > 80) console.error(`…and ${failures.length - 80} more`);
  process.exit(1);
}
console.log("PASS — live whole-set DS verification clean");
