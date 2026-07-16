/**
 * Pure transform helpers for prerender HTML (scripts + non-blocking CSS).
 * Imported by defer-hydration.mjs, patch-html-writes.mjs, and unit tests.
 */

export const LOADER_ID = "cs-defer-hydration";
export const CRITICAL_STYLE_ID = "cs-critical";
export const CSS_NOSCRIPT_ID = "cs-css-noscript";

export const LOADER = `<script id="${LOADER_ID}">(function(){var done=0;function go(){if(done)return;done=1;var n=document.querySelectorAll("script[data-cs-defer-src]");for(var i=0;i<n.length;i++){var s=n[i],e=document.createElement("script");e.src=s.getAttribute("data-cs-defer-src");e.async=true;if(s.getAttribute("data-cs-defer-nomodule")!=null)e.noModule=true;document.body.appendChild(e);}var m=document.querySelectorAll("script[data-cs-defer-inline]");for(var j=0;j<m.length;j++){var t=document.createElement("script");t.text=m[j].textContent;document.body.appendChild(t);}cleanup();}var evs=["scroll","pointerdown","keydown","touchstart"];function cleanup(){for(var i=0;i<evs.length;i++)window.removeEventListener(evs[i],go);if(tid)clearTimeout(tid);}for(var i=0;i<evs.length;i++)window.addEventListener(evs[i],go,{once:true,passive:true});var tid=setTimeout(go,12000);})();</script>`;

export function deferScripts(html) {
  if (html.includes(`id="${LOADER_ID}"`)) {
    return { html, changed: false, already: true };
  }

  let changed = false;

  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, body) => {
    if (full.includes(LOADER_ID)) return full;
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) return full;

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

    if (body && body.trim()) {
      changed = true;
      return `<script type="text/plain" data-cs-defer-inline="1">${body}</script>`;
    }
    return full;
  });

  const beforePre = html;
  html = html.replace(/<link\b[^>]*\bas\s*=\s*["']script["'][^>]*>/gi, "");
  if (html !== beforePre) changed = true;

  if (changed) {
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${LOADER}</body>`);
    } else {
      html += LOADER;
    }
  }

  return { html, changed, already: false };
}

/**
 * Inline the built app CSS into the document and drop external
 * /_next/static/css links. Eliminates render-blocking CSS without the
 * media=print swap CLS (late full stylesheet restyling main#main ~0.9).
 *
 * @param {string} html
 * @param {string} [cssText] minified/built CSS file contents
 */
export function inlineAppStylesheet(html, cssText) {
  if (!cssText || typeof cssText !== "string" || cssText.length < 100) {
    return { html, changed: false };
  }
  if (html.includes(`id="cs-full-inline"`) || html.includes(`id='cs-full-inline'`)) {
    return { html, changed: false };
  }

  let changed = false;
  const before = html;
  // Remove external app stylesheet links (and our noscript fallback if any)
  html = html.replace(/<link\b[^>]*\/_next\/static\/css\/[^>]*>/gi, () => {
    changed = true;
    return "";
  });
  html = html.replace(
    new RegExp(`<noscript\\b[^>]*id=["']${CSS_NOSCRIPT_ID}["'][^>]*>[\\s\\S]*?<\\/noscript>`, "gi"),
    () => {
      changed = true;
      return "";
    },
  );

  // Escape </style> in CSS content
  const safe = cssText.replace(/<\/style/gi, "<\\/style");
  const tag = `<style id="cs-full-inline">${safe}</style>`;
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${tag}</head>`);
    changed = true;
  } else if (html.includes("<body")) {
    html = html.replace(/<body\b[^>]*>/i, (m) => `${tag}${m}`);
    changed = true;
  }

  if (html === before) return { html, changed: false };
  return { html, changed };
}

/** @deprecated use inlineAppStylesheet — kept for tests/compat name */
export function makeStylesheetsNonBlocking(html, cssText) {
  return inlineAppStylesheet(html, cssText);
}

export function hasEagerNextScripts(html) {
  return /<script(?![^>]*type=["']text\/plain["'])[^>]*\ssrc=["'][^"']*\/_next\/static\/chunks\//i.test(
    html,
  );
}

export function hasBlockingAppStylesheet(html) {
  // Ignore noscript fallbacks — those only apply when JS is off
  const stripped = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  // Any remaining external /_next/static/css stylesheet is render-blocking
  // (media=print swap was abandoned due to CLS when full CSS arrived).
  if (/<link\b[^>]*\/_next\/static\/css\/[^>]*>/i.test(stripped)) {
    // Allow preload-as=style without rel=stylesheet
    const re = /<link\b([^>]*)>/gi;
    let m;
    while ((m = re.exec(stripped))) {
      const attrs = m[1];
      if (!/\/_next\/static\/css\//i.test(attrs)) continue;
      if (/rel\s*=\s*["']stylesheet["']/i.test(attrs)) return true;
      if (/data-precedence/i.test(attrs) && /href\s*=/i.test(attrs)) return true;
    }
  }
  return false;
}

export function hasCriticalCss(html) {
  // Prefer explicit SSR marker; Critters may drop the id but leave a large inline block
  if (
    html.includes(`id="${CRITICAL_STYLE_ID}"`) ||
    html.includes(`id='${CRITICAL_STYLE_ID}'`) ||
    /<style[^>]*id=["']cs-critical["'][^>]*>[\s\S]{200,}<\/style>/i.test(html)
  ) {
    return true;
  }
  // Substantial first-paint style block in the document head region
  return /<style[^>]*>[\s\S]{800,}<\/style>/i.test(html);
}

/**
 * Full prerender transform: defer scripts + inline app CSS.
 * @param {string} html
 * @param {string} [cssText]
 */
export function transformPrerenderHtml(html, cssText) {
  let out = html;
  let changed = false;
  const d = deferScripts(out);
  out = d.html;
  changed = changed || d.changed;
  if (cssText) {
    const s = inlineAppStylesheet(out, cssText);
    out = s.html;
    changed = changed || s.changed;
  }
  return { html: out, changed };
}
