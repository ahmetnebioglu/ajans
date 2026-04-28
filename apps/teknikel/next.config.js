/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ajans/ui", "@ajans/db", "@ajans/crm", "@ajans/google-api", "@ajans/core"],
};

export default nextConfig;
