// Static golden-Lumi poster: mobile / low-GPU / reduced-motion fallback for the
// 3D scene. Implemented as a CSS background (not <img>) so it can never become
// the LCP element — decorative Lumi must not compete with the hero text under
// mobile lab throttling. The painted frame stays size-reserved for CLS.
export function StaticPoster() {
  return (
    <div className="cs-poster" aria-hidden="true">
      <div className="cs-poster-frame" role="presentation" />
    </div>
  );
}
