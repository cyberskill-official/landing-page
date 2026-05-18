import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const slug = url.searchParams.get('slug') ?? 'sample';
  const expected = process.env.SANITY_PREVIEW_SECRET;

  if (!expected) {
    return Response.json({ ok: false, error: 'missing_preview_secret' }, { status: 503 });
  }

  if (token !== expected) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(`/work/${encodeURIComponent(slug)}`);
}

