// Pure, testable parser for the Anthropic Messages streaming SSE protocol.
// It is stateful across chunk boundaries (a JSON frame can split mid-line), and
// emits only the text deltas. Used by /api/genie; unit-tested in tests/sse.test.ts.

export function makeAnthropicTextDecoder() {
  let buffer = "";
  return {
    /** Feed a decoded text chunk; returns any complete text deltas found. */
    push(chunk: string): string[] {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      const out: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const evt = JSON.parse(data) as {
            type?: string;
            delta?: { type?: string; text?: string };
          };
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
            out.push(evt.delta.text);
          }
        } catch {
          // keepalive ping or a partial frame: ignore
        }
      }
      return out;
    },
  };
}
