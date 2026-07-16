/**
 * Preload hook for next build on Vercel.
 *
 * Vercel Next onBuildComplete runs during next build and snapshots prerender
 * HTML into the deploy artifact before any post-build script can rewrite
 * files under .next/server/app. Production then serves the un-deferred
 * snapshot even though the post-build gate passes on disk.
 *
 * This module patches fs write APIs so every HTML write under
 * .next/server/app is deferred as it is written, so the snapshot already
 * has data-cs-defer-src plus the idle/interaction loader.
 *
 * Usage:
 *   node --import ./scripts/patch-html-writes.mjs node_modules/next/dist/bin/next build --webpack
 */
import fs from "node:fs";
import path from "node:path";
import { deferScripts } from "./defer-hydration-lib.mjs";

function shouldTransform(filePath, data) {
  if (typeof filePath !== "string") return false;
  if (!filePath.endsWith(".html")) return false;
  // Match both absolute and relative Next output paths
  const norm = filePath.replace(/\\/g, "/");
  if (!norm.includes("/.next/server/app/") && !norm.includes(".next/server/app/")) {
    return false;
  }
  if (typeof data !== "string") return false;
  if (!data.includes("<script") && !data.includes("<SCRIPT")) return false;
  // Already transformed
  if (data.includes("cs-defer-hydration") || data.includes("data-cs-defer-src")) {
    return false;
  }
  return true;
}

function transform(data) {
  try {
    return deferScripts(data).html;
  } catch (err) {
    console.warn("[patch-html-writes] deferScripts failed:", err && err.message);
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
    // writeFile(path, data, cb) or writeFile(path, data, options, cb)
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
    if (shouldTransform(String(file), typeof data === "string" ? data : data?.toString?.())) {
      if (typeof data === "string") data = transform(data);
      else if (Buffer.isBuffer(data)) data = Buffer.from(transform(data.toString("utf8")), "utf8");
    }
    return orig.call(this, file, data, options);
  };
}

// Sync
fs.writeFileSync = wrapWriteSync(fs.writeFileSync.bind(fs));
// Callback async
fs.writeFile = wrapWriteAsync(fs.writeFile.bind(fs));
// Promises API
if (fs.promises?.writeFile) {
  fs.promises.writeFile = wrapPromisesWrite(fs.promises.writeFile.bind(fs.promises));
}

// Stream writes (some pipelines use createWriteStream + end(data))
const origCreateWriteStream = fs.createWriteStream.bind(fs);
fs.createWriteStream = function patchedCreateWriteStream(file, options) {
  const stream = origCreateWriteStream(file, options);
  if (typeof file === "string" && file.endsWith(".html")) {
    const origEnd = stream.end.bind(stream);
    const origWrite = stream.write.bind(stream);
    let buf = "";
    let intercept = true;
    stream.write = function (chunk, encoding, cb) {
      if (!intercept) return origWrite(chunk, encoding, cb);
      if (typeof chunk === "string") buf += chunk;
      else if (Buffer.isBuffer(chunk)) buf += chunk.toString(typeof encoding === "string" ? encoding : "utf8");
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

console.log("[patch-html-writes] active — deferring .next/server/app HTML on write");
