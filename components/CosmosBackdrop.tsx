// A permanent cosmos behind the whole site (FR-CHAR-032). It sits at z-index 0,
// beneath the content (which is z-index 1), so opaque sections hide it during
// normal reading and it is REVEALED - already there, never fading in - when the
// black hole digests the page's top layer away. Pure CSS/DOM: a deep-space
// gradient with nebula tints, two drifting star layers, and a gold sun with
// planets orbiting on faint rings. Decorative only (aria-hidden). The drift and
// orbit animations run solely while a digest is on (html[data-digesting]), so
// the layer costs nothing while it is covered.
export function CosmosBackdrop() {
  return (
    <div className="cs-cosmos" aria-hidden="true">
      <div className="cs-cosmos-stars" />
      <div className="cs-cosmos-stars cs-cosmos-stars-2" />
      <div className="cs-cosmos-sun" />
      <div className="cs-cosmos-system">
        <div className="cs-cosmos-orbit cs-orbit-1">
          <span className="cs-planet" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-2">
          <span className="cs-planet cs-planet-ringed" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-3">
          <span className="cs-planet cs-planet-blue" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-4">
          <span className="cs-planet cs-planet-pale" />
        </div>
      </div>
    </div>
  );
}
