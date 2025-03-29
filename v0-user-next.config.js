/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "via.placeholder.com", "placehold.co", "picsum.photos"],
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

