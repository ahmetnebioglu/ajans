/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ajans/auth", "@ajans/db", "@ajans/ui", "next-auth"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
