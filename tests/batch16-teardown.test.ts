// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { POST as leadPost } from "@/app/api/lead/route";
import { GET as statusGet } from "@/app/api/teardown/status/route";
import { TeardownCta } from "@/components/sections/TeardownCta";
import { leadSchema } from "@/lib/lead/schema";
import { getDb, resetDb } from "@/lib/db";
import * as analyticsTaxonomy from "@/lib/analytics/taxonomy";

vi.mock("node:fs/promises", () => {
  const m = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
  };
  return {
    ...m,
    default: m,
  };
});

const mockDict = {
  form: {
    required: "Trường này là bắt buộc",
    invalidEmail: "Email không hợp lệ",
    consentRequired: "Cần đồng ý điều khoản",
    submitting: "Đang gửi...",
    submit: "Gửi",
    trustLine: "Thông tin của bạn được bảo mật",
    errorGeneric: "Đã xảy ra lỗi. Vui lòng thử lại.",
    successTitle: "Thành công",
    successBody: "Biểu mẫu đã được gửi",
  },
  footer: {
    privacy: "Bảo mật",
  },
  teardown: {
    title: "Nhận đánh giá 15 điểm miễn phí",
    lead: "Chúng tôi sẽ đánh giá ứng dụng của bạn...",
    nameLabel: "Tên của bạn",
    emailLabel: "Email công việc",
    urlLabel: "Đường dẫn sản phẩm",
    messageLabel: "Nội dung cần đánh giá",
    consentLabel: "Tôi đồng ý",
    submitLabel: "Yêu cầu đánh giá",
    lumiCta: "Yêu cầu cùng Lumi",
    formFallback: "Thích biểu mẫu cổ điển?",
    lumiSeed: "Tôi muốn đánh giá 15 điểm miễn phí",
    capFullTitle: "Các suất tuần này đã đầy",
    capFullBody: "Vui lòng quay lại vào thứ Hai tuần sau.",
    successTitle: "Đã gửi yêu cầu thành công!",
    successBody: "Chúng tôi sẽ gửi báo cáo PDF trong 3 ngày.",
    successNextLabel: "Bước tiếp theo",
    successStep1: "Kỹ sư rà soát",
    successStep2: "Nhận PDF",
    successStep3: "Phản hồi nếu cần",
  },
};

describe("FR-CTA-019: Teardown lead magnet funnel", () => {
  const originalEnv = process.env;
  let container: HTMLDivElement;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      RESEND_API_KEY: "mock-resend-key",
      LEAD_CRM_WEBHOOK_URL: "http://mock-crm/leads",
      TEARDOWN_WEEKLY_CAP: "2",
    };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ capExceeded: false, cap: 2, count: 0 }),
      } as Response)
    );
    resetDb();
    const db = getDb();
    if (typeof (db as any).clearAll === "function") {
      (db as any).clearAll();
    }
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    process.env = originalEnv;
    container.remove();
    vi.restoreAllMocks();
  });

  // --- AC for 1.1: api/lead-validation ---
  describe("api/lead-validation", () => {
    it("accepts and validates teardown fields in leadSchema", () => {
      const payload = {
        name: "Test User",
        email: "test@example.com",
        url: "https://example.com/product",
        company: "https://example.com/product",
        intent: "project" as const,
        consent: true,
        locale: "vi" as const,
        source: "teardown",
      };
      const parsed = leadSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.url).toBe("https://example.com/product");
    });

    it("saves teardown request to datastore correctly", async () => {
      const db = getDb();
      const saveSpy = vi.spyOn(db, "saveLead");

      const payload = {
        name: "Teardown Fan",
        email: "fan@example.com",
        url: "https://fan.com",
        company: "https://fan.com",
        intent: "project",
        consent: true,
        locale: "en",
        source: "teardown",
      };

      const req = new Request("http://localhost/api/lead", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await leadPost(req);
      expect(res.status).toBe(200);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  // --- AC for 1.2: cta/teardown-cap ---
  describe("cta/teardown-cap", () => {
    it("rejects leads when cap is exceeded and returns 429", async () => {
      const db = getDb();
      // Populate 2 leads with source "teardown" to exceed cap of 2
      await db.saveLead({
        sessionId: "session-1",
        email: "user1@example.com",
        name: "User 1",
        locale: "en",
        source: "teardown",
        intent: "project",
      });
      await db.saveLead({
        sessionId: "session-2",
        email: "user2@example.com",
        name: "User 2",
        locale: "en",
        source: "teardown",
        intent: "project",
      });

      const payload = {
        name: "User 3",
        email: "user3@example.com",
        url: "https://user3.com",
        company: "https://user3.com",
        intent: "project",
        consent: true,
        locale: "en",
        source: "teardown",
      };

      const req = new Request("http://localhost/api/lead", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await leadPost(req);
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toBe("cap_exceeded");
    });

    it("returns correct cap status on GET api/teardown/status", async () => {
      const db = getDb();
      await db.saveLead({
        sessionId: "session-1",
        email: "user1@example.com",
        name: "User 1",
        locale: "en",
        source: "teardown",
        intent: "project",
      });

      const res = await statusGet();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count).toBe(1);
      expect(data.cap).toBe(2);
      expect(data.capExceeded).toBe(false);
    });

    it("displays honest closed state in TeardownCta component when cap exceeded", async () => {
      // Mock status endpoint to return capExceeded: true
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ capExceeded: true, cap: 2, count: 2 }),
        } as Response)
      );

      const root = createRoot(container);
      await act(async () => {
        root.render(createElement(TeardownCta, { locale: "vi", dict: mockDict as any }));
      });

      // Wait for fetch to resolve and render
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(container.textContent).toContain(mockDict.teardown.capFullTitle);
      expect(container.textContent).toContain(mockDict.teardown.capFullBody);
      // The form fields should not render when cap is full
      expect(container.querySelector("form")).toBeNull();
      // Lumi primary CTA is also suppressed when slots are full
      expect(container.textContent).not.toContain(mockDict.teardown.lumiCta);
    });

    it("surfaces Lumi as primary CTA and form as details fallback", async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(createElement(TeardownCta, { locale: "vi", dict: mockDict as any }));
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(container.textContent).toContain(mockDict.teardown.lumiCta);
      expect(container.textContent).toContain(mockDict.teardown.formFallback);
      const details = container.querySelector("details.cs-contact-details");
      expect(details).not.toBeNull();
      expect(container.querySelector("form")).not.toBeNull();
    });
  });

  // --- AC for 1.3: analytics/both-lead-paths ---
  describe("analytics/both-lead-paths", () => {
    it("fires form_started on input interaction, and lead_submitted on success", async () => {
      const emitSpy = vi.spyOn(analyticsTaxonomy, "emit");

      global.fetch = vi.fn((url) => {
        if (url === "/api/teardown/status") {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ capExceeded: false, cap: 2, count: 0 }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ ok: true }),
        } as Response);
      });

      const root = createRoot(container);
      await act(async () => {
        root.render(createElement(TeardownCta, { locale: "vi", dict: mockDict as any }));
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Classic form lives under details (Lumi is primary). Open it for the form path.
      const details = container.querySelector("details");
      if (details) details.open = true;

      const form = container.querySelector("form");
      expect(form).not.toBeNull();

      // Trigger start event by focusing an input inside the form
      const nameInput = container.querySelector("#td-name") as HTMLInputElement;
      await act(async () => {
        nameInput?.focus();
      });

      expect(emitSpy).toHaveBeenCalledWith("form_started", { formId: "teardown" });

      // Fill in all required fields to satisfy validation
      const emailInput = container.querySelector("#td-email") as HTMLInputElement;
      const urlInput = container.querySelector("#td-url") as HTMLInputElement;
      const consentInput = container.querySelector("#td-consent") as HTMLInputElement;

      const setInputValue = (input: HTMLInputElement, val: string) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, val);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const setCheckboxValue = (input: HTMLInputElement, checked: boolean) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked")?.set;
        setter?.call(input, checked);
        input.dispatchEvent(new Event("click", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };

      await act(async () => {
        setInputValue(nameInput, "Jane");
        setInputValue(emailInput, "jane@example.com");
        setInputValue(urlInput, "https://jane.com");
        setCheckboxValue(consentInput, true);
      });

      // Trigger submit success
      const submitBtn = container.querySelector("button[type='submit']") as HTMLButtonElement;
      await act(async () => {
        submitBtn?.click();
      });

      // Give a tiny moment for fetch and emit to execute
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });



      // Expect lead_submitted is triggered
      expect(emitSpy).toHaveBeenCalledWith(
        "lead_submitted",
        expect.objectContaining({ source: "teardown", locale: "vi" })
      );
    });

    it("allows emitting teardown_delivered analytics event", () => {
      const emitSpy = vi.spyOn(analyticsTaxonomy, "emit");
      analyticsTaxonomy.emit("teardown_delivered", { leadId: "some-lead-id" });
      expect(emitSpy).toHaveBeenCalledWith("teardown_delivered", { leadId: "some-lead-id" });
    });
  });
});
