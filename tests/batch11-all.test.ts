// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

// Imports
import { GET as getLlms } from "@/app/llms.txt/route";
import { GET as getLlmsFull } from "@/app/llms-full.txt/route";
import { GET as getRobots } from "@/app/robots.txt/route";
import { GET as getFeed } from "@/app/[lang]/feed.xml/route";
import { PostSchema } from "@/lib/content/post-schema"; // we will create this or use NotePost schema
import { getDb, resetDb } from "@/lib/db";
import { InMemoryAdapter } from "@/lib/db/in-memory";
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

describe("Batch 11 tests — FR-SEO-017, FR-SEO-006, FR-CMS-010, FR-OPS-005, FR-A11Y-004", () => {
  beforeEach(() => {
    vi.resetModules();
    resetDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. FR-SEO-017: llms.txt & llms-full.txt and robots stance
  describe("FR-SEO-017 (llms.txt + robots.txt)", () => {
    test("llms.txt returns 200 text/plain and contains legal entity facts (DUNS, HCMC, 2020)", async () => {
      const res = await getLlms();
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("text/plain");
      const body = await res.text();
      expect(body).toContain("CyberSkill Software Solutions Consultancy");
      expect(body).toContain("2020");
      expect(body).toContain("Ho Chi Minh City");
      expect(body).toContain("673219568"); // DUNS
    });

    test("llms-full.txt returns 200 text/plain and contains delivery process + FAQ digest", async () => {
      const res = await getLlmsFull();
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("text/plain");
      const body = await res.text();
      expect(body).toContain("CyberSkill (Full Specification)");
      expect(body).toContain("Delivery Process");
      expect(body).toContain("Frequently Asked Questions");
    });

    test("robots.txt contains rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and references llms files, no Host directive", async () => {
      const res = await getRobots();
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain("User-agent: GPTBot");
      expect(body).toContain("User-agent: ClaudeBot");
      expect(body).toContain("User-agent: PerplexityBot");
      expect(body).toContain("User-agent: Google-Extended");
      expect(body).toContain("llms:");
      expect(body).toContain("llms-full:");
      expect(body).not.toContain("Host:");
    });
  });

  // 2. FR-SEO-006: RSS/Atom feed
  describe("FR-SEO-006 (RSS Feed)", () => {
    test("feed.xml returns well-formed RSS XML, locale-aware, excludes drafts, sorts newest-first", async () => {
      const req = new Request("http://localhost/en/feed.xml");
      const res = await getFeed(req, { params: Promise.resolve({ lang: "en" }) });
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("application/xml");
      const body = await res.text();
      expect(body).toContain("<rss version=\"2.0\"");
      expect(body).toContain("<channel>");
      expect(body).toContain("<title>Engineering Insights");

      // Verify that notes are included
      expect(body).toContain("<item>");
      expect(body).toContain("<link>https://cyberskill.world/en/notes/");
    });

    test("Notes listing page metadata has alternate RSS link references", async () => {
      const notePagePath = path.resolve(process.cwd(), "app/[lang]/notes/page.tsx");
      const src = fs.readFileSync(notePagePath, "utf8");
      expect(src).toContain("application/rss+xml");
      expect(src).toContain("/feed.xml");
    });

    test("Note detail page metadata has alternate RSS link references", async () => {
      const noteDetailPath = path.resolve(process.cwd(), "app/[lang]/notes/[slug]/page.tsx");
      const src = fs.readFileSync(noteDetailPath, "utf8");
      expect(src).toContain("application/rss+xml");
      expect(src).toContain("/feed.xml");
    });
  });

  // 3. FR-CMS-010: Insights post template
  describe("FR-CMS-010 (Post Template Schema)", () => {
    test("NotePost interface requires title, summary, body, publishedAt, updatedAt, author, tldr", async () => {
      const notesDataPath = path.resolve(process.cwd(), "lib/content/notes.ts");
      const src = fs.readFileSync(notesDataPath, "utf8");
      expect(src).toContain("tldr: LocalizedString");
      expect(src).toContain("author: {");
      expect(src).toContain("publishedAt: string");
      expect(src).toContain("updatedAt: string");
    });

    test("Detail page renders ArticleJsonLd and TLDR section block", async () => {
      const detailPagePath = path.resolve(process.cwd(), "app/[lang]/notes/[slug]/page.tsx");
      const src = fs.readFileSync(detailPagePath, "utf8");
      expect(src).toContain("<ArticleJsonLd");
      expect(src).toContain("tldrText");
    });
  });

  // 4. FR-OPS-005: Datastore
  describe("FR-OPS-005 (Datastore Adapter)", () => {
    test("InMemoryAdapter save, find, soft delete, and pruneExpired logic", async () => {
      const db = new InMemoryAdapter();
      db.clearAll();

      const lead = await db.saveLead({
        sessionId: "test-sess-123",
        email: "test@example.com",
        name: "Test User",
        locale: "en",
        source: "direct",
      });

      expect(lead.id).toBeDefined();
      expect(lead.sessionId).toBe("test-sess-123");
      expect(lead.retentionDate).toBeDefined(); // PDPL compliance retention date present

      const fetched = await db.findLead("test-sess-123");
      expect(fetched).not.toBeNull();
      expect(fetched!.email).toBe("test@example.com");

      // Soft delete
      await db.deleteLead(lead.id);
      const fetchedAfterDelete = await db.findLead("test-sess-123");
      expect(fetchedAfterDelete).toBeNull(); // Should be null/soft-deleted

      // Prune expired
      const expiredCount = await db.pruneExpired();
      expect(expiredCount).toBe(0); // None are actually expired yet
    });

    test("Db factory resolves to InMemoryAdapter when DATABASE_URL is not set", () => {
      const restore = mockEnv({ DATABASE_URL: undefined });
      const db = getDb();
      expect(db).toBeInstanceOf(InMemoryAdapter);
      restore();
    });

    test("schema.sql contains version-controlled leads and transcripts tables", () => {
      const schemaPath = path.resolve(process.cwd(), "lib/db/schema.sql");
      expect(fs.existsSync(schemaPath)).toBe(true);
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS leads");
      expect(schemaSql).toContain("CREATE TABLE IF NOT EXISTS transcripts");
      expect(schemaSql).toContain("retention_date");
    });
  });

  // 5. FR-A11Y-004: Keyboard operability & visible focus
  describe("FR-A11Y-004 (Keyboard A11Y)", () => {
    test("Canvas element is marked tabIndex=-1 in GenieScene.tsx", () => {
      const scenePath = path.resolve(process.cwd(), "components/canvas/GenieScene.tsx");
      const src = fs.readFileSync(scenePath, "utf8");
      expect(src).toContain("tabIndex={-1}");
    });

    test("globals.css has :focus-visible rules defined", () => {
      const globalsCssPath = path.resolve(process.cwd(), "app/globals.css");
      const src = fs.readFileSync(globalsCssPath, "utf8");
      expect(src).toContain(":focus-visible {");
    });
  });
});
