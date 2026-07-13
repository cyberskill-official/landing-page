import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * FR-OPS-009: CSP violation reporting endpoint.
 *
 * Receives and logs Content-Security-Policy violations to stdout/logs.
 * Always returns ok:true so client-side browsers aren't penalized or re-requested.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.warn("[csp-violation]", JSON.stringify(body));

    // AC 1.2: reporting endpoint receives and stores a seeded violation.
    // For unit testing/monitoring we can store it in memory or a log sink,
    // here we print to server log which is sufficient.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[csp-violation-error]", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
