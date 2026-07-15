import { describe, it, expect } from "vitest";
import {
  getOpeningChips,
  matchScriptedFreeText,
  offlineFallbackReply,
  resolveScriptTopic,
} from "@/lib/genie/scriptedChat";

describe("scripted Lumi chat (keyless)", () => {
  it("offers opening chips in both locales", () => {
    const en = getOpeningChips("en");
    const vi = getOpeningChips("vi");
    expect(en.length).toBeGreaterThanOrEqual(4);
    expect(vi.length).toBe(en.length);
    expect(en.some((c) => c.id === "fortune")).toBe(true);
    expect(vi.some((c) => c.id === "teardown")).toBe(true);
    expect(en.map((c) => c.label).join()).not.toBe(vi.map((c) => c.label).join());
  });

  it("resolves topic trees with follow-up chips", () => {
    const build = resolveScriptTopic("en", "what_we_build");
    expect(build.message.toLowerCase()).toMatch(/web|mobile|internal/);
    expect(build.chips?.some((c) => c.id === "wish")).toBe(true);

    const price = resolveScriptTopic("vi", "pricing");
    expect(price.message).toMatch(/giá|ngân sách|báo giá/i);
    expect(price.startWish).toBeUndefined();

    const wish = resolveScriptTopic("en", "wish");
    expect(wish.startWish).toBe(true);

    const td = resolveScriptTopic("en", "teardown_flow");
    expect(td.startTeardown).toBe(true);
  });

  it("matches free-text keywords EN and VI", () => {
    expect(matchScriptedFreeText("en", "How much does a project cost?")?.message).toMatch(
      /price|scoped|budget/i,
    );
    expect(matchScriptedFreeText("vi", "Các bạn tuyển dụng không?")?.message).toMatch(
      /tuyển|Careers|đội/i,
    );
    expect(matchScriptedFreeText("en", "Can I get a free teardown?")?.chips?.some((c) =>
      c.id.includes("teardown"),
    )).toBe(true);
    expect(matchScriptedFreeText("en", "asdf qwer")).toBeNull();
  });

  it("nudges long build-intent free text toward a wish", () => {
    const r = matchScriptedFreeText("en", "I want to build an operations app for my warehouse");
    expect(r).not.toBeNull();
    expect(r?.chips?.some((c) => c.id === "wish")).toBe(true);
  });

  it("offline fallback still offers chips", () => {
    const r = offlineFallbackReply("en");
    expect(r.message.toLowerCase()).toMatch(/resting|topic|wish/);
    expect(r.chips?.length).toBeGreaterThan(0);
  });

  it("fortune returns a non-empty prophecy", () => {
    const r = resolveScriptTopic("en", "fortune");
    expect(r.message.length).toBeGreaterThan(40);
    expect(r.chips?.some((c) => c.id === "fortune")).toBe(true);
  });
});
