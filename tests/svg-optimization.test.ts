import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { optimize } from "svgo";

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

describe("TASK-OPS-016: SVG Asset Optimization", () => {
  const root = process.cwd();

  it("perf/svg-minified: all SVGs in public/ or components/ have comments, editor tags, and unused namespaces stripped", () => {
    // Find all SVGs in public/ and components/
    const publicSVGs = walk(path.join(root, "public")).filter(f => f.endsWith(".svg"));
    const componentsSVGs = walk(path.join(root, "components")).filter(f => f.endsWith(".svg"));
    const allSVGs = [...publicSVGs, ...componentsSVGs];

    expect(allSVGs.length).toBeGreaterThan(0);

    for (const file of allSVGs) {
      const content = fs.readFileSync(file, "utf8");

      // Verify no comments
      expect(content).not.toContain("<!--");
      // Verify no metadata tag
      expect(content).not.toContain("<metadata>");
      // Verify no editor attributes/namespaces
      expect(content).not.toContain("sodipodi:");
      expect(content).not.toContain("inkscape:");

      // Verify that running SVGO yields no significant size reduction (<= 10 bytes)
      const result = optimize(content, { path: file });
      const sizeDiff = content.length - result.data.length;
      expect(sizeDiff).toBeLessThanOrEqual(10);
    }
  });

  it("perf/svg-budget-gate: check-asset-size script throws an error if any SVG exceeds its budget", () => {
    const budgetPath = path.join(root, "scripts/asset-budget.json");
    const originalBudget = fs.readFileSync(budgetPath, "utf8");
    
    // Create an oversized mock SVG in public/
    const mockSvgPath = path.join(root, "public/oversized-mock.svg");
    // Create 15KB of mock SVG path data (which exceeds the 10KB budget)
    const mockContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${"M 0 0 L 10 10 ".repeat(1000)}" /></svg>`;
    fs.writeFileSync(mockSvgPath, mockContent, "utf8");

    try {
      // Run the check-asset-size script and check if it throws/fails
      expect(() => {
        execSync("node scripts/check-asset-size.mjs", { stdio: "pipe" });
      }).toThrow();
    } finally {
      // Clean up mock file
      if (fs.existsSync(mockSvgPath)) {
        fs.unlinkSync(mockSvgPath);
      }
    }
  });

  it("perf/svg-precommit: pre-commit verification script blocks commit if staged SVGs are not optimized", () => {
    // We will test the logic of scripts/check-svgs-optimized.mjs directly by mocking child_process execSync
    const mockSvgPath = path.join(root, "public/unoptimized-mock.svg");
    // Create a mock unoptimized SVG containing metadata and comments
    const mockContent = `<!-- Created with Inkscape -->\n<svg xmlns:inkscape="http://inkscape.org" viewBox="0 0 100 100"><metadata>mock metadata</metadata></svg>`;
    fs.writeFileSync(mockSvgPath, mockContent, "utf8");

    try {
      // Execute the scripts/check-svgs-optimized.mjs script with GIT mock environment
      // Mock execSync to simulate staging the unoptimized-mock.svg file
      expect(() => {
        execSync(`git diff --cached --name-only`, { stdio: "pipe" }); // verify git runs
        
        // Run script directly by mocking staged files. We stub execSync in check-svgs-optimized.mjs:
        // Actually, we can just invoke it with custom environment or pass files.
        // Wait, check-svgs-optimized.mjs runs `git diff --cached --name-only` inside it.
        // If we stage the file temporarily, it will check it!
        execSync(`git add ${mockSvgPath}`);
        execSync("node scripts/check-svgs-optimized.mjs", { stdio: "pipe" });
      }).toThrow();
    } finally {
      // Clean up
      execSync(`git restore --staged ${mockSvgPath} 2>/dev/null || true`);
      if (fs.existsSync(mockSvgPath)) {
        fs.unlinkSync(mockSvgPath);
      }
    }
  });
});
