/**
 * Preload hook for next build on Vercel.
 *
 * Snapshots HTML during next build with:
 *   - deferred Next chunk scripts
 *   - app CSS inlined (no render-blocking external stylesheet, no late-CSS CLS)
 *
 * Critical first-paint CSS is also SSR-inlined via app/layout.tsx (#cs-critical).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  transformPrerenderHtml,
  hasEagerNextScripts,
  hasBlockingAppStylesheet,
} from "./defer-hydration-lib.mjs";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = path.join(projectRoot, ".next", "static", "css");

let cachedCss = null;
let cachedCssMtime = 0;

function loadBuiltCss() {
  try {
    if (!fs.existsSync(cssDir)) return "";
    const files = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
    if (!files.length) return "";
    // Prefer largest (main app bundle)
    let best = files[0];
    let bestSize = 0;
    for (const f of files) {
      const st = fs.statSync(path.join(cssDir, f));
      if (st.size > bestSize) {
        bestSize = st.size;
        best = f;
      }
    }
    const full = path.join(cssDir, best);
    const st = fs.statSync(full);
    if (cachedCss !== null && st.mtimeMs === cachedCssMtime) return cachedCss;
    cachedCss = fs.readFileSync(full, "utf8");
    cachedCssMtime = st.mtimeMs;
    return cachedCss;
  } catch {
    return "";
  }
}

function isAppHtmlPath(filePath) {
  if (typeof filePath !== "string") return false;
  if (!filePath.endsWith(".html")) return false;
  const norm = filePath.replace(/\\/g, "/");
  return norm.includes("/.next/server/app/") || norm.includes(".next/server/app/");
}

function shouldTransform(filePath, data) {
  if (!isAppHtmlPath(filePath)) return false;
  if (typeof data !== "string") return false;
  if (!data.includes("<html") && !data.includes("<HTML")) return false;
  if (hasEagerNextScripts(data)) return true;
  if (hasBlockingAppStylesheet(data)) return true;
  if (data.includes("/_next/static/chunks/") && !data.includes("data-cs-defer-src")) {
    return true;
  }
  return false;
}

function transform(data) {
  try {
    return transformPrerenderHtml(data, loadBuiltCss()).html;
  } catch (err) {
    console.warn("[patch-html-writes] transform failed:", err && err.message);
    return data;
  }
}

function wrapWriteSync(orig) {
  return function patchedWriteFileSync(file, data, options) {
    if (shouldTransform(file, data)) {
      data = transform(data);
    }
    return orig.call(this, file, data, options);
  };
}

function wrapWriteAsync(orig) {
  return function patchedWriteFile(file, data, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = undefined;
    }
    if (shouldTransform(file, data)) {
      data = transform(data);
    }
    if (callback === undefined) {
      return orig.call(this, file, data, options);
    }
    return orig.call(this, file, data, options, callback);
  };
}

function wrapPromisesWrite(orig) {
  return async function patchedPromisesWriteFile(file, data, options) {
    const asString =
      typeof data === "string" ? data : Buffer.isBuffer(data) ? data.toString("utf8") : null;
    if (asString !== null && shouldTransform(String(file), asString)) {
      const next = transform(asString);
      data = typeof data === "string" ? next : Buffer.from(next, "utf8");
    }
    return orig.call(this, file, data, options);
  };
}

fs.writeFileSync = wrapWriteSync(fs.writeFileSync.bind(fs));
fs.writeFile = wrapWriteAsync(fs.writeFile.bind(fs));
if (fs.promises?.writeFile) {
  fs.promises.writeFile = wrapPromisesWrite(fs.promises.writeFile.bind(fs.promises));
}

const origCreateWriteStream = fs.createWriteStream.bind(fs);
fs.createWriteStream = function patchedCreateWriteStream(file, options) {
  const stream = origCreateWriteStream(file, options);
  if (typeof file === "string" && file.endsWith(".html") && isAppHtmlPath(file)) {
    const origEnd = stream.end.bind(stream);
    const origWrite = stream.write.bind(stream);
    let buf = "";
    let intercept = true;
    stream.write = function (chunk, encoding, cb) {
      if (!intercept) return origWrite(chunk, encoding, cb);
      if (typeof chunk === "string") buf += chunk;
      else if (Buffer.isBuffer(chunk))
        buf += chunk.toString(typeof encoding === "string" ? encoding : "utf8");
      else return origWrite(chunk, encoding, cb);
      if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();
      return true;
    };
    stream.end = function (chunk, encoding, cb) {
      if (chunk) {
        if (typeof chunk === "string") buf += chunk;
        else if (Buffer.isBuffer(chunk)) buf += chunk.toString("utf8");
      }
      if (intercept && buf && shouldTransform(file, buf)) {
        buf = transform(buf);
      }
      intercept = false;
      return origEnd(buf, "utf8", typeof encoding === "function" ? encoding : cb);
    };
  }
  return stream;
};

console.log(
  "[patch-html-writes] active — defer scripts + inline app CSS on .next/server/app HTML writes",
);
