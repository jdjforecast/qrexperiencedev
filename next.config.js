/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Asegurarse que experimental.serverActions está habilitado si lo usas
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 