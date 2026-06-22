import { describe, it, expect } from "vitest";
import { negotiateLocale } from "@/lib/i18n/negotiate";

describe("negotiateLocale (FR-WEB-004)", () => {
  it("falls back to the default locale when the header is missing or empty", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale(undefined)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
  });

  it("picks Vietnamese when it is preferred", () => {
    expect(negotiateLocale("vi")).toBe("vi");
    expect(negotiateLocale("vi-VN,vi;q=0.9,en;q=0.8")).toBe("vi");
  });

  it("picks English for English-region headers", () => {
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en");
  });

  it("respects q-weights when ordering preferences", () => {
    expect(negotiateLocale("en;q=0.7,vi;q=0.9")).toBe("vi");
  });

  it("skips unsupported languages and uses the next supported one", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,vi;q=0.5")).toBe("vi");
  });

  it("returns the default for unsupported-only or wildcard headers", () => {
    expect(negotiateLocale("fr-FR,de;q=0.8")).toBe("en");
    expect(negotiateLocale("*")).toBe("en");
  });
});
