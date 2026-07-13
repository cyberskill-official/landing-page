import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// FR-PERF-004: on-demand bundle analysis. `ANALYZE=true npm run build` emits a
// static per-chunk treemap under .next/analyze so chunk composition (and the
// separately-chunked 3D scene) is inspectable. Off by default - normal builds
// are unaffected.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The 3D scene is a dynamically imported client-only enhancement. Keeping
  // strict typed routes off avoids friction while the route set is in flux.
  experimental: {},
  async headers() {
    // FR-PERF-010: content-stable public assets with immutable caching.
    // These files never change without a filename change (logo uses semantic
    // versioning via git; models carry a version in their name on any swap).
    const immutable = { key: "Cache-Control", value: "public, max-age=31536000, immutable" };
    const immutableAssets = [
      { source: "/brand/:file*", headers: [immutable] },
      { source: "/models/:file*", headers: [immutable] },
      { source: "/logo.svg", headers: [immutable] },
      { source: "/favicon.svg", headers: [immutable] },
      { source: "/lumi-poster.webp", headers: [immutable] },
    ];

    return [
      {
        // Baseline security headers for the whole site.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // The site needs none of these powerful features; deny them so a
          // third-party script (or an injected one) cannot reach for them.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      ...immutableAssets,
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
