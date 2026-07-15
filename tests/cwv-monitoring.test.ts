import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/analytics/route";

describe("TASK-PERF-013: CWV Monitoring and Alerting", () => {
  const originalConsoleError = console.error;
  const originalConsoleInfo = console.info;

  beforeEach(async () => {
    // Clear history via the private route event
    await POST(new Request("https://cyberskill.world/api/analytics", {
      method: "POST",
      body: JSON.stringify({ event: "clear_history_for_testing" }),
    }));
    console.error = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
  });

  it("analytics/field-vitals-ingest: accepts cwv_metric events (TASK-PERF-013 §1.3)", async () => {
    const req = new Request("https://cyberskill.world/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        event: "cwv_metric",
        props: {
          name: "LCP",
          value: 2000,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    expect(console.info).toHaveBeenCalledWith(
      "[analytics]",
      expect.stringContaining("cwv_metric")
    );
  });

  it("analytics/cwv-alert: logs cwv p75 breach alert when thresholds are exceeded (TASK-PERF-013 §1.4)", async () => {
    // Post three good values and one bad value
    // Since p75 picks the 75th percentile, posting [2000, 2100, 2200, 3000] makes p75 = 3000, triggering breach.
    const values = [2000, 2100, 2200, 3000];
    
    for (const val of values) {
      const req = new Request("https://cyberskill.world/api/analytics", {
        method: "POST",
        body: JSON.stringify({
          event: "cwv_metric",
          props: {
            name: "LCP",
            value: val,
          },
        }),
      });
      await POST(req);
    }

    // Check that console.error was called with the breach alert
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[alert] cwv p75 breach: LCP value 3000 exceeds good threshold")
    );
  });

  it("analytics/cwv-alert: does not alert when p75 remains within limits", async () => {
    const values = [2000, 2100, 2200, 2400]; // p75 is 2400 <= 2500
    
    for (const val of values) {
      const req = new Request("https://cyberskill.world/api/analytics", {
        method: "POST",
        body: JSON.stringify({
          event: "cwv_metric",
          props: {
            name: "LCP",
            value: val,
          },
        }),
      });
      await POST(req);
    }

    expect(console.error).not.toHaveBeenCalled();
  });
});
