import { getIndexNowKey } from "@/lib/seo/indexnow";

export const runtime = "nodejs";

// TASK-SEO-021 §1.1: the IndexNow key file.
//
// The protocol wants `<key>.txt`. The root dynamic segment here is already
// taken by `[lang]`, so a root-level `/<key>.txt` route would collide with
// locale routing. `keyLocation` in the submission payload exists for exactly
// this case and points the engine at `/indexnow/<key>.txt`.
//
// §1.3: with no key configured this 404s, so a deploy without the credential
// simply has no key file rather than serving an empty or placeholder one.
export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const configured = getIndexNowKey();
  if (!configured) return new Response("Not Found", { status: 404 });

  const { key } = await ctx.params;
  // The request path carries the ".txt" the protocol expects; compare the stem.
  const requested = key.endsWith(".txt") ? key.slice(0, -4) : key;

  // Constant-shape comparison against the validated key. `configured` is known
  // hexadecimal (§1.6), so nothing user-supplied is ever interpolated into a
  // path or a filesystem call - the route only ever echoes its own env value.
  if (requested !== configured) return new Response("Not Found", { status: 404 });

  return new Response(configured, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
