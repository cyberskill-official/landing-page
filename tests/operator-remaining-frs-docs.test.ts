import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Structural gates for human-mixed FRs that are proved by repo docs
 * (FR-BIZ-003 evidence path, FR-BIZ-004 nap-register, FR-BIZ-008 seo-log).
 * Does not mark FRs done — only that artefacts exist and stay wired.
 */

const root = process.cwd();

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

describe("docs/post-deploy-verification (BIZ-003 evidence path)", () => {
  it("keeps a dated BIZ-003 evidence file under docs/verification/", () => {
    const dir = path.join(root, "docs/verification");
    const files = fs.readdirSync(dir).filter((f) => f.includes("biz-003") || f.includes("BIZ-003"));
    expect(files.length).toBeGreaterThan(0);
    const body = read(path.join("docs/verification", files[0]!));
    expect(body).toMatch(/FR-BIZ-003|lead pipeline/i);
    expect(body).toMatch(/Resend|info@cyberskill\.world/i);
    // Configured sinks only — must not claim CyberOS row without BIZ-002
    expect(body.toLowerCase()).toMatch(/configured sink|resend-only|crm webhook/i);
  });
});

describe("docs/nap-register (BIZ-004)", () => {
  it("registers canonical NAP and listing rows from SSOT", () => {
    const body = read("docs/ops/nap-listings-register.md");
    const site = read("lib/content/site.ts");
    expect(body).toContain("Tan Dinh");
    expect(body).toMatch(/NAP|listings register/i);
    // Address on register matches site SSOT string
    const addr = site.match(/address:\s*"([^"]+)"/)?.[1];
    expect(addr).toBeTruthy();
    expect(body).toContain(addr!);
    expect(body).toMatch(/Google Business Profile|Google Play/i);
  });
});

describe("docs/seo-log (BIZ-008)", () => {
  it("provides Search Console setup checklist and monthly template", () => {
    const body = read("docs/ops/seo-monthly-log.md");
    expect(body).toMatch(/Search Console|sitemap\.xml/i);
    expect(body).toMatch(/Monthly 15-minute review/i);
    expect(body).toMatch(/cyberskill\.world/);
    expect(body).toMatch(/noindex|\/lite/i);
  });
});

describe("docs/a11y-manual (A11Y-008/014)", () => {
  it("ships operator checklists for screen reader and device labs", () => {
    const body = read("docs/verification/a11y-manual-checklist.md");
    expect(body).toMatch(/VoiceOver|NVDA/i);
    expect(body).toMatch(/FR-A11Y-008|FR-A11Y-014/);
    expect(body).toMatch(/prefers-reduced-motion|44px|contrast/i);
  });
});

describe("docs/profile-pack (BIZ-005)", () => {
  it("assembles directory profile pack from site SSOT", () => {
    const pack = read("docs/content/directory-profile-pack.md");
    const site = read("lib/content/site.ts");
    const addr = site.match(/address:\s*"([^"]+)"/)?.[1];
    expect(addr).toBeTruthy();
    expect(pack).toContain(addr!);
    expect(pack).toMatch(/utm_source=clutch|utm_source=goodfirms/i);
    expect(pack).toContain("Tan Dinh");
    expect(pack).toMatch(/Turn Your Will Into Real/);
    // Must not invent review counts
    expect(pack.toLowerCase()).not.toMatch(/we have \d+ reviews/);
    const register = read("docs/ops/directory-profiles-register.md");
    expect(register).toMatch(/Clutch|GoodFirms|DesignRush/i);
    expect(register).toContain("share.google");
  });
});
