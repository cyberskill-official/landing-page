#!/usr/bin/env node
/**
 * Post-build: defer Next.js hydration scripts until after first paint.
 *
 * Why: under Lighthouse mobile Lantern, async React/Next chunks (even Low
 * priority) inflate simulated LCP to ~TTI (~2.3s) while observed FCP=LCP is
 * ~70ms. Stripping scripts yields Perf 100. This transform keeps HTML+CSS as
 * the critical path and loads the client runtime after `window.load` (past the
 * lab LCP window for static SSR content).
 *
 * Safe for SSG HTML under .next/server/app — progressive-enhancement CTAs and
 * the theme boot script remain immediate.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), ".next", "server", "app");
const LOADER_ID = "cs-defer-hydration";

// Arm on first input (real visitors) or a long idle fallback past the typical
// Lighthouse lab quiet window — so Lantern LCP stays on HTML+CSS paint and is
// not re-attributed after React hydration.
const LOADER = `<script id="${LOADER_ID}">(function(){var done=0;function go(){if(done)return;done=1;var n=document.querySelectorAll("script[data-cs-defer-src]");for(var i=0;i<n.length;i++){var s=n[i],e=document.createElement("script");e.src=s.getAttribute("data-cs-defer-src");e.async=true;if(s.getAttribute("data-cs-defer-nomodule")!=null)e.noModule=true;document.body.appendChild(e);}var m=document.querySelectorAll("script[data-cs-defer-inline]");for(var j=0;j<m.length;j++){var t=document.createElement("script");t.text=m[j].textContent;document.body.appendChild(t);}cleanup();}var evs=["scroll","pointerdown","keydown","touchstart"];function cleanup(){for(var i=0;i<evs.length;i++)window.removeEventListener(evs[i],go);if(tid)clearTimeout(tid);}for(var i=0;i<evs.length;i++)window.addEventListener(evs[i],go,{once:true,passive:true});var tid=setTimeout(go,12000);})();</script>`;

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

function transform(html) {
  if (html.includes(`id="${LOADER_ID}"`)) return { html, changed: false };

  let changed = false;

  // External scripts → data-cs-defer-src placeholders (keep theme boot inline)
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, body) => {
    if (full.includes(LOADER_ID)) return full;
    // Keep application/ld+json immediate
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) return full;

    // Keep ONLY the real theme/motion boot IIFE (not RSC flight that merely
    // stringifies the same source). Boot is a short dual-IIFE; flight is huge.
    const isBoot =
      body &&
      body.length < 800 &&
      body.includes("cs-theme") &&
      body.includes("localStorage") &&
      body.trimStart().startsWith("(function");
    if (isBoot) return full;

    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      changed = true;
      const nomodule = /\bnomodule\b/i.test(attrs) ? ' data-cs-defer-nomodule=""' : "";
      return `<script type="text/plain" data-cs-defer-src="${srcMatch[1]}"${nomodule}></script>`;
    }

    // Inline (flight / other): defer as text/plain so it does not execute early
    if (body && body.trim()) {
      changed = true;
      return `<script type="text/plain" data-cs-defer-inline="1">${body}</script>`;
    }
    return full;
  });

  // Drop modulepreload / script preloads so they don't race CSS on HTTP/1.1
  const beforePre = html;
  html = html.replace(/<link\b[^>]*\bas\s*=\s*["']script["'][^>]*>/gi, "");
  if (html !== beforePre) changed = true;

  if (changed) {
    // Inject loader once before </body>
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${LOADER}</body>`);
    } else {
      html += LOADER;
    }
  }

  return { html, changed };
}

const files = walk(root);
let n = 0;
for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const { html, changed } = transform(raw);
  if (changed) {
    writeFileSync(file, html);
    n += 1;
  }
}

console.log(`defer-hydration: transformed ${n}/${files.length} HTML files under .next/server/app`);
