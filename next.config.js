/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "via.placeholder.com", "placehold.co", "picsum.photos"],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@v0/utils/supabaseClient": "./utils/supabaseClient.ts",
      "@v0/utils/getUserProfile": "./utils/getUserProfile.ts",
    }
    return config
  },
}

module.exports = nextConfig 