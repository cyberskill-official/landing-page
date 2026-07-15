// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { getDb, resetDb } from "@/lib/db";
import { PrismaDbAdapter } from "@/lib/db/prisma";
import fs from "node:fs";
import path from "node:path";

function mockEnv(vars: Record<string, string | undefined>) {
  const original: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) original[k] = process.env[k];
  Object.assign(process.env, vars);
  return () => {
    for (const k of Object.keys(vars)) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
  };
}

// Mock Prisma client and pg Pool
const mockCreateLead = vi.fn();
const mockFindFirstLead = vi.fn();
const mockFindUniqueLead = vi.fn();
const mockUpdateLead = vi.fn();
const mockUpdateManyLeads = vi.fn().mockResolvedValue({ count: 0 });

const mockCreateTranscript = vi.fn();
const mockFindFirstTranscript = vi.fn();
const mockUpdateTranscript = vi.fn();
const mockUpdateManyTranscripts = vi.fn().mockResolvedValue({ count: 0 });

const mockTransaction = vi.fn(async (cb) => {
  const tx = {
    lead: {
      create: mockCreateLead,
      findFirst: mockFindFirstLead,
      findUnique: mockFindUniqueLead,
      update: mockUpdateLead,
      updateMany: mockUpdateManyLeads,
    },
    transcript: {
      create: mockCreateTranscript,
      findFirst: mockFindFirstTranscript,
      update: mockUpdateTranscript,
      updateMany: mockUpdateManyTranscripts,
    },
  };
  return cb(tx);
});
const mockDisconnect = vi.fn();

vi.mock("@prisma/client", () => {
  class PrismaClient {
    $transaction = mockTransaction;
    $disconnect = mockDisconnect;
    lead = {
      create: mockCreateLead,
      findFirst: mockFindFirstLead,
      findUnique: mockFindUniqueLead,
      update: mockUpdateLead,
      updateMany: mockUpdateManyLeads,
    };
    transcript = {
      create: mockCreateTranscript,
      findFirst: mockFindFirstTranscript,
      update: mockUpdateTranscript,
      updateMany: mockUpdateManyTranscripts,
    };
  }
  return { PrismaClient };
});

vi.mock("@prisma/adapter-pg", () => {
  class PrismaPg {
    constructor(pool: any) {}
  }
  return { PrismaPg };
});

vi.mock("pg", () => {
  class Pool {
    constructor(config: any) {}
    end = vi.fn();
  }
  return { Pool };
});

describe("TASK-OPS-014: Prisma PostgreSQL integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDb();
  });

  afterEach(() => {
    resetDb();
  });

  // 1. db/prisma-initialization
  test("db/prisma-initialization: initializes and returns PrismaDbAdapter when DATABASE_URL is set", () => {
    const restore = mockEnv({ DATABASE_URL: "postgresql://user:pass@localhost:5432/db" });
    const db = getDb();
    expect(db).toBeInstanceOf(PrismaDbAdapter);
    restore();
  });

  // 2. db/prisma-connection-fallback
  test("db/prisma-connection-fallback: connection timeout errors fail safe to no-op without crashing", async () => {
    vi.useFakeTimers();
    const restore = mockEnv({ DATABASE_URL: "postgresql://user:pass@localhost:5432/db" });
    const db = getDb();

    // Force connection error on transaction call
    const connectionError = new Error("Connection timed out");
    connectionError.name = "PrismaClientInitializationError";
    mockTransaction.mockRejectedValue(connectionError);

    // Call saveLead and assert it fails safe (returns lead record anyway as no-op)
    const savePromise = db.saveLead({
      sessionId: "sess-123",
      email: "timeout@example.com",
      locale: "en",
      source: "test",
    });

    // Fast-forward delays in withRetry
    await vi.runAllTimersAsync();
    const result = await savePromise;

    expect(result.email).toBe("timeout@example.com");
    expect(result.id).toBeDefined();

    // Verify pruneExpired fallback
    const prunePromise = db.pruneExpired();
    await vi.runAllTimersAsync();
    const prunedCount = await prunePromise;
    expect(prunedCount).toBe(0);

    // Restore the default mock behavior of transaction
    mockTransaction.mockImplementation(async (cb) => {
      const tx = {
        lead: {
          create: mockCreateLead,
          findFirst: mockFindFirstLead,
          findUnique: mockFindUniqueLead,
          update: mockUpdateLead,
          updateMany: mockUpdateManyLeads,
        },
        transcript: {
          create: mockCreateTranscript,
          findFirst: mockFindFirstTranscript,
          update: mockUpdateTranscript,
          updateMany: mockUpdateManyTranscripts,
        },
      };
      return cb(tx);
    });

    restore();
    vi.useRealTimers();
  });

  // 3. db/prisma-atomic-writes
  test("db/prisma-atomic-writes: saveLead and saveTranscript use transactions to link records", async () => {
    const restore = mockEnv({ DATABASE_URL: "postgresql://user:pass@localhost:5432/db" });
    const db = getDb();

    // --- saveLead transaction linking mock ---
    mockCreateLead.mockResolvedValue({ id: "lead-new-123" });
    mockFindFirstTranscript.mockResolvedValue({ id: "transcript-exist-456" });
    mockUpdateTranscript.mockResolvedValue({ id: "transcript-exist-456", leadId: "lead-new-123" });

    const lead = await db.saveLead({
      sessionId: "atomic-sess-789",
      email: "atomic@example.com",
      locale: "vi",
      source: "chat",
    });

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionId: "atomic-sess-789",
          email: "atomic@example.com",
        }),
      })
    );
    expect(mockFindFirstTranscript).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId: "atomic-sess-789", leadId: null, deletedAt: null },
      })
    );
    expect(mockUpdateTranscript).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "transcript-exist-456" },
        data: { leadId: lead.id },
      })
    );

    restore();
  });

  // 4. db/schema-parity
  test("db/schema-parity: schema.sql table and column names match schema.prisma models", () => {
    const sqlPath = path.resolve(process.cwd(), "lib/db/schema.sql");
    const prismaPath = path.resolve(process.cwd(), "prisma/schema.prisma");

    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    const prismaContent = fs.readFileSync(prismaPath, "utf8");

    // Check table mapping
    expect(prismaContent).toContain('@@map("leads")');
    expect(prismaContent).toContain('@@map("transcripts")');

    // Extract columns from schema.sql and check map annotations
    const leadsSqlFields = ["id", "session_id", "email", "name", "locale", "source", "intent", "utm_source", "utm_medium", "utm_campaign", "submitted_at", "retention_date", "deleted_at"];
    leadsSqlFields.forEach((field) => {
      expect(sqlContent).toContain(field);
      if (field !== "id" && field !== "email" && field !== "name" && field !== "locale" && field !== "source" && field !== "intent") {
        expect(prismaContent).toContain(`@map("${field}")`);
      }
    });

    const transcriptsSqlFields = ["id", "session_id", "lead_id", "messages", "locale", "created_at", "retention_date", "deleted_at"];
    transcriptsSqlFields.forEach((field) => {
      expect(sqlContent).toContain(field);
      if (field !== "id" && field !== "messages" && field !== "locale") {
        expect(prismaContent).toContain(`@map("${field}")`);
      }
    });
  });
});
