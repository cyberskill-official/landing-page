import { describe, it, expect } from "vitest";
import { makeAnthropicTextDecoder } from "@/lib/genie/sse";

function delta(text: string): string {
  const payload = { type: "content_block_delta", delta: { type: "text_delta", text } };
  return `event: content_block_delta\ndata: ${JSON.stringify(payload)}\n\n`;
}

describe("Anthropic SSE text decoder", () => {
  it("extracts consecutive text deltas", () => {
    const d = makeAnthropicTextDecoder();
    const out = d.push(delta("Hello ") + delta("world"));
    expect(out.join("")).toBe("Hello world");
  });

  it("reassembles a frame split across chunks", () => {
    const d = makeAnthropicTextDecoder();
    const full = delta("Split frame");
    const mid = Math.floor(full.length / 2);
    const a = d.push(full.slice(0, mid));
    const b = d.push(full.slice(mid));
    expect([...a, ...b].join("")).toBe("Split frame");
  });

  it("ignores [DONE], keepalive pings, and non-text events", () => {
    const d = makeAnthropicTextDecoder();
    const out = d.push('event: ping\ndata: {"type":"ping"}\n\ndata: [DONE]\n\n');
    expect(out).toEqual([]);
  });
});
