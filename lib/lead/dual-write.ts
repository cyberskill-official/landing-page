/**
 * TASK-OPS-020 scaffold: dual-write helpers for CyberOS primary + local buffer.
 * The /api/lead route already fans out; this module centralises the policy so
 * tests and future migration can share one definition of "primary SoR".
 */

export type DualWriteChannel =
  | "file"
  | "email"
  | "slack"
  | "cyberos"
  | "ack"
  | "db";

export type ChannelResult =
  | { channel: DualWriteChannel; configured: boolean; ok: true }
  | { channel: DualWriteChannel; configured: boolean; ok: false; error: string };

/**
 * Visitor-facing success policy: never fail the HTTP response solely because
 * CyberOS (or any single non-required sink) failed. Production alerts when
 * every configured sink fails (see /api/lead).
 */
export function shouldFailVisitorSubmission(results: ChannelResult[]): boolean {
  // Validation failures happen before dual-write; here we always accept.
  void results;
  return false;
}

/**
 * CyberOS is the primary SoR when configured. Local db/file are buffers.
 */
export function isPrimarySor(
  channel: DualWriteChannel,
  cyberosConfigured: boolean,
): boolean {
  if (channel === "cyberos" && cyberosConfigured) return true;
  if (!cyberosConfigured && (channel === "db" || channel === "file")) return true;
  return false;
}

/**
 * Summarise dual-write for logs / OPS-010 style alerts.
 */
export function summariseDualWrite(results: ChannelResult[]): {
  configured: number;
  failed: number;
  cyberosOk: boolean | null;
} {
  let configured = 0;
  let failed = 0;
  let cyberosOk: boolean | null = null;
  for (const r of results) {
    if (r.channel === "ack") continue;
    if (r.configured) {
      configured++;
      if (!r.ok) failed++;
    }
    if (r.channel === "cyberos") {
      cyberosOk = r.configured ? r.ok : null;
    }
  }
  return { configured, failed, cyberosOk };
}
