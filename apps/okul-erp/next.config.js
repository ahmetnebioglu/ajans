
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  transpilePackages: ["@ajans/auth", "@ajans/db", "@ajans/ui", "next-auth"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
