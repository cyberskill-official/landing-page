// Static golden-Lumi poster: the mobile / low-GPU / reduced-motion fallback for
// the 3D scene. Pure CSS + inline SVG, zero JS cost, so it protects Core Web
// Vitals where most B2B research traffic lives (research doc §C/§E). The
// silhouette mirrors the CyberSkill logo (hooded genie + face void + curling
// wisp) so reduced-motion visitors still meet Lumi instead of empty space.
export function StaticPoster() {
  return (
    <div className="cs-poster" aria-hidden="true">
      <svg className="cs-poster-genie" viewBox="0 0 200 380" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cs-lumi-gold" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FCE9A8" />
            <stop offset="55%" stopColor="#F4BA17" />
            <stop offset="100%" stopColor="#C8890A" />
          </radialGradient>
          <filter id="cs-lumi-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#cs-lumi-glow)" fill="url(#cs-lumi-gold)">
          {/* Hooded head - teardrop, pointed at the top. */}
          <path d="M100 24 C134 52 152 112 132 152 C123 170 110 180 100 180 C90 180 77 170 68 152 C48 112 66 52 100 24 Z" />
          {/* Collar chevron. */}
          <path d="M60 182 L100 206 L140 182 L140 196 L100 222 L60 196 Z" />
          {/* Body with broad shoulders curling into a genie wisp at the base. */}
          <path d="M66 200 C34 222 40 300 74 332 C84 346 95 360 96 368 C99 374 106 372 106 362 C103 346 120 330 132 308 C166 270 168 222 134 200 C112 214 88 214 66 200 Z" />
        </g>
        {/* Dark face void nested in the lower hood. */}
        <circle cx="100" cy="142" r="30" fill="#3A1D0E" />
      </svg>
    </div>
  );
}
