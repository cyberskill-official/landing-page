import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-CHAR-028 / TASK-OPS-005 / TASK-OPS-018: Daily cron endpoint to delete expired leads and transcripts
 * past their retention periods.
 * Gated by CRON_SECRET token validation and x-vercel-signature timestamp drift checks.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const authHeader = req.headers.get("Authorization");
  const signature = req.headers.get("x-vercel-signature");
  
  const expectedSecret = process.env.CRON_SECRET;

  // 1. Token validation
  let authorized = false;
  if (expectedSecret) {
    if (secret === expectedSecret) {
      authorized = true;
    } else if (authHeader === `Bearer ${expectedSecret}`) {
      authorized = true;
    }
  } else {
    // If CRON_SECRET is not set, reject in production (fail closed) but allow in other envs
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      authorized = false;
    } else {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // 2. Vercel Signature drift check
  if (signature) {
    const match = signature.match(/t=(\d+)/);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      const now = Math.floor(Date.now() / 1000);
      // Reject if signature timestamp is older than 5 minutes (300 seconds) or in the future
      if (Math.abs(now - timestamp) > 300) {
        return NextResponse.json({ ok: false, error: "signature expired" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ ok: false, error: "invalid signature format" }, { status: 400 });
    }
  }

  // 3. Execution and secure log auditing
  const startTime = Date.now();
  try {
    const db = getDb();
    const count = await db.pruneExpired();
    const duration = Date.now() - startTime;
    
    // Log metrics securely without printing any sensitive data (AC 1.3)
    console.log(`[cron/prune] Pruning successful. durationMs=${duration} prunedCount=${count}`);
    
    return NextResponse.json({ ok: true, pruned: count });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[cron/prune] Pruning failed after durationMs=${duration}`, err);
    
    // Mask detailed DB error in production to protect db layout (AC 1.3)
    const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
    return NextResponse.json(
      { ok: false, error: isProd ? "internal server error" : err.message },
      { status: 500 }
    );
  }
}
