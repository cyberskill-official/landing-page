// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");

/** Every production source file — the gates below scan the whole set, not a sample. */
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

// Variants and sizes the package declares (components/button/Button.d.ts).
const DS_VARIANTS = ["primary", "secondary", "tertiary", "ghost", "danger", "danger-ghost"];
const DS_SIZES = ["xs", "sm", "md", "lg"];
const DS_MODIFIERS = [...DS_VARIANTS, ...DS_SIZES, "full"];

// Lumi storytelling modifiers that are allowed to ride on a `.cs-button` root.
const LOCAL_MODIFIERS = [
  "cs-cta-lumi",
  "cs-lumi-alt",
  "cs-wish-go",
  "cs-header-cta",
  "cs-footer-verify-btn",
];

// Wrappers that put their `className` onto a design-system button root, so a
// class named there is a local modifier and must be in the allowlist too.
const BUTTON_WRAPPERS = ["LeadCta", "GenieOpenButton", "DesignSystemButton"];

describe("Phase 2: buttons come from @cyberskill/design", () => {
  it("no production source keeps a .cs-btn class", () => {
    const offenders = sourceFiles().filter((f) => /cs-btn/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => f.slice(root.length + 1))).toEqual([]);
  });

  it("consumes the official package export — no alias to a raw .jsx file", () => {
    const reexport = readFileSync(resolve(root, "lib/design-system/button.tsx"), "utf8");
    expect(reexport).toMatch(/from "@cyberskill\/design"/);
    expect(reexport).not.toMatch(/@cyberskill\/design\/button/);

    for (const config of ["next.config.ts", "tsconfig.json", "vitest.config.ts"]) {
      const text = readFileSync(resolve(root, config), "utf8");
      expect(text, `${config} must not alias the package`).not.toMatch(/@cyberskill\/design\/button/);
      expect(text, `${config} must not point at Button.jsx`).not.toMatch(/Button\.jsx/);
    }

    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    // npm's 1.0.0 tarball predates the React entry and registry versions are
    // immutable, so the pin is a commit on the public design-system repo.
    expect(pkg.dependencies["@cyberskill/design"]).toMatch(
      /^github:cyberskill-official\/design-system#[0-9a-f]{40}$/,
    );

    const installed = JSON.parse(
      readFileSync(resolve(root, "node_modules/@cyberskill/design/package.json"), "utf8"),
    );
    expect(installed.exports["."].import).toBe("./_esm/react.mjs");
    expect(installed.exports["./react"].import).toBe("./_esm/react.mjs");
  });

  it("drops the in-repo Button primitive", () => {
    expect(existsSync(resolve(root, "components/ui/Button.tsx"))).toBe(false);
  });

  it("only uses modifiers the package declares", () => {
    const used = new Set<string>();
    for (const file of sourceFiles()) {
      for (const [, mod] of readFileSync(file, "utf8").matchAll(/cs-button--([a-z-]+)/g)) {
        used.add(mod);
      }
    }
    expect([...used].filter((m) => !DS_MODIFIERS.includes(m))).toEqual([]);
    // The sweep must actually have landed the roles Lumi needs.
    for (const variant of ["primary", "secondary", "tertiary", "ghost"]) {
      expect(used, `no call site uses cs-button--${variant}`).toContain(variant);
    }
  });

  it("keeps Lumi extras to a documented set of local modifiers", () => {
    const extras = new Set<string>();
    const collect = (value: string) => {
      for (const cls of value.split(/\s+/).filter(Boolean)) {
        if (cls !== "cs-button" && !cls.startsWith("cs-button--")) extras.add(cls);
      }
    };
    for (const file of sourceFiles().filter((f) => f.endsWith(".tsx"))) {
      const text = readFileSync(file, "utf8");
      // Literal DS button roots.
      for (const [, value] of text.matchAll(/className="(cs-button[^"]*)"/g)) collect(value);
      // Wrappers forward className onto a DS button root, so those count too.
      for (const wrapper of BUTTON_WRAPPERS) {
        for (const [, props] of text.matchAll(
          new RegExp(`<${wrapper}\\b([^>]*)>`, "gs"),
        )) {
          const cls = props.match(/className="([^"]*)"/);
          if (cls) collect(cls[1]);
        }
      }
    }
    expect([...extras].filter((c) => !LOCAL_MODIFIERS.includes(c))).toEqual([]);
    // The allowlist must not rot: every documented modifier is still styled.
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    for (const mod of LOCAL_MODIFIERS) {
      expect(css, `${mod} is allowlisted but unstyled`).toMatch(new RegExp(`\\.${mod}\\b`));
    }
  });

  it("ships a Phase 2 decision note that explains both deviations and the pin", () => {
    const note = readFileSync(
      resolve(root, "docs/decisions/2026-07-25-lumi-ds-phase2-buttons.md"),
      "utf8",
    );
    expect(note).toMatch(/Phase 2/);
    expect(note).toMatch(/--cs-component-button-radius/);
    expect(note).toMatch(/--cs-component-button-primary-bg/);
    expect(note).toMatch(/immutable/);
    for (const mod of LOCAL_MODIFIERS) expect(note, `${mod} is undocumented`).toContain(mod);

    const readme = readFileSync(resolve(root, "README.md"), "utf8");
    expect(readme).toContain("2026-07-25-lumi-ds-phase2-buttons.md");
    expect(readme).not.toMatch(/Deferred:.*\.cs-btn/);
  });

  it("expresses the Lumi pill + ochre CTA through package component tokens", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    expect(css).toMatch(/--cs-component-button-radius:\s*var\(--cs-radius-pill\)/);
    // Lumi never redefines a low-emphasis variant globally; the only overrides
    // allowed are context-scoped (e.g. inside the consent banner).
    expect(css).not.toMatch(/^\.cs-button--(secondary|tertiary|ghost)\s*\{/m);
  });
});
