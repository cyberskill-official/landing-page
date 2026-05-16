import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: { typedRoutes: true },
  transpilePackages: ['three'],
  webpack: (config) => {
    config.optimization = { ...config.optimization, usedExports: true };
    return config;
  },
};
export default nextConfig;
