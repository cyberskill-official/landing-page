#!/usr/bin/env node
// FR spec gate - the `draft -> ready_to_implement` check for this repo.
//
// Why this exists (ADR-001): the CyberOS plugin's `feature-request-audit` skill runs
// `audit_rubric@2.0`, which audits a DIFFERENT FR contract (`feature_request@1`) from the
// one this repo's vendored `.cyberos/cuo/templates/FR-TEMPLATE.md` defines and the
// `ship-feature-requests` workflow actually parses. Running that rubric here fails ~12
// rules on all 168 FRs, including shipped ones - a template mismatch, not a quality signal.
// So the contract-agnostic rules that matter are enforced here instead, mechanically:
//
//   FM-001   frontmatter fences exist and parse
//   FM-003   no duplicate keys
//   FM-104   status is one of the 10 values in .cyberos/cuo/STATUS-REFERENCE.md
//   TRACE-001 every numbered clause is cited by an acceptance criterion
//   TRACE-002 every acceptance criterion names a verification (a test or evidence)
//   + this repo's own: class/priority/owner enums, depends_on resolution, no dependency on
//     a closed FR, unique ids, filename matches id, BACKLOG parity, plain-keyboard chars.
//
// TRACE-003 (every named test resolves on disk) is deliberately NOT enforced here: for an
// unimplemented FR the tests ARE the deliverable. It belongs to the coverage gate, from
// `implementing` onward.
//
// Body rules apply only to FRs the build queue can pick up (`ready_to_implement`).
// Archived (`done`), `on_hold` and `closed` FRs are checked for frontmatter validity only.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = "docs/feature-requests";
const STATUSES = ["draft", "ready_to_implement", "implementing", "ready_to_review", "reviewing", "ready_to_test", "testing", "done", "on_hold", "closed"];
const CLASSES = ["product", "improvement"];
const PRIORITIES = ["MUST", "SHOULD", "COULD", "MAY"];
const OWNERS = ["agent", "human", "mixed"];
const MODULES = ["DS", "WEB", "SCENE", "CHAR", "CTA", "CMS", "SEO", "A11Y", "PERF", "OPS", "BIZ"];
const SECTIONS = ["## 1. Description", "## 2. Acceptance criteria", "## 3. Edge cases", "## 4. Out of scope", "## 5. Protected invariants"];

const errors = [];
const warnings = [];
const err = (id, rule, msg) => errors.push(`${id} [${rule}] ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") && basename(p).startsWith("FR-") ? [p] : [];
  });
}

const frs = new Map();

for (const path of walk(ROOT).sort()) {
  const src = readFileSync(path, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(src);
  if (!m) { errors.push(`${path} [FM-001] no frontmatter`); continue; }
  const [, fmText, body] = m;

  const fm = {};
  const seen = new Set();
  for (const line of fmText.split("\n")) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, k, v] = kv;
    if (seen.has(k)) errors.push(`${path} [FM-003] duplicate key '${k}'`);
    seen.add(k);
    fm[k] = v.split("#")[0].trim().replace(/^"|"$/g, "");
  }

  const id = fm.id;
  if (!id) { errors.push(`${path} [FM-001] no id`); continue; }
  if (frs.has(id)) errors.push(`${path} [FM-003] duplicate FR id ${id} (also ${frs.get(id).path})`);
  if (!basename(path).startsWith(id)) err(id, "FM-001", `filename does not start with the id (${basename(path)})`);
  if (!MODULES.includes(id.split("-")[1])) err(id, "FM-001", `unknown module '${id.split("-")[1]}'`);
  if (!fm.title) err(id, "FM-101", "title missing");
  if (!STATUSES.includes(fm.status)) err(id, "FM-104", `status '${fm.status}' is not one of ${STATUSES.join(" | ")}`);
  if (!CLASSES.includes(fm.class)) err(id, "FM-105", `class '${fm.class}' must be product | improvement`);
  if (!PRIORITIES.includes(fm.priority)) err(id, "FM-105", `priority '${fm.priority}' must be a BCP-14 keyword`);

  const archived = path.includes("_archive");
  if (!archived && fm.owner && !OWNERS.includes(fm.owner)) err(id, "FM-106", `owner '${fm.owner}' must be agent | human | mixed`);
  if (!archived && !fm.owner) err(id, "FM-106", "owner missing (agent | human | mixed)");

  const deps = (fm.depends_on ?? "[]").replace(/[[\]]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  frs.set(id, { id, path, body, fm, deps, archived, status: fm.status, owner: fm.owner ?? "agent" });
}

// dependency integrity
for (const fr of frs.values()) {
  for (const d of fr.deps) {
    if (!frs.has(d)) err(fr.id, "DEP-001", `depends_on unknown FR ${d}`);
    else if (frs.get(d).status === "closed") err(fr.id, "DEP-002", `depends on a closed FR (${d})`);
  }
}

// body rules - only for FRs the queue can pick up
for (const fr of frs.values()) {
  if (fr.status !== "ready_to_implement") continue;
  const { id, body } = fr;

  for (const s of SECTIONS) if (!body.includes(s)) err(id, "SEC-001", `missing section '${s}'`);

  const clauses = [...body.matchAll(/^- 1\.(\d+) (.+)$/gm)].map(([, n, t]) => ({ n, t }));
  const acs = [...body.matchAll(/^- \[ \] (.+)$/gm)].map(([, t]) => t);
  if (clauses.length === 0) err(id, "SEC-008", "no numbered normative clauses in section 1");
  if (acs.length === 0) err(id, "SEC-008", "no acceptance criteria in section 2");

  const cited = new Set(acs.flatMap((a) => [...a.matchAll(/AC for 1\.(\d+)/g)].map(([, n]) => n)));
  for (const c of clauses) {
    if (!/\b(SHALL|MUST|SHOULD|MAY)\b/.test(c.t)) err(id, "TRACE-001", `clause 1.${c.n} carries no BCP-14 keyword - it is not normative`);
    const deferred = /\(deferred to /i.test(c.t);
    if (!cited.has(c.n) && !deferred) err(id, "TRACE-001", `clause 1.${c.n} is not cited by any acceptance criterion`);
    if (deferred && !/\(deferred to FR-[A-Z0-9]+-\d+/i.test(c.t)) err(id, "TRACE-005", `clause 1.${c.n} is deferred but names no destination FR`);
  }
  for (const a of acs) {
    if (!/test:\s*`[^`]+`|evidence:/.test(a)) err(id, "TRACE-002", `acceptance criterion names no verification: "${a.slice(0, 60)}..."`);
  }

  for (const [heading, label] of [["## 3. Edge cases", "edge cases"], ["## 4. Out of scope", "non-goals"], ["## 5. Protected invariants", "protected invariants"]]) {
    const seg = body.split(heading)[1]?.split("\n## ")[0] ?? "";
    if (!/^- \S/m.test(seg)) err(id, "SEC-008", `section '${label}' is empty`);
  }

  const bad = [...new Set((body.match(/[‘’“”–—…]/g) ?? []))];
  if (bad.length) err(id, "STYLE-001", `non-keyboard characters: ${bad.join(" ")}`);
}

// BACKLOG parity
const backlog = readFileSync(join(ROOT, "BACKLOG.md"), "utf8");
const listed = new Set([...backlog.matchAll(/(FR-[A-Z0-9]+-\d+) -/g)].map(([, id]) => id));
for (const id of frs.keys()) if (!listed.has(id)) err(id, "IDX-001", "no row in BACKLOG.md");
for (const id of listed) if (!frs.has(id)) errors.push(`BACKLOG.md [IDX-001] row ${id} has no FR file`);

// the queue the ship-feature-requests workflow can actually pick up
const done = (id) => frs.get(id)?.status === "done";
const eligible = [...frs.values()].filter((f) => f.status === "ready_to_implement" && f.owner === "agent" && f.deps.every(done));
const blocked = [...frs.values()].filter((f) => f.status === "ready_to_implement" && f.owner === "agent" && !f.deps.every(done));
const human = [...frs.values()].filter((f) => f.status === "ready_to_implement" && f.owner !== "agent");

const counts = {};
for (const f of frs.values()) counts[f.status] = (counts[f.status] ?? 0) + 1;

console.log(`FR gate - ${frs.size} feature requests`);
console.log(Object.entries(counts).map(([k, v]) => `  ${k}: ${v}`).join("\n"));
console.log(`\nqueue:`);
console.log(`  agent-eligible now (deps done): ${eligible.length}`);
console.log(`  agent-blocked on a dependency:  ${blocked.length}`);
console.log(`  needs a human (owner human/mixed): ${human.length}`);
if (eligible.length) console.log(`\nnext up: ${eligible.slice(0, 8).map((f) => f.id).join(", ")}${eligible.length > 8 ? ", ..." : ""}`);
if (warnings.length) console.log(`\nwarnings:\n${warnings.map((w) => "  " + w).join("\n")}`);

if (errors.length) {
  console.error(`\nFAIL - ${errors.length} error(s):`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log("\nPASS - every FR satisfies the contract in .cyberos/cuo/templates/FR-TEMPLATE.md (ADR-001).");
