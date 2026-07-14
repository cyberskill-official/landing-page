import { defineConfig } from "@prisma/config";

// `prisma generate` (run via postinstall on every `npm install`) only reads
// prisma/schema.prisma and never opens a connection - but Prisma 7's env()
// config helper still eagerly validates that DATABASE_URL resolves just to
// *load* this file. That breaks `npm install` anywhere a real DATABASE_URL
// isn't set yet: Vercel builds (Command "npm install" exited with 1 -
// PrismaConfigEnvError) and, until CI carried a placeholder, GitHub Actions.
// The app's actual runtime PrismaClient (lib/db/prisma.ts) reads
// process.env.DATABASE_URL directly and never imports this file, so a
// fallback placeholder here is safe - it only affects what the Prisma CLI
// sees at generate/migrate time, never what the deployed app connects to.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
