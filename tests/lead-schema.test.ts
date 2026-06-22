import { describe, it, expect } from "vitest";
import { leadSchema } from "@/lib/lead/schema";

const base = {
  name: "Anh",
  email: "anh@example.com",
  intent: "project" as const,
  consent: true as const,
  locale: "en" as const,
};

describe("leadSchema", () => {
  it("accepts a minimal valid lead", () => {
    expect(leadSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when consent is not given", () => {
    expect(leadSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(leadSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });

  it("requires a locale", () => {
    const { locale: _omit, ...withoutLocale } = base;
    void _omit;
    expect(leadSchema.safeParse(withoutLocale).success).toBe(false);
  });

  it("allows optional company and message", () => {
    const r = leadSchema.safeParse({ ...base, company: "CyberSkill", message: "Hello" });
    expect(r.success).toBe(true);
  });
});
