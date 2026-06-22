// Static golden-Lumi poster: the mobile / low-GPU / reduced-motion fallback for
// the 3D scene. Pure CSS, zero JS cost, so it protects Core Web Vitals where
// most B2B research traffic lives (research doc §C/§E).
export function StaticPoster() {
  return <div className="cs-poster" aria-hidden="true" />;
}
