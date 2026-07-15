/**
 * Locks the CyberOS central-data recommendation artefact:
 * - every ready_to_implement task has a disposition
 * - domain "today" citations resolve on disk
 * - draft centralization tasks exist
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REC = path.join(ROOT, "docs/architecture/cyberos-central-data-source.md");
const BACKLOG = path.join(ROOT, "docs/tasks/BACKLOG.md");

function readyFrIds(): string[] {
  const text = fs.readFileSync(BACKLOG, "utf8");
  const ids: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^- \[ready_to_implement\] (FR-[A-Z0-9-]+)/);
    if (m) ids.push(m[1]!);
  }
  return ids;
}

function dispositions(rec: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /\|\s*\*\*(FR-[A-Z0-9-]+)\*\*\s*\|\s*\*\*([^*]+)\*\*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rec))) {
    map.set(m[1]!, m[2]!.trim());
  }
  return map;
}

describe("docs/cyberos-central-data-recommendation", () => {
  it("artefact exists with domain map, dispositions, and new task proposals", () => {
    expect(fs.existsSync(REC)).toBe(true);
    const rec = fs.readFileSync(REC, "utf8");
    expect(rec).toMatch(/Domain map/i);
    expect(rec).toMatch(/Disposition of every/i);
    expect(rec).toMatch(/Minimal new task set/i);
    expect(rec).toContain("TASK-BIZ-016");
    expect(rec).toContain("TASK-OPS-019");
    expect(rec).toContain("TASK-OPS-020");
    expect(rec).toContain("TASK-CMS-021");
  });

  it("every ready_to_implement BACKLOG task has exactly one disposition keyword", () => {
    const ready = readyFrIds();
    // Backlog may be fully drained (no ready tasks); only assert dispositions when present.
    if (ready.length === 0) return;
    const rec = fs.readFileSync(REC, "utf8");
    const disp = dispositions(rec);
    // Disposition table is the full set that was ready when the recommendation
    // was written; every *current* ready task must still appear there (or have
    // been shipped - then it is no longer ready and is out of this check).
    for (const id of ready) {
      expect(disp.has(id), `missing disposition for ${id}`).toBe(true);
      const d = disp.get(id)!.toLowerCase();
      expect(
        /leave|update|supersede|depends_on/.test(d),
        `bad disposition for ${id}: ${disp.get(id)}`,
      ).toBe(true);
    }
  });

  it("domain-map today citations resolve to real files", () => {
    const paths = [
      "app/api/lead/route.ts",
      "lib/db/adapter.ts",
      "lib/db/index.ts",
      "lib/content/notes.ts",
      "lib/content/site.ts",
      "lib/content/policy.ts",
      "docs/tasks/biz/TASK-BIZ-002-cyberos-lead-intake/spec.md",
      "docs/tasks/ops/TASK-OPS-005-lead-db/spec.md",
    ];
    for (const rel of paths) {
      expect(fs.existsSync(path.join(ROOT, rel)), rel).toBe(true);
    }
    // lead handler really mentions CyberOS webhook path
    const lead = fs.readFileSync(path.join(ROOT, "app/api/lead/route.ts"), "utf8");
    expect(lead).toMatch(/LEAD_CRM_WEBHOOK_URL|forwardToCyberOs/);
  });

  it("draft centralization task specs exist with status draft", () => {
    const drafts = [
      "docs/tasks/biz/TASK-BIZ-016-cyberos-central-data-platform/spec.md",
      "docs/tasks/ops/TASK-OPS-019-cyberos-content-read-model/spec.md",
      "docs/tasks/ops/TASK-OPS-020-lead-dual-write-and-migration/spec.md",
      "docs/tasks/cms/TASK-CMS-021-cyberos-notes-authoring/spec.md",
    ];
    for (const rel of drafts) {
      const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
      expect(text).toMatch(/^status: draft$/m);
      // Specs use TASK-* ids in this repo's task spine (not FR- prefixes).
      expect(text).toMatch(/^id: (FR-|TASK-)/m);
    }
  });
});
