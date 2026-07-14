#!/usr/bin/env node
/**
 * FR-CTA-016: write company profile PDFs under public/downloads/ from content SSOT.
 * Run: npx tsx scripts/generate-profile-pdfs.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const mod = await import(
    pathToFileURL(join(root, "lib/content/profile.ts")).href
  );
  const { buildProfilePdf, PROFILE_PDF_PATHS } = mod;

  for (const locale of ["en", "vi"]) {
    const rel = PROFILE_PDF_PATHS[locale];
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    const bytes = await buildProfilePdf(locale);
    writeFileSync(abs, bytes);
    console.log(`wrote ${rel} (${bytes.byteLength} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
