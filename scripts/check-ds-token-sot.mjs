/**
 * Phase 4 token SoT gate.
 *
 * Walks every custom-property *assignment* in `app/globals.css` and fails if
 * any name collides with a package token from `@cyberskill/design/tokens/*`,
 * except the documented allowlist (button component tokens + Display-P3 umber).
 *
 * Storytelling *aliases* (`--cs-color-fg`, …) are fine — they are not package
 * names. Local extensions that the package never declares (e.g. `--cs-space-32`)
 * are also fine.
 *
 * Usage: node scripts/check-ds-token-sot.mjs
 * Exit 0 = PASS, 1 = FAIL.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = resolve(root, "node_modules/@cyberskill/design/tokens");

/** Package token names Lumi may assign in globals — see keep-local inventory. */
const ALLOWLIST = new Set([
  // Display-P3 richer umber on capable displays (sRGB hex remains package SoT).
  "--cs-color-brand-umber",
  // Phase 2: Lumi pill + pinned gold CTA through package *component* tokens.
  "--cs-component-button-radius",
  "--cs-component-button-primary-bg",
  "--cs-component-button-primary-fg",
]);

function packageTokenNames() {
  const names = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        // Skip native / JSON exports — CSS custom properties live in *.css.
        if (entry === "native") continue;
        walk(full);
        continue;
      }
      if (!entry.endsWith(".css")) continue;
      const text = readFileSync(full, "utf8");
      for (const m of text.matchAll(/--cs-[a-z0-9-]+/g)) names.add(m[0]);
    }
  };
  walk(tokensDir);
  return names;
}

function globalsAssignments(css) {
  const assigned = new Set();
  // Match `--cs-*: …` declarations (not `var(--cs-*)` references).
  for (const m of css.matchAll(/(?:^|[{\s;])(--cs-[a-z0-9-]+)\s*:/gm)) {
    assigned.add(m[1]);
  }
  return assigned;
}

const pkg = packageTokenNames();
const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
const assigned = globalsAssignments(css);

const offenders = [...assigned]
  .filter((name) => pkg.has(name) && !ALLOWLIST.has(name))
  .sort();

if (offenders.length) {
  console.error("FAIL — globals.css redefines package semantic tokens:");
  for (const name of offenders) console.error(`  ${name}`);
  console.error(
    "Documented allowlist only:",
    [...ALLOWLIST].sort().join(", "),
  );
  process.exit(1);
}

// Allowlist must not rot: every entry must still be assigned in globals.
const missing = [...ALLOWLIST].filter((name) => !assigned.has(name)).sort();
if (missing.length) {
  console.error(
    "FAIL — allowlisted override missing from globals.css (rot):",
    missing.join(", "),
  );
  process.exit(1);
}

console.log(
  `PASS — token SoT: ${assigned.size} globals assignments, ${pkg.size} package names, ${ALLOWLIST.size} documented overrides`,
);
