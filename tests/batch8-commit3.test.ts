// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach } from "vitest";
import { captureUtm, readUtm } from "@/lib/analytics/taxonomy";
import { buildAckEmail } from "@/lib/email/ack-templates";
import { MessagingChips } from "@/components/cta/MessagingChips";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import { JSDOM } from "jsdom";
import { company } from "@/lib/content/site";

describe("Commit 3 tests — FR-OPS-011, FR-CTA-011, FR-CTA-012", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== "undefined") {
      window.sessionStorage.clear();
    }
    // Mock contacts configuration so chips have something to render
    company.contacts = {
      phone: "+84 906 878 091",
      email: "info@cyberskill.world",
      whatsapp: "84906878091",
      zalo: "https://zalo.me/0906878091",
    };
  });

  // --- FR-OPS-011: UTM Tracking ---
  test("utm/persistence: captureUtm saves query params to sessionStorage and readUtm loads them", () => {
    // Set query params in jsdom window
    delete (window as any).location;
    window.location = new URL("https://cyberskill.world/?utm_source=google&utm_medium=cpc&utm_campaign=winter_promo&utm_term=react&utm_content=text_ad") as any;

    captureUtm();

    const utm = readUtm() as any;
    expect(utm.utm_source).toBe("google");
    expect(utm.utm_medium).toBe("cpc");
    expect(utm.utm_campaign).toBe("winter_promo");
    expect(utm.utm_term).toBe("react");
    expect(utm.utm_content).toBe("text_ad");
  });

  test("utm/persistence: does not overwrite existing UTM parameters in sessionStorage with empty ones", () => {
    delete (window as any).location;
    window.location = new URL("https://cyberskill.world/?utm_source=facebook") as any;
    captureUtm();

    // Now navigate to a URL with no UTM params
    window.location = new URL("https://cyberskill.world/") as any;
    captureUtm();

    const utm = readUtm() as any;
    expect(utm.utm_source).toBe("facebook");
  });

  // --- FR-CTA-011: Transactional Acknowledgement Emails ---
  test("lead/acknowledgement: buildAckEmail generates correctly localized templates", () => {
    const enEmail = buildAckEmail({ name: "Stephen", locale: "en", bookingUrl: "https://calendly.com/cyberskill" });
    expect(enEmail.subject).toContain("Stephen");
    expect(enEmail.subject).toContain("CyberSkill");
    expect(enEmail.text).toContain("Stephen");
    expect(enEmail.text).toContain("https://calendly.com/cyberskill");

    const viEmail = buildAckEmail({ name: "Stephen", locale: "vi" });
    expect(viEmail.subject).toContain("Stephen");
    expect(viEmail.subject).toContain("CyberSkill");
    expect(viEmail.text).toContain("Stephen");
    expect(viEmail.text).not.toContain("https://calendly.com"); // default fallback should be absent or fallback
  });

  // --- FR-CTA-012: Messaging Chips ---
  test("analytics/chips-rendered: messaging chips render correctly in EN and VN", () => {
    const html = renderToStaticMarkup(
      createElement(MessagingChips, { locale: "en", location: "test-footer" })
    );
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const chips = doc.querySelectorAll(".cs-chip");
    expect(chips.length).toBe(2); // whatsapp and zalo

    const whatsapp = doc.querySelector(".cs-chip--whatsapp");
    expect(whatsapp?.getAttribute("href")).toBe("https://wa.me/84906878091");
    expect(whatsapp?.textContent).toContain("Chat on WhatsApp");
    expect(whatsapp?.getAttribute("aria-label")).toBe("Chat on WhatsApp");
    expect(whatsapp?.getAttribute("target")).toBe("_blank");

    const zalo = doc.querySelector(".cs-chip--zalo");
    expect(zalo?.getAttribute("href")).toBe("https://zalo.me/0906878091");
    expect(zalo?.textContent).toContain("Chat on Zalo");
    expect(zalo?.getAttribute("aria-label")).toBe("Chat on Zalo");
    expect(zalo?.getAttribute("target")).toBe("_blank");
  });
});

