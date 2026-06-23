import { describe, it, expect } from "vitest";
import { parseChatRequest, cleanContent, MAX_CONTENT, MAX_TOTAL } from "@/lib/genie/validate";

describe("parseChatRequest (FR-CHAR-029 abuse hardening)", () => {
  it("accepts a valid request and trims content", () => {
    const r = parseChatRequest({ messages: [{ role: "user", content: "  hello  " }], locale: "vi" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.messages).toEqual([{ role: "user", content: "hello" }]);
      expect(r.locale).toBe("vi");
    }
  });

  it("defaults locale to en when missing or invalid", () => {
    const r = parseChatRequest({ messages: [{ role: "user", content: "hi" }], locale: "zz" });
    expect(r.ok && r.locale).toBe("en");
  });

  it("rejects a non-array, empty, or oversized messages list", () => {
    expect(parseChatRequest({ messages: "nope" }).ok).toBe(false);
    expect(parseChatRequest({ messages: [] }).ok).toBe(false);
    const tooMany = Array.from({ length: 31 }, () => ({ role: "user", content: "x" }));
    expect(parseChatRequest({ messages: tooMany }).ok).toBe(false);
  });

  it("requires the first valid message to be from the user", () => {
    expect(parseChatRequest({ messages: [{ role: "assistant", content: "hi" }] }).ok).toBe(false);
  });

  it("drops invalid roles and over-long messages, failing if none remain", () => {
    const big = "a".repeat(MAX_CONTENT + 1);
    expect(parseChatRequest({ messages: [{ role: "system", content: "x" }, { role: "user", content: big }] }).ok).toBe(false);
  });

  it("rejects when total content exceeds the cap", () => {
    const chunk = "b".repeat(MAX_CONTENT);
    const msgs = Array.from({ length: Math.ceil(MAX_TOTAL / MAX_CONTENT) + 1 }, () => ({ role: "user", content: chunk }));
    expect(parseChatRequest({ messages: msgs }).ok).toBe(false);
  });

  it("strips control characters but keeps tab and newline", () => {
    const withControls = "a" + String.fromCharCode(0) + "b" + String.fromCharCode(27) + "c";
    expect(cleanContent(withControls)).toBe("abc");
    expect(cleanContent("line1\nline2\tend")).toBe("line1\nline2\tend");
  });
});
