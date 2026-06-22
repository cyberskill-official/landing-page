import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/genie/persona";
import { company } from "@/lib/content/site";

describe("Lumi persona system prompt", () => {
  it("speaks as Lumi and grounds in CyberSkill facts", () => {
    const p = buildSystemPrompt("en");
    expect(p).toContain("Lumi");
    expect(p).toContain(company.email);
    expect(p).toContain(company.duns);
    expect(p.toLowerCase()).toContain("web applications");
  });

  it("tells the model to answer in Vietnamese on the vi site", () => {
    expect(buildSystemPrompt("vi")).toContain("Vietnamese");
  });

  it("carries the no-fabrication guardrail", () => {
    expect(buildSystemPrompt("en").toLowerCase()).toContain("never invent");
  });
});
