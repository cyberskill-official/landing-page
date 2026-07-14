// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { BookingLink, bookingLabels } from "@/components/cta/BookingLink";
import * as taxonomy from "@/lib/analytics/taxonomy";

describe("cta/booking-action (ui)", () => {
  beforeEach(() => {
    vi.spyOn(taxonomy, "emit").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when url is null; link when url provided", () => {
    const empty = document.createElement("div");
    document.body.appendChild(empty);
    const rootEmpty = createRoot(empty);
    act(() => {
      rootEmpty.render(
        createElement(BookingLink, {
          locale: "en",
          location: "contact-section",
          url: null,
        }),
      );
    });
    expect(empty.querySelector("[data-booking-link]")).toBeNull();
    act(() => rootEmpty.unmount());
    empty.remove();

    const box = document.createElement("div");
    document.body.appendChild(box);
    const root = createRoot(box);
    act(() => {
      root.render(
        createElement(BookingLink, {
          locale: "en",
          location: "contact-section",
          url: "https://cal.example.com/cs",
        }),
      );
    });
    const a = box.querySelector("[data-booking-link]") as HTMLAnchorElement;
    expect(a).toBeTruthy();
    expect(a.href).toContain("cal.example.com");
    expect(a.target).toBe("_blank");
    expect(a.rel).toContain("noopener");
    expect(a.textContent).toBe(bookingLabels.en);
    act(() => {
      a.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(taxonomy.emit).toHaveBeenCalledWith("booking_clicked", {
      location: "contact-section",
    });
    act(() => root.unmount());
    box.remove();
  });
});
