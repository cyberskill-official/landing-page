#!/usr/bin/env node
// Static verification gate (runs in CI before typecheck/build, and locally via
// `npm run verify`). It catches the failure modes that do not need installed
// dependencies: unresolved `@/` path-alias imports and malformed JSON. It is a
// fast pre-flight, NOT a substitute for `tsc --noEmit` and `next build`.

import { readFileSync, readdirSync, statSync, lstatSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const exts = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
/** Product source only — agent harness / plugin trees are not app imports. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "docs",
  ".cyberos-memory",
  ".awh",
  "public",
  ".claude",
  ".grok",
  ".agents",
  ".codex",
  ".commandcode",
  ".opencode",
  ".cyberos",
]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    let s;
    try {
      // lstat first so broken symlinks do not throw ENOENT on stat()
      const ls = lstatSync(p);
      if (ls.isSymbolicLink()) {
        // Skip dangling agent skill links (targets often live under ignored .cyberos/)
        try {
          s = statSync(p);
        } catch {
          continue;
        }
      } else {
        s = ls;
      }
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) acc.push(p);
  }
  return acc;
}

function resolvesAlias(spec) {
  const base = join(root, spec.replace(/^@\//, ""));
  const candidates = [base, ...exts.map((x) => base + x), ...exts.map((x) => join(base, "index" + x))];
  return candidates.some(existsSync);
}

let problems = 0;
let scanned = 0;
const importRe = /(?:from\s+|import\(\s*)["'](@\/[^"']+)["']/g;

for (const file of walk(root)) {
  scanned += 1;
  const src = readFileSync(file, "utf8");
  let m;
  while ((m = importRe.exec(src))) {
    if (!resolvesAlias(m[1])) {
      console.error(`unresolved import: ${m[1]}  <-  ${file.replace(root + "/", "")}`);
      problems += 1;
    }
  }
}

for (const jsonFile of ["package.json", "tsconfig.json", "lighthouse/budget.json"]) {
  try {
    JSON.parse(readFileSync(join(root, jsonFile), "utf8"));
  } catch (e) {
    console.error(`invalid JSON: ${jsonFile} (${e.message})`);
    problems += 1;
  }
}

console.log(`verify-static: scanned ${scanned} source files; ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
