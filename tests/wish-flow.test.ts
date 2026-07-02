import { describe, it, expect } from "vitest";
import {
  advanceWishFlow,
  isOptionalStep,
  resolveConsent,
  startWishFlow,
  wishFlowPayload,
} from "@/lib/genie/wishFlow";

// Conversational lead capture (FR-CHAR-026): the flow is a pure state
// machine, so its contract pins down here - validation, optional skips,
// explicit consent, and the exact /api/lead payload.

describe("wish flow", () => {
  it("walks the happy path to a valid lead payload", () => {
    let s = startWishFlow();
    expect(s.step).toBe("name");

    let r = advanceWishFlow(s, "  Stephen  ");
    expect(r.error).toBeUndefined();
    s = r.state;
    expect(s.step).toBe("email");
    expect(s.draft.name).toBe("Stephen");

    r = advanceWishFlow(s, "stephen@cyberskill.world");
    s = r.state;
    expect(s.step).toBe("company");

    r = advanceWishFlow(s, "CyberSkill");
    s = r.state;
    expect(s.step).toBe("message");

    r = advanceWishFlow(s, "An operations platform that retires our spreadsheets.");
    s = r.state;
    expect(s.step).toBe("consent");

    s = resolveConsent(s, true);
    expect(s.step).toBe("done");

    const payload = wishFlowPayload(s, "en");
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      name: "Stephen",
      email: "stephen@cyberskill.world",
      company: "CyberSkill",
      intent: "project",
      consent: true,
      website: "",
      locale: "en",
      source: "lumi-chat",
    });
  });

  it("rejects an empty name and a bad email without advancing", () => {
    let s = startWishFlow();
    const empty = advanceWishFlow(s, "   ");
    expect(empty.error).toBe("required");
    expect(empty.state.step).toBe("name");

    s = advanceWishFlow(s, "Anh").state;
    const bad = advanceWishFlow(s, "not-an-email");
    expect(bad.error).toBe("invalid_email");
    expect(bad.state.step).toBe("email");
  });

  it("lets optional steps be skipped with empty input", () => {
    expect(isOptionalStep("company")).toBe(true);
    expect(isOptionalStep("message")).toBe(true);
    expect(isOptionalStep("email")).toBe(false);

    let s = startWishFlow();
    s = advanceWishFlow(s, "Anh").state;
    s = advanceWishFlow(s, "anh@example.com").state;
    s = advanceWishFlow(s, "").state; // skip company
    expect(s.step).toBe("message");
    s = advanceWishFlow(s, "").state; // skip message
    expect(s.step).toBe("consent");
    s = resolveConsent(s, true);
    const payload = wishFlowPayload(s, "vi");
    expect(payload?.company).toBe("");
    expect(payload?.locale).toBe("vi");
  });

  it("consent is explicit: declining does not advance, and payloads need done", () => {
    let s = startWishFlow();
    s = advanceWishFlow(s, "Anh").state;
    s = advanceWishFlow(s, "anh@example.com").state;
    s = advanceWishFlow(s, "").state;
    s = advanceWishFlow(s, "").state;
    expect(s.step).toBe("consent");

    const declined = resolveConsent(s, false);
    expect(declined.step).toBe("consent");
    expect(wishFlowPayload(declined, "en")).toBeNull();

    // resolveConsent outside the consent step is inert.
    const fresh = startWishFlow();
    expect(resolveConsent(fresh, true).step).toBe("name");
  });
});
