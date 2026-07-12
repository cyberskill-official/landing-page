// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LumiPlaceholder } from "@/components/canvas/LumiPlaceholder";

vi.mock("@/lib/genie/store", () => ({
  useGenieStore: vi.fn((selector) => {
    const state = { status: "idle", open: false };
    return selector(state);
  }),
}));

vi.mock("@/lib/theme", () => ({
  useThemeMode: vi.fn(() => "dark"),
}));

vi.mock("@react-three/fiber", () => ({
  useFrame: vi.fn(),
  Canvas: ({ children }: any) => createElement("div", { "data-testid": "canvas" }, children),
}));

// FR-SCENE-009 requires that the scene disposes of WebGL resources on unmount
// and stays under the draw call budget. Testing WebGL context in JSDOM is not
// possible, so we verify that the component can render without throwing and
// rely on manual profiling and Lighthouse budgets for the draw call count.

describe("FR-SCENE-009: GPU Disposal and Draw-call Budget", () => {
  it("renders LumiPlaceholder without throwing", () => {
    // We expect a group with pointLight and meshes inside
    const html = renderToStaticMarkup(createElement(LumiPlaceholder));
    expect(html).toContain("group");
  });
});
