import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { optimize } from "svgo";

// Get list of staged SVG files
let stagedFiles = [];
try {
  const output = execSync("git diff --cached --name-only", { encoding: "utf8" });
  stagedFiles = output.split("\n").map(f => f.trim()).filter(f => f.endsWith(".svg") && existsSync(f));
} catch (e) {
  // Fallback if git fails: do nothing, or we can check public/ SVGs directly.
}

if (stagedFiles.length === 0) {
  console.log("No staged SVG files to check.");
  process.exit(0);
}

let failed = false;
for (const file of stagedFiles) {
  const original = readFileSync(file, "utf8");
  const result = optimize(original, { path: file });
  const originalSize = original.length;
  const optimizedSize = result.data.length;

  const sizeDiff = originalSize - optimizedSize;
  const percentDiff = (sizeDiff / originalSize) * 100;
  
  const hasEditorTags = original.includes("sodipodi:") || 
                        original.includes("inkscape:") || 
                        original.includes("<metadata>") || 
                        original.includes("<!--");

  if (sizeDiff > 10 || hasEditorTags) {
    console.error(`\nError: SVG file "${file}" is not optimized (TASK-OPS-016).`);
    if (hasEditorTags) console.error(`  - Contains editor namespaces, metadata, or comments.`);
    if (sizeDiff > 10) console.error(`  - Can be further compressed by ${sizeDiff} bytes (${percentDiff.toFixed(1)}%).`);
    console.error(`Please run: npx svgo "${file}" -o "${file}" and stage the changes.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log("Staged SVG files are fully optimized.");
