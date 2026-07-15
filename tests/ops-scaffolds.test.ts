import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  getPublishableContent,
  isCyberOsContentConfigured,
} from "@/lib/content/read-model";
import {
  shouldFailVisitorSubmission,
  isPrimarySor,
  summariseDualWrite,
  type ChannelResult,
} from "@/lib/lead/dual-write";
import { commercialPolicy } from "@/lib/content/policy";
import { notes } from "@/lib/content/notes";
import { team } from "@/lib/content/site";

describe("content/read-model (TASK-OPS-019 scaffold)", () => {
  it("returns git SSOT with real modules, never empty invent", () => {
    const c = getPublishableContent();
    expect(c.source).toBe("git");
    expect(c.notes.length).toBe(notes.length);
    expect(c.commercialPolicy.registrationNumber).toBe(
      commercialPolicy.registrationNumber,
    );
    expect(c.team.length).toBe(team.length);
    expect(c.company.legalName.length).toBeGreaterThan(0);
    expect(isCyberOsContentConfigured({})).toBe(false);
    expect(
      isCyberOsContentConfigured({
        CYBEROS_CONTENT_URL: "https://example.invalid/content",
      }),
    ).toBe(true);
  });
});

describe("lead/dual-write (TASK-OPS-020 scaffold)", () => {
  it("never fails the visitor on CyberOS channel failure", () => {
    const results: ChannelResult[] = [
      { channel: "file", configured: true, ok: true },
      { channel: "cyberos", configured: true, ok: false, error: "500" },
      { channel: "db", configured: true, ok: true },
    ];
    expect(shouldFailVisitorSubmission(results)).toBe(false);
  });

  it("treats CyberOS as primary SoR when configured", () => {
    expect(isPrimarySor("cyberos", true)).toBe(true);
    expect(isPrimarySor("db", true)).toBe(false);
    expect(isPrimarySor("db", false)).toBe(true);
    expect(isPrimarySor("file", false)).toBe(true);
  });

  it("summarises configured/failed and cyberosOk", () => {
    const s = summariseDualWrite([
      { channel: "email", configured: true, ok: true },
      { channel: "cyberos", configured: true, ok: false, error: "down" },
      { channel: "ack", configured: true, ok: true },
    ]);
    expect(s.configured).toBe(2);
    expect(s.failed).toBe(1);
    expect(s.cyberosOk).toBe(false);
  });
});

describe("docs/operator-runbook", () => {
  it("runbook and interim sheet exist with every ready task id", () => {
    const runbook = fs.readFileSync(
      path.join(process.cwd(), "docs/ops/operator-runbook-remaining-frs.md"),
      "utf8",
    );
    const sheet = fs.readFileSync(
      path.join(process.cwd(), "docs/ops/lead-interim-sor-sheet.md"),
      "utf8",
    );
    expect(runbook).toMatch(/## 1\. Triage/);
    expect(sheet).toMatch(/status/);

    const backlog = fs.readFileSync(
      path.join(process.cwd(), "docs/tasks/BACKLOG.md"),
      "utf8",
    );
    const ready = [
      ...backlog.matchAll(/^- \[ready_to_implement\] (FR-[A-Z0-9-]+)/gm),
    ].map((m) => m[1]!);
    // When the ready queue is empty, only require the draft task anchors below.
    for (const id of ready) {
      expect(runbook, `runbook missing ${id}`).toContain(id);
    }
    // Drafts
    for (const id of ["TASK-BIZ-016", "TASK-OPS-019", "TASK-OPS-020", "TASK-CMS-021"]) {
      expect(runbook).toContain(id);
    }
  });
});
