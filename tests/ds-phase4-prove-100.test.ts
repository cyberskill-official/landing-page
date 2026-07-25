// @vitest-environment node
/**
 * Phase 4 — prove “100% DS adoption for what maps”.
 * Whole-tree / whole-contract gates (not spot checks). Complements
 * ds-phase1/2/3 tests and scripts/check-ds-token-sot.mjs.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(tsx|ts|css)$/.test(entry)) {
        out.push(full);
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(resolve(root, dir));
  return out;
}

const LOCAL_BUTTON_MODIFIERS = [
  "cs-cta-lumi",
  "cs-lumi-alt",
  "cs-wish-go",
  "cs-header-cta",
  "cs-footer-verify-btn",
];

const DS_WRAPPERS = [
  "lib/design-system/button.tsx",
  "lib/design-system/forms.tsx",
  "lib/design-system/tag.tsx",
  "lib/design-system/card.tsx",
  "lib/design-system/icon.tsx",
];

describe("Phase 4: 100% DS adoption for what maps", () => {
  it("no production .cs-btn classNames remain", () => {
    const offenders = sourceFiles().filter((f) => /cs-btn/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });

  it("consumes the official package React export — no Button.jsx alias", () => {
    for (const rel of DS_WRAPPERS) {
      const text = readFileSync(resolve(root, rel), "utf8");
      expect(text, rel).toMatch(/from "@cyberskill\/design"/);
      expect(text, rel).not.toMatch(/@cyberskill\/design\/button/);
      expect(text, rel).not.toMatch(/Button\.jsx/);
    }
    for (const config of ["next.config.ts", "tsconfig.json", "vitest.config.ts"]) {
      const text = readFileSync(resolve(root, config), "utf8");
      expect(text, config).not.toMatch(/@cyberskill\/design\/button/);
      expect(text, config).not.toMatch(/Button\.jsx/);
    }
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.dependencies["@cyberskill/design"]).toMatch(
      /^github:cyberskill-official\/design-system#[0-9a-f]{40}$/,
    );
    const installed = JSON.parse(
      readFileSync(resolve(root, "node_modules/@cyberskill/design/package.json"), "utf8"),
    );
    expect(installed.exports["."].import).toBe("./_esm/react.mjs");
  });

  it("semantic tokens are not redefined in globals beyond the documented bridge", () => {
    // Whole-set collision scan against the installed package token sheets.
    expect(() =>
      execFileSync(process.execPath, [resolve(root, "scripts/check-ds-token-sot.mjs")], {
        cwd: root,
        encoding: "utf8",
      }),
    ).not.toThrow();
  });

  it("package.json exposes the Phase 4 token + adoption scripts", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts["check:ds:tokens"]).toBe("node scripts/check-ds-token-sot.mjs");
    expect(pkg.scripts["check:ds:buttons"]).toMatch(/probe-ds-buttons/);
    expect(pkg.scripts["check:ds:phase3"]).toMatch(/probe-ds-phase3/);
    expect(pkg.scripts["check:ds:phase4"]).toMatch(/check-ds-token-sot/);
  });

  it("ships keep-local inventory, coverage report, and migration summary", () => {
    const inventory = readFileSync(
      resolve(root, "docs/ds-keep-local-inventory.md"),
      "utf8",
    );
    expect(inventory).toMatch(/DS-owned/);
    expect(inventory).toMatch(/keep.?local/i);
    for (const mod of LOCAL_BUTTON_MODIFIERS) {
      expect(inventory, `${mod} undocumented`).toContain(mod);
    }
    expect(inventory).toMatch(/cs-genie-/);
    expect(inventory).toMatch(/Space Grotesk/);
    expect(inventory).toMatch(/components\/canvas/);
    expect(inventory).toMatch(/LAUNCH/);

    const coverage = readFileSync(resolve(root, "docs/ds-coverage-report.md"), "utf8");
    expect(coverage).toMatch(/100%/);
    expect(coverage).toMatch(/git.?pin|github:cyberskill-official/i);
    expect(coverage).toMatch(/LAUNCH/);

    const summary = readFileSync(
      resolve(root, "docs/decisions/2026-07-25-lumi-ds-migration-complete.md"),
      "utf8",
    );
    expect(summary).toMatch(/Phase 0|Phase 1|Phase 2|Phase 3|Phase 4/);
    expect(summary).toMatch(/2026-07-24-cyberskill-design-package\.md/);
    expect(summary).toMatch(/2026-07-25-lumi-ds-phase1-fonts-tokens\.md/);
    expect(summary).toMatch(/2026-07-25-lumi-ds-phase2-buttons\.md/);
    expect(summary).toMatch(/2026-07-25-lumi-ds-phase3-forms-polish\.md/);
    expect(summary).toMatch(/ds-keep-local-inventory\.md/);
    expect(summary).toMatch(/ds-coverage-report\.md/);
  });

  it("README documents how Lumi consumes DS and drops the Phase 4 deferral", () => {
    const readme = readFileSync(resolve(root, "README.md"), "utf8");
    expect(readme).toMatch(/How Lumi consumes/);
    expect(readme).toContain("2026-07-25-lumi-ds-migration-complete.md");
    expect(readme).toContain("ds-keep-local-inventory.md");
    expect(readme).toContain("ds-coverage-report.md");
    expect(readme).not.toMatch(/Deferred:.*100%.*Phase 4/i);
    expect(readme).not.toMatch(/\*\*Deferred:\*\* the .100%. proof sweep/);
  });

  it("per-phase decision notes remain and point at the migration summary", () => {
    const notes = [
      "docs/decisions/2026-07-24-cyberskill-design-package.md",
      "docs/decisions/2026-07-25-lumi-ds-phase1-fonts-tokens.md",
      "docs/decisions/2026-07-25-lumi-ds-phase2-buttons.md",
      "docs/decisions/2026-07-25-lumi-ds-phase3-forms-polish.md",
    ];
    for (const rel of notes) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
      const text = readFileSync(resolve(root, rel), "utf8");
      expect(text, rel).toMatch(/lumi-ds-migration-complete\.md/);
    }
  });

  it("dead in-repo UI primitives stay deleted", () => {
    for (const name of ["Button", "Field", "Select", "Dialog", "Card"]) {
      expect(existsSync(resolve(root, `components/ui/${name}.tsx`)), name).toBe(false);
    }
    expect(existsSync(resolve(root, "lib/icons/index.ts"))).toBe(false);
  });
});
