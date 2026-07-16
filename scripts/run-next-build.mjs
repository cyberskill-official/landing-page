#!/usr/bin/env node
/**
 * Production build entry used by `npm run build`.
 *
 * 1. Runs `next build --webpack` with the HTML write-patch preloaded so Vercel's
 *    onBuildComplete snapshots already-deferred prerender HTML.
 * 2. Runs defer-hydration.mjs for Critters critical-CSS + multi-root gate.
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patch = join(root, "scripts/patch-html-writes.mjs");
const nextBin = join(root, "node_modules/next/dist/bin/next");
const defer = join(root, "scripts/defer-hydration.mjs");

const env = {
  ...process.env,
  // Ensure child inherits the import hook (and any existing NODE_OPTIONS)
  NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import ${patch}`].filter(Boolean).join(" "),
};

console.log("run-next-build: next build --webpack (with HTML write patch)");
const build = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
  cwd: root,
  env,
  stdio: "inherit",
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

console.log("run-next-build: defer-hydration post-pass (critical CSS + gates)");
const post = spawnSync(process.execPath, [defer], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});
process.exit(post.status ?? 1);
