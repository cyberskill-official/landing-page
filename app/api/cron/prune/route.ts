import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FR-CHAR-028 / FR-OPS-005: Daily cron endpoint to delete expired leads and transcripts
 * past their retention periods.
 * Gated by CRON_SECRET to prevent arbitrary public execution.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const count = await db.pruneExpired();
    return NextResponse.json({ ok: true, pruned: count });
  } catch (err: any) {
    console.error("[cron/prune] pruning failed", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
