#!/usr/bin/env node
/**
 * Post-build: (1) defer Next.js hydration scripts until after first paint,
 * (2) inline critical CSS via Critters so the full stylesheet is not
 * render-blocking under mobile Lantern.
 *
 * Fails the build if homepage HTML still has eager Next chunk scripts after
 * transform (so a silent no-op can never ship to production again).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  LOADER_ID,
  deferScripts,
  hasEagerNextScripts,
} from "./defer-hydration-lib.mjs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const root = join(projectRoot, ".next", "server", "app");
const staticCssDir = join(projectRoot, ".next", "static", "css");

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

async function inlineCriticalCss(html) {
  let Critters;
  try {
    Critters = require("critters");
  } catch {
    return { html, inlined: false, reason: "critters-missing" };
  }

  if (!existsSync(staticCssDir)) {
    return { html, inlined: false, reason: "no-css-dir" };
  }

  try {
    const critters = new Critters({
      path: projectRoot,
      publicPath: "/",
      preload: "media",
      inlineFonts: false,
      compress: true,
      pruneSource: false,
      reduceInlineStyles: true,
      mergeStylesheets: true,
      external: true,
      logLevel: "error",
    });

    // Next emits href="/_next/static/css/x.css" but files live at
    // .next/static/css/x.css on disk. Rewrite for Critters filesystem lookup.
    const rewritten = html.replace(
      /href="\/_next\/static\/css\/([^"]+)"/g,
      'href=".next/static/css/$1"',
    );

    let out = await critters.process(rewritten);
    // Restore public URLs for anything Critters left as filesystem paths.
    out = out.replace(/href="\.next\/static\/css\/([^"]+)"/g, 'href="/_next/static/css/$1"');
    out = out.replace(/url\(\.next\/static\/css\//g, "url(/_next/static/css/");
    out = out.replace(/\.next\/static\/css\//g, "/_next/static/css/");

    // Critters can emit the same non-blocking stylesheet link twice; keep one.
    const seenLinks = new Set();
    out = out.replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/stylesheet/i.test(tag) && !/as=["']style["']/i.test(tag)) return tag;
      const key = tag.replace(/\s+/g, " ").trim();
      if (seenLinks.has(key)) return "";
      seenLinks.add(key);
      return tag;
    });

    // Ensure noscript fallback when stylesheet is media=print + onload.
    if (
      /media=["']print["'][^>]*onload=/i.test(out) &&
      !/<noscript>[\s\S]*stylesheet[\s\S]*<\/noscript>/i.test(out)
    ) {
      const hrefMatch = out.match(/href="(\/_next\/static\/css\/[^"]+)"/);
      if (hrefMatch) {
        const noscript = `<noscript><link rel="stylesheet" href="${hrefMatch[1]}"></noscript>`;
        if (out.includes("</head>")) {
          out = out.replace("</head>", `${noscript}</head>`);
        }
      }
    }

    const hasInline = /<style[^>]*>[\s\S]{200,}<\/style>/i.test(out);
    return { html: out, inlined: hasInline, reason: hasInline ? "ok" : "no-inline-block" };
  } catch (err) {
    return {
      html,
      inlined: false,
      reason: `critters-error:${err && err.message ? err.message : String(err)}`,
    };
  }
}

async function main() {
  const files = walk(root);
  if (files.length === 0) {
    console.warn("defer-hydration: no HTML under .next/server/app — skip");
    return;
  }

  let n = 0;
  let crittersOk = 0;
  let crittersFail = 0;
  const reasons = new Map();

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const deferred = deferScripts(raw);
    let html = deferred.html;

    if (deferred.changed || deferred.already || html.includes(LOADER_ID)) {
      const { html: next, inlined, reason } = await inlineCriticalCss(html);
      html = next;
      reasons.set(reason, (reasons.get(reason) || 0) + 1);
      if (inlined) crittersOk += 1;
      else crittersFail += 1;
    }

    if (html !== raw) {
      writeFileSync(file, html);
      n += 1;
    }
  }

  console.log(
    `defer-hydration: transformed ${n}/${files.length} HTML files; critical-css inlined ${crittersOk}, skipped ${crittersFail}`,
  );
  if (reasons.size) {
    console.log(
      "defer-hydration: critters reasons:",
      [...reasons.entries()].map(([k, v]) => `${k}=${v}`).join(", "),
    );
  }

  const homepageCandidates = [join(root, "en.html"), join(root, "vi.html")].filter((p) =>
    existsSync(p),
  );

  if (homepageCandidates.length === 0) {
    console.error("defer-hydration: FAIL — en.html/vi.html missing after build");
    process.exit(1);
  }

  for (const home of homepageCandidates) {
    const html = readFileSync(home, "utf8");
    if (!html.includes(LOADER_ID)) {
      console.error(`defer-hydration: FAIL — ${home} missing #${LOADER_ID}`);
      process.exit(1);
    }
    if (hasEagerNextScripts(html)) {
      console.error(
        `defer-hydration: FAIL — ${home} still has eager /_next/static/chunks script tags`,
      );
      process.exit(1);
    }
  }

  console.log("defer-hydration: homepage gate OK");
}

main().catch((err) => {
  console.error("defer-hydration: fatal", err);
  process.exit(1);
});
