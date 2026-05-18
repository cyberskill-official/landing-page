import type { NextConfig } from 'next';

const immutableDecoderHeaders = [
  { key: 'Cache-Control', value: 'public, immutable, max-age=31536000' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  typedRoutes: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['@react-three/drei'],
  },
  async headers() {
    return [
      {
        source: '/decoders/:path*',
        headers: immutableDecoderHeaders,
      },
      {
        source: '/decoders/draco/draco_decoder.wasm',
        headers: [...immutableDecoderHeaders, { key: 'Content-Type', value: 'application/wasm' }],
      },
      {
        source: '/decoders/basis/basis_transcoder.wasm',
        headers: [...immutableDecoderHeaders, { key: 'Content-Type', value: 'application/wasm' }],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: true,
        usedExports: true,
      };
    }
    return config;
  },
};
export default nextConfig;
