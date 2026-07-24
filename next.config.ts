import path from "node:path";
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// TASK-PERF-004: on-demand bundle analysis. `ANALYZE=true npm run build` emits a
// static per-chunk treemap under .next/analyze so chunk composition (and the
// separately-chunked 3D scene) is inspectable. Off by default - normal builds
// are unaffected.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

// Package exports only expose `_esm/cs.mjs` (browser UMD bridge) for JS — not
// SSR-safe here. Alias the published Button.jsx from the same tarball.
const designSystemButton = path.join(
  process.cwd(),
  "node_modules/@cyberskill/design/components/button/Button.jsx",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Transpile the design-system JSX source we alias in (package is ESM/"raw").
  transpilePackages: ["@cyberskill/design"],
  // The 3D scene is a dynamically imported client-only enhancement. Keeping
  // strict typed routes off avoids friction while the route set is in flux.
  experimental: {
    // Inline above-the-fold CSS (critters) so mobile lab FCP/LCP are not gated
    // on a full ~19KB render-blocking stylesheet round-trip under slow-4G.
    optimizeCss: true,
  },
  turbopack: {
    resolveAlias: {
      "@cyberskill/design/button": designSystemButton,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@cyberskill/design/button": designSystemButton,
    };
    return config;
  },
  images: {
    // StaticPoster uses q=70 for a tighter LCP image than the default 75.
    qualities: [70, 75],
  },
  async headers() {
    // TASK-PERF-010: content-stable public assets with immutable caching.
    // These files never change without a filename change (logo uses semantic
    // versioning via git; models carry a version in their name on any swap).
    const immutable = { key: "Cache-Control", value: "public, max-age=31536000, immutable" };
    const sitemapCache = { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600" };
    const immutableAssets = [
      { source: "/brand/:file*", headers: [immutable] },
      { source: "/models/:file*", headers: [immutable] },
      { source: "/logo.svg", headers: [immutable] },
      { source: "/favicon.svg", headers: [immutable] },
      { source: "/lumi-poster.webp", headers: [immutable] },
      { source: "/sitemap.xml", headers: [sitemapCache] },
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
