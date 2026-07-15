import { NextResponse } from "next/server";

// Lightweight health/status endpoint for uptime checks and load balancers
// (TASK-WEB-010). No dependencies, no caching, always fresh. Returns 200 with a
// tiny JSON body so a monitor can assert on status and parse the timestamp.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Build identifier from the Vercel deploy env (a commit SHA is public, not a
  // secret); "dev" locally. No auth, no config, nothing sensitive.
  const version = process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";
  return NextResponse.json(
    { status: "ok", service: "cyberskill-landing-page", version, ts: new Date().toISOString() },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
