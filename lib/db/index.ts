import { DbAdapter } from "./adapter";
import { InMemoryAdapter } from "./in-memory";
import { PrismaDbAdapter } from "./prisma";

let globalAdapter: DbAdapter | null = null;

/**
 * FR-OPS-005 / FR-OPS-014: Resolve the configured datastore or fallback safely.
 * When DATABASE_URL is present, we initialize and return the PrismaDbAdapter.
 * Otherwise, we utilize the InMemoryAdapter.
 */
export function getDb(): DbAdapter {
  if (!globalAdapter) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.info("[db] DATABASE_URL is set. Initializing PrismaDbAdapter.");
      try {
        globalAdapter = new PrismaDbAdapter();
      } catch (err: any) {
        console.error("[db] Failed to initialize PrismaDbAdapter. Falling back to InMemoryAdapter.", err);
        globalAdapter = new InMemoryAdapter();
      }
    } else {
      console.info(
        "[db] DATABASE_URL is absent. Utilizing InMemoryAdapter (data will reset on process restart)."
      );
      globalAdapter = new InMemoryAdapter();
    }
  }
  return globalAdapter;
}

/**
 * Test helper to reset or inject custom adapter during verification.
 */
export function resetDb() {
  if (globalAdapter && typeof (globalAdapter as any).disconnect === "function") {
    (globalAdapter as any).disconnect().catch(() => {});
  }
  globalAdapter = null;
}
