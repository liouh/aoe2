import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {},
  webpack: (config) => {
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;
