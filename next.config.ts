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
    config.output.environment = {
      ...(config.output.environment ?? {}),
      asyncFunction: true,
    };
    return config;
  },
};

export default nextConfig;
