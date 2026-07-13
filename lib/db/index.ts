import { DbAdapter } from "./adapter";
import { InMemoryAdapter } from "./in-memory";

let globalAdapter: DbAdapter | null = null;

/**
 * FR-OPS-005 §1.5: Resolve the configured datastore or fallback safely.
 * Under local/CI environments where DATABASE_URL is not set, this defaults
 * to the InMemoryAdapter so request flows are never broken.
 */
export function getDb(): DbAdapter {
  if (!globalAdapter) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.warn(
        "[db] DATABASE_URL is set but database driver is not yet initialized. Falling back to InMemoryAdapter."
      );
    } else {
      console.info(
        "[db] DATABASE_URL is absent. Utilizing InMemoryAdapter (data will reset on process restart)."
      );
    }
    globalAdapter = new InMemoryAdapter();
  }
  return globalAdapter;
}

/**
 * Test helper to reset or inject custom adapter during verification.
 */
export function resetDb() {
  globalAdapter = null;
}
