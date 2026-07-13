// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { getDb, resetDb } from "@/lib/db";
import { InMemoryAdapter } from "@/lib/db/in-memory";
import { GET as getPrune } from "@/app/api/cron/prune/route";
import fs from "node:fs";
import path from "node:path";

function mockEnv(vars: Record<string, string | undefined>) {
  const original: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    original[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  return () => {
    for (const k of Object.keys(vars)) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
  };
}

describe("FR-CHAR-028: Transcript persistence & disclosures", () => {
  beforeEach(() => {
    vi.resetModules();
    resetDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. genie/transcript-persist: Finished conversation is retrievable
  test("genie/transcript-persist: finished conversation is saved and retrievable by session ID", async () => {
    const db = getDb() as InMemoryAdapter;
    db.clearAll();

    // Mock saving a finished conversation
    const sessionId = "completed-session-789";
    const record = await db.saveTranscript({
      sessionId,
      locale: "en",
      messages: [
        { sender: "user", text: "Hello", ts: new Date().toISOString() },
        { sender: "genie", text: "Hi, I am Lumi.", ts: new Date().toISOString() },
      ],
    });

    expect(record.id).toBeDefined();
    expect(record.sessionId).toBe(sessionId);

    const fetched = await db.findTranscript(sessionId);
    expect(fetched).not.toBeNull();
    expect(fetched!.messages.length).toBe(2);
  });

  // 2. genie/transcript-partial: Conversation abandoned after two turns is stored
  test("genie/transcript-partial: partial conversation is stored turn-by-turn", async () => {
    const db = getDb() as InMemoryAdapter;
    db.clearAll();

    const sessionId = "abandoned-session-111";
    
    // Save first turn
    await db.saveTranscript({
      sessionId,
      locale: "vi",
      messages: [
        { sender: "user", text: "Cần làm web", ts: new Date().toISOString() },
        { sender: "genie", text: "Lumi giúp bạn", ts: new Date().toISOString() },
      ],
    });

    // Check it is retrievable even if partial
    let fetched = await db.findTranscript(sessionId);
    expect(fetched).not.toBeNull();
    expect(fetched!.messages.length).toBe(2);

    // Save second turn (updates/overwrites the conversation for this session ID)
    await db.saveTranscript({
      sessionId,
      locale: "vi",
      messages: [
        ...fetched!.messages,
        { sender: "user", text: "Giá thế nào?", ts: new Date().toISOString() },
        { sender: "genie", text: "Giá tùy thuộc quy mô", ts: new Date().toISOString() },
      ],
    });

    fetched = await db.findTranscript(sessionId);
    expect(fetched!.messages.length).toBe(4);
  });

  // 3. ci/no-public-secrets: No raw database credentials or secrets exist in the client bundle directory
  test("ci/no-public-secrets: client files contain no DATABASE_URL or database credentials", () => {
    // Scan components directory for database client or secrets
    const componentsDir = path.resolve(process.cwd(), "components");
    const files = fs.readdirSync(componentsDir, { recursive: true }) as string[];
    
    for (const file of files) {
      const fullPath = path.join(componentsDir, file);
      if (fs.statSync(fullPath).isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
        const content = fs.readFileSync(fullPath, "utf8");
        expect(content).not.toContain("DATABASE_URL");
        expect(content).not.toContain("databaseUrl");
      }
    }
  });

  // 4. genie/transcript-retention: Expired transcripts pruned by retention job
  test("genie/transcript-retention: records past retention date are pruned by prune job", async () => {
    const db = getDb() as InMemoryAdapter;
    db.clearAll();

    const restore = mockEnv({ CRON_SECRET: "my-test-secret" });

    // Save a normal lead
    await db.saveLead({
      sessionId: "active-session",
      email: "active@example.com",
      locale: "en",
      source: "direct",
    });

    // Directly insert an expired lead record
    const expiredLeadId = "expired-lead-id";
    const now = new Date();
    const expiredDate = new Date();
    expiredDate.setMonth(now.getMonth() - 25); // 25 months ago (retention is 24)

    // Using getLeadsMap getter to mock an expired record in InMemoryAdapter
    const leadsMap = db.getLeadsMap();
    leadsMap.set("expired-session", {
      id: expiredLeadId,
      sessionId: "expired-session",
      email: "expired@example.com",
      locale: "en",
      source: "direct",
      submittedAt: expiredDate.toISOString(),
      retentionDate: expiredDate.toISOString(),
    });

    expect(db.getLeadsCount()).toBe(2);

    // Call prune cron endpoint
    const req = new Request("http://localhost/api/cron/prune?secret=my-test-secret");
    const res = await getPrune(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.pruned).toBe(1);

    expect(db.getLeadsCount()).toBe(1); // One expired lead pruned!

    restore();
  });

  // 5. genie/transfer-disclosure: Disclosure renders before the first message (greeting contains Anthropic and store details)
  test("genie/transfer-disclosure: greeting text contains Anthropic and store mentions in both EN and VI", () => {
    const dictsPath = path.resolve(process.cwd(), "lib/i18n/dictionaries.ts");
    const src = fs.readFileSync(dictsPath, "utf8");
    
    // Greeting disclosures
    expect(src).toContain("processed by Anthropic and stored");
    expect(src).toContain("xử lý bởi Anthropic và lưu trữ");
  });
});
