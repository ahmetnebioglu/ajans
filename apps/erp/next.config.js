/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ajans/auth", "@ajans/db", "@ajans/google-api"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  cacheComponents: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
