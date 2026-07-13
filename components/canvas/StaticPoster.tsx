import Image from "next/image";

// Static golden-Lumi poster: the mobile / low-GPU / reduced-motion fallback for
// the 3D scene. Rendered using next/image with priority={true} to serve as the
// preloaded LCP element, protecting Core Web Vitals (research doc §C/§E).
export function StaticPoster() {
  return (
    <div className="cs-poster" aria-hidden="true">
      <Image
        src="/lumi-poster.webp"
        alt="Lumi mascot fallback"
        fill
        priority
        sizes="(max-width: 1023px) 50vw, 33vw"
        className="cs-poster-img"
      />
    </div>
  );
}
