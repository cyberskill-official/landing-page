import { describe, it, expect } from "vitest";
import {
  fortunePoolSize,
  getOpeningChips,
  listPrimaryTopicIds,
  listWorkStoryIds,
  matchScriptedFreeText,
  offlineFallbackReply,
  pickFortune,
  resolveEngagementQuiz,
  resolveScriptTopic,
} from "@/lib/genie/scriptedChat";
import { commercialPolicy } from "@/lib/content/policy";
import { work } from "@/lib/content/site";

describe("scripted Lumi chat (keyless)", () => {
  it("offers a richer opening set including quiz and stories", () => {
    const en = getOpeningChips("en");
    const vi = getOpeningChips("vi");
    expect(en.length).toBeGreaterThanOrEqual(7);
    expect(vi.length).toBe(en.length);
    expect(en.map((c) => c.id)).toEqual(
      expect.arrayContaining(["wish", "quiz_start", "story_hub", "teardown", "fortune"]),
    );
    expect(en.map((c) => c.label).join()).not.toBe(vi.map((c) => c.label).join());
  });

  it("lists many primary topics and still includes wish + teardown entry", () => {
    const ids = listPrimaryTopicIds();
    expect(ids.length).toBeGreaterThanOrEqual(30);
    expect(ids).toContain("wish");
    expect(ids).toContain("teardown");
    expect(ids).toContain("teardown_flow");
    expect(ids).toContain("quiz_start");
    for (const w of work) {
      expect(ids).toContain(`story_${w.slug}`);
    }
  });

  it("fortune pool is large and pickFortune is pure with index", () => {
    expect(fortunePoolSize("en")).toBeGreaterThanOrEqual(20);
    expect(fortunePoolSize("vi")).toBe(fortunePoolSize("en"));
    const a = pickFortune("en", 0);
    const b = pickFortune("en", 0);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(20);
    expect(pickFortune("vi", 1)).not.toBe(pickFortune("en", 1));
  });

  it("resolves classic topics with follow-up chips", () => {
    const build = resolveScriptTopic("en", "what_we_build");
    expect(build.message.toLowerCase()).toMatch(/web|mobile|internal/);
    expect(build.chips?.some((c) => c.id === "service_web")).toBe(true);

    const price = resolveScriptTopic("vi", "pricing");
    expect(price.message).toMatch(/giá|ngân sách|báo giá|phạm vi/i);

    const wish = resolveScriptTopic("en", "wish");
    expect(wish.startWish).toBe(true);

    const td = resolveScriptTopic("en", "teardown_flow");
    expect(td.startTeardown).toBe(true);
  });

  it("engagement quiz is multi-step and lands on commercialPolicy models", () => {
    const start = resolveEngagementQuiz("en", "quiz_start");
    expect(start).not.toBeNull();
    expect(start!.chips?.some((c) => c.id.startsWith("quiz_pace_"))).toBe(true);

    const pace = resolveEngagementQuiz("en", "quiz_pace_fast");
    expect(pace!.message.toLowerCase()).toMatch(/scope|pace|outcome/);
    expect(pace!.chips?.every((c) => c.id.startsWith("quiz_scope_"))).toBe(true);

    const result = resolveScriptTopic("en", "quiz_scope_locked__fast");
    const modelNames = commercialPolicy.engagementModels.map((m) => m.name.en);
    expect(modelNames.some((n) => result.message.includes(n))).toBe(true);
    expect(result.message).toMatch(/15,000|25,000|month|project/i);
    expect(result.chips?.some((c) => c.id === "wish")).toBe(true);

    const viResult = resolveScriptTopic("vi", "quiz_scope_fluid__steady");
    expect(viResult.message.length).toBeGreaterThan(40);
    expect(viResult.message).toMatch(/USD|tháng|dự án|đội|phạm vi/i);
  });

  it("work story hub lists real work slugs and story beats resolve", () => {
    const hub = resolveScriptTopic("en", "story_hub");
    expect(listWorkStoryIds().length).toBe(work.length);
    for (const w of work) {
      expect(hub.chips?.some((c) => c.id === `story_${w.slug}`)).toBe(true);
      const beat = resolveScriptTopic("en", `story_${w.slug}`);
      expect(beat.message).toContain(w.title.en.split(" ")[0]!);
      expect(beat.message).toContain(`/work/${w.slug}`);
    }
  });

  it("matches free-text keywords EN and VI for new topics", () => {
    expect(matchScriptedFreeText("en", "Which engagement model fits us?")?.message).toMatch(
      /quiz|pace|question/i,
    );
    expect(matchScriptedFreeText("en", "How much does a project cost?")?.message).toMatch(
      /price|scoped|budget|quote|à-la-carte|scope/i,
    );
    expect(matchScriptedFreeText("vi", "Các bạn tuyển dụng không?")?.message).toMatch(
      /tuyển|Careers|đội/i,
    );
    expect(
      matchScriptedFreeText("en", "Can I get a free teardown?")?.chips?.some((c) =>
        c.id.includes("teardown"),
      ),
    ).toBe(true);
    expect(matchScriptedFreeText("en", "show me a case study")?.chips?.some((c) =>
      c.id.startsWith("story"),
    )).toBe(true);
    expect(matchScriptedFreeText("vi", "mô hình hợp tác")?.message).toMatch(
      /hợp tác|USD|tháng|dự án/i,
    );
    expect(matchScriptedFreeText("en", "7 day promise")?.message).toMatch(/7|structure|strategy/i);
    expect(matchScriptedFreeText("en", "asdf qwer")).toBeNull();
  });

  it("matches Vietnamese keywords without ASCII word boundaries", () => {
    // `\b` fails around "giá" / "ứng dụng web" / "xây gì" — must still resolve.
    const price = matchScriptedFreeText("vi", "giá");
    expect(price).not.toBeNull();
    expect(price!.message).toMatch(/giá|ngân sách|báo giá|phạm vi|USD|scope/i);

    const web = matchScriptedFreeText("vi", "ứng dụng web");
    expect(web).not.toBeNull();
    expect(web!.message.toLowerCase()).toMatch(/web|ứng dụng/);

    const buildQ = matchScriptedFreeText("vi", "xây gì");
    expect(buildQ).not.toBeNull();
    expect(buildQ!.message).toMatch(/practice|web|mobile|nội bộ|internal|ứng dụng/i);
    // not the process step dump
    expect(buildQ!.message).not.toMatch(/\*\*01 /);
  });

  it("routes what-can-you-build and build-intent away from process", () => {
    const what = matchScriptedFreeText("en", "What can you build?");
    expect(what).not.toBeNull();
    expect(what!.message.toLowerCase()).toMatch(/practice|web|mobile|internal/);
    expect(what!.message).not.toMatch(/How a project runs/);
    expect(what!.chips?.some((c) => c.id === "service_web" || c.id === "wish")).toBe(true);

    const intent = matchScriptedFreeText(
      "en",
      "I want to build an operations app for my warehouse",
    );
    expect(intent).not.toBeNull();
    // Soft wish-nudge copy (not process SSOT dump)
    expect(intent!.message).toMatch(/wish forming/i);
    expect(intent!.message).not.toMatch(/How a project runs/);
    expect(intent!.chips?.some((c) => c.id === "wish")).toBe(true);
    expect(intent!.chips?.some((c) => c.id === "quiz_start")).toBe(true);

    const processOnly = matchScriptedFreeText("en", "process steps");
    expect(processOnly!.message).toMatch(/How a project runs|Discover|01/);
  });

  it("matches genie house rules via free text", () => {
    for (const q of ["house rules", "genie rules", "chat rules"]) {
      const r = matchScriptedFreeText("en", q);
      expect(r, q).not.toBeNull();
      expect(r!.message.toLowerCase()).toMatch(/password|secret|privacy|human|house rules|stored/);
    }
    const vi = matchScriptedFreeText("vi", "nội quy");
    expect(vi).not.toBeNull();
    expect(vi!.message).toMatch(/mật khẩu|riêng tư|nội quy|chat/i);
  });

  it("offline fallback still offers chips including quiz", () => {
    const r = offlineFallbackReply("en");
    expect(r.message.toLowerCase()).toMatch(/resting|quiz|wish|story/);
    expect(r.chips?.some((c) => c.id === "quiz_start")).toBe(true);
  });

  it("service deep-dives use SSOT service copy", () => {
    const web = resolveScriptTopic("en", "service_web");
    expect(web.message.toLowerCase()).toMatch(/web/);
    expect(web.chips?.some((c) => c.id === "wish")).toBe(true);
  });
});
