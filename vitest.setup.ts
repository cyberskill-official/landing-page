import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({
    className: "mock-space-grotesk",
    variable: "--font-display",
    style: { fontFamily: "mock-space-grotesk" },
  }),
  Be_Vietnam_Pro: () => ({
    className: "mock-be-vietnam-pro",
    variable: "--font-body",
    style: { fontFamily: "mock-be-vietnam-pro" },
  }),
}));

if (typeof window !== 'undefined') {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

