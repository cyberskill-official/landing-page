// A permanent cosmos behind the whole site (FR-CHAR-032). Rendered directly in
// <body> by the root layout - a sibling of <main>, NOT a child of it - so it
// sits at z-index 0, genuinely behind the content (z-index 1). Opaque sections
// cover it in normal reading; it is revealed - already there, never fading in -
// the instant the black hole digests the page's top layer away. Pure server-
// rendered CSS/DOM (no client JS, no portal): a deep-space gradient with nebula
// tints, two drifting star layers, and a gold sun with planets orbiting on faint
// rings. Decorative (aria-hidden); it stays visibility:hidden until a digest is
// on (html[data-digesting]), and the drift/orbit animations only run then, so it
// costs nothing while covered and is invisible on pages that never digest.
export function CosmosBackdrop() {
  return (
    <div className="cs-cosmos" aria-hidden="true">
      <div className="cs-cosmos-nebula cs-neb-1" />
      <div className="cs-cosmos-nebula cs-neb-2" />
      <div className="cs-cosmos-nebula cs-neb-3" />
      <div className="cs-cosmos-stars" />
      <div className="cs-cosmos-stars cs-cosmos-stars-2" />
      <div className="cs-cosmos-stars cs-cosmos-stars-bright" />
      <div className="cs-cosmos-sun">
        <span className="cs-cosmos-corona" />
      </div>
      <div className="cs-cosmos-system">
        <div className="cs-cosmos-orbit cs-orbit-1">
          <span className="cs-planet cs-planet-rock" />
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
      <div className="cs-cosmos-vignette" />
    </div>
  );
}
