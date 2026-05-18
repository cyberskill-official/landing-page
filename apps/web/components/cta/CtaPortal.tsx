import type { Track, TrackId } from './tracks';

export type CtaPortalProps = {
  track: Track;
  isCurrent: boolean;
  onActivate: (track: TrackId) => void;
  onFocusTrack: (track: TrackId) => void;
  onBlurTrack: () => void;
};

export function CtaPortal({ track, isCurrent, onActivate, onFocusTrack, onBlurTrack }: CtaPortalProps) {
  const descId = `cta-desc-${track.id}`;

  return (
    <button
      id={`cta-portal-${track.id}`}
      type="button"
      className="cta-portal"
      data-cta-portal
      data-cta-track={track.id}
      data-palette-role={track.paletteRole}
      aria-current={isCurrent ? 'page' : undefined}
      aria-describedby={descId}
      onClick={() => onActivate(track.id)}
      onFocus={() => onFocusTrack(track.id)}
      onBlur={onBlurTrack}
      onPointerEnter={() => onFocusTrack(track.id)}
      onPointerLeave={onBlurTrack}
    >
      <span className="cta-portal__eyebrow">{track.eyebrow}</span>
      <span className="cta-portal__label">{track.label}</span>
      <span className="cta-portal__subhead">{track.subhead}</span>
      <span className="cta-portal__action">{track.primaryAction}</span>
      <span id={descId} className="visually-hidden">
        {track.describedBy}
      </span>
    </button>
  );
}
