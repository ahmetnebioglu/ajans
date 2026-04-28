/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ajans/ui", "@ajans/db", "@ajans/crm", "@ajans/google-api", "@ajans/core"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  },
};

export default nextConfig;
