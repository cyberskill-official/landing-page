#!/usr/bin/env python3
"""
Generate a dependency graph visualisation from FR frontmatter.

Reads:   docs/feature-requests/*/FR-*.md
Writes:  docs/feature-requests/FR_GRAPH.md            (Mermaid source + analysis)
         docs/feature-requests/.fr-graph-cache.json   (machine-readable graph)

Graph features:
- Nodes coloured by status (accepted → green, planned → grey, building → blue, shipped → black).
- Edges from `depends_on` (B depends on A: A → B).
- Cycle detection (exits non-zero on cycle).
- Per-phase clustering.
- "Most-blocking" ranking — which FR unblocks the most downstream work.

Run:    python3 tools/fr-graph.py
        python3 tools/fr-graph.py --check        # exit 1 if graph changes
        python3 tools/fr-graph.py --no-cycles    # exit 0 only if cycle-free

References:
- AGENTS.md §0.8 (module catalogue)
- BACKLOG.md §10 (dependency-graph health)
- feature-request-audit skill §6 (frontmatter contract)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FR_DIR = ROOT / "docs" / "feature-requests"
OUTPUT_MD = FR_DIR / "FR_GRAPH.md"
OUTPUT_JSON = FR_DIR / ".fr-graph-cache.json"


# -- frontmatter parser (mirrors regen-backlog.py — kept independent for portability) --
def parse_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---", text, flags=re.DOTALL)
    if not m:
        return {}
    block = m.group(1)
    out: dict = {}
    current_list_key: str | None = None
    list_buf: list[str] = []

    for line in block.splitlines():
        # Multi-line list continuation: lines starting with `  - `
        if line.startswith("  - ") and current_list_key:
            item = line[4:].strip()
            # strip inline comment
            item = re.sub(r"\s+#\s.*$", "", item).strip()
            # strip quotes
            if item.startswith('"') and item.endswith('"'):
                item = item[1:-1]
            elif item.startswith("'") and item.endswith("'"):
                item = item[1:-1]
            list_buf.append(item)
            continue
        else:
            if current_list_key:
                out[current_list_key] = list_buf
                current_list_key = None
                list_buf = []

        line = re.sub(r"\s+#\s.*$", "", line).rstrip()
        if not line or line.startswith("#"):
            continue
        m2 = re.match(r"^([a-zA-Z_][\w]*)\s*:\s*(.*)$", line)
        if not m2:
            continue
        key, raw = m2.group(1), m2.group(2)
        raw = raw.strip()
        if raw == "":
            # multi-line list follows
            current_list_key = key
            list_buf = []
            continue
        out[key] = _coerce(raw)

    if current_list_key:
        out[current_list_key] = list_buf

    return out


def _coerce(raw: str):
    raw = raw.strip()
    if raw == "" or raw in ("null", "~"):
        return None
    if raw.startswith("[") and raw.endswith("]"):
        inner = raw[1:-1].strip()
        if not inner:
            return []
        return [x.strip().strip('"').strip("'") for x in inner.split(",")]
    if raw.startswith('"') and raw.endswith('"'):
        return raw[1:-1]
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1]
    if raw.isdigit():
        return int(raw)
    return raw


# -- graph build -------------------------------------------------------------
def build_graph() -> tuple[dict[str, dict], dict[str, list[str]]]:
    """Return (nodes-by-id, edges as adj-list of depends_on)."""
    nodes: dict[str, dict] = {}
    edges: dict[str, list[str]] = defaultdict(list)   # edges[fr] = list of FRs `fr` depends on

    for path in sorted(FR_DIR.glob("*/FR-*.md")):
        if path.name.endswith(".audit.md"):
            continue
        fm = parse_frontmatter(path)
        fr_id = fm.get("id")
        if not fr_id:
            continue
        nodes[fr_id] = {
            "id": fr_id,
            "module": fm.get("module", "?"),
            "phase": fm.get("phase", "?"),
            "status": fm.get("status", "draft"),
            "title": (fm.get("title") or "").strip('"').strip("'"),
            "engineering_anchor": fm.get("engineering_anchor") in (True, "true", "True"),
            "path": path.relative_to(FR_DIR).as_posix(),
        }
        deps = fm.get("depends_on") or []
        if isinstance(deps, list):
            # filter to ids that match FR-XXX-NNN pattern
            for d in deps:
                if isinstance(d, str) and re.match(r"^FR-[A-Z]+-\d+", d):
                    edges[fr_id].append(d)

    return nodes, edges


# -- cycle detection (DFS) ---------------------------------------------------
def detect_cycles(nodes: dict, edges: dict) -> list[list[str]]:
    """Return list of cycles found (each cycle = list of node ids)."""
    WHITE, GREY, BLACK = 0, 1, 2
    color = {n: WHITE for n in nodes}
    cycles: list[list[str]] = []
    stack: list[str] = []

    def dfs(u: str):
        color[u] = GREY
        stack.append(u)
        for v in edges.get(u, []):
            if v not in nodes:
                continue   # missing dependency target — not a cycle
            if color[v] == GREY:
                # Found cycle: extract from where v entered the stack
                idx = stack.index(v)
                cycles.append(stack[idx:] + [v])
            elif color[v] == WHITE:
                dfs(v)
        stack.pop()
        color[u] = BLACK

    for n in nodes:
        if color[n] == WHITE:
            dfs(n)
    return cycles


# -- reachability + ranking --------------------------------------------------
def downstream_count(nodes: dict, edges: dict) -> dict[str, int]:
    """For each FR, count how many FRs (directly or transitively) depend on it."""
    # Reverse edges: rev[fr] = list of FRs that depend on `fr`
    rev: dict[str, list[str]] = defaultdict(list)
    for src, deps in edges.items():
        for d in deps:
            rev[d].append(src)

    out: dict[str, int] = {}
    for n in nodes:
        # BFS over rev graph starting at n
        seen: set[str] = set()
        q = deque([n])
        while q:
            x = q.popleft()
            for y in rev.get(x, []):
                if y not in seen:
                    seen.add(y)
                    q.append(y)
        out[n] = len(seen)
    return out


# -- Mermaid rendering -------------------------------------------------------
STATUS_COLOR = {
    "accepted":   "#9ED69E",   # green
    "draft":      "#D8D8D8",   # grey
    "audited":    "#FFD580",   # amber
    "planned":    "#E0E0E0",
    "building":   "#7FB8FF",
    "shipped":    "#2A2A2A",
    "deferred":   "#FFC9C9",
    "rejected":   "#FFA0A0",
    "superseded": "#C8A2C8",
}


def render_mermaid(nodes: dict, edges: dict) -> str:
    lines = ["```mermaid", "flowchart LR", ""]

    # Group by phase as subgraphs
    by_phase: dict[str, list[str]] = defaultdict(list)
    for fr_id, n in nodes.items():
        by_phase[n["phase"]].append(fr_id)

    for phase in sorted(by_phase):
        lines.append(f"  subgraph {phase}[{phase}]")
        for fr_id in sorted(by_phase[phase]):
            n = nodes[fr_id]
            label = fr_id
            if n["engineering_anchor"]:
                label = f"⚓ {label}"
            lines.append(f"    {_safe_id(fr_id)}[{label}]")
        lines.append("  end")
        lines.append("")

    # Edges
    for src, deps in edges.items():
        for d in deps:
            if d in nodes:
                lines.append(f"  {_safe_id(d)} --> {_safe_id(src)}")

    # Status colour styles (only for nodes that exist)
    statuses_present = {n["status"] for n in nodes.values()}
    for status in statuses_present:
        color = STATUS_COLOR.get(status, "#EAEAEA")
        nodelist = [_safe_id(fr_id) for fr_id, n in nodes.items() if n["status"] == status]
        if nodelist:
            lines.append(f"  classDef status_{status} fill:{color},stroke:#333;")
            lines.append(f"  class {','.join(nodelist)} status_{status};")

    lines.append("```")
    return "\n".join(lines)


def _safe_id(fr_id: str) -> str:
    """Mermaid node ids can't contain dashes when used as references."""
    return fr_id.replace("-", "_")


# -- per-FR ranking table ----------------------------------------------------
def render_ranking(nodes: dict, edges: dict) -> str:
    downstream = downstream_count(nodes, edges)
    # Top 10 most-blocking FRs (highest downstream count)
    ranked = sorted(nodes.values(),
                    key=lambda n: (-downstream[n["id"]], n["id"]))
    lines = [
        "## Most-blocking FRs (top 10)",
        "",
        "These FRs unblock the largest number of downstream tasks. "
        "Prioritise them at slice-planning time.",
        "",
        "| Rank | FR-ID | Module | Phase | Status | Downstream count |",
        "|---:|---|:-:|:-:|:-:|---:|",
    ]
    for i, n in enumerate(ranked[:10], start=1):
        lines.append(
            f"| {i} | [{n['id']}]({n['path']}) | {n['module']} | "
            f"{n['phase']} | {n['status']} | {downstream[n['id']]} |"
        )
    return "\n".join(lines)


def render_doc(nodes: dict, edges: dict, cycles: list[list[str]]) -> str:
    lines = [
        "# FR Dependency Graph",
        "",
        "> **Generated.** Run `python3 tools/fr-graph.py` to regenerate. "
        "Do NOT hand-edit.",
        "",
        f"**Inventory:** {len(nodes)} FRs · {sum(len(v) for v in edges.values())} dependency edges",
        "",
    ]

    if cycles:
        lines.extend([
            "## ⚠️ Cycles detected",
            "",
            "**The dependency graph has cycles — `building` order is undefined for these FRs.** "
            "Resolve by re-examining `depends_on` frontmatter.",
            "",
        ])
        for c in cycles:
            lines.append(f"- Cycle: `{' → '.join(c)}`")
        lines.append("")
    else:
        lines.append("✅ **No cycles.** The graph is a clean DAG.")
        lines.append("")

    lines.extend([
        render_ranking(nodes, edges),
        "",
        "## Full graph",
        "",
        render_mermaid(nodes, edges),
        "",
        "## Legend",
        "",
        "- ⚓ = engineering anchor (per-module format template — `engineering_anchor: true` in frontmatter)",
        "- Edge `A → B` = B depends on A (A must ship before B can start `building`)",
        "- Node fill colours by status: green = accepted · grey = draft/planned · amber = audited · blue = building · dark = shipped · red = deferred/rejected · purple = superseded",
        "",
    ])
    return "\n".join(lines) + "\n"


# -- entry point -------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description="Generate FR dependency graph.")
    ap.add_argument("--check", action="store_true",
                    help="exit 1 if FR_GRAPH.md would change; don't write")
    ap.add_argument("--no-cycles", action="store_true",
                    help="exit 1 if any dependency cycle is detected (CI mode)")
    args = ap.parse_args()

    nodes, edges = build_graph()
    cycles = detect_cycles(nodes, edges)

    doc = render_doc(nodes, edges, cycles)
    cache = {
        "nodes": list(nodes.values()),
        "edges": {k: v for k, v in edges.items()},
        "cycles": cycles,
        "downstream": downstream_count(nodes, edges),
    }
    cache_text = json.dumps(cache, indent=2, sort_keys=True) + "\n"

    if args.check:
        existing_doc = OUTPUT_MD.read_text(encoding="utf-8") if OUTPUT_MD.exists() else ""
        existing_cache = OUTPUT_JSON.read_text(encoding="utf-8") if OUTPUT_JSON.exists() else ""
        if existing_doc == doc and existing_cache == cache_text:
            print("OK — FR_GRAPH.md is in sync.")
            return 0
        print("FR_GRAPH.md would change. Run without --check to write.", file=sys.stderr)
        return 1

    OUTPUT_MD.write_text(doc, encoding="utf-8")
    OUTPUT_JSON.write_text(cache_text, encoding="utf-8")
    print(f"OK — wrote {OUTPUT_MD.relative_to(ROOT)} ({len(nodes)} nodes, "
          f"{sum(len(v) for v in edges.values())} edges, {len(cycles)} cycles)")

    if args.no_cycles and cycles:
        for c in cycles:
            print(f"cycle: {' → '.join(c)}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
