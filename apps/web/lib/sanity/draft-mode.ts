export type SanityPerspective = 'published' | 'previewDrafts';

export function resolveSanityPerspective({
  draftModeEnabled,
  hasReadToken,
}: {
  draftModeEnabled: boolean;
  hasReadToken: boolean;
}): SanityPerspective {
  return draftModeEnabled && hasReadToken ? 'previewDrafts' : 'published';
}

