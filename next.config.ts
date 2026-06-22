import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The 3D scene is a dynamically imported client-only enhancement. Keeping
  // strict typed routes off avoids friction while the route set is in flux.
  experimental: {
    optimizePackageImports: ["@react-three/drei"],
  },
  async headers() {
    return [
      {
        // Baseline security headers for the whole site.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
