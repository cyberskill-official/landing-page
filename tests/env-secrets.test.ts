import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { POST as geniePost } from "@/app/api/genie/route";
import { POST as leadPost } from "@/app/api/lead/route";
import { NextResponse } from "next/server";

describe("FR-OPS-004: Env Example Parity", () => {
  it("docs/env-vars maps every variable to its environments (FR-OPS-004 §1.3)", () => {
    const docPath = path.join(process.cwd(), "docs/deploy/env-vars.md");
    expect(fs.existsSync(docPath)).toBe(true);
    const content = fs.readFileSync(docPath, "utf8");
    
    // Read all env vars from .env.example
    const examplePath = path.join(process.cwd(), ".env.example");
    const exampleContent = fs.readFileSync(examplePath, "utf8");
    const vars = exampleContent
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => line.split("=")[0]);

    vars.forEach(v => {
      expect(content).toContain(v);
    });
  });

  it("checks .env.example contains placeholders only (FR-OPS-004 §1.2)", () => {
    const examplePath = path.join(process.cwd(), ".env.example");
    const content = fs.readFileSync(examplePath, "utf8");
    const lines = content.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    
    lines.forEach(line => {
      const parts = line.split("=");
      const key = parts[0];
      const val = parts[1];
      
      if (key.includes("KEY") || key.includes("TOKEN") || key.includes("URL")) {
        // If it's a secret key/webhook URL, it must be empty in .env.example
        if (!key.startsWith("NEXT_PUBLIC_") && key !== "GENIE_MODEL" && key !== "GENIE_MAX_TOKENS" && key !== "LEAD_STORE_DIR") {
          expect(val).toBe("");
        }
      }
    });
  });
});

describe("FR-OPS-004: Public Secrets Check", () => {
  it("ci/no-public-secrets: no secret values committed in code (FR-OPS-004 §1.4)", () => {
    const searchDirs = ["app", "lib", "components"];
    const secretPatterns = [
      /sk-ant-[a-zA-Z0-9_-]{32,}/g, // Anthropic API Key
      /re-[a-zA-Z0-9_-]{24,}/g,     // Resend API Key
    ];

    function scanDir(dirPath: string) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (stat.isFile() && /\.(tsx|ts|js|mjs)$/.test(file)) {
          const content = fs.readFileSync(fullPath, "utf8");
          secretPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            expect(matches).toBeNull();
          });
          
          expect(content).not.toContain("NEXT_PUBLIC_RESEND_API_KEY");
          expect(content).not.toContain("NEXT_PUBLIC_ANTHROPIC_API_KEY");
        }
      });
    }

    searchDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        scanDir(fullPath);
      }
    });
  });
});

describe("FR-OPS-004: Env Fail Closed", () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "production", FORCE_ENV_CHECK: "true" };
    console.error = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
  });

  it("ci/env-fail-closed: api/genie route fails closed when required key is missing (FR-OPS-004 §1.5)", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const req = new Request("https://cyberskill.world/api/genie", {
      method: "POST",
      body: JSON.stringify({ message: "hello" }),
    });

    const res = await geniePost(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("configuration_error");
    expect(data.message).toContain("MISSING_PRODUCTION_KEY_ANTHROPIC_API_KEY");
  });

  it("ci/env-fail-closed: api/lead route fails closed when required key is missing (FR-OPS-004 §1.5)", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_CRM_WEBHOOK_URL;

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Anh",
        email: "anh@example.com",
        intent: "project",
        consent: true,
        locale: "en",
      }),
    });

    const res = await leadPost(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("configuration_error");
    expect(data.message).toContain("MISSING_PRODUCTION_KEY_RESEND_API_KEY");
  });
});
