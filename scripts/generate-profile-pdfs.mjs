#!/usr/bin/env node
/**
 * FR-CTA-016: write company profile PDFs under public/downloads/ from content SSOT.
 * Run: node scripts/generate-profile-pdfs.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Load compiled TS via tsx/node next: use dynamic import of source through jiti-like path.
// In this repo tests import @/lib — here we register ts via experimental or spawn vitest.
// Prefer direct evaluation: read via next/swc not available. Use child process with npx tsx if present.

async function main() {
  let buildProfilePdf;
  let PROFILE_PDF_PATHS;
  try {
    // Prefer tsx resolve
    const mod = await import(
      pathToFileURL(join(root, "lib/content/profile.ts")).href
    );
    buildProfilePdf = mod.buildProfilePdf;
    PROFILE_PDF_PATHS = mod.PROFILE_PDF_PATHS;
  } catch {
    // Fallback: spawn node with vitest/vite-node
    const { register } = await import("node:module");
    // last resort: inline write using dynamic require of dist — generate via inline minimal
    console.error(
      "generate-profile-pdfs: import of profile.ts failed; run via `npx tsx scripts/generate-profile-pdfs.mjs` or `npm run generate:profile-pdfs`",
    );
    throw new Error("Cannot load lib/content/profile.ts");
  }

  for (const locale of ["en", "vi"]) {
    const rel = PROFILE_PDF_PATHS[locale];
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    const bytes = buildProfilePdf(locale);
    writeFileSync(abs, bytes);
    console.log(`wrote ${rel} (${bytes.byteLength} bytes)`);
    if (bytes.byteLength > 1024 * 1024) {
      throw new Error(`${rel} exceeds 1 MB`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
