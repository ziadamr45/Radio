import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Ensure z-ai-web-dev-sdk works in serverless
  serverExternalPackages: ['z-ai-web-dev-sdk'],
};

export default nextConfig;
// v1775594974
