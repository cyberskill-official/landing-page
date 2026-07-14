import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  const count = await db.getTeardownCountThisWeek();
  const cap = parseInt(process.env.TEARDOWN_WEEKLY_CAP || "3", 10);
  return NextResponse.json({
    capExceeded: count >= cap,
    cap,
    count,
  });
}
