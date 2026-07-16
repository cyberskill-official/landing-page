#!/usr/bin/env node
// task spec gate - the `draft -> ready_to_implement` check for this repo.
//
// Why this exists (ADR-001): the CyberOS plugin's `task-audit` skill runs
// `audit_rubric@2.0`, which audits a DIFFERENT task contract (`task@1`) from the
// one this repo's vendored `.cyberos/cuo/templates/TASK-TEMPLATE.md` defines and the
// `ship-tasks` workflow actually parses. Running that rubric here fails ~12
// rules on all 168 tasks, including shipped ones - a template mismatch, not a quality signal.
// So the contract-agnostic rules that matter are enforced here instead, mechanically:
//
//   FM-001   frontmatter fences exist and parse
//   FM-003   no duplicate keys
//   FM-104   status is one of the 10 values in .cyberos/cuo/STATUS-REFERENCE.md
//   TRACE-001 every numbered clause is cited by an acceptance criterion
//   TRACE-002 every acceptance criterion names a verification (a test or evidence)
//   + this repo's own: class/priority/owner enums, depends_on resolution, no dependency on
//     a closed task, unique ids, filename matches id, BACKLOG parity, plain-keyboard chars.
//
// TRACE-003 (every named test resolves on disk) is deliberately NOT enforced here: for an
// unimplemented task the tests ARE the deliverable. It belongs to the coverage gate, from
// `implementing` onward.
//
// Body rules apply only to tasks the build queue can pick up (`ready_to_implement`).
// Archived (`done`), `on_hold` and `closed` tasks are checked for frontmatter validity only.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename, dirname } from "node:path";

const ROOT = "docs/tasks";
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
    if (statSync(p).isDirectory()) return walk(p);
    if (p.endsWith(".md")) {
      const base = basename(p);
      if (base.startsWith("TASK-")) return [p];
      if (base === "spec.md" && basename(dirname(p)).startsWith("TASK-")) return [p];
    }
    return [];
  });
}

const tasks = new Map();

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
  if (tasks.has(id)) errors.push(`${path} [FM-003] duplicate task id ${id} (also ${tasks.get(id).path})`);
  const baseNameCheck = basename(path) === "spec.md" ? basename(dirname(path)) : basename(path);
  if (!baseNameCheck.startsWith(id)) err(id, "FM-001", `filename or folder does not start with the id (${baseNameCheck})`);
  if (!MODULES.includes(id.split("-")[1])) err(id, "FM-001", `unknown module '${id.split("-")[1]}'`);
  if (!fm.title) err(id, "FM-101", "title missing");
  if (!STATUSES.includes(fm.status)) err(id, "FM-104", `status '${fm.status}' is not one of ${STATUSES.join(" | ")}`);
  if (!CLASSES.includes(fm.class)) err(id, "FM-105", `class '${fm.class}' must be product | improvement`);
  if (!PRIORITIES.includes(fm.priority)) err(id, "FM-105", `priority '${fm.priority}' must be a BCP-14 keyword`);

  const archived = path.includes("_archive");
  if (!archived && fm.owner && !OWNERS.includes(fm.owner)) err(id, "FM-106", `owner '${fm.owner}' must be agent | human | mixed`);
  if (!archived && !fm.owner) err(id, "FM-106", "owner missing (agent | human | mixed)");

  const deps = (fm.depends_on ?? "[]").replace(/[[\]]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  tasks.set(id, { id, path, body, fm, deps, archived, status: fm.status, owner: fm.owner ?? "agent" });
}

// dependency integrity
for (const task of tasks.values()) {
  for (const d of task.deps) {
    if (!tasks.has(d)) err(task.id, "DEP-001", `depends_on unknown task ${d}`);
    else if (tasks.get(d).status === "closed") err(task.id, "DEP-002", `depends on a closed task (${d})`);
  }
}

// DEP-003: no cycles - a cycle is a queue that can never drain.
const CYCLE_MARK = new Map();
const findCycle = (id, path = []) => {
  if (path.includes(id)) return [...path.slice(path.indexOf(id)), id];
  if (CYCLE_MARK.get(id) === "clean") return null;
  for (const d of tasks.get(id)?.deps ?? []) {
    if (!tasks.has(d)) continue;
    const c = findCycle(d, [...path, id]);
    if (c) return c;
  }
  CYCLE_MARK.set(id, "clean");
  return null;
};
const reported = new Set();
for (const id of tasks.keys()) {
  const c = findCycle(id);
  if (c) {
    const k = [...new Set(c)].sort().join(">");
    if (!reported.has(k)) { reported.add(k); err(id, "DEP-003", `dependency cycle: ${c.join(" -> ")}`); }
  }
}

// DEP-004: an agent-owned task must never depend (transitively) on a human/mixed task that is
// not done - that is a permanent stall: the queue would skip it forever with no signal.
// The right shape is a mechanism that ships env/config-gated and degrades gracefully, with
// the human input landing later. See docs/tasks/README.md §1.
const humanBlockers = (id, seen = new Set()) => {
  const out = new Set();
  for (const d of tasks.get(id)?.deps ?? []) {
    if (seen.has(d) || !tasks.has(d)) continue;
    seen.add(d);
    const dep = tasks.get(d);
    if (dep.status === "done") continue;
    if (dep.owner !== "agent") out.add(d);
    for (const x of humanBlockers(d, seen)) out.add(x);
  }
  return out;
};
for (const task of tasks.values()) {
  if (task.status !== "ready_to_implement" || task.owner !== "agent") continue;
  const blockers = humanBlockers(task.id);
  if (blockers.size) err(task.id, "DEP-004", `agent-owned but permanently stalled behind human-owned ${[...blockers].sort().join(", ")} - re-scope so the mechanism ships gated, or change the owner`);
}

// body rules - only for tasks the queue can pick up
for (const task of tasks.values()) {
  if (task.status !== "ready_to_implement") continue;
  const { id, body } = task;

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
    if (deferred && !/\(deferred to TASK-[A-Z0-9]+-\d+/i.test(c.t)) err(id, "TRACE-005", `clause 1.${c.n} is deferred but names no destination task`);
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
const listed = new Set([...backlog.matchAll(/(TASK-[A-Z0-9]+-\d+) -/g)].map(([, id]) => id));
for (const id of tasks.keys()) if (!listed.has(id)) err(id, "IDX-001", "no row in BACKLOG.md");
for (const id of listed) if (!tasks.has(id)) errors.push(`BACKLOG.md [IDX-001] row ${id} has no task file`);

// the queue the ship-tasks workflow can actually pick up
const done = (id) => tasks.get(id)?.status === "done";
const eligible = [...tasks.values()].filter((f) => f.status === "ready_to_implement" && f.owner === "agent" && f.deps.every(done));
const blocked = [...tasks.values()].filter((f) => f.status === "ready_to_implement" && f.owner === "agent" && !f.deps.every(done));
const human = [...tasks.values()].filter((f) => f.status === "ready_to_implement" && f.owner !== "agent");

const counts = {};
for (const f of tasks.values()) counts[f.status] = (counts[f.status] ?? 0) + 1;

console.log(`task gate - ${tasks.size} tasks`);
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
console.log("\nPASS - every task satisfies the contract in .cyberos/cuo/templates/TASK-TEMPLATE.md (ADR-001).");
