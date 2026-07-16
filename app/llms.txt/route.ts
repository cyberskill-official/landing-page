import {
  buildLlmsTxt,
  LLMS_CACHE_CONTROL,
  LLMS_CONTENT_TYPE,
} from "@/lib/seo/llms-content";

export const runtime = "nodejs";

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": LLMS_CONTENT_TYPE,
      "Cache-Control": LLMS_CACHE_CONTROL,
    },
  });
}
