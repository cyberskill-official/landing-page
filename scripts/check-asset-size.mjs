// Asset + bundle size guard (TASK-PERF-003). Deterministic: walks public/ and the
// built client JS in .next/static/chunks and fails the build if anything exceeds
// the budgets in scripts/asset-budget.json. Run after `next build`.
import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const root = process.cwd();
const budget = JSON.parse(readFileSync(join(root, "scripts/asset-budget.json"), "utf8"));
const KB = 1024;

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const failures = [];
const note = (m) => console.log(m);

// 1. public/ assets: per-image / per-GLB caps + total.
const publicFiles = walk(join(root, "public"));
let publicTotal = 0;
for (const f of publicFiles) {
  const size = statSync(f).size;
  publicTotal += size;
  const ext = extname(f).toLowerCase();
  const isImage = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"].includes(ext);
  const isGlb = ext === ".glb" || ext === ".gltf";
  const isSvg = ext === ".svg";
  const rel = f.replace(root + "/", "");
  if (isGlb && size > budget.maxGlbKB * KB) failures.push(`${rel}: ${(size / KB) | 0}KB > maxGlbKB ${budget.maxGlbKB}KB`);
  else if (isImage && size > budget.maxImageKB * KB) failures.push(`${rel}: ${(size / KB) | 0}KB > maxImageKB ${budget.maxImageKB}KB`);
  else if (isSvg && size > budget.maxSvgKB * KB) failures.push(`${rel}: ${(size / KB) | 0}KB > maxSvgKB ${budget.maxSvgKB}KB`);
}
if (publicTotal > budget.maxPublicTotalKB * KB) failures.push(`public/ total ${(publicTotal / KB) | 0}KB > maxPublicTotalKB ${budget.maxPublicTotalKB}KB`);
note(`public/: ${publicFiles.length} files, ${(publicTotal / KB) | 0}KB total`);

// 2. client JS bundle total.
const chunks = walk(join(root, ".next/static/chunks")).filter((f) => f.endsWith(".js"));
const jsTotal = chunks.reduce((s, f) => s + statSync(f).size, 0);
if (chunks.length === 0) failures.push("no built client JS found - run `next build` first");
if (jsTotal > budget.maxClientJsTotalKB * KB) failures.push(`client JS total ${(jsTotal / KB) | 0}KB > maxClientJsTotalKB ${budget.maxClientJsTotalKB}KB`);
note(`client JS: ${chunks.length} chunks, ${(jsTotal / KB) | 0}KB total`);

// 3. First-load JS heuristic (TASK-PERF-008). 
// Sums core shared chunks (main-app, framework, webpack) + route segment chunks (page, layout).
const firstLoadChunks = chunks.filter(f => {
  const name = f.split('/').pop();
  return name.startsWith('main-app-') || 
         name.startsWith('framework-') || 
         name.startsWith('webpack-') || 
         name.startsWith('layout-') || 
         name.startsWith('page-');
});
const firstLoadJsTotal = firstLoadChunks.reduce((s, f) => s + statSync(f).size, 0);
if (firstLoadJsTotal > budget.maxFirstLoadJsKB * KB) {
  failures.push(`first-load JS total ${(firstLoadJsTotal / KB) | 0}KB > maxFirstLoadJsKB ${budget.maxFirstLoadJsKB}KB`);
}
note(`first-load JS: ${firstLoadChunks.length} core chunks, ${(firstLoadJsTotal / KB) | 0}KB total`);

if (failures.length) {
  console.error("\nAsset-size budget exceeded (TASK-PERF-003):");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log("\nAsset-size budget OK.");
