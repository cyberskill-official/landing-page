import { BackToCinematicLink } from './BackToCinematicLink';
import { STORYBOARD_PANELS, type StoryboardPanelId } from './storyboard-panels';

function renderNarration(narration: string) {
  const marker = 'Three.js';
  const markerIndex = narration.indexOf(marker);
  if (markerIndex === -1) return narration;

  return (
    <>
      {narration.slice(0, markerIndex)}T<span>hree.js</span>
      {narration.slice(markerIndex + marker.length)}
    </>
  );
}

export function StoryboardPanel({ anchorId, panelId }: { anchorId?: string; panelId: StoryboardPanelId }) {
  const panel = STORYBOARD_PANELS.find((candidate) => candidate.id === panelId);
  if (!panel) return null;

  const { id, sceneLabel, svgPath, title, narration, alt, ctaPrimary } = panel;
  const titleId = `lite-${id}-title`;
  const captionId = `lite-${id}-caption`;

  return (
    <section
      id={anchorId}
      className="lite-panel"
      data-storyboard-panel
      data-scene-id={id}
      aria-labelledby={titleId}
      aria-describedby={captionId}
      tabIndex={anchorId ? -1 : undefined}
    >
      <div className="lite-panel__copy">
        <p className="lite-panel__scene">{sceneLabel}</p>
        <h2 id={titleId}>{title}</h2>
        <p id={captionId} className="lite-narration" aria-live="polite">
          {renderNarration(narration)}
        </p>
      </div>
      <img
        className="lite-panel__image"
        src={svgPath}
        alt={alt}
        width={1200}
        height={800}
        loading={id === 'scene-0' ? 'eager' : 'lazy'}
        decoding="async"
      />
      <div className="lite-panel__actions">
        <a className="lite-cta" href={ctaPrimary.href}>
          {ctaPrimary.label}
        </a>
        <BackToCinematicLink className="lite-back-link" />
      </div>
    </section>
  );
}
