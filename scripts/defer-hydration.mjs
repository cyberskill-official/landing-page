#!/usr/bin/env node
/**
 * Post-build: (1) defer Next.js hydration scripts until after first paint,
 * (2) inline critical CSS via Critters so the full stylesheet is not
 * render-blocking under mobile Lantern.
 *
 * On Vercel, `@vercel/next` onBuildComplete may copy prerender HTML into
 * `/vercel/output` *before* this script runs (still during `next build`).
 * Transforming only `.next/server/app` then leaves production serving the
 * pre-transform copy. We therefore transform every HTML tree we can find:
 *   - `.next/server/app`
 *   - `/vercel/output` (Vercel Build Output API)
 *   - `.vercel/output` (local `vercel build`)
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
const nextAppHtmlRoot = join(projectRoot, ".next", "server", "app");
const staticCssDir = join(projectRoot, ".next", "static", "css");

function walkHtml(dir, acc = []) {
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
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Roots that may hold prerendered HTML (Next + Vercel packaging). */
function collectHtmlRoots() {
  const roots = [nextAppHtmlRoot];
  const vercelCandidates = [
    "/vercel/output",
    join(projectRoot, ".vercel/output"),
    join(projectRoot, "vercel/output"),
  ];
  for (const c of vercelCandidates) {
    if (existsSync(c)) roots.push(c);
  }
  return roots;
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

    // Next emits href="/_next/static/css/x.css" (sometimes with ?dpl=…).
    // Files live at .next/static/css/x.css on disk.
    const rewritten = html
      .replace(/href="\/_next\/static\/css\/([^"?]+)(?:\?[^"]*)?"/g, 'href=".next/static/css/$1"')
      .replace(/href="[^"]*\/_next\/static\/css\/([^"?]+)(?:\?[^"]*)?"/g, (full, file) => {
        // already rewritten or absolute — only rewrite public paths
        if (full.includes(".next/static/css/")) return full;
        return `href=".next/static/css/${file}"`;
      });

    let out = await critters.process(rewritten);
    out = out.replace(/href="\.next\/static\/css\/([^"]+)"/g, 'href="/_next/static/css/$1"');
    out = out.replace(/url\(\.next\/static\/css\//g, "url(/_next/static/css/");
    out = out.replace(/\.next\/static\/css\//g, "/_next/static/css/");

    const seenLinks = new Set();
    out = out.replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/stylesheet/i.test(tag) && !/as=["']style["']/i.test(tag)) return tag;
      // Ignore dpl query when deduping
      const key = tag
        .replace(/\?dpl=[^"&\s]*/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (seenLinks.has(key)) return "";
      seenLinks.add(key);
      return tag;
    });

    if (
      /media=["']print["'][^>]*onload=/i.test(out) &&
      !/<noscript>[\s\S]*stylesheet[\s\S]*<\/noscript>/i.test(out)
    ) {
      const hrefMatch = out.match(/href="(\/_next\/static\/css\/[^"?]+)/);
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

async function transformTree(rootDir) {
  const files = walkHtml(rootDir);
  if (files.length === 0) {
    return { rootDir, files: 0, transformed: 0, crittersOk: 0, crittersFail: 0, reasons: new Map() };
  }

  let transformed = 0;
  let crittersOk = 0;
  let crittersFail = 0;
  const reasons = new Map();

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    // Skip non-document HTML (unlikely) without scripts
    if (!raw.includes("<html") && !raw.includes("<HTML")) continue;

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
      transformed += 1;
    }
  }

  return {
    rootDir,
    files: files.length,
    transformed,
    crittersOk,
    crittersFail,
    reasons,
  };
}

function assertHomepageGate(rootDir) {
  // Prefer Next app paths; also accept flat /en.html under vercel output
  const candidates = [
    join(rootDir, "en.html"),
    join(rootDir, "vi.html"),
    join(rootDir, "static", "en.html"),
    join(rootDir, "static", "vi.html"),
    // Nested under server/app mirrors
    join(rootDir, "server", "app", "en.html"),
    join(rootDir, "server", "app", "vi.html"),
  ].filter((p) => existsSync(p));

  if (candidates.length === 0) {
    // Tree may be functions-only; not a hard fail for non-primary roots
    return { ok: true, skipped: true, rootDir };
  }

  for (const home of candidates) {
    const html = readFileSync(home, "utf8");
    if (!html.includes(LOADER_ID)) {
      return { ok: false, rootDir, home, reason: `missing #${LOADER_ID}` };
    }
    if (hasEagerNextScripts(html)) {
      return { ok: false, rootDir, home, reason: "eager /_next/static/chunks scripts remain" };
    }
  }
  return { ok: true, skipped: false, rootDir, homes: candidates };
}

async function main() {
  const roots = collectHtmlRoots();
  console.log(
    "defer-hydration: HTML roots:",
    roots.map((r) => `${r}${existsSync(r) ? "" : " (missing)"}`).join(", "),
  );

  let anyFiles = 0;
  for (const rootDir of roots) {
    const result = await transformTree(rootDir);
    anyFiles += result.files;
    console.log(
      `defer-hydration: ${rootDir} → files=${result.files} transformed=${result.transformed} critical-css ok=${result.crittersOk} skip=${result.crittersFail}`,
    );
    if (result.reasons.size) {
      console.log(
        "  critters:",
        [...result.reasons.entries()].map(([k, v]) => `${k}=${v}`).join(", "),
      );
    }
  }

  if (anyFiles === 0) {
    console.error("defer-hydration: FAIL — no HTML files found under any root");
    process.exit(1);
  }

  // Primary gate: Next app HTML must be clean (always present after next build).
  const primary = assertHomepageGate(nextAppHtmlRoot);
  if (!primary.ok) {
    console.error(`defer-hydration: FAIL — ${primary.home}: ${primary.reason}`);
    process.exit(1);
  }
  if (primary.skipped) {
    console.error("defer-hydration: FAIL — en.html/vi.html missing under .next/server/app");
    process.exit(1);
  }

  // Secondary gate: if Vercel already packaged output, that copy must also be deferred.
  for (const rootDir of roots) {
    if (rootDir === nextAppHtmlRoot) continue;
    const gate = assertHomepageGate(rootDir);
    if (!gate.ok) {
      console.error(`defer-hydration: FAIL — vercel output ${gate.home}: ${gate.reason}`);
      process.exit(1);
    }
    if (!gate.skipped) {
      console.log(`defer-hydration: vercel output gate OK (${rootDir})`);
    } else {
      // Search any en.html under this root
      const all = walkHtml(rootDir).filter((f) => f.endsWith("/en.html") || f.endsWith("/vi.html"));
      for (const home of all) {
        const html = readFileSync(home, "utf8");
        if (!html.includes(LOADER_ID) || hasEagerNextScripts(html)) {
          console.error(
            `defer-hydration: FAIL — ${home} not deferred after transform (vercel packaging race)`,
          );
          process.exit(1);
        }
      }
      if (all.length) {
        console.log(
          `defer-hydration: vercel output deep gate OK (${all.length} locale HTML files under ${rootDir})`,
        );
      } else {
        console.log(
          `defer-hydration: no locale HTML under ${rootDir} (adapter may store prerenders differently)`,
        );
      }
    }
  }

  console.log("defer-hydration: homepage gate OK");
}

main().catch((err) => {
  console.error("defer-hydration: fatal", err);
  process.exit(1);
});
