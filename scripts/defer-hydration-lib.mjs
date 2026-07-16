/**
 * Pure transform helpers for post-build HTML (scripts + critical CSS).
 * Imported by defer-hydration.mjs and unit tests.
 */

export const LOADER_ID = "cs-defer-hydration";

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

export function hasEagerNextScripts(html) {
  return /<script(?![^>]*type=["']text\/plain["'])[^>]*\ssrc=["'][^"']*\/_next\/static\/chunks\//i.test(
    html,
  );
}
