import { describe, it, expect } from "vitest";
import {
  COUNTING_RULE,
  combinatorialCellCount,
  countScriptedBubbles,
  enumerateScriptedBubbles,
  fortunePoolSize,
  FUNNEL_STAGE_ORDER,
  getOpeningChips,
  listPrimaryTopicIds,
  listScenarioCatalog,
  listWorkStoryIds,
  matchScriptedFreeText,
  offlineFallbackReply,
  parseCorpusPath,
  pickFortune,
  resolveEngagementQuiz,
  resolveScriptTopic,
  sampleConsultToLeadPath,
  stageForHeroTopic,
} from "@/lib/genie/scriptedChat";
import { commercialPolicy } from "@/lib/content/policy";
import { work } from "@/lib/content/site";

describe("scripted Lumi chat (keyless SCRIPTED funnel)", () => {
  it("offers a richer opening set including guided path, quiz, MVP, call, and stories", () => {
    const en = getOpeningChips("en");
    const vi = getOpeningChips("vi");
    expect(en.length).toBeGreaterThanOrEqual(9);
    expect(vi.length).toBe(en.length);
    expect(en.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        "wish",
        "path_hub",
        "quiz_start",
        "mvp_start",
        "book_call",
        "story_hub",
        "teardown",
        "fortune",
      ]),
    );
    expect(en.map((c) => c.label).join()).not.toBe(vi.map((c) => c.label).join());
  });

  it("lists many primary topics and still includes wish + teardown entry", () => {
    const ids = listPrimaryTopicIds();
    expect(ids.length).toBeGreaterThanOrEqual(40);
    expect(ids).toContain("wish");
    expect(ids).toContain("teardown");
    expect(ids).toContain("teardown_flow");
    expect(ids).toContain("quiz_start");
    expect(ids).toContain("mvp_flow");
    expect(ids).toContain("book_call_flow");
    expect(ids).toContain("contact_flow");
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

    const mvp = resolveScriptTopic("en", "mvp_flow");
    expect(mvp.startWish).toBe(true);
    expect(mvp.seedMessage).toMatch(/mvp/i);

    const call = resolveScriptTopic("en", "book_call_flow");
    expect(call.startContact).toBe(true);

    const partner = resolveScriptTopic("en", "partnership_flow");
    expect(partner.startPartnership).toBe(true);
  });

  it("exports a stage-grouped SCRIPTED catalog ending in COLLECT lead", () => {
    const cat = listScenarioCatalog();
    expect(cat.length).toBeGreaterThanOrEqual(6);
    expect(cat.every((c) => c.scenarios.length > 0)).toBe(true);
    expect(cat.every((c) => FUNNEL_STAGE_ORDER.includes(c.stage))).toBe(true);
    const collect = cat.find((c) => c.id === "stage_lead");
    expect(collect?.mode).toBe("collect");
    expect(collect?.stage).toBe("lead");
    expect(collect?.scenarios.some((s) => s.id === "wish")).toBe(true);
    expect(collect?.scenarios.some((s) => s.id === "mvp_flow")).toBe(true);
    // Naming: SCRIPTED consult funnel, not LLM product
    const blob = JSON.stringify(cat).toLowerCase();
    expect(blob).toMatch(/scripted/);
    expect(blob).toMatch(/collect/);
    expect(blob).not.toMatch(/llm chat product/);
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
    expect(processOnly!.message).toMatch(/How a project usually runs|Discover|01/);
    const processVi = resolveScriptTopic("vi", "process");
    expect(processVi.message).toMatch(/bốn bước|Khám phá|Định hình/);
    expect(processVi.message).not.toMatch(/review kỹ|agency|timeline bí/);
    const howVi = resolveScriptTopic("vi", "how_we_work");
    expect(howVi.message).toMatch(/đội gọn|đánh đổi|người dùng/);
    expect(howVi.message).not.toMatch(/agency hộp đen|timeline bí ẩn|đội senior gọn/);
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
    expect(r.message.toLowerCase()).toMatch(/catch|path|quiz|wish|story|ready|here/);
    expect(r.chips?.some((c) => c.id === "quiz_start")).toBe(true);
    // User-facing copy must not dump operator jargon
    expect(r.message).not.toMatch(/SCRIPTED|COLLECT/);
    const vi = offlineFallbackReply("vi");
    expect(vi.message).not.toMatch(/SCRIPTED|COLLECT/);
    expect(vi.message.length).toBeGreaterThan(20);
  });

  it("hero genie dict strings are polished EN and natural VI (no operator jargon)", async () => {
    const { getDictionary } = await import("@/lib/i18n/dictionaries");
    const en = getDictionary("en");
    const vi = getDictionary("vi");
    expect(en.genie.greeting.toLowerCase()).toMatch(/lumi|wish|topic|guide|friendly/);
    expect(en.genie.greeting).not.toMatch(/SCRIPTED|COLLECT|LLM/);
    expect(vi.genie.greeting).toMatch(/Lumi|điều ước|chủ đề|mình/);
    expect(vi.genie.greeting).not.toMatch(/SCRIPTED|COLLECT/);
    // Natural VI markers (warm, spoken, not stiff machine translation)
    expect(vi.genie.wishAskName.toLowerCase()).toMatch(/mình|xưng hô|gọi|bạn/);
    expect(vi.genie.greeting.toLowerCase()).toMatch(/chào|lumi|điều ước|tư vấn/);
    expect(vi.hero.lead.length).toBeGreaterThan(40);
    expect(vi.hero.lead).toMatch(/phần mềm|điều ước|CyberSkill|Lumi/);
    expect(en.hero.lead.toLowerCase()).toMatch(/wish|software|genie|will|lumi/);
  });

  it("service deep-dives use SSOT service copy", () => {
    const web = resolveScriptTopic("en", "service_web");
    expect(web.message.toLowerCase()).toMatch(/web/);
    expect(web.chips?.some((c) => c.id === "wish")).toBe(true);
  });

  it("assigns funnel stages on hero topics and corpus paths", () => {
    expect(stageForHeroTopic("who_is_lumi")).toBe("rapport");
    expect(stageForHeroTopic("what_we_build")).toBe("consult");
    expect(stageForHeroTopic("story_hub")).toBe("proof");
    expect(stageForHeroTopic("capacity")).toBe("interest");
    expect(stageForHeroTopic("book_call")).toBe("soft_cta");
    expect(stageForHeroTopic("wish")).toBe("lead");
    expect(stageForHeroTopic("cx:consult:mvp:founder:generous")).toBe("consult");
    expect(FUNNEL_STAGE_ORDER).toEqual([
      "rapport",
      "consult",
      "proof",
      "interest",
      "soft_cta",
      "lead",
    ]);
  });

  it("enumerates ≥10000 staged bubbles via real expansion (not a magic literal)", () => {
    expect(COUNTING_RULE.toLowerCase()).toMatch(/locale|stage|combinatorial|expansion/);
    expect(combinatorialCellCount()).toBeGreaterThan(1000);

    const a = countScriptedBubbles();
    const b = countScriptedBubbles();
    expect(a.total).toBe(b.total);
    expect(a.total).toBeGreaterThanOrEqual(10_000);
    expect(a.countingRule).toBe(COUNTING_RULE);

    for (const stage of FUNNEL_STAGE_ORDER) {
      expect(a.byStage[stage], stage).toBeGreaterThan(0);
    }
    expect(a.byLocale.en).toBeGreaterThan(0);
    expect(a.byLocale.vi).toBeGreaterThan(0);
    expect(a.byLocale.en + a.byLocale.vi).toBe(a.total);
    expect(a.byKind.assistant).toBeGreaterThan(0);
    expect(a.byKind.chip).toBeGreaterThan(0);

    // Spot-check: every bubble tagged + non-empty
    const sample = enumerateScriptedBubbles().slice(0, 200);
    for (const bubble of sample) {
      expect(bubble.text.trim().length).toBeGreaterThan(0);
      expect(FUNNEL_STAGE_ORDER).toContain(bubble.stage);
      expect(["en", "vi"]).toContain(bubble.locale);
    }
  });

  it("consult-stage replies give value before hard lead-only chip sets", () => {
    const consult = resolveScriptTopic("en", "mvp_start");
    expect(consult.stage ?? stageForHeroTopic("mvp_start")).toBe("consult");
    expect(consult.message.toLowerCase()).toMatch(/slice|outcome|consult|mvp|measurable/);
    // Not lead-only: includes progressive chips (quiz / path / promise), not solely wish
    const chipIds = consult.chips?.map((c) => c.id) ?? [];
    expect(chipIds.some((id) => id === "quiz_start" || id.startsWith("cx:"))).toBe(true);
    expect(consult.startWish).toBeFalsy();

    const what = resolveScriptTopic("en", "what_we_build");
    expect(what.startWish).toBeFalsy();
    expect(what.message.toLowerCase()).toMatch(/practice|web|mobile/);
  });

  it("multiple COLLECT handoff paths set start flags", () => {
    expect(resolveScriptTopic("en", "wish").startWish).toBe(true);
    expect(resolveScriptTopic("en", "mvp_flow").startWish).toBe(true);
    expect(resolveScriptTopic("en", "teardown_flow").startTeardown).toBe(true);
    expect(resolveScriptTopic("en", "book_call_flow").startContact).toBe(true);
    expect(resolveScriptTopic("en", "partnership_flow").startPartnership).toBe(true);
    expect(resolveScriptTopic("en", "careers_flow").startCareers).toBe(true);
    expect(resolveScriptTopic("en", "contact_flow").startContact).toBe(true);

    const cxLead = resolveScriptTopic("en", "cx:lead:mvp:founder:generous");
    expect(
      cxLead.startWish ||
        cxLead.startTeardown ||
        cxLead.startContact ||
        cxLead.startPartnership ||
        cxLead.startCareers,
    ).toBe(true);
  });

  it("sample consult→lead path: value messages then COLLECT flag", () => {
    const path = sampleConsultToLeadPath("en");
    expect(path.length).toBeGreaterThanOrEqual(5);
    const consultBeat = path.find((p) => p.stage === "consult");
    expect(consultBeat).toBeTruthy();
    expect(consultBeat!.message.length).toBeGreaterThan(40);
    expect(consultBeat!.collect).toBeNull();
    const leadBeat = path.find((p) => p.stage === "lead");
    expect(leadBeat?.collect).toBeTruthy();
  });

  it("parses and resolves combinatorial path ids EN/VI", () => {
    const id = "cx:consult:ecommerce:ops_lead:crisp";
    const parsed = parseCorpusPath(id);
    expect(parsed).toEqual({
      stage: "consult",
      intent: "ecommerce",
      situation: "ops_lead",
      tone: "crisp",
    });
    const en = resolveScriptTopic("en", id);
    const vi = resolveScriptTopic("vi", id);
    expect(en.message.length).toBeGreaterThan(30);
    expect(vi.message.length).toBeGreaterThan(30);
    expect(en.message).not.toBe(vi.message);
    expect(en.chips?.length).toBeGreaterThan(0);
  });

  it("path hub situation→intent enters consult corpus", () => {
    const hub = resolveScriptTopic("en", "path_hub");
    expect(hub.stage).toBe("rapport");
    expect(hub.chips?.some((c) => c.id.startsWith("path_sit_"))).toBe(true);
    const sit = resolveScriptTopic("en", "path_sit_founder");
    expect(sit.chips?.some((c) => c.id.startsWith("path_intent_"))).toBe(true);
    const into = resolveScriptTopic("en", "path_intent_mvp__founder");
    expect(into.stage).toBe("consult");
    expect(into.startWish).toBeFalsy();
  });
});
