type PublishableDocument = {
  _id?: string;
  published_at?: string | null;
  closed_at?: string | null;
};

export const PUBLIC_SANITY_FILTER =
  'defined(published_at) && published_at <= now() && !(_id in path("drafts.**"))';

export function isPubliclyVisible(
  document: PublishableDocument,
  now: Date = new Date(),
): boolean {
  if (document._id?.startsWith('drafts.')) {
    return false;
  }

  if (!document.published_at) {
    return false;
  }

  const publishTime = Date.parse(document.published_at);
  if (Number.isNaN(publishTime) || publishTime > now.getTime()) {
    return false;
  }

  if (document.closed_at) {
    const closedTime = Date.parse(document.closed_at);
    if (!Number.isNaN(closedTime) && closedTime <= now.getTime()) {
      return false;
    }
  }

  return true;
}

